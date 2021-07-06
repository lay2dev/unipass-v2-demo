import { CellDep } from '@lay2/pw-core';
import axios from 'axios';
import { LocalStorage } from 'quasar';

interface CellDepApi {
  data: CellDep[];
  code: number;
}

export async function getCellDeps(): Promise<CellDep[]> {
  const isLina = LocalStorage.getItem('lina');
  let url = 'https://cellapitest.ckb.pw/transaction/cellDeps';
  let params = [
    {
      codeHash:
        '0x124a60cd799e1fbca664196de46b3f7f0ecb7138133dcaea4893c51df5b02be6',
      hashType: 'type',
      args: '0x'
    },
    {
      codeHash:
        '0xb1837b5ad01a88558731953062d1f5cb547adf89ece01e8934a9f0aeed2d959f',
      hashType: 'type',
      args: '0x'
    }
  ];
  if (isLina) {
    url = 'https://cellapiprod.ckb.pw/transaction/cellDeps';
    params = [
      {
        codeHash:
          '0x614d40a86e1b29a8f4d8d93b9f3b390bf740803fa19a69f1c95716e029ea09b3',
        hashType: 'type',
        args: '0x'
      },
      {
        codeHash:
          '0x2b24f0d644ccbdd77bbf86b27c8cca02efa0ad051e447c212636d9ee7acaaec9',
        hashType: 'type',
        args: '0x'
      }
    ];
  }
  console.log('url', url, isLina);
  const ret = await axios.post(url, params);
  const data = ret.data as CellDepApi;
  console.log(data.data);
  return data.data;
}
