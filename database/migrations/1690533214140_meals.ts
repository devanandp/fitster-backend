import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'meals'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name', 255).notNullable()
      table.text('description')
      table.string('image', 255)
      table.integer('trainer_id').unsigned().references('id').inTable('trainers')
      table.integer('nutrition_plan_id').unsigned().references('id').inTable('nutrition_plans')
      table.integer('day_number')
      table.integer('meal_number')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
