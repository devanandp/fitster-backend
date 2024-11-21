import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Program from './Program'
import Trainer from './Trainer'

export default class Workout extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public program_id: number

  @column()
  public trainer_id: number

  @column()
  public day_number: number

  @column()
  public is_rest_day: boolean

  @belongsTo(() => Program, {
    foreignKey: 'program_id',
  })
  public program: BelongsTo<typeof Program>

  @belongsTo(() => Trainer, {
    foreignKey: 'trainer_id',
  })
  public trainer: BelongsTo<typeof Trainer>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
