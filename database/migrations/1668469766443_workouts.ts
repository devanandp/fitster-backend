import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'workouts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('program_id').unsigned().references('id').inTable('programs').notNullable()

      table.integer('trainer_id').unsigned().references('id').inTable('users').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
