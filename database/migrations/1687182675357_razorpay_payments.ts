import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'razorpay_payments'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropNullable('razorpay_event_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('razorpay_event_id').notNullable()
    })
  }
}
