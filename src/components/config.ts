import { CellDep, ChainID, DepType, OutPoint, RPC } from '@lay2/pw-core';
import { LocalStorage } from 'quasar';
interface Url {
  NODE_URL: string;
  INDEXER_URL: string;
  CHAIN_ID: ChainID;
}

export const nets = [
  {
    name: '测试-aggron',
    url: 'https://t.unipass.xyz',
    model: 1
  },
  {
    name: '本地-aggron',
    url: 'http://localhost:5000'
  },
  {
    name: '预览-lina',
    url: 'https://rc.unipass.xyz',
    model: 0
  },
  {
    name: '正式-lina',
    url: 'https://unipass.xyz'
  }
];

const AggronCellDeps = [
  new CellDep(
    DepType.code,
    new OutPoint(
      '0x04a1ac7fe15e454741d3c5c9a409efb9a967714ad2f530870514417978a9f655',
      '0x0'
    )
  ),
  new CellDep(
    DepType.code,
    new OutPoint(
      '0x3d41e1c543f0fddcbb17157d15a2845d7c5fb0363561cd8f50ecd0e118b34f84',
      '0x0'
    )
  ),
  new CellDep(
    DepType.code,
    new OutPoint(
      '0xd346695aa3293a84e9f985448668e9692892c959e7e83d6d8042e59c08b8cf5c',
      '0x0'
    )
  ),
  new CellDep(
    DepType.code,
    new OutPoint(
      '0x3ecf42927509645dec38667d557dd9ba20d0d07267d769983495c1b6b9c70cc4',
      '0x2'
    )
  )
];

const LinaCellDeps = [
  new CellDep(
    DepType.code,
    new OutPoint(
      '0x5c98197999d04fbfa5eb579d0f1c85a3edac2b2f72164f2fc618b101adc71729',
      '0x0'
    )
  ),
  new CellDep(
    DepType.code,
    new OutPoint(
      '0xf247a0e9dfe9d559ad8486428987071b65d441568075465c2810409e889f4081',
      '0x0'
    )
  ),
  new CellDep(
    DepType.code,
    new OutPoint(
      '0x1196caaf9e45f1959ea3583f92914ee8306d42e27152f7068f9eeb52ac23eeae',
      '0x0'
    )
  ),
  new CellDep(
    DepType.code,
    new OutPoint(
      '0xf5edd047b3dbd676c9aa1e5a77ff32e3661d154c306e23bb0c13f8da9133f145',
      '0x2'
    )
  )
];

const testCKB = {
  NODE_URL: 'https://testnet.ckb.dev',
  INDEXER_URL: 'https://testnet.ckb.dev/indexer',
  CHAIN_ID: ChainID.ckb_testnet
};
const mainCKB = {
  NODE_URL: 'https://lina.ckb.dev',
  INDEXER_URL: 'https://mainnet.ckb.dev/indexer',
  CHAIN_ID: ChainID.ckb
};

export function saveEnvData(url: string) {
  if (url == 'https://rc.unipass.xyz' || url == 'https://unipass.xyz') {
    LocalStorage.set('lina', true);
  } else {
    LocalStorage.remove('lina');
  }
}

export function getCkbEnv(): Url {
  const isLina = LocalStorage.getItem('lina');
  let data = testCKB;
  if (isLina) data = mainCKB;
  console.log('[cells]:', isLina, data);
  return data;
}

export function getCellDeps(): CellDep[] {
  const isLina = LocalStorage.getItem('lina');
  let data = AggronCellDeps;
  if (isLina) data = LinaCellDeps;
  console.log('[cells]:', isLina, data);
  return data;
}

export function getRpc() {
  const isLina = LocalStorage.getItem('lina');
  let url = testCKB.NODE_URL;
  if (isLina) url = mainCKB.NODE_URL;
  const rpc = new RPC(url);
  return rpc;
}
