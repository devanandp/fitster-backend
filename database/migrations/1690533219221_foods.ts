import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'foods'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name', 255).notNullable()
      table.string('description', 255)
      table.string('image', 255)
      table.text('recipe')
      table.string('video', 255)
      table.integer('protein')
      table.integer('carbs')
      table.integer('fat')
      table.integer('calories')
      table.integer('trainer_id').unsigned().references('id').inTable('trainers')

      table.enum('units', ['g', 'ml', 'serving', 'tbspoon']).defaultTo('serving')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
