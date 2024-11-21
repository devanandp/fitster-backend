import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up() {
    this.defer(async () => {
      await this.raw(
        `CREATE TYPE payment_type AS ENUM ('razorpay', 'phonepe', 'stripe', 'apple', 'free_trial')`
      )
      await this.raw(
        `ALTER TABLE ${this.tableName} ADD COLUMN payment_type_temp payment_type NOT NULL DEFAULT 'free_trial'`
      )

      await this.raw(`UPDATE ${this.tableName} SET payment_type_temp=payment_type::payment_type`)
      await this.raw(`ALTER TABLE ${this.tableName} DROP COLUMN payment_type`)
      await this.raw(
        `ALTER TABLE ${this.tableName} RENAME COLUMN payment_type_temp TO payment_type`
      )
    })
  }

  public async down() {
    this.defer(async () => {
      await this.raw(
        `ALTER TABLE ${this.tableName} ADD COLUMN status_temp order_status NOT NULL DEFAULT 'pending'`
      )
      await this.raw(`UPDATE ${this.tableName} SET status_temp=status::order_status`)
      await this.raw(`ALTER TABLE ${this.tableName} DROP COLUMN status_temp`)
    })
  }
}
