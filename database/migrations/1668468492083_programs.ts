import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'programs'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('trainer_id').references('id').inTable('users').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
