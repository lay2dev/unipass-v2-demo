import { Address } from '@lay2/pw-core';
import { LocalStorage } from 'quasar';

/*
 * @Author: Aven
 * @Date: 2021-04-26 14:18:43
 * @LastEditors: Aven
 * @LastEditTime: 2021-05-06 17:57:57
 * @Description:
 */
const KEY = 'unipass';
interface UnipassData {
  email: string;
  address: string;
  pubkey: string;
}
export function getData(): UnipassData {
  return LocalStorage.getItem(KEY) as UnipassData;
}

export function saveData(data: UnipassData) {
  console.log(data);
  LocalStorage.set(KEY, data);
}

export function Logout() {
  LocalStorage.remove(KEY);
}
