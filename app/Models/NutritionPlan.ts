import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Trainer from './Trainer'

export default class NutritionPlan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public about: string

  @column()
  public trainerId: number

  @column()
  public isActive: boolean

  @column()
  public isWithProgram: boolean

  @column()
  public programId: number

  @column()
  public numberOfDays: number

  @belongsTo(() => Trainer, {
    foreignKey: 'trainerId',
  })
  public trainer: BelongsTo<typeof Trainer>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
