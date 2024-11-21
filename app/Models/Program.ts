import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Workout from './Workout'
import Order from './Order'
import Trainer from './Trainer'
import ProgramAsset from './ProgramAsset'

export default class Program extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public trainer_id: number

  @column()
  public number_of_days: number

  @column()
  public price: number

  @column()
  public discount: number

  @column()
  public level: string

  @column()
  public list_image: string

  @column()
  public main_image: string

  @column()
  public video: string

  @column()
  public about: string

  @column()
  public nutrition_plan_id: number

  @column()
  public trainers_tips: string

  @column()
  public warmup: string

  @column()
  public free_trial_days: number

  @column()
  public type: string

  @belongsTo(() => Trainer, {
    foreignKey: 'trainer_id',
  })
  public trainer: BelongsTo<typeof Trainer>

  @hasMany(() => Workout)
  public workout: HasMany<typeof Workout>

  @hasMany(() => Order, {
    foreignKey: 'program_id',
  })
  public order: HasMany<typeof Order>

  @hasMany(() => ProgramAsset, {
    foreignKey: 'program_id',
  })
  public asset: HasMany<typeof ProgramAsset>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
