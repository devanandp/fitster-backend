import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'meals'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('day_number')
      table.integer('meal_number')
      table.integer('nutrition_plan_id').unsigned().references('id').inTable('nutrition_plans')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('day_number')
      table.dropColumn('meal_number')
      table.dropColumn('nutrition_plan_id')
    })
  }
}
