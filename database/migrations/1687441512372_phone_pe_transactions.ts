import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'phone_pe_transactions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('pg_transaction_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pg_transaction_id')
    })
  }
}
