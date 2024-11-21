import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'foods'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('serving_size')
      table.string('unit')
      table.dropColumn('description')
      table.dropColumn('recipe')
      table.dropColumn('video')
      table.dropColumn('image')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('serving_size')
      table.dropColumn('unit')
      table.string('description', 255)
      table.string('image', 255)
      table.text('recipe')
      table.string('video', 255)
    })
  }
}
