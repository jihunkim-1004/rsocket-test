import { useState, useEffect, useRef } from 'react'
import rsocketService from '../services/rsocketService'
import './ChatRoom.css'

function ChatRoom({ username, onDisconnect }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const messagesEndRef = useRef(null)
  const hasConnectedRef = useRef(false)
  const RSOCKET_URL = 'ws://localhost:7000/rsocket'

  useEffect(() => {
    // 중복 연결 방지
    if (hasConnectedRef.current) {
      return
    }
    hasConnectedRef.current = true

    connectToRSocket()

    return () => {
      hasConnectedRef.current = false
      disconnectFromRSocket()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const connectToRSocket = async () => {
    try {
      setIsConnecting(true)
      console.log('RSocket 연결 시도 중...')
      await rsocketService.connect(RSOCKET_URL, username)
      console.log('RSocket 연결 완료, 상태 업데이트')
      
      // 연결 성공 시 바로 상태 업데이트
      setIsConnected(true)
      setIsConnecting(false)
      console.log('연결 상태 업데이트 완료:', { isConnected: true, isConnecting: false })
      
      // 메시지 스트림 구독 (비동기로 처리, 실패해도 연결 상태는 유지)
      rsocketService.streamMessages((message) => {
        setMessages((prev) => [...prev, message])
      }).catch((error) => {
        console.error('스트림 구독 실패:', error)
        // 스트림 구독 실패해도 연결 상태는 유지
      })
    } catch (error) {
      console.error('RSocket 연결 실패:', error)
      alert('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
      setIsConnected(false)
      setIsConnecting(false)
      onDisconnect()
    }
  }

  const disconnectFromRSocket = async () => {
    try {
      // 소켓이 연결되어 있으면 나가기 요청
      if (rsocketService.isConnected()) {
        await rsocketService.leaveChat(username)
      }
    } catch (error) {
      // 나가기 실패해도 연결은 종료
      console.warn('채팅 나가기 요청 실패:', error)
    } finally {
      // 항상 연결 종료
      rsocketService.disconnect()
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !isConnected) return

    rsocketService.sendMessage(username, inputMessage.trim())
    setInputMessage('')
  }

  const handleDisconnect = () => {
    disconnectFromRSocket()
    onDisconnect()
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="header-info">
          <h2>RSocket 채팅</h2>
          <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnecting ? '연결 중...' : isConnected ? '● 연결됨' : '● 연결 끊김'}
          </span>
        </div>
        <div className="user-info">
          <span className="username">{username}</span>
          <button onClick={handleDisconnect} className="disconnect-btn">
            나가기
          </button>
        </div>
      </div>

      <div className="messages-container">
        {isConnecting && (
          <div className="connecting-message">
            서버에 연결하는 중...
          </div>
        )}
        {messages.map((msg, index) => {
          const isOwnMessage = msg.username === username
          const isSystemMessage = msg.type === 'JOIN' || msg.type === 'LEAVE'

          if (isSystemMessage) {
            // 서버에서 보낸 메시지 필드 사용 (null 체크)
            const displayMessage = msg.message || `${msg.username || '알 수 없음'}님이 ${msg.type === 'JOIN' ? '입장' : '퇴장'}하셨습니다.`
            return (
              <div key={index} className="system-message">
                {displayMessage}
              </div>
            )
          }

          return (
            <div
              key={index}
              className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
            >
              <div className="message-content">
                {!isOwnMessage && (
                  <span className="message-username">{msg.username}</span>
                )}
                <div className="message-text">{msg.message}</div>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
          disabled={!isConnected}
          autoFocus
        />
        <button type="submit" disabled={!isConnected || !inputMessage.trim()}>
          전송
        </button>
      </form>
    </div>
  )
}

export default ChatRoom

