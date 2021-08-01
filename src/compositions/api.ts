import axios from 'axios';
import { LocalStorage } from 'quasar';

export async function getNFTData(
  address: string,
  page: number,
  limit: number
): Promise<any> {
  const isLina = LocalStorage.getItem('lina');
  let url = `https://devapi.gift.unipass.me/ckb?address=${address}&page=${page}&limit=${limit}`;
  console.log(url);
  if (isLina) {
    url = `https://api.gift.unipass.me/ckb?address=${address}&page=${page}&limit=${limit}`;
  }
  const ret = await axios.get(url);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ret.data;
}
