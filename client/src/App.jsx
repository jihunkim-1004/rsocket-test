import { useState, useEffect, useRef } from 'react'
import ChatRoom from './components/ChatRoom'
import LoginForm from './components/LoginForm'
import './App.css'

function App() {
  const [username, setUsername] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  const handleLogin = (name) => {
    setUsername(name)
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    setUsername(null)
    setIsConnected(false)
  }

  return (
    <div className="app">
      {!isConnected ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <ChatRoom username={username} onDisconnect={handleDisconnect} />
      )}
    </div>
  )
}

export default App

