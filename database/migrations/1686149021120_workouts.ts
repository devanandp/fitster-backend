import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'workouts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('trainer_id').unsigned().references('id').inTable('trainers')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('trainer_id')
    })
  }
}
