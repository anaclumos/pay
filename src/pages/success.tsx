import axios from 'axios'
import { Inter } from 'next/font/google'
import { GetServerSideProps } from 'next'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

interface Payment {
  orderName: string
  approvedAt: string
  receipt: {
    url: string
  }
  totalAmount: number
  method: '카드' | '가상계좌' | '계좌이체'
}
const inter = Inter({ subsets: ['latin'] })

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { paymentKey, orderId, amount },
  } = context

  try {
    const { data: payment } = await axios.post<Payment>(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        paymentKey,
        orderId,
        amount,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.TOSS_PAYMENTS_SECRET_KEY}:`).toString('base64')}`,
        },
      }
    )

    return {
      props: { payment },
    }
  } catch (err: any) {
    console.error('err', err)

    return {
      redirect: {
        destination: `/fail?code=${err.code}&message=${err.message}`,
        permanent: false,
      },
    }
  }
}

interface Props {
  payment: Payment
}

export default function SuccessPage({ payment }: Props) {
  return (
    <main className='grid min-h-screen place-items-center'>
      <div className={`flex flex-col items-center justify-between w-full min-h-screen ${inter.className}`}>
        <h1 className='sr-only'>Checkout</h1>
        <div className='grid w-full grid-cols-1 m-auto md:grid-cols-2'>
          <div className='py-24 bg-gray-100 md:py-24'>
            <div className='max-w-lg px-4 mx-auto space-y-8 lg:px-8'>
              <div className='flex items-center gap-4'>
                <span className='w-10 h-10 bg-blue-700 rounded-full'></span>
                <h2 className='font-medium text-gray-900'>Success!</h2>
              </div>
              <div>
                <p className='text-2xl font-medium tracking-tight text-gray-900'>
                  {' '}
                  <span>{`₩${payment.totalAmount.toLocaleString()}`}</span>
                </p>
                <p className='mt-1 text-sm text-gray-600'>You bought:</p>
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
              <h1 className='pt-4 text-2xl font-medium tracking-tight text-gray-900'>Success</h1>
              <h2 className='pt-4 text-xl font-medium tracking-tight text-gray-900'>Order Name</h2>
              <p className='pt-2 font-medium tracking-tight text-gray-900 text-md'>{payment.orderName}</p>
              <h2 className='pt-4 text-xl font-medium tracking-tight text-gray-900'>Approved At</h2>
              <p className='pt-2 font-medium tracking-tight text-gray-900 text-md'>{format(new Date(payment.approvedAt), 'yyyy-MM-dd HH:mm:ss')}</p>
              <h2 className='pt-4 text-xl font-medium tracking-tight text-gray-900'>Receipt</h2>
              <Link className='pt-2 font-medium tracking-tight text-blue-900 text-md' href={payment.receipt.url}>
                Receipt
              </Link>
              <h2 className='pt-4 text-xl font-medium tracking-tight text-gray-900'>Total Amount</h2>
              <p className='pt-2 font-medium tracking-tight text-gray-900 text-md'>{payment.totalAmount}</p>
              <h2 className='pt-4 text-xl font-medium tracking-tight text-gray-900'>Method</h2>
              <p className='pt-2 font-medium tracking-tight text-gray-900 text-md'>{payment.method}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
