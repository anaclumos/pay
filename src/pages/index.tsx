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
  const [price, setPrice] = useState(100000)

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

  let approxExchangeRateFor1USD = 1300

  return (
    <main className='grid min-h-screen bg-gray-700 place-items-center'>
      <div className={`flex flex-col items-center justify-between w-full ${inter.className}`}>
        <h1 className='sr-only'>Checkout</h1>
        <div className='grid min-h-[60%] w-full min-h-[80%] grid-cols-1 m-auto md:grid-cols-2'>
          <div className='py-24 bg-gray-100 md:py-24'>
            <div className='max-w-lg px-4 mx-auto space-y-8 lg:px-8'>
              <div className='flex items-center gap-4'>
                <span className='w-10 h-10 bg-blue-700 rounded-full'></span>
                <h2 className='font-medium text-gray-900'>Believer Plan</h2>
              </div>
              <div>
                <p className='text-2xl font-medium tracking-tight text-gray-900'>
                  {' '}
                  <span>{`${price.toLocaleString()}원`}</span>
                </p>
                <p className='mt-1 text-sm text-gray-600'>
                  ≈{' '}
                  {(price / approxExchangeRateFor1USD).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}{' '}
                  U.S. Dollar
                </p>
              </div>
              <div>
                <div className='flow-root'>
                  <ul className='-my-4 divide-y divide-gray-100'>
                    <li className='flex items-center gap-4 py-4'>
                      <Image src='https://github.com/anaclumos.png' alt='' width={64} height={64} className='object-cover w-16 h-16 rounded' />
                      <div>
                        <h3 className='text-sm text-gray-900'>Send a Note to Thousands of Hackers</h3>
                        <div className='mt-0.5 space-y-px text-[10px] text-gray-600'>
                          To address the expensive upkeep of hn.cho.sh, I am introducing a supporter plan for it. As a thank you for your support,
                          you&#39;ll have the opportunity to write a brief message of appreciation to reach over 1,000 hackers worldwide.
                        </div>
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

                {/* checkbox, agree to terms and conditions, required */}
                <div className='col-span-6'>
                  <div className='flex items-center'>
                    <input
                      id='terms-and-conditions-checkbox'
                      name='terms-and-conditions-checkbox'
                      type='checkbox'
                      className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                    />
                    <label htmlFor='terms-and-conditions-checkbox' className='block ml-2 text-xs text-gray-900'>
                      I agree to the{' '}
                      <a href='#terms-and-conditions' className='font-medium text-blue-600 hover:underline'>
                        Terms and Conditions
                      </a>
                      .
                    </label>
                  </div>
                </div>

                <div id='payment-widget' className='col-span-6 -mx-4'></div>
                <div className='col-span-6'>
                  <button
                    className='block w-full rounded-md bg-black p-2.5 text-sm text-white transition hover:shadow-lg'
                    onClick={async (event) => {
                      event.preventDefault()
                      if (!(document.getElementById('terms-and-conditions-checkbox') as HTMLInputElement)?.checked) {
                        alert('Please agree to the Terms and Conditions.')
                        return
                      }

                      const paymentWidget = paymentWidgetRef.current
                      try {
                        await paymentWidget?.requestPayment({
                          orderId: nanoid(),
                          orderName: 'hn.cho.sh Believer Plan',
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
      <div className='flex items-center justify-center w-full py-12 bg-gray-700'>
        <div className='justify-center p-12 space-x-2'>
          <h2 id='terms-and-conditions' className='font-medium tracking-tight text-white text-md md:text-sm'>
            Terms and Conditions
          </h2>
          {/* list */}
          <ul className='mt-0.5 space-y-px text-[10px] text-gray-100 list-disc'>
            <li>
              To address the expensive upkeep of hn.cho.sh, I am introducing a supporter plan for it. As a thank you for your support, you&apos;ll
              have the opportunity to write a brief message of appreciation to reach over 1,000 hackers worldwide.
            </li>
            <li>These numbers grow by 3% daily, and the newsletter open rate is an impressive 50-60%.</li>
            <li>&quot;Hackers&quot; refers to subscribers of the hacker news summarization service &quot;hn.cho.sh&quot; and its successors.</li>
            <li>
              &quot;Believer Plan&quot; refers to a product that can be purchased to support the development of the product in the future while
              sympathizing with the purpose of the Internet information summarization service, which is currently available in research beta form.
            </li>
            <li>
              As a benefit of purchasing the Believer Plan, &quot;hackers&quot; can send a one-time message to the daily newsletter, which is subject
              to change. The message can contain your thoughts. Public service announcements can be made, but not commercial announcements. The
              company and the member will agree upon this.
            </li>
            <li>The agreement between the company and the member can be made via email or video call.</li>
            <li>
              If you purchase this plan, you can write a message within two weeks, which will be reflected in the letter within three days after the
              notice is noted.{' '}
            </li>
            <li>Members may request a refund from the Company. Refunds will be made by the policies and methods outlined by the Company.</li>
            <li>The Company will proceed with the refund in the following manner.</li>
            <li>
              In the case of sending a message to the newsletter sent daily to &#39;hackers&#39; as a benefit of purchasing the &#39;Believer
              Plan&#39;, a full refund is possible only before 24 hours from the message sending time specified by the agreement between the Company
              and the Member. After that, no refund is possible.
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
