import { Buffer } from 'buffer'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 브라우저 환경에서 Buffer를 global에 설정
window.Buffer = Buffer
globalThis.Buffer = Buffer

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

