import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Testimonial extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public program_id: number

  @column()
  public review: string

  @column()
  public before_photo: string

  @column()
  public after_photo: string

  @column()
  testimonialGivenBy: number

  @belongsTo(() => User, {
    foreignKey: 'testimonialGivenBy',
  })
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
