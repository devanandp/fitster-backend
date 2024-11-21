import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user_logs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('program_id').references('id').inTable('programs').notNullable()
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.integer('workout_id').references('id').inTable('workouts').notNullable()
      table.integer('exercise_id').references('id').inTable('exercises').notNullable()
      table.integer('set').notNullable().defaultTo(1)
      table.integer('reps').notNullable().defaultTo(0)
      table.integer('weight').notNullable().defaultTo(0)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
