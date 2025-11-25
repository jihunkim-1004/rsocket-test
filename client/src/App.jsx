import { useState, useEffect, useRef } from 'react'
import rsocketClient from './services/rsocketClient'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleConnect = async () => {
    if (!username.trim()) {
      alert('사용자 이름을 입력해주세요!')
      return
    }

    try {
      await rsocketClient.connect('ws://localhost:8080/rsocket', username)
      setIsConnected(true)

      // 입장 알림 전송
      const joinMessage = {
        username: username,
        message: '',
        timestamp: new Date().toISOString(),
        type: 'JOIN'
      }
      rsocketClient.sendMessage('chat.join', joinMessage)

      // 메시지 스트림 구독
      rsocketClient.streamMessages('chat.stream', (message) => {
        setMessages((prev) => [...prev, message])
      })
    } catch (error) {
      console.error('연결 실패:', error)
      alert('서버 연결에 실패했습니다.')
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim()) return

    const message = {
      username: username,
      message: inputMessage,
      timestamp: new Date().toISOString(),
      type: 'MESSAGE'
    }

    rsocketClient.sendMessage('chat.send', message)
    setInputMessage('')
  }

  const handleDisconnect = () => {
    // 퇴장 알림 전송
    const leaveMessage = {
      username: username,
      message: '',
      timestamp: new Date().toISOString(),
      type: 'LEAVE'
    }
    rsocketClient.sendMessage('chat.leave', leaveMessage)
    
    // 약간의 지연 후 연결 해제 (퇴장 메시지가 전송될 시간 확보)
    setTimeout(() => {
      rsocketClient.disconnect()
      setIsConnected(false)
      setMessages([])
    }, 100)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // 로그인 화면
  if (!isConnected) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>💬 RSocket 채팅</h1>
          <p className="subtitle">실시간 채팅 애플리케이션</p>
          <input
            type="text"
            placeholder="사용자 이름을 입력하세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
            className="username-input"
          />
          <button onClick={handleConnect} className="connect-button">
            입장하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <h2>💬 RSocket 채팅</h2>
          <span className="username-badge">{username}</span>
        </div>
        <button onClick={handleDisconnect} className="disconnect-button">
          나가기
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>아직 메시지가 없습니다.</p>
            <p className="empty-subtitle">첫 번째 메시지를 보내보세요! 🚀</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            // 시스템 메시지 (입장/퇴장 알림)
            if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
              return (
                <div key={index} className="system-message">
                  <span className="system-message-text">{msg.message}</span>
                </div>
              )
            }
            
            // 일반 메시지
            return (
              <div
                key={index}
                className={`message ${msg.username === username ? 'own-message' : 'other-message'}`}
              >
                <div className="message-header">
                  <span className="message-username">{msg.username}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="message-input"
        />
        <button type="submit" className="send-button">
          전송
        </button>
      </form>
    </div>
  )
}

export default App

