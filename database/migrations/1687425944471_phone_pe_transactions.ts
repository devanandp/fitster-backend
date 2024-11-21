import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'phone_pe_transactions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('merchant_user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('merchant_user_id')
    })
  }
}
