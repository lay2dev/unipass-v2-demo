import {
  Address,
  AddressType,
  getDefaultPrefix,
  HashType,
  Platform,
  Provider,
  Script
} from '@lay2/pw-core';
import { createHash } from 'crypto';
import { getData, saveData } from './LocalData';

type UP_ACT = 'UP-READY' | 'UP-LOGIN' | 'UP-SIGN' | 'UP-CLOSE' | 'UP-BIND';

export interface UnipassAccount {
  pubkey: string;
  email: string;
}
export interface UnipassMessage {
  upact: UP_ACT;
  payload?: string | UnipassAccount;
}

export default class UnipassProvider extends Provider {
  private _email: string | undefined;
  private msgHandler:
    | ((this: Window, event: MessageEvent) => unknown)
    | undefined;

  get email() {
    return this._email;
  }

  constructor(private readonly UNIPASS_BASE = 'https://unipass.me') {
    super(Platform.ckb);
  }

  async init(): Promise<UnipassProvider> {
    return new Promise(resolve => {
      const data = getData();
      console.log(data, '-----');
      if (!data) {
        const { blackOut, uniFrame } = openIframe(
          'login',
          `${this.UNIPASS_BASE}/#/login`,
          () => {
            const msg: UnipassMessage = {
              upact: 'UP-LOGIN'
            };
            uniFrame.contentWindow &&
              uniFrame.contentWindow.postMessage(msg, this.UNIPASS_BASE);
          }
        );

        this.msgHandler = event => {
          if (typeof event.data === 'object' && 'upact' in event.data) {
            const msg = event.data as UnipassMessage;
            if (msg.upact === 'UP-LOGIN') {
              const { pubkey, email } = msg.payload as UnipassAccount;
              const ckbAddress = pubkeyToAddress(pubkey);
              this.address = new Address(ckbAddress, AddressType.ckb);
              saveData({ email, pubkey, address: this.address });
              this._email = email;
              this.msgHandler &&
                window.removeEventListener('message', this.msgHandler);
              blackOut && blackOut.remove();
              resolve(this);
            }
          }
        };
        window.addEventListener('message', this.msgHandler, false);
      } else {
        this._email = data.email;
        this.address = data.address;
        resolve(this);
      }
    });
  }

  sign(message: string): Promise<string> {
    console.log('[UnipassProvider] message to sign', message);
    return new Promise(resolve => {
      const { blackOut, uniFrame } = openIframe(
        'sign',
        `${this.UNIPASS_BASE}/#/sign`
      );
      this.msgHandler = event => {
        if (typeof event.data === 'object' && 'upact' in event.data) {
          const msg = event.data as UnipassMessage;
          if (msg.upact === 'UP-SIGN') {
            const signature = msg.payload as string;
            console.log('[Sign] signature: ', signature);
            this.msgHandler &&
              window.removeEventListener('message', this.msgHandler);
            blackOut && blackOut.remove();
            resolve('0x' + signature);
          } else if (msg.upact === 'UP-READY') {
            console.log('[UnipassProvider] sign READY');
            const msg: UnipassMessage = {
              upact: 'UP-SIGN',
              payload: message
            };
            uniFrame.contentWindow &&
              uniFrame.contentWindow.postMessage(msg, this.UNIPASS_BASE);
            console.log('[UnipassProvider] opend');
          }
        }
      };

      window.addEventListener('message', this.msgHandler, false);
    });
  }

  close() {
    this.msgHandler && window.removeEventListener('message', this.msgHandler);
  }
}
function openIframe(
  title: string,
  url: string,
  onload?: (this: GlobalEventHandlers, ev: Event) => unknown
) {
  const uniFrame = document.createElement('iframe');
  uniFrame.src = url;
  uniFrame.style.width = '80%';
  uniFrame.style.height = '80%';
  uniFrame.style.backgroundColor = '#FFF';
  uniFrame.setAttribute('scrolling', 'no');
  uniFrame.setAttribute('frameborder', 'no');
  onload && (uniFrame.onload = onload);

  const blackOut = document.createElement('div');
  blackOut.id = 'uni-frame';
  blackOut.style.position = 'absolute';
  blackOut.style.zIndex = '1010';
  blackOut.style.left = '0';
  blackOut.style.top = '0';
  blackOut.style.width = '100%';
  blackOut.style.height = '100%';
  blackOut.style.backgroundColor = 'rgba(0,0,0,.65)';
  blackOut.style.display = 'flex';
  blackOut.style.justifyContent = 'center';
  blackOut.style.alignItems = 'center';

  blackOut.appendChild(uniFrame);
  document.body.appendChild(blackOut);

  return { blackOut, uniFrame };
}

function pubkeyToAddress(pubkey: string): string {
  const pubKeyBuffer = Buffer.from(pubkey.replace('0x', ''), 'hex');
  const hashHex =
    '0x' +
    createHash('SHA256')
      .update(pubKeyBuffer)
      .digest('hex')
      .toString()
      .slice(0, 40);
  // console.log('hashHex', hashHex);

  const script = new Script(
    '0x6843c5fe3acb7f4dc2230392813cb9c12dbced5597fca30a52f13aa519de8d33',
    hashHex,
    HashType.type
  );

  return script.toAddress(getDefaultPrefix()).toCKBAddress();
}
