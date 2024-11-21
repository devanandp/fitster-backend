import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'programs'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('listImage', 'list_image')
      table.renameColumn('mainImage', 'main_image')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('list_image', 'listImage')
      table.renameColumn('main_image', 'mainImage')
    })
  }
}
