import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'meal_foods'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('quantity').alter()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('quantity').alter()
    })
  }
}
