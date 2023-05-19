import { useRouter } from 'next/router'

export default function FailPage() {
  const { query } = useRouter()

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Fail</h1>
      <p>{query.message ?? '알 수 없음'}</p>
    </main>
  )
}
