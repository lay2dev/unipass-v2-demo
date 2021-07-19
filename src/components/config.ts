import { CellDep, ChainID, DepType, OutPoint, RPC } from '@lay2/pw-core';
import { LocalStorage } from 'quasar';
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
  // {
  //   name: '测试',
  //   url: 'https://unipass-me-git-dev-lay2.vercel.app/'
  // },
  // {
  //   name: '开发-aggron',
  //   url: 'https://dev.unipass.me'
  // },
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
      '0x03dd2a5594ed2d79196b396c83534e050ba0ad07fa5c1cd61a7094f9fb60a592',
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
      '0xbd262c87a84c08ea3bc141700cf55c1a285009de0e22c247a8d9597b4fc491e6',
      '0x2'
    )
  )
];

const LinaCellDeps = [
  new CellDep(
    DepType.code,
    new OutPoint(
      '0xd521f52a7f4f4f00a25f0f6924c439844574d77d228113077ee0c84dc60ad11d',
      '0x2'
    )
  ),
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
  )
];

const TestCellDeps = [
  new CellDep(
    DepType.code,
    new OutPoint(
      '0xd7022ca7f883ffa7e067bf0ecd945fefa49b3a0c82d3edb6939f976b53a6069f',
      '0x0'
    )
  ),
  new CellDep(
    DepType.code,
    new OutPoint(
      '0x363b22a0de38c31e83fb83fa7210c447a4861408f1c56502f545cfffda25d9cc',
      '0x0'
    )
  ),
  new CellDep(
    DepType.code,
    new OutPoint(
      '0x3baaf7f1589eeaa2bb49a261f75fc23b01d4566b4aa9ec48fbd2d8aa75df77e1',
      '0x0'
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

export function getCellDeps(): CellDep[] {
  const isLina = LocalStorage.getItem('lina');
  const isTest = LocalStorage.getItem('test');
  let data = AggronCellDeps;
  if (isLina) data = LinaCellDeps;
  if (isTest) data = TestCellDeps;
  console.log('[cells]:', isLina, isTest, data);
  return data;
}

export function getRpc() {
  const isLina = LocalStorage.getItem('lina');
  let url = testCKB.NODE_URL;
  if (isLina) url = mainCKB.NODE_URL;
  const rpc = new RPC(url);
  return rpc;
}
