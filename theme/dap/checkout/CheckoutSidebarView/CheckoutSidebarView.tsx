import cn from 'classnames'
import Link from 'next/link'
import { FC } from 'react'
import CartItem from '@components/cart/CartItem'
import { Button, Text } from '@components/ui'
import { useUI } from '@components/ui/context'
import useCart from '@framework/cart/use-cart'
import usePrice from '@framework/product/use-price'
import ShippingWidget from '@components/checkout/ShippingWidget'
import PaymentWidget from '@components/checkout/PaymentWidget'
import SidebarLayout from '@components/common/SidebarLayout'
import s from './CheckoutSidebarView.module.css'
import { transitionOrderToStateMutation } from '@framework/utils/mutations/transition-order-to-state-mutation'
import { addPaymentToOrderMutation } from '@framework/utils/mutations/add-payment-to-order-mutation'
import request from '@commerce/utils/request'

const CheckoutSidebarView: FC = () => {
  const { setSidebarView, closeSidebarIfPresent } = useUI()
  const { data } = useCart()

  const { price: subTotal } = usePrice(
    data && {
      amount: Number(data.subtotalPrice),
      currencyCode: data.currency.code,
    }
  )
  const { price: total } = usePrice(
    data && {
      amount: Number(data.totalPrice),
      currencyCode: data.currency.code,
    }
  )
  
  const transitionOrderToState = async () => {
    const data = await request({
      query: transitionOrderToStateMutation,
      variables: {
        state: 'ArrangingPayment'
      }
    })
    console.log(data, 777)
  }
  const addPaymentToOrder = async () => {
    const data = await request({
      query: addPaymentToOrderMutation,
      variables: {
        input: {
          "method": "cash",
          "metadata": "{id:'nagyt pull'}"
        }
      }
    })
  }
  const handleConfirmPurchase = async (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()

    try {
      await transitionOrderToState()
      await addPaymentToOrder()
      closeSidebarIfPresent()
      console.log('Purchased')
    } catch ({ errors }) {
      console.log(errors, 444)
    }
  }
  return (
    <SidebarLayout
      className={s.root}
      handleBack={() => setSidebarView('CART_VIEW')}
    >
      <div className="px-4 sm:px-6 flex-1">
        <Link href="/cart">
          <Text variant="sectionHeading">Checkout</Text>
        </Link>

        {/* <PaymentWidget onClick={() => setSidebarView('PAYMENT_VIEW')} /> */}
        <ShippingWidget onClick={() => setSidebarView('SHIPPING_VIEW')} />

        <ul className={s.lineItemsList}>
          {data!.lineItems.map((item: any) => (
            <CartItem
              key={item.id}
              item={item}
              currencyCode={data!.currency.code}
              variant="display"
            />
          ))}
        </ul>
      </div>

      <div className="flex-shrink-0 px-6 py-6 sm:px-6 sticky z-20 bottom-0 w-full right-0 left-0 bg-accent-0 border-t text-sm">
        <ul className="pb-2">
          <li className="flex justify-between py-1">
            <span>Subtotal</span>
            <span>{subTotal}</span>
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
        <div className="flex justify-between border-t border-accent-2 py-3 font-bold mb-2">
          <span>Total</span>
          <span>{total}</span>
        </div>
        <div>
          {/* Once data is correcly filled */}
          <Button Component="a" width="100%" onClick={handleConfirmPurchase}>
            Confirm Purchase
          </Button>
          {/* <Button Component="a" width="100%" variant="ghost" disabled>
            Continue
          </Button> */}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CheckoutSidebarView
