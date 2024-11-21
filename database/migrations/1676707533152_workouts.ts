import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'workouts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_rest_day').defaultTo(false)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_rest_day')
    })
  }
}
