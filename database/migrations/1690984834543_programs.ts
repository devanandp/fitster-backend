import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'programs'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('trainers_tips')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('trainers_tips')
    })
  }
}
