import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'apple_pay_transactions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('transactionDetails', 'transaction_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('transaction_id', 'transactionDetails')
    })
  }
}
