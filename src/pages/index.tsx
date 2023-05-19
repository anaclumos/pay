import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import { PaymentWidgetInstance, loadPaymentWidget } from '@tosspayments/payment-widget-sdk'
import { nanoid } from 'nanoid'
import { useAsync } from 'react-use'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const clientKey = 'test_ck_Z0RnYX2w532yBRobpGP8NeyqApQE'
  const customerKey = nanoid()
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null)
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null)
  const [price, setPrice] = useState(10)

  useAsync(async () => {
    const paymentWidget = await loadPaymentWidget(clientKey, customerKey)
    const paymentMethodsWidget = paymentWidget.renderPaymentMethods('#payment-widget', price)
    paymentWidgetRef.current = paymentWidget
    paymentMethodsWidgetRef.current = paymentMethodsWidget
  }, [])

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current
    if (paymentMethodsWidget == null) {
      return
    }
    paymentMethodsWidget.updateAmount(price, paymentMethodsWidget.UPDATE_REASON.COUPON)
  }, [price])

  return (
    <main className='grid min-h-screen place-items-center'>
      <div className={`flex flex-col items-center justify-between w-full min-h-screen ${inter.className}`}>
        <h1 className='sr-only'>Checkout</h1>
        <div className='m-auto grid grid-cols-1 md:grid-cols-2 w-full'>
          <div className='bg-gray-100 py-24 md:py-24'>
            <div className='mx-auto max-w-lg space-y-8 px-4 lg:px-8'>
              <div className='flex items-center gap-4'>
                <span className='h-10 w-10 rounded-full bg-blue-700'></span>
                <h2 className='font-medium text-gray-900'>pay.cho.sh</h2>
              </div>
              <div>
                <p className='text-2xl font-medium tracking-tight text-gray-900'>
                  {' '}
                  <span>{`₩${price.toLocaleString()}`}</span>
                </p>
                <p className='mt-1 text-sm text-gray-600'>I graciously purchase</p>
              </div>

              <div>
                <div className='flow-root'>
                  <ul className='-my-4 divide-y divide-gray-100'>
                    <li className='flex items-center gap-4 py-4'>
                      <Image src='https://github.com/anaclumos.png' alt='' width={64} height={64} className='h-16 w-16 rounded object-cover' />
                      <div>
                        <h3 className='text-sm text-gray-900'>Autograph of Sunghyun Cho</h3>
                        <dl className='mt-0.5 space-y-px text-[10px] text-gray-600'>
                          <div>
                            <dt className='inline'>Sent via: </dt>
                            <dd className='inline'>Email</dd>
                          </div>
                        </dl>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white py-12 md:py-24'>
            <div className='mx-auto max-w-lg px-4 lg:px-8'>
              <form className='grid grid-cols-6 gap-4'>
                <div className='col-span-3'>
                  <label htmlFor='FirstName' className='block text-xs font-medium text-gray-700'>
                    First Name
                  </label>

                  <input type='text' id='FirstName' className='mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm' />
                </div>

                <div className='col-span-3'>
                  <label htmlFor='LastName' className='block text-xs font-medium text-gray-700'>
                    Last Name
                  </label>
                  <input type='text' id='LastName' className='mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm' />
                </div>

                <div className='col-span-6'>
                  <label htmlFor='Email' className='block text-xs font-medium text-gray-700'>
                    Email
                  </label>

                  <input type='email' id='Email' className='mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm' />
                </div>
                <div id='payment-widget' className='col-span-6 -mx-6'></div>
                <div className='col-span-6'>
                  <button
                    className='block w-full rounded-md bg-black p-2.5 text-sm text-white transition hover:shadow-lg'
                    onClick={async (event) => {
                      event.preventDefault()
                      const paymentWidget = paymentWidgetRef.current
                      try {
                        await paymentWidget?.requestPayment({
                          orderId: nanoid(),
                          orderName: 'Autograph of Sunghyun Cho',
                          customerName:
                            (document.getElementById('FirstName') as HTMLInputElement)?.value +
                            ' ' +
                            (document.getElementById('LastName') as HTMLInputElement)?.value,
                          customerEmail: (document.getElementById('Email') as HTMLInputElement)?.value,
                          successUrl: `${window.location.origin}/success`,
                          failUrl: `${window.location.origin}/fail`,
                        })
                      } catch (error) {
                        // handle error
                      }
                    }}
                  >
                    Pay Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
