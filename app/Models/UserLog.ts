import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class UserLog extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public program_id: number

  @column()
  public user_id: number

  @column()
  public workout_id: number

  @column()
  public exercise_id: number

  @column()
  public sets_reps: object

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
