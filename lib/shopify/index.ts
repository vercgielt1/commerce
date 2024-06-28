import { AjaxError } from 'lib/shopify/ajax';
import { Payload, Where } from 'lib/shopify/payload';
import {
  Cart as PayloadCart,
  Category as PayloadCategory,
  Media as PayloadMedia,
  Option as PayloadOption,
  Product as PayloadProduct
} from 'lib/shopify/payload-types';
import {
  Cart,
  CartItem,
  Collection,
  Image,
  Menu,
  Money,
  Page,
  Product,
  ProductOption,
  ProductVariant
} from './types';

const payload = new Payload({ baseUrl: process.env.CMS_URL });

const reshapeCartItems = (lines: PayloadCart['lines']): CartItem[] => {
  return (lines ?? []).map((item) => {
    const product = item.product as PayloadProduct;
    const variant = product.variants.find((v) => v.id === item.variant);

    return {
      id: item.id!,
      quantity: item.quantity,
      merchandise: {
        id: item.variant,
        title: product.title,
        selectedOptions: [],
        product: reshapeProduct(product)
      },
      cost: {
        totalAmount: reshapePrice(variant?.price!)
      }
    };
  });
};

const reshapeCart = (cart: PayloadCart): Cart => {
  return {
    id: cart.id,
    checkoutUrl: '/api/checkout',
    cost: {
      totalAmount: {
        currencyCode: 'EUR',
        amount: cart.totalAmount?.toString()!
      },
      totalTaxAmount: {
        currencyCode: 'EUR',
        amount: '0.0'
      },
      subtotalAmount: {
        currencyCode: 'EUR',
        amount: '0.0'
      }
    },
    lines: reshapeCartItems(cart.lines),
    totalQuantity: 0
  };
};

export async function createCart(): Promise<Cart> {
  const cart = await payload.create<PayloadCart>('carts', { lines: [] });
  return reshapeCart(cart.doc);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const prevCart = await payload.findByID<PayloadCart>('carts', cartId);
  const cartItems = await mergeItems(prevCart.lines, lines, true);

  const cart = await payload.update<PayloadCart>('carts', cartId, {
    lines: cartItems
  });
  return reshapeCart(cart.doc);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const prevCart = await payload.findByID<PayloadCart>('carts', cartId);
  const lines = prevCart?.lines?.filter((lineItem) => !lineIds.includes(lineItem.id!)) ?? [];
  const cart = await payload.update<PayloadCart>('carts', cartId, { lines });
  return reshapeCart(cart.doc);
}

const mergeItems = async (
  cartItems: PayloadCart['lines'],
  lines: { merchandiseId: string; quantity: number }[],
  add: boolean
): Promise<PayloadCart['lines']> => {
  const map = new Map((cartItems ?? []).map((item) => [item.variant, item]));

  const products = await payload.find<PayloadProduct>('products', {
    where: {
      'variants.id': {
        in: lines.map((line) => line.merchandiseId)
      }
    }
  });

  lines.forEach((line) => {
    const product = products.docs.find((p) =>
      p.variants.some((variant) => variant.id === line.merchandiseId)
    );

    let item = {
      product: product?.id!,
      variant: line.merchandiseId,
      quantity: line.quantity
    };
    if (add) {
      const added = map.get(line.merchandiseId);
      if (added) {
        item = {
          ...item,
          quantity: item.quantity + added.quantity
        };
      }
    }
    map.set(line.merchandiseId, item);
  });

  return Array.from(map).map(([, item]) => item);
};

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const prevCart = await payload.findByID<PayloadCart>('carts', cartId);
  const cartItems = await mergeItems(prevCart.lines, lines, false);

  const cart = await payload.update<PayloadCart>('carts', cartId, { lines: cartItems });
  return reshapeCart(cart.doc);
}

export async function getCart(cartId: string): Promise<Cart | undefined> {
  try {
    const cart = await payload.findByID<PayloadCart>('carts', cartId);
    return reshapeCart(cart);
  } catch (error: unknown) {
    if (error instanceof AjaxError) {
      if (error.statusCode === 404) {
        return undefined;
      }
    }

    throw error;
  }
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const category = await payload.findByID<PayloadCategory>('categories', handle);
  return reshapeCategory(category);
}

const reshapeImage = (media: PayloadMedia): Image => {
  return {
    url: media.url!,
    altText: media.alt,
    width: media.width ?? 0,
    height: media.height ?? 0
  };
};

type Price = {
  amount: number;
  currencyCode: string;
};

