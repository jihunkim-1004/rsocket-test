import {
  RSocketClient,
  JsonSerializer,
  IdentitySerializer,
} from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';

// 라우팅 메타데이터를 문자열로 인코딩
// RSocket 라우팅 메타데이터 형식: [길이(1바이트)] + [라우트 문자열]
function encodeRoute(route) {
  const routeBytes = new TextEncoder().encode(route);
  const buffer = new Uint8Array(1 + routeBytes.length);
  buffer[0] = routeBytes.length;
  buffer.set(routeBytes, 1);
  return String.fromCharCode(...buffer);
}

// 전역 연결 플래그 (React StrictMode 대응)
let isConnecting = false;
let connectionLock = null;

class RSocketService {
  constructor() {
    this.client = null;
    this.socket = null;
    this.subscription = null;
    this.connectingPromise = null; // 연결 중인 Promise 저장
    this.joinedUsers = new Set(); // 참여한 사용자 목록
  }

  connect(url, username) {
    // 이미 연결되어 있으면 기존 연결 반환
    if (this.socket) {
      console.log('이미 연결되어 있습니다.');
      return Promise.resolve(this.socket);
    }

    // 전역 연결 플래그 확인
    if (isConnecting && connectionLock) {
      console.log('다른 곳에서 연결 중입니다. 기존 연결을 기다립니다.');
      return connectionLock;
    }

    // 연결 중이면 기존 연결 Promise 반환
    if (this.connectingPromise) {
      console.log('연결 중입니다. 기존 연결을 기다립니다.');
      return this.connectingPromise;
    }

    // 전역 플래그 설정
    isConnecting = true;

    this.connectingPromise = new Promise((resolve, reject) => {
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
        },
        transport: new RSocketWebSocketClient({
          url: url,
        }),
      });

      // 전역 Promise 저장
      connectionLock = this.connectingPromise;

