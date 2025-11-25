import { useState } from 'react'
import './LoginForm.css'

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) {
      alert('사용자 이름을 입력해주세요.')
      return
    }

    setIsConnecting(true)
    // 연결은 ChatRoom에서 처리하므로 여기서는 바로 로그인 처리
    setTimeout(() => {
      setIsConnecting(false)
      onLogin(username.trim())
    }, 100)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>RSocket 채팅</h1>
        <p>사용자 이름을 입력하여 채팅을 시작하세요</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자 이름"
            disabled={isConnecting}
            autoFocus
          />
          <button type="submit" disabled={isConnecting || !username.trim()}>
            {isConnecting ? '연결 중...' : '채팅 시작'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm

