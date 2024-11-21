import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'programs'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('price', 12, 2).nullable().defaultTo(0)
      table.decimal('discount', 12, 2).nullable().defaultTo(0)
      table
        .enum('level', ['beginner', 'intermediate', 'advanced', 'all'])
        .nullable()
        .defaultTo('beginner')
      table.string('listImage').nullable().defaultTo(null)
      table.string('mainImage').nullable().defaultTo(null)
      table.string('video').nullable().defaultTo(null)
      table.text('about')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('price')
      table.dropColumn('discount')
      table.dropColumn('level')
      table.dropColumn('listImage')
      table.dropColumn('mainImage')
      table.dropColumn('video')
      table.dropColumn('about')
    })
  }
}
