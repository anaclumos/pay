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
  const [price, setPrice] = useState(1)

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
        <div className='grid w-full grid-cols-1 m-auto md:grid-cols-2'>
          <div className='py-24 bg-gray-100 md:py-24'>
            <div className='max-w-lg px-4 mx-auto space-y-8 lg:px-8'>
              <div className='flex items-center gap-4'>
                <span className='w-10 h-10 bg-blue-700 rounded-full'></span>
                <h2 className='font-medium text-gray-900'>pay.cho.sh</h2>
              </div>
              <div>
                <p className='text-2xl font-medium tracking-tight text-gray-900'>
                  {' '}
                  <span>{`${price.toLocaleString()}원`}</span>
                </p>
                <p className='mt-1 text-sm text-gray-600'>≈ 0.001 U.S. Dollar</p>
              </div>

              <div>
                <div className='flow-root'>
                  <ul className='-my-4 divide-y divide-gray-100'>
                    <li className='flex items-center gap-4 py-4'>
                      <Image src='https://github.com/anaclumos.png' alt='' width={64} height={64} className='object-cover w-16 h-16 rounded' />
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

          <div className='py-12 bg-white md:py-24'>
            <div className='max-w-lg px-4 mx-auto lg:px-8'>
              <form className='grid grid-cols-6 gap-4'>
                <div className='col-span-3'>
                  <label htmlFor='FirstName' className='block text-xs font-medium text-gray-700'>
                    First Name
                  </label>
                  <input type='text' id='FirstName' className='w-full mt-1 border-gray-200 rounded-md shadow-sm sm:text-sm' />
                </div>

                <div className='col-span-3'>
                  <label htmlFor='LastName' className='block text-xs font-medium text-gray-700'>
                    Last Name
                  </label>
                  <input type='text' id='LastName' className='w-full mt-1 border-gray-200 rounded-md shadow-sm sm:text-sm' />
                </div>
                <div className='col-span-6'>
                  <label htmlFor='Email' className='block text-xs font-medium text-gray-700'>
                    Email
                  </label>

                  <input type='email' id='Email' className='w-full mt-1 border-gray-200 rounded-md shadow-sm sm:text-sm' />
                </div>
                <div id='payment-widget' className='col-span-6 -mx-4'></div>
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
