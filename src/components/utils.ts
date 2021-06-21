/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import urlencode from 'urlencode';
import { getData, saveData } from './LocalData';
import { pubkeyToAddress } from './UnipassProvider';
import { Notify } from 'quasar';

interface UnipassData {
  data: {
    email?: string;
    pubkey?: string;
    recovery?: string;
    sig?: string;
  };
  info: string;
  code: number;
}
export function getDataFromUrl(): void {
  const url = window.location.href;
  console.log('getDataFromUrl--', url);
  let data = '';
  try {
    data = url.split('unipass_ret=')[1];
  } catch (e) {
    console.log('getDataFromUrl-e', e);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const unipassStr = urlencode.decode(data, 'utf-8');
  const unipassData = JSON.parse(unipassStr) as UnipassData;
  console.log(unipassData);
  if (unipassData.code === 200) {
    // todo save data
    if (unipassData.data.pubkey && unipassData.data.email) {
      const ckbAddress = pubkeyToAddress(unipassData.data.pubkey);
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
}

export function getPublick(): string {
  const data = getData();
  return data.pubkey;
}
