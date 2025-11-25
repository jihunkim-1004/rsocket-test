import {
  RSocketClient,
  JsonSerializer,
  IdentitySerializer,
} from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Buffer } from 'buffer';

// 브라우저 환경에서 Buffer 사용 가능하도록 설정
window.Buffer = Buffer;

// 라우팅 메타데이터를 문자열로 인코딩
function encodeRoute(route) {
  return String.fromCharCode(route.length) + route;
}

class RSocketService {
  constructor() {
    this.client = null;
    this.socket = null;
  }

  connect(url, username) {
    return new Promise((resolve, reject) => {
      const client = new RSocketClient({
        serializers: {
          data: JsonSerializer,
          metadata: IdentitySerializer,
        },
        setup: {
          keepAlive: 60000,
          lifetime: 180000,
          dataMimeType: 'application/json',
          metadataMimeType: 'message/x.rsocket.routing.v0',
          // RSocket setup frame에 username 포함 (RSocket의 실제 기능 활용)
          data: username ? { username: username } : null,
        },
        transport: new RSocketWebSocketClient({
          url: url,
        }),
      });

      client.connect().subscribe({
        onComplete: (socket) => {
          this.socket = socket;
          console.log('RSocket 연결 성공');
          resolve(socket);
        },
        onError: (error) => {
          console.error('RSocket 연결 실패:', error);
          reject(error);
        },
      });
    });
  }

  sendMessage(route, message) {
    if (!this.socket) {
      console.error('소켓이 연결되지 않았습니다');
      return;
    }

    try {
      this.socket.fireAndForget({
        data: message,
        metadata: encodeRoute(route),
      });
    } catch (error) {
      console.error('메시지 전송 에러:', error);
    }
  }

  streamMessages(route, data, callback) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        console.error('소켓이 연결되지 않았습니다');
        reject(new Error('소켓이 연결되지 않았습니다'));
        return;
      }

      // callback이 두 번째 인자인 경우 (이전 버전 호환성)
      if (typeof data === 'function') {
        callback = data;
        data = {};
      }

      this.socket.requestStream({
        data: typeof data === 'string' ? data : data,
        metadata: encodeRoute(route),
      }).subscribe({
        onComplete: () => {
          console.log('스트림 완료');
        },
        onError: (error) => {
          console.error('스트림 에러:', error);
          reject(error);
        },
        onNext: (payload) => {
          console.log('스트림 데이터 수신:', payload.data);
          callback(payload.data);
        },
        onSubscribe: (subscription) => {
          console.log('스트림 구독 시작');
          subscription.request(2147483647); // 최대값 요청
          resolve(); // 구독이 시작되면 resolve
        },
      });
    });
  }

  requestResponse(route, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('소켓이 연결되지 않았습니다'));
        return;
      }

      this.socket.requestResponse({
        data: data,
        metadata: encodeRoute(route),
      }).subscribe({
        onComplete: (payload) => resolve(payload ? payload.data : null),
        onError: (error) => reject(error),
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default new RSocketService();
