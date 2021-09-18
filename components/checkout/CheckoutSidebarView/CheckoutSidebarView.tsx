import cn from 'classnames'
import Link from 'next/link'
import { FC } from 'react'
import CartItem from '@components/cart/CartItem'
import { Button, Text } from '@components/ui'
import { useUI } from '@components/ui/context'
// import useCart from '@framework/cart/use-cart'
// import usePrice from '@framework/product/use-price'
import ShippingWidget from '../ShippingWidget'
import PaymentWidget from '../PaymentWidget'
import SidebarLayout from '@components/common/SidebarLayout'
import s from './CheckoutSidebarView.module.css'

const CheckoutSidebarView: FC = () => {
  const { setSidebarView } = useUI()
  // const { data } = useCart()

  // const { price: subTotal } = usePrice(
  //   data && {
  //     amount: Number(data.subtotalPrice),
  //     currencyCode: data.currency.code,
  //   }
  // )
  // const { price: total } = usePrice(
  //   data && {
  //     amount: Number(data.totalPrice),
  //     currencyCode: data.currency.code,
  //   }
  // )

  return (
    <SidebarLayout
      className={s.root}
      handleBack={() => setSidebarView('CART_VIEW')}
    >
      <div className="flex-1 px-4 sm:px-6">
        <Link href="/cart">
          <Text variant="sectionHeading">Checkout</Text>
        </Link>

        <PaymentWidget onClick={() => setSidebarView('PAYMENT_VIEW')} />
        <ShippingWidget onClick={() => setSidebarView('SHIPPING_VIEW')} />

        <ul className={s.lineItemsList}>
          {/* {data!.lineItems.map((item: any) => (
            <CartItem
              key={item.id}
              item={item}
              currencyCode={data!.currency.code}
              variant="display"
            />
          ))} */}
        </ul>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-20 flex-shrink-0 w-full px-6 py-6 text-sm border-t sm:px-6 bg-accent-0">
        <ul className="pb-2">
          <li className="flex justify-between py-1">
            <span>Subtotal</span>
            {/* <span>{subTotal}</span> */}
          </li>
          <li className="flex justify-between py-1">
            <span>Taxes</span>
            <span>Calculated at checkout</span>
          </li>
          <li className="flex justify-between py-1">
            <span>Shipping</span>
            <span className="font-bold tracking-wide">FREE</span>
          </li>
        </ul>
        <div className="flex justify-between py-3 mb-2 font-bold border-t border-accent-2">
          <span>Total</span>
          {/* <span>{total}</span> */}
        </div>
        <div>
          {/* Once data is correcly filled */}
          {/* <Button Component="a" width="100%">
                Confirm Purchase
              </Button> */}
          <Button Component="a" width="100%" variant="ghost" disabled>
            Continue
          </Button>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CheckoutSidebarView
