'use server';

import { TAGS } from 'lib/constants';
import { addToCart, createCart, getCart, removeFromCart, updateCart } from 'lib/shopify';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

export async function addItem(prevState: any, selectedVariantIds: Array<string>) {
  let cartId = cookies().get('cartId')?.value;
  let cart;

  if (cartId) {
    cart = await getCart(cartId);
  }

  if (!cartId || !cart) {
    cart = await createCart();
    cartId = cart.id;
    cookies().set('cartId', cartId);
  }

  if (!selectedVariantIds.length) {
    return 'Missing product variant ID';
  }

  try {
    await addToCart(
      cartId,
      selectedVariantIds.map((variantId) => ({ merchandiseId: variantId, quantity: 1 }))
    );
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error adding item to cart';
  }
}

export async function removeItem(prevState: any, lineIds: string[]) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  try {
    await removeFromCart(cartId, lineIds);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error removing item from cart';
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    lineId: string;
    variantId: string;
    quantity: number;
  }[]
) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  const itemsToRemove = payload.filter((item) => item.quantity === 0);

  try {
    if (itemsToRemove.length > 0) {
      await removeFromCart(
        cartId,
        itemsToRemove.map((item) => item.lineId)
      );
      revalidateTag(TAGS.cart);
      return;
    }

    await updateCart(
      cartId,
      payload.map(({ lineId, variantId, quantity }) => ({
        id: lineId,
        merchandiseId: variantId,
        quantity
      }))
    );
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error updating items quantity';
  }
}
