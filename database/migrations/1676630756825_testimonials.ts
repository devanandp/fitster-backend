import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'testimonials'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('testimonialGivenBy', 'testimonial_given_by')
      table.renameColumn('testimonialGivenTo', 'testimonial_given_to')
      table.renameColumn('beforePhoto', 'before_photo')
      table.renameColumn('afterPhoto', 'after_photo')
      table.renameColumn('programId', 'program_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('testimonial_given_by', 'testimonialGivenBy')
      table.renameColumn('testimonial_given_to', 'testimonialGivenTo')
      table.renameColumn('before_photo', 'beforePhoto')
      table.renameColumn('after_photo', 'afterPhoto')
      table.renameColumn('program_id', 'programId')
    })
  }
}
