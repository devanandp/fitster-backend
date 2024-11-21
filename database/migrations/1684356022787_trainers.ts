import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'trainers'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.specificType('certifications', 'text[]').nullable().alter()
      table.string('website_cover_url').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('certifications')
      table.dropColumn('website_cover_url')
    })
  }
}