      client.connect().subscribe({
        onComplete: (socket) => {
          this.socket = socket;
          this.connectingPromise = null; // 연결 완료 후 초기화
          isConnecting = false; // 전역 플래그 해제
          connectionLock = null; // 전역 Promise 해제
          console.log('RSocket 연결 성공');
          
          // 연결 성공 시 즉시 resolve (joinChat은 별도로 처리)
          resolve(socket);
          
          // 연결 후 자동으로 채팅 참여 (비동기로 처리)
          if (username) {
            this.joinChat(username).catch((error) => {
              console.error('채팅 참여 실패:', error);
              // 참여 실패해도 연결은 유지
            });
          }
        },
        onError: (error) => {
          this.connectingPromise = null; // 에러 발생 시 초기화
          isConnecting = false; // 전역 플래그 해제
          connectionLock = null; // 전역 Promise 해제
          console.error('RSocket 연결 실패:', error);
          reject(error);
        },
      });
    });

    return this.connectingPromise;
  }

  joinChat(username) {
    if (!this.socket) {
      return Promise.reject(new Error('소켓이 연결되지 않았습니다'));
    }

    // 이미 참여한 사용자면 중복 참여 방지
    if (this.joinedUsers.has(username)) {
      console.log('이미 참여한 사용자입니다:', username);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.socket.requestResponse({
        data: { username, type: 'JOIN' },
        metadata: encodeRoute('rsocket.chat.join'),
      }).subscribe({
        onComplete: () => {
          this.joinedUsers.add(username);
          console.log('채팅 참여 성공');
          resolve();
        },
        onError: (error) => {
          console.error('채팅 참여 실패:', error);
          reject(error);
        },
      });
    });
  }

  leaveChat(username) {
    if (!this.socket) {
      // 소켓이 없으면 조용히 성공 처리
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.socket.requestResponse({
        data: { username, type: 'LEAVE' },
        metadata: encodeRoute('rsocket.chat.leave'),
      }).subscribe({
        onComplete: () => {
          console.log('채팅 나가기 성공');
          resolve();
        },
        onError: (error) => {
          console.error('채팅 나가기 실패:', error);
          // 실패해도 resolve하여 연결 종료는 계속 진행
          resolve();
        },
      });
    });
  }

  sendMessage(username, message) {
    if (!this.socket) {
      console.error('소켓이 연결되지 않았습니다');
      return;
    }

    try {
      // 서버 측 중복 핸들러 문제를 피하기 위해 requestResponse 사용
      this.socket.requestResponse({
        data: {
          username,
          message,
          type: 'MESSAGE',
        },
        metadata: encodeRoute('rsocket.chat.send'),
      }).subscribe({
        onComplete: () => {
          // 성공적으로 전송됨
        },
        onError: (error) => {
          console.error('메시지 전송 에러:', error);
        },
      });
    } catch (error) {
      console.error('메시지 전송 에러:', error);
    }
  }

  streamMessages(callback) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('소켓이 연결되지 않았습니다'));
        return;
      }

      // 기존 구독이 있으면 취소
      if (this.subscription) {
        console.log('기존 스트림 구독 취소');
        this.subscription.cancel();
        this.subscription = null;
      }

      this.socket.requestStream({
        data: {},
        metadata: encodeRoute('rsocket.chat.stream'),
      }).subscribe({
        onComplete: () => {
          console.log('스트림 완료');
        },
        onError: (error) => {
          console.error('스트림 에러:', error);
          this.subscription = null;
          reject(error);
        },
        onNext: (payload) => {
          console.log('스트림 데이터 수신:', payload);
          if (payload.data) {
            try {
              // 데이터가 이미 객체면 그대로 사용, 문자열이면 JSON 파싱
              let messageData = payload.data;
              
              // 바이너리 데이터 체크 (Uint8Array나 ArrayBuffer인 경우)
              if (messageData instanceof Uint8Array || messageData instanceof ArrayBuffer) {
                console.warn('바이너리 데이터 수신, 무시:', Array.from(messageData).map(b => b.toString(16).padStart(2, '0')).join(' '));
                return;
              }
              
              // 문자열이지만 바이너리처럼 보이는 경우 체크
              if (typeof messageData === 'string' && /^[\x00-\x08\x0B-\x1F\x7F-\xFF]+$/.test(messageData)) {
                console.warn('바이너리 문자열 수신, 무시:', Array.from(new TextEncoder().encode(messageData)).map(b => b.toString(16).padStart(2, '0')).join(' '));
                return;
              }
              
              if (typeof messageData === 'string') {
                try {
                  messageData = JSON.parse(messageData);
                } catch (e) {
                  // JSON 파싱 실패 시 무시
                  console.warn('메시지 파싱 실패:', e, messageData);
                  return;
                }
              }
              
              // 유효한 메시지 객체인지 확인
              if (messageData && typeof messageData === 'object' && (messageData.username || messageData.message)) {
                callback(messageData);
              } else {
                console.warn('유효하지 않은 메시지 형식:', messageData);
              }
            } catch (error) {
              console.error('메시지 처리 오류:', error, payload.data);
            }
          }
        },
        onSubscribe: (subscription) => {
          console.log('스트림 구독 시작');
          this.subscription = subscription;
          subscription.request(2147483647); // 최대값 요청
          resolve(subscription);
        },
      });
    });
  }

  isConnected() {
    return this.socket !== null;
  }

  disconnect() {
    try {
      if (this.subscription) {
        this.subscription.cancel();
        this.subscription = null;
      }
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      // 연결 중 Promise도 초기화
      this.connectingPromise = null;
      // 참여한 사용자 목록도 초기화
      this.joinedUsers.clear();
      // 전역 플래그도 초기화
      isConnecting = false;
      connectionLock = null;
    } catch (error) {
      console.error('연결 종료 중 오류:', error);
      // 에러가 발생해도 상태는 초기화
      this.socket = null;
      this.subscription = null;
      this.connectingPromise = null;
      this.joinedUsers.clear();
      isConnecting = false;
      connectionLock = null;
    }
  }
}

export default new RSocketService();

