import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'nutrition_plans'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('number_of_days')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('number_of_days')
    })
  }
}
