import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'workout_exercises'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // add sets and reps columns
      table.integer('sets').notNullable().defaultTo(0)
      table.integer('reps').notNullable().defaultTo(0)
    })
  }

  public async down() {
    // alter table to remove sets and reps columns
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sets')
      table.dropColumn('reps')
    })
  }
}
