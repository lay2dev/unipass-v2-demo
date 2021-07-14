import PWCore, {
  Address,
  AddressType,
  BuilderOption,
  Message,
  normalizers,
  OutPoint,
  Reader,
  SerializeWitnessArgs,
  transformers,
  WitnessArgs
} from '@lay2/pw-core';
import { getData } from 'src/components/LocalData';
import { getCellDeps, getCellsByOutpoints } from './api';
import { TransferNFTProvider } from './transfer_nft-provider';
import { TransferTicketBuilder } from './transfer_ticket_builder';
import { UnipassIndexerCollector } from './unipass-indexer-collector';
import { UnipassSigner } from './unipass-signer';

const collector = new UnipassIndexerCollector(
  process.env.CKB_INDEXER_URL as string
);

export interface NFT {
  classTypeArgs: string;
  nftTypeArgs: string;
  tokenId: string;
  outPoint: {
    txHash: string;
    index: string;
  };
}

export interface SendTxState {
  txObj: any;
  messages: Message[];
  signedOtx?: any;
  order?: any;
}

export interface SignTxMessage {
  data: string;
  messages: string;
}
export function getOutPoint(nfts: NFT[]): OutPoint[] {
  const outpoints: OutPoint[] = [];
  for (const item of nfts) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const outPoint = new OutPoint(item.outPoint.txHash, item.outPoint.index);
    outpoints.push(outPoint);
  }
  return outpoints;
}

export async function getTicketTransferSignMessage(
  address: string,
  nfts: NFT[],
  state = '01'
): Promise<SignTxMessage | boolean> {
  const masterPubkey = getData().pubkey;
  if (!masterPubkey) return false;
  const outpoints = getOutPoint(nfts);

  const provider = new TransferNFTProvider(
    '0x' + masterPubkey.replace('0x', '')
  );
  const toAddress = new Address(address, AddressType.ckb);

  const cells = await getCellsByOutpoints(outpoints);
  const lockLen = (1 + (8 + 256 * 2) * 2) * 2;
  const builderOption: BuilderOption = {
    witnessArgs: {
      lock: '0x' + '0'.repeat(lockLen),
      input_type: '',
      output_type: ''
    },
    collector
  };
  const cellDeps = await getCellDeps();
  const builder = new TransferTicketBuilder(
    toAddress,
    cells,
    builderOption,
    cellDeps,
    state
  );
  const tx = await builder.build();
  // sign a otx
  const otxSigner = new UnipassSigner([provider]);
  const messages = otxSigner.toMessages(tx);

  const txObj = transformers.TransformTransaction(tx);
  const data = JSON.stringify({ txObj });
  return { data, messages: messages[0].message };
}

export async function getTicketTransferSignCallback(
  sig: string,
  extraObj: string,
  url: string
): Promise<string> {
  console.log('getMakerSignCallback sig', sig);
  console.log('getMakerSignCallback extraObj', extraObj);
  if (!extraObj) return '0x';
  const masterPubkey = getData().pubkey;
  console.log('getMakerSignCallback masterPubkey', masterPubkey);
  if (!masterPubkey) return '0x';
  const provider = new TransferNFTProvider(masterPubkey);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { txObj } = JSON.parse(extraObj) as SendTxState;
  console.log('getMakerSignCallback txObj', txObj);
  const witnessArgs: WitnessArgs = {
    lock: '0x01' + sig.replace('0x', ''),
    input_type: '',
    output_type: ''
  };

  const witness = new Reader(
    SerializeWitnessArgs(normalizers.NormalizeWitnessArgs(witnessArgs))
  ).serializeJson();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  txObj.witnesses[0] = witness;

  const transformedTx = transformers.TransformTransaction(txObj);
  console.log('transformedTx', JSON.stringify(transformedTx));

  const pwcore = await new PWCore(url).init(provider, collector);
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const txhash = await pwcore.rpc.send_transaction(transformedTx);
    return txhash as string;
  } catch (e) {
    console.log(e);
    return '0x';
  }
}
