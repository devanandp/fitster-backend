import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'foods'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('protein').alter()
      table.float('carbs').alter()
      table.float('fat').alter()
      table.float('fibre').alter()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('protein').alter()
      table.integer('carbs').alter()
      table.integer('fat').alter()
      table.integer('fibre').alter()
    })
  }
}
