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
      <div className={`flex flex-col items-center justify-between w-full min-h-screen p-4  ${inter.className}`}>
        <h1 className='sr-only'>Checkout</h1>
        <div className='m-auto grid grid-cols-1 md:grid-cols-2 w-full'>
          <div className='bg-gray-100 py-24 md:py-24'>
            <div className='mx-auto max-w-lg space-y-8 px-4 lg:px-8'>
              <div className='flex items-center gap-4'>
                <span className='h-10 w-10 rounded-full bg-blue-700'></span>
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
              <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1>Success</h1>
                <h2>Order Name</h2>
                <p>{payment.orderName}</p>
                <h2>Approved At</h2>
                <p>{format(new Date(payment.approvedAt), 'yyyy-MM-dd HH:mm:ss')}</p>
                <h2>Receipt</h2>
                <Link href={payment.receipt.url}>Receipt</Link>
                <h2>Total Amount</h2>
                <p>{payment.totalAmount}</p>
                <h2>Method</h2>
                <p>{payment.method}</p>
              </main>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
