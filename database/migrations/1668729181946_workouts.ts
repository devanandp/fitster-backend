import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'workouts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('day_number').defaultTo(1)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('day_number')
    })
  }
}
