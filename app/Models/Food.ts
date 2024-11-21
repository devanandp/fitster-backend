import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Trainer from './Trainer'

export default class Food extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public protein: number

  @column()
  public carbs: number

  @column()
  public fat: number

  @column()
  public fibre: number

  @column()
  public calories: number

  @column()
  public trainerId: number

  @column()
  public servingSize: number

  @column()
  public unit: string

  @belongsTo(() => Trainer, {
    foreignKey: 'trainerId',
  })
  public trainer: BelongsTo<typeof Trainer>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
