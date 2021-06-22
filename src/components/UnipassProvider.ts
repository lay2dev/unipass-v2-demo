import {
  Address,
  AddressType,
  Blake2bHasher,
  getDefaultPrefix,
  HashType,
  Platform,
  Provider,
  Script
} from '@lay2/pw-core';
import { LocalStorage } from 'quasar';
import { getData, saveData } from './LocalData';

type UP_ACT =
  | 'UP-READY'
  | 'UP-LOGIN'
  | 'UP-SIGN'
  | 'UP-CLOSE'
  | 'UP-BIND'
  | 'UP-RECOVERY';

export interface UnipassAccount {
  pubkey: string;
  email: string;
  recovery?: boolean;
}
export interface UnipassSign {
  pubkey: string;
  sign: string;
}
export interface UnipassMessage {
  upact: UP_ACT;
  payload?: string | UnipassAccount | UnipassSign;
}

export default class UnipassProvider extends Provider {
  private _email: string | undefined;
  private _recovery: boolean | undefined;
  private msgHandler:
    | ((this: Window, event: MessageEvent) => unknown)
    | undefined;

  get email() {
    return this._email;
  }
  get recovery() {
    return this._recovery;
  }

  constructor(email: string, address: string) {
    super(Platform.ckb);
    this._email = email;
    this.address = new Address(address, AddressType.ckb);
  }

  async init(): Promise<UnipassProvider> {
    return new Promise(resolve => {
      resolve(this);
    });
  }
  async recover(): Promise<UnipassProvider> {
    console.log('[UnipassProvider] to recover');
    return new Promise(resolve => resolve(this));
  }
  sign(message: string): Promise<string> {
    console.log('[UnipassProvider] message to sign', message);
    return new Promise(resolve => resolve(''));
  }

  close() {
    this.msgHandler && window.removeEventListener('message', this.msgHandler);
  }
}

export function pubkeyToAddress(pubkey: string): string {
  const pubKeyBuffer = Buffer.from(pubkey.replace('0x', ''), 'hex');

  const hashHex = new Blake2bHasher()
    .update(pubKeyBuffer.buffer)
    .digest()
    .serializeJson()
    .slice(0, 42);
  const isLina = LocalStorage.getItem('lina');
  const isTest = LocalStorage.getItem('test');
  let script: Script;
  if (isLina) {
    script = new Script(
      '0x614d40a86e1b29a8f4d8d93b9f3b390bf740803fa19a69f1c95716e029ea09b3',
      hashHex,
      HashType.type
    );
  } else if (isTest) {
    script = new Script(
      '0x949db47aac7d1a2a0d921344dc5c1ddefda390813a1881d56a0872d798e0d629',
      hashHex,
      HashType.type
    );
  } else {
    script = new Script(
      '0x124a60cd799e1fbca664196de46b3f7f0ecb7138133dcaea4893c51df5b02be6',
      hashHex,
      HashType.type
    );
  }

  return script.toAddress(getDefaultPrefix()).toCKBAddress();
}
