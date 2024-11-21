import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'drop_nutrition_tables'

  public async up() {
    this.schema.dropTable('meal_foods')
    this.schema.dropTable('foods')
    this.schema.dropTable('meals')
  }

  public async down() {
    //
  }
}
