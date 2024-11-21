import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'testimonials'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('testimonial_given_to').references('id').inTable('trainers')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('testimonial_given_to')
    })
  }
}
