# 🚀 RSocket 채팅 애플리케이션

Spring Boot와 React를 사용한 실시간 채팅 애플리케이션입니다. RSocket 프로토콜을 통해 양방향 실시간 통신을 구현했습니다.

## 📋 프로젝트 구조

```
rsocket-test/
├── src/                          # Spring Boot 백엔드
│   └── main/
│       ├── java/
│       │   └── com/example/rsocketchat/
│       │       ├── RSocketChatApplication.java
│       │       ├── config/
│       │       │   └── RSocketConfig.java
│       │       ├── service/
│       │       │   └── ChatService.java
│       │       ├── controller/
│       │       │   └── ChatController.java
│       │       └── model/
│       │           └── ChatMessage.java
│       └── resources/
│           └── application.yml
├── client/                       # React 클라이언트
│   ├── src/
│   │   ├── services/
│   │   │   └── rsocketClient.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── build.gradle
└── settings.gradle
```

## 🛠️ 기술 스택

### 백엔드
- **Spring Boot 3.2.0** - 웹 애플리케이션 프레임워크
- **RSocket** - 양방향 실시간 통신 프로토콜
- **Spring WebFlux** - 리액티브 프로그래밍
- **Project Reactor** - Reactive Streams 구현
- **Gradle** - 빌드 도구
- **Java 17** - 프로그래밍 언어

### 프론트엔드
- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **rsocket-core** - RSocket 코어 라이브러리
- **rsocket-websocket-client** - RSocket WebSocket 클라이언트
- **Modern CSS** - 스타일링

## ⚡ 주요 기능

- ✅ 실시간 양방향 채팅
- ✅ 여러 사용자 동시 접속 지원
- ✅ 자동 스크롤
- ✅ 메시지 타임스탬프
- ✅ 모던하고 반응형 UI
- ✅ 사용자 구분 (본인/타인 메시지)

## 🚀 실행 방법

### 1. 백엔드 서버 실행

프로젝트 루트 디렉토리에서:

```bash
# Gradle Wrapper를 사용하여 실행
./gradlew bootRun

# 또는 빌드 후 실행
./gradlew build
java -jar build/libs/rsocket-chat-0.0.1-SNAPSHOT.jar
```

서버는 다음 포트에서 실행됩니다:
- **HTTP**: `http://localhost:8080`
- **RSocket WebSocket**: `ws://localhost:8080/rsocket`

### 2. 프론트엔드 클라이언트 실행

새 터미널 창에서:

```bash
# client 디렉토리로 이동
cd client

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

클라이언트는 `http://localhost:3000`에서 실행됩니다.

## 📱 사용 방법

1. 브라우저에서 `http://localhost:3000`에 접속
2. 사용자 이름을 입력하고 "입장하기" 클릭
3. 메시지를 입력하고 전송
4. 여러 브라우저 탭/창을 열어 다중 사용자 채팅 테스트

## 🔧 설정

### 백엔드 설정 (`application.yml`)

```yaml
spring:
  rsocket:
    server:
      port: 7000
      transport: websocket
      mapping-path: /rsocket

server:
  port: 8080
```

### RSocket 엔드포인트

- **`chat.send`** - 메시지 전송 (Fire-and-Forget)
- **`chat.stream`** - 메시지 스트림 구독 (Request-Stream)

## 📦 빌드

### 백엔드 빌드
```bash
./gradlew build
```

빌드된 JAR 파일: `build/libs/rsocket-chat-0.0.1-SNAPSHOT.jar`

### 프론트엔드 빌드
```bash
cd client
npm run build
```

빌드된 파일: `client/dist/`

## 🐛 문제 해결

### 연결 오류 시
1. 백엔드 서버가 실행 중인지 확인
2. 포트 8080과 3000이 사용 가능한지 확인
3. 브라우저 콘솔에서 오류 메시지 확인

### 의존성 오류 시
```bash
# 백엔드
./gradlew clean build

# 프론트엔드
cd client
rm -rf node_modules package-lock.json
npm install
```

## 🔧 기술 세부사항

**RSocket 통신:**
- RSocket over WebSocket 프로토콜 사용
- Reactive Streams (Project Reactor) 기반
- Fire-and-Forget, Request-Stream 패턴 활용

**통신 패턴:**
- `chat.send` - Fire-and-Forget으로 메시지 전송
- `chat.stream` - Request-Stream으로 실시간 메시지 수신
- Backpressure 지원으로 안정적인 스트리밍

## 📝 API 설명

### ChatMessage 모델
```java
{
  "username": "사용자이름",
  "message": "메시지 내용",
  "timestamp": "2024-11-24T10:30:00"
}
```

## 🎨 UI 특징

- 그라디언트 배경 (보라색 계열)
- 부드러운 애니메이션
- 반응형 디자인
- 사용자별 메시지 색상 구분
- 깔끔한 현대적 인터페이스

## 🤝 기여

이슈나 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이선스

이 프로젝트는 학습 목적으로 만들어졌습니다.

