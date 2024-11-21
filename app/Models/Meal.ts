import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Trainer from './Trainer'
import NutritionPlan from './NutritionPlan'

export default class Meal extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public trainerId: number

  @column()
  public nutritionPlanId: number

  @belongsTo(() => Trainer, {
    foreignKey: 'trainerId',
  })
  public trainer: BelongsTo<typeof Trainer>

  @belongsTo(() => NutritionPlan, {
    foreignKey: 'nutritionPlanId',
  })
  public nutritionPlan: BelongsTo<typeof NutritionPlan>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
