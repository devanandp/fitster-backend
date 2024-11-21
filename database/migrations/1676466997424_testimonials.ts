import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'testimonials'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('testimonialGivenBy').references('users.id')
      table.integer('testimonialGivenTo').references('users.id')
      table.integer('programId').references('programs.id')
      table.text('review').notNullable()
      table.string('beforePhoto', 256)
      table.string('afterPhoto', 256)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
