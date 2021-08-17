/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import urlencode from 'urlencode';
import { getData, saveData } from './LocalData';
import { pubkeyToAddress } from './UnipassProvider';
import { Notify } from 'quasar';

export interface UnipassData {
  data: {
    email?: string;
    pubkey?: string;
    recovery?: string;
    sig?: string;
  };
  info: string;
  code: number;
}
export function getDataFromUrl(unipassData?: UnipassData): void {
  const url = new URL(window.location.href);
  if (!unipassData) {
    console.log('getDataFromUrl--', url);
    let data = '';
    try {
      data = url.searchParams.get('unipass_ret') as string;
    } catch (e) {
      console.log('getDataFromUrl-e', e);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const unipassStr = urlencode.decode(data, 'utf-8');
    unipassData = JSON.parse(unipassStr) as UnipassData;
  }
  console.log(unipassData);
  if (unipassData.code === 200) {
    // todo save data
    if (unipassData.data.pubkey && unipassData.data.email) {
      const ckbAddress = pubkeyToAddress(unipassData.data.pubkey);
      console.log('ckbAddress', ckbAddress);
      saveData({
        email: unipassData.data.email,
        pubkey: unipassData.data.pubkey,
        address: ckbAddress,
        sig: unipassData.data.sig
      });
    } else if (unipassData.data.pubkey) {
      const data = getData();
      data.pubkey = unipassData.data.pubkey;
      data.sig = unipassData.data.sig;
      saveData(data);
    }
  } else {
    if (unipassData.info == 'sign rejected') {
      const data = getData();
      data.sig = '';
      saveData(data);
    }
    Notify.create(unipassData.info);
  }

  url.searchParams.delete('unipass_ret');
  history.replaceState('', '', url.href);
  console.log('url.href', url.href);
}

export function getPublick(): string {
  const data = getData();
  return data.pubkey;
}

export function addBinary(a: string, b: string) {
  let res = '';
  let c = 0;
  const binary1 = a.split('');
  const binary2 = b.split('');
  while (binary1.length || binary2.length) {
    const a = binary1.pop();
    const b = binary2.pop();
    if (a && b) {
      c += parseInt(a) + parseInt(b);
    } else if (a) {
      c += parseInt(a);
    } else if (b) {
      c += parseInt(b);
    }
    res = `${c % 2}${res}`;
    c > 1 ? (c = 1) : (c = 0);
  }
  if (c == 1) res = `${c}${res}`;
  let data = parseInt(res, 2).toString(16);
  if (data.length == 1) data = `0${data}`;
  return data;
}
