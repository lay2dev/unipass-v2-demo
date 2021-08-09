import { LocalStorage } from 'quasar';

/*
 * @Author: Aven
 * @Date: 2021-04-26 14:18:43
 * @LastEditors: Aven
 * @LastEditTime: 2021-05-13 19:52:16
 * @Description:
 */
const KEY = 'unipass';
export interface UnipassData {
  email: string;
  address: string;
  pubkey: string;
  sig?: string;
}
export function getData(): UnipassData {
  return LocalStorage.getItem(KEY) as UnipassData;
}

export function saveData(data: UnipassData) {
  LocalStorage.set(KEY, data);
}
export function saveAddress(address: string) {
  if (!address) return;
  const data = LocalStorage.getItem(KEY) as UnipassData;
  data.address = address;
  console.log(data);
  LocalStorage.set(KEY, data);
}

export function Logout() {
  LocalStorage.remove(KEY);
}