const reshapePrice = (price: Price): Money => {
  return {
    amount: price.amount.toString(),
    currencyCode: price.currencyCode
  };
};

const reshapeOptions = (variants: PayloadProduct['variants']): ProductOption[] => {
  const options = new Map<string, PayloadOption>();

  variants.forEach((variant) => {
    variant.selectedOptions?.forEach((selectedOption) => {
      const option = selectedOption.option as PayloadOption;
      options.set(option.id, option);
    });
  });

  return Array.from(options, ([id, option]) => ({
    id,
    name: option.name,
    values: option.values.map((value) => value.label)
  }));
};

const reshapeSelectedOption = (
  selectedOptions: PayloadProduct['variants'][0]['selectedOptions']
): Array<{ name: string; value: string }> => {
  return (selectedOptions ?? []).map((selectedOption) => {
    const option = selectedOption.option as PayloadOption;
    return {
      name: option.name,
      value: option.values.find(({ value }) => value === selectedOption.value)?.label!
    };
  });
};

const reshapeVariants = (variants: PayloadProduct['variants']): ProductVariant[] => {
  return variants.map((variant) => ({
    id: variant.id!,
    title: `${variant.price.amount} ${variant.price.currencyCode}`,
    availableForSale: true,
    selectedOptions: reshapeSelectedOption(variant.selectedOptions),
    price: reshapePrice(variant.price)
  }));
};

const reshapeProduct = (product: PayloadProduct): Product => {
  return {
    id: product.id,
    handle: product.id,
    availableForSale: !product.disabled,
    title: product.title,
    description: product.description,
    descriptionHtml: product.description,
    options: reshapeOptions(product.variants),
    priceRange: {
      maxVariantPrice: reshapePrice(product.variants[0]?.price!),
      minVariantPrice: reshapePrice(product.variants[0]?.price!)
    },
    featuredImage: reshapeImage(product.media as PayloadMedia),
    images: [],
    seo: {
      title: product.title,
      description: product.description
    },
    tags: product.tags ?? [],
    variants: reshapeVariants(product.variants),
    updatedAt: product.updatedAt
  };
};

export async function getCollectionProducts({
  collection,
  tag
}: {
  collection?: string;
  tag?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const filters: Where[] = [];
  if (collection) {
    filters.push({
      categories: {
        equals: collection
      }
    });
  }
  if (tag) {
    filters.push({
      tags: {
        equals: collection
      }
    });
  }

  const products = await payload.find<PayloadProduct>('products', {
    where: {
      and: filters
    }
  });
  return products.docs.map(reshapeProduct);
}

const reshapeCategory = (category: PayloadCategory): Collection => {
  return {
    handle: category.id,
    title: category.title,
    description: category.description!,
    seo: {
      title: category.title,
      description: category.description!
    },
    path: `/search/${category.id}`,
    updatedAt: category.updatedAt
  };
};

export async function getCollections(): Promise<Collection[]> {
  const categories = await payload.find<PayloadCategory>('categories', {});
  return [
    {
      handle: '',
      title: 'All',
      description: 'All products',
      seo: {
        title: 'All',
        description: 'All products'
      },
      path: '/search',
      updatedAt: new Date().toISOString()
    },
    ...categories.docs.map(reshapeCategory)
  ];
}

export async function getMenu(handle: string): Promise<Menu[]> {
  switch (handle) {
    case 'next-js-frontend-footer-menu':
      return [
        { title: 'About Medusa', path: 'https://medusajs.com/' },
        { title: 'Medusa Docs', path: 'https://docs.medusajs.com/' },
        { title: 'Medusa Blog', path: 'https://medusajs.com/blog' }
      ];
    case 'next-js-frontend-header-menu':
      return await getCollections();
    default:
      return [];
  }
}

// eslint-disable-next-line no-unused-vars
export async function getPage(handle: string): Promise<Page | undefined> {
  return undefined;
}

export async function getPages(): Promise<Page[]> {
  return [];
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const product = await payload.findByID<PayloadProduct>('products', handle);
  return reshapeProduct(product);
}

// eslint-disable-next-line no-unused-vars
export async function getProductRecommendations(productId: string): Promise<Product[]> {
  return [];
}

export async function getProducts({
  query
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  let where: Where | undefined;
  if (query) {
    where = {
      or: [
        {
          title: {
            contains: query
          }
        },
        {
          description: {
            contains: query
          }
        }
      ]
    };
  }

  const products = await payload.find<PayloadProduct>('products', { where });
  return products.docs.map(reshapeProduct);
}
