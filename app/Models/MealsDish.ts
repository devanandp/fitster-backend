import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Meal from './Meal'
import Dish from './Dish'

export default class MealsDish extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public mealId: number

  @column()
  public dishId: number

  @column()
  public dayNumber: number

  @column()
  public mealNumber: number

  @belongsTo(() => Meal, {
    foreignKey: 'mealId',
  })
  public meal: BelongsTo<typeof Meal>

  @belongsTo(() => Dish, {
    foreignKey: 'dishId',
  })
  public dish: BelongsTo<typeof Dish>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
