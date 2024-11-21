import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'nutrition_plans'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name', 255).notNullable()
      table.text('description')
      table.string('image', 255)
      table.integer('trainer_id').unsigned().references('id').inTable('trainers')
      table.boolean('is_active').defaultTo(false)
      table.boolean('is_with_program').defaultTo(false)

      table.integer('program_id').unsigned().references('id').inTable('programs')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
