import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('first_name')
      table.string('last_name')
      table.json('social_media_links')
      table.string('certifications')
      table.text('about')
      table.integer('years_of_experience')
      table.integer('people_trained')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('first_name')
      table.dropColumn('last_name')
      table.dropColumn('social_media_links')
      table.dropColumn('certifications')
      table.dropColumn('about')
      table.dropColumn('years_of_experience')
      table.dropColumn('people_trained')
    })
  }
}
