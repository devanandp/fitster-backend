import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
      table.dropColumn('years_of_experience')
      table.dropColumn('people_trained')
      table.dropColumn('website_cover_url')
      table.dropColumn('certifications')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('role')
      table.integer('years_of_experience')
      table.integer('people_trained')
      table.string('website_cover_url')
      table.string('certifications')
    })
  }
}
