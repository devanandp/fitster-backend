import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('current_program').references('id').inTable('programs')
      table.integer('current_workout').references('id').inTable('workouts')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('current_program')
      table.dropColumn('current_workout')
    })
  }
}
