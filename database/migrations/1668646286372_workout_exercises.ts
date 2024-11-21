import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'workout_exercises'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('sets_reps').notNullable().defaultTo('[]')
      table.dropColumn('sets')
      table.dropColumn('reps')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sets_reps')
      table.integer('sets').notNullable().defaultTo(0)
      table.string('reps').notNullable().defaultTo('0')
    })
  }
}
