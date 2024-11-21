import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up() {
    this.defer(async () => {
      await this.raw(
        `CREATE TYPE order_status AS ENUM ('pending', 'captured', 'failed', 'refunded', 'reversed', 'voided', 'free_trial')`
      )
      await this.raw(
        `ALTER TABLE ${this.tableName} ADD COLUMN status_temp order_status NOT NULL DEFAULT 'pending'`
      )

      await this.raw(`UPDATE ${this.tableName} SET status_temp=status::order_status`)
      await this.raw(`ALTER TABLE ${this.tableName} DROP COLUMN status`)
      await this.raw(`ALTER TABLE ${this.tableName} RENAME COLUMN status_temp TO status`)
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
