import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'exercises'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('trainer_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('trainer_id').unsigned().references('id').inTable('users')
    })
  }
}
