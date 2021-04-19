import PWCore, {
  Address,
  Amount,
  AmountUnit,
  Cell,
  RawTransaction,
  Transaction,
  Builder,
  Collector,
  CellDep,
  DepType,
  OutPoint
} from '@lay2/pw-core';

const Secp256R1BinOutPoint = new OutPoint(
  '0x9687ac5e311d009df1505459afc83a55c46496eb292fc11e4f6c24df5dfd4de5',
  '0x0'
);
const Secp256R1Args = {
  lock: '0x' + '0'.repeat(1128),
  input_type: '',
  output_type: ''
};

export default class UnipassBuilder extends Builder {
  constructor(
    private address: Address,
    private amount: Amount,
    feeRate?: number,
    collector?: Collector
  ) {
    super(feeRate, collector);
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    const outputCell = new Cell(this.amount, this.address.toLockScript());
    const neededAmount = this.amount.add(Builder.MIN_CHANGE).add(fee);
    let inputSum = new Amount('0');
    const inputCells: Cell[] = [];

    // fill the inputs
    const cells = await this.collector.collect(PWCore.provider.address, {
      neededAmount
    });
    for (const cell of cells) {
      inputCells.push(cell);
      inputSum = inputSum.add(cell.capacity);
      if (inputSum.gt(neededAmount)) break;
    }

    if (inputSum.lt(neededAmount)) {
      throw new Error(
        `input capacity not enough, need ${neededAmount.toString(
          AmountUnit.ckb
        )}, got ${inputSum.toString(AmountUnit.ckb)}`
      );
    }

    const changeCell = new Cell(
      inputSum.sub(outputCell.capacity),
      PWCore.provider.address.toLockScript()
    );

    const r1CellDep: CellDep = new CellDep(DepType.code, Secp256R1BinOutPoint);

    const tx = new Transaction(
      new RawTransaction(inputCells, [outputCell, changeCell], [r1CellDep]),
      [Secp256R1Args]
    );

    this.fee = Builder.calcFee(tx, this.feeRate);

    if (changeCell.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee);
      tx.raw.outputs.pop();
      tx.raw.outputs.push(changeCell);
      return tx;
    }

    return this.build(this.fee);
  }

  getCollector() {
    return this.collector;
  }
}
