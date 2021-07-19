import {
  Amount,
  AmountUnit,
  Cell,
  CellDep,
  HashType,
  OutPoint,
  Script
} from '@lay2/pw-core';
import axios from 'axios';
import { LocalStorage } from 'quasar';

interface CellDepApi {
  data: CellDep[];
  code: number;
}

interface CellApiData {
  id: number;
  blockHash: string;
  lock: {
    codeHash: string;
    hashType: string;
    args: string;
  };
  outPoint: {
    txHash: string;
    index: string;
  };
  outputDataLen: string;
  capacity: string;
  cellbase: true;
  type: {
    codeHash: string;
    hashType: string;
    args: string;
  };
  dataHash: string;
  status: string;
  sudtAmount: string;
  data: string;
}

export async function getNFTData(
  address: string,
  page: number,
  limit: number
): Promise<any> {
  const isLina = LocalStorage.getItem('lina');
  let url = `https://devapi.gift.unipass.me/ckb?address=${address}&page=${page}&limit=${limit}`;
  console.log(url);
  if (isLina) {
    url = `https://devapi.gift.unipass.me/ckb?address=${address}&page=${page}&limit=${limit}`;
  }
  const ret = await axios.get(url);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ret.data;
}
