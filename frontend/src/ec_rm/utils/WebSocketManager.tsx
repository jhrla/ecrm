import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import store from 'store/store';

interface CCTVConfig {
  ip: string;
  username: string;
  password: string;
  channel: number;
  stream: 'main' | 'sub';
  port?: string;
}

interface WebSocketErrorEvent extends Event {
  error?: Error;
  message?: string;
}

class WebSocketManager {
  private static instance: WebSocketManager;
  private client: Client | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private isStompReady = false;
  private subscriptionQueue: Map<string, () => void> = new Map();
  private subscriptions: Map<string, { unsubscribe: () => void }> = new Map();
  private topicListeners: Map<string, Set<(message: IMessage) => void>> =
    new Map();
  private brokerURL: string;
  private maxRetries = Infinity;
  private currentRetries = 0;
  private baseRetryDelay = 1000;
  private cctvPlayer: any = null;
  private cctvSocket: WebSocket | null = null;
  private reconnectCallbacks: (() => void)[] = [];
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS: number = 3;

  private constructor() {
    console.log('환경변수 WS URL:', process.env.REACT_APP_WS_URL);

    if (!process.env.REACT_APP_WS_URL) {
      console.error('WebSocket URL이 환경변수에 설정되지 않았습니다');
      this.brokerURL = 'https://keep.ktssolution.co.kr/ecrm/ws';
    } else {
      this.brokerURL = process.env.REACT_APP_WS_URL;
    }

    console.log('최종 WebSocket URL:', this.brokerURL);
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public setBrokerURL(url: string) {
    this.brokerURL = url;
  }

  public async connect() {
    if (this.client?.connected) {
      console.log('Already connected');
      return;
    }

    try {
      // 기존 연결 정리
      this.cleanup();

      // store 초기화 확인
      await new Promise<void>((resolve) => {
        const checkStore = () => {
          const state = store.getState();
          if (state && state.event) {
            resolve();
          } else {
            setTimeout(checkStore, 100);
          }
        };
        checkStore();
      });

      console.log('Store initialized, connecting to WebSocket...');

      const socket = new SockJS(this.brokerURL);
      this.client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      await this.setupStompConnection();
    } catch (error) {
      console.error('Connection error:', error);
      this.handleDisconnection();
    }
  }

  private handleDisconnection() {
    this.isConnected = false;
    this.isStompReady = false;

    this.subscriptions.clear();

    this.startReconnection();
  }

  private startReconnection() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const retryDelay = Math.min(
      this.baseRetryDelay * Math.pow(1.5, this.currentRetries),
      10000
    );

    console.log(
      `Scheduling reconnection attempt ${this.currentRetries + 1} in ${retryDelay}ms`
    );

    this.reconnectTimer = setTimeout(() => {
      this.currentRetries++;
      this.connect();
    }, retryDelay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private cleanup() {
    if (this.client) {
      this.subscriptions.forEach((sub) => {
        if (sub) sub.unsubscribe();
      });
      this.subscriptions.clear();
      if (this.client.connected) {
        this.client.deactivate();
      }
      this.client = null;
    }
    this.isConnected = false;
    this.isStompReady = false;
  }

  public disconnect() {
    this.cleanup();
    this.currentRetries = this.maxRetries;
  }

  private async checkServerStatus(): Promise<boolean> {
    try {
      const response = await fetch('/health-check');
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }

  private executeSubscriptions() {
    console.log('Executing queued subscriptions');
    const queuedSubscriptions = Array.from(this.subscriptionQueue.entries());

    queuedSubscriptions.forEach(([topic, subscription]) => {
      console.log(`Re-subscribing to ${topic}`);
      subscription();
    });
  }

  public isConnectedAndReady(): boolean {
    return this.isConnected && this.isStompReady;
  }

  sendMessage(destination: string, body: string) {
    try {
      this.checkConnection();
      if (this.client?.connected) {
        this.client.publish({
          destination: destination,
          body: body,
        });
        console.log(`Message sent to ${destination}:`, body);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  public subscribe(topic: string, handler: (message: IMessage) => void) {
    console.log(`Attempting to subscribe to ${topic}`);

    if (!this.topicListeners.has(topic)) {
      this.topicListeners.set(topic, new Set());
    }

    this.topicListeners.get(topic)?.add(handler);

    const subscriptionFunc = () => {
      if (!this.client?.connected) {
        console.log(`Cannot subscribe to ${topic}, connection not ready`);
        this.subscriptionQueue.set(topic, subscriptionFunc);
        return;
      }

      try {
        console.log(`Subscribing to topic ${topic}`);
        const subscription = this.client.subscribe(
          topic,
          (message: IMessage) => {
            console.log(`Received message from ${topic}:`, message.body);
            this.notifyListeners(topic, message);
          }
        );

        this.subscriptions.set(topic, subscription);
        console.log(`Successfully subscribed to ${topic}`);
      } catch (error) {
        console.error(`Subscription error for ${topic}:`, error);
        this.subscriptionQueue.set(topic, subscriptionFunc);
      }
    };

    if (this.isStompReady && this.client?.connected) {
      subscriptionFunc();
    } else {
      console.log(`Queuing subscription to ${topic}`);
      this.subscriptionQueue.set(topic, subscriptionFunc);
    }
  }

  unsubscribe(topic: string) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      console.log(`Unsubscribing from topic ${topic}`);
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      this.topicListeners.delete(topic);
    } else {
      console.log(`No active subscription to topic ${topic} found.`);
    }
  }

  subscribeCCTVStream(
    config: CCTVConfig,
    canvasElement: HTMLCanvasElement,
    type: string = 'dahua'
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.cctvSocket || this.cctvPlayer) {
          this.unsubscribeCCTVStream();
        }

        // 서버에 초기화 요청
        const response = await fetch(
          `/api/cctv/init?channel=${config.channel}&mainStream=${config.stream === 'main'}`,
          {
            method: 'POST',
          }
        );

        if (!response.ok) {
          throw new Error('Server initialization failed');
        }

        const data = await response.json();
        console.log('CCTV initialization response:', data);

        // WebSocket 연결
        const wsUrl = `ws://${config.ip}:${config.port}/`;
        console.log('Connecting to CCTV:', wsUrl);

        this.cctvSocket = new WebSocket(wsUrl);
        this.cctvSocket.binaryType = 'arraybuffer';

        const connectionTimeout = setTimeout(() => {
          if (this.cctvSocket?.readyState !== WebSocket.OPEN) {
            this.unsubscribeCCTVStream();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.cctvSocket.onopen = () => {
          console.log('WebSocket connected');
          clearTimeout(connectionTimeout);

          const loginRequest = {
            method: 'global.login',
            params: {
              userName: config.username,
              password: config.password,
              clientType: 'Web5.0',
              loginType: 'Direct',
            },
            id: 1,
          };

          this.cctvSocket?.send(JSON.stringify(loginRequest));
        };

        this.cctvSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received:', data);

            if (data.method === 'global.login' && data.result) {
              const startVideo = {
                method: 'realTime.startVideo',
                params: {
                  channel: config.channel,
                  stream: config.stream === 'main' ? 'Main' : 'Extra1',
                  codec: 'H264',
                },
                id: 2,
              };
              this.cctvSocket?.send(JSON.stringify(startVideo));
              resolve(true);
            }
          } catch (e) {
            if (event.data instanceof ArrayBuffer) {
              if (this.cctvPlayer) {
                this.cctvPlayer.write(new Uint8Array(event.data));
              }
            }
          }
        };

        this.cctvSocket.onerror = (event: Event) => {
          console.error('WebSocket error:', event);
          clearTimeout(connectionTimeout);
          reject(new Error('WebSocket connection failed'));
        };

        this.cctvSocket.onclose = (event) => {
          console.log('WebSocket closed:', event);
          clearTimeout(connectionTimeout);
          if (event.code === 1006) {
            this.handleReconnection(config, canvasElement, reject);
          }
        };
      } catch (error) {
        console.error('CCTV connection error:', error);
        reject(error);
      }
    });
  }

  private handleReconnection(
    config: CCTVConfig,
    canvasElement: HTMLCanvasElement,
    reject: (reason?: any) => void
  ) {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`
      );

      setTimeout(() => {
        this.subscribeCCTVStream(config, canvasElement)
          .then(() => {
            this.reconnectAttempts = 0;
          })
          .catch(reject);
      }, 2000);
    } else {
      this.reconnectAttempts = 0;
      reject(new Error('Failed to connect after multiple attempts'));
    }
  }

  private handleVideoData(
    arrayBuffer: ArrayBuffer,
    canvasElement: HTMLCanvasElement
  ) {
    // JSMpeg가 처리하므로 이 메서드는 비워둡니다
  }

  unsubscribeCCTVStream() {
    if (this.cctvSocket) {
      if (this.cctvSocket.readyState === WebSocket.OPEN) {
        const logoutRequest = {
          method: 'global.logout',
          params: null,
          id: 3,
        };
        this.cctvSocket.send(JSON.stringify(logoutRequest));
      }
      this.cctvSocket.close();
      this.cctvSocket = null;
    }

    if (this.cctvPlayer) {
      this.cctvPlayer.destroy();
      this.cctvPlayer = null;
    }

    this.reconnectAttempts = 0;
  }

  private checkConnection() {
    if (!this.client || !this.isConnected || !this.isStompReady) {
      throw new Error('STOMP connection is not ready');
    }
  }

  private notifyListeners(topic: string, message: IMessage) {
    console.log(`Notifying listeners for topic ${topic}`);
    const listeners = this.topicListeners.get(topic);
    listeners?.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error(`Error in listener for topic ${topic}:`, error);
      }
    });
  }

  public onReconnect(callback: () => void) {
    this.reconnectCallbacks.push(callback);
  }

  public offReconnect(callback: () => void) {
    this.reconnectCallbacks = this.reconnectCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  private handleReconnect() {
    console.log('Executing reconnect callbacks');
    this.reconnectCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Error executing reconnect callback:', error);
      }
    });
  }

  // 웹소켓 연결 설정 수정
  connectWebSocket = () => {
    const wsUrl =
      process.env.NODE_ENV === 'development'
        ? 'wss://keep.ktssolution.co.kr/ecrm/ws'
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ecrm/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      debug: () => {},
      onConnect: () => {
        this.setConnected(true);
        this.resubscribeToTopics();
      },
      onDisconnect: () => {
        this.setConnected(false);
      },
    });

    client.activate();
    return client;
  };

  private setConnected(status: boolean) {
    this.isConnected = status;
    if (status) {
      this.handleReconnect();
    }
  }

  private resubscribeToTopics() {
    console.log('Executing queued subscriptions');
    this.executeSubscriptions(); // 기존 executeSubscriptions 메서드 사용
  }

  private ensureStoreInitialized() {
    return new Promise<void>((resolve) => {
      const checkStore = () => {
        const state = store.getState();
        if (state.event) {
          resolve();
        } else {
          setTimeout(checkStore, 100);
        }
      };
      checkStore();
    });
  }

  private setupStompConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('STOMP client not initialized'));
        return;
      }

      this.client.onConnect = () => {
        this.isConnected = true;
        this.isStompReady = true;
        this.executeSubscriptions();
        resolve();
      };

      this.client.onStompError = (error) => {
        reject(error);
      };

      this.client.activate();
    });
  }
}

export default WebSocketManager;
