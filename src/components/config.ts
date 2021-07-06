import { CellDep, ChainID, DepType, OutPoint } from '@lay2/pw-core';
import { LocalStorage } from 'quasar';
interface AllCellDeps {
  rsaDep: CellDep;
  acpDep: CellDep;
  unipassDep: CellDep;
}
interface Url {
  NODE_URL: string;
  INDEXER_URL: string;
  CHAIN_ID: ChainID;
}

export const nets = [
  // {
  //   name: '本地',
  //   url: 'http://localhost:3000/'
  // },
  {
    name: '测试',
    url: 'https://unipass-me-git-dev-lay2.vercel.app/'
  },
  {
    name: '开发-aggron',
    url: 'https://dev.unipass.me'
  },
  {
    name: '预览-aggron',
    url: 'https://t.rc.unipass.me'
  },
  {
    name: '预览-lina',
    url: 'https://rc.unipass.me'
  },
  {
    name: '正式-aggron',
    url: 'https://t.unipass.me'
  },
  {
    name: '正式-lina',
    url: 'https://unipass.me'
  }
];

const TestCellDeps = {
  rsaDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0xd7022ca7f883ffa7e067bf0ecd945fefa49b3a0c82d3edb6939f976b53a6069f',
      '0x0'
    )
  ),
  acpDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0x363b22a0de38c31e83fb83fa7210c447a4861408f1c56502f545cfffda25d9cc',
      '0x0'
    )
  ),
  unipassDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0x3baaf7f1589eeaa2bb49a261f75fc23b01d4566b4aa9ec48fbd2d8aa75df77e1',
      '0x0'
    )
  )
};
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
  if (url == 'https://unipass.me' || url == 'https://rc.unipass.me') {
    LocalStorage.set('lina', true);
    LocalStorage.remove('test');
  } else if (url == 'https://unipass-me-git-dev-lay2.vercel.app/') {
    LocalStorage.set('test', true);
    LocalStorage.remove('lina');
  } else {
    LocalStorage.remove('lina');
    LocalStorage.remove('test');
  }
}

export function getCkbEnv(): Url {
  const isLina = LocalStorage.getItem('lina');
  let data = testCKB;
  if (isLina) data = mainCKB;
  console.log('[cells]:', isLina, data);
  return data;
}
