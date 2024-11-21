import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user_logs'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('set')
      table.dropColumn('reps')
      table.dropColumn('weight')

      table.jsonb('sets_reps').notNullable().defaultTo('[]')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('set')
      table.integer('reps')
      table.integer('weight')

      table.dropColumn('sets_reps')
    })
  }
}
