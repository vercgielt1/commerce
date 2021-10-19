export const cartFragment = /* GraphQL */ `
  fragment Cart on Order {
    id
    code
    createdAt
    totalQuantity
    subTotal
    subTotalWithTax
    total
    totalWithTax
    currencyCode
    customer {
      id
      firstName
      lastName
      emailAddress
    }
    shippingAddress {
      streetLine1
      city
      province
      postalCode
      countryCode
      phoneNumber
    }
    lines {
      id
      quantity
      linePriceWithTax
      discountedLinePriceWithTax
      unitPriceWithTax
      discountedUnitPriceWithTax
      featuredAsset {
        id
        preview
      }
      discounts {
        description
        amount
      }
      productVariant {
        id
        name
        sku
        price
        priceWithTax
        stockLevel
        product {
          slug
        }
        productId
      }
    }
  }
`
