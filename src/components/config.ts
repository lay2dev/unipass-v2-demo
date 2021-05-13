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
    url: 'https://t.unipasss.me'
  },
  {
    name: '正式-lina',
    url: 'https://unipasss.me'
  }
];

const AggronCellDeps = {
  rsaDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0xd346695aa3293a84e9f985448668e9692892c959e7e83d6d8042e59c08b8cf5c',
      '0x0'
    )
  ),
  acpDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0x04a1ac7fe15e454741d3c5c9a409efb9a967714ad2f530870514417978a9f655',
      '0x0'
    )
  ),
  unipassDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0x1dd7f9b7bde1ce261778abe693e739c9473b3f0c4a1a0f6f78dfec52927b6cbb',
      '0x0'
    )
  )
};

const LinaCellDeps = {
  rsaDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0x1196caaf9e45f1959ea3583f92914ee8306d42e27152f7068f9eeb52ac23eeae',
      '0x0'
    )
  ),
  acpDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0xf247a0e9dfe9d559ad8486428987071b65d441568075465c2810409e889f4081',
      '0x0'
    )
  ),
  unipassDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0xb05e45161a0887288eaf6940c90cc41cdb578495c8b1b285411b4e651f34f3f3',
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

export function cellDeps(): AllCellDeps {
  const isLina = LocalStorage.getItem('lina');
  let data = AggronCellDeps;
  if (isLina) data = LinaCellDeps;
  console.log('[cells]:', isLina, data);
  return data;
}

export function saveEnvData(url: string) {
  if (url == 'https://unipasss.me' || url == 'https://rc.unipass.me') {
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
