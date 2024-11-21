import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Meal from './Meal'
import Food from './Food'

export default class MealFood extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public mealId: number

  @column()
  public foodId: number

  @column()
  public quantity: number

  @belongsTo(() => Meal, {
    foreignKey: 'mealId',
  })
  public meal: BelongsTo<typeof Meal>

  @belongsTo(() => Food, {
    foreignKey: 'foodId',
  })
  public food: BelongsTo<typeof Food>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
