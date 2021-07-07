import {
  Builder,
  Address,
  Amount,
  Cell,
  RawTransaction,
  Transaction,
  BuilderOption,
  CellDep
} from '@lay2/pw-core';

// change all cell's lock and provide fee by self own expense
export class TransferNFTBuilder extends Builder {
  constructor(
    private toAddress: Address,
    private cells: Cell[],
    protected options: BuilderOption = {},
    private cellDeps: CellDep[],
    private since: string = '0x0'
  ) {
    super(options.feeRate, options.collector, options.witnessArgs);
  }

  // eslint-disable-next-line
  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    const inputCells: Cell[] = [];
    const outputCells: Cell[] = [];

    if (this.cells.length === 0) {
      throw new Error('no live cells, not neccessary to change lock');
    }

    for (const cell of this.cells) {
      inputCells.push(cell);

      const outputCell = cell.clone();
      outputCell.lock = this.toAddress.toLockScript();
      outputCells.push(outputCell);
    }

    const rawTx = new RawTransaction(inputCells, outputCells, this.cellDeps);

    for (let i = 0; i < rawTx.inputs.length - 1; i++) {
      rawTx.inputs[i].since = this.since;
    }
    const tx = new Transaction(rawTx, [this.witnessArgs]);
    this.fee = Builder.calcFee(tx, this.feeRate);
    console.log(fee);
    // this.fee = new Amount('10000', AmountUnit.shannon);
    const changeCell = tx.raw.outputs.pop() as Cell;
    changeCell.capacity = changeCell.capacity.sub(this.fee);
    tx.raw.outputs.push(changeCell);
    return tx;
  }

  getCollector() {
    return this.collector;
  }
}
