import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'foods'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('units')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('units', ['g', 'ml', 'serving', 'tbspoon'])
    })
  }
}
