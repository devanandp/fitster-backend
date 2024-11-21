import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('payment_type', ['razorpay', 'phonepe', 'stripe', 'apple'])
        .defaultTo('razorpay')
        .notNullable()
      table.integer('apple_pay_id').unsigned().references('apple_pay_transactions.id')
      table.integer('razorpay_id').unsigned().references('razorpay_payments.id')
      table.integer('trainer_id').unsigned().references('trainers.id')

      table.dropColumn('razorpay_order_id')
      table.dropColumn('razorpay_payment_id')
      table.dropColumn('razorpay_signature')
      table.dropColumn('razorpay_event_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('payment_type')
      table.dropColumn('apple_pay_id')
      table.dropColumn('razorpay_id')
      table.dropColumn('trainer_id')

      table.string('razorpay_order_id').notNullable()
      table.string('razorpay_payment_id').notNullable()
      table.string('razorpay_signature').notNullable()
      table.string('razorpay_event_id').notNullable()
    })
  }
}
