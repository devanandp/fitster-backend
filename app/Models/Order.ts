import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Program from './Program'
import User from './User'
import Trainer from './Trainer'
import ApplePayTransaction from './ApplePayTransaction'
import PhonePeTransaction from './PhonePeTransaction'
import NutritionPlan from './NutritionPlan'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public program_id: number

  @column()
  public amount_paid: number

  @column()
  public status:
    | 'pending'
    | 'captured'
    | 'failed'
    | 'refunded'
    | 'reversed'
    | 'voided'
    | 'free_trial'

  @column()
  public apple_pay_id: number

  // TODO: Remove this column
  @column()
  public razorpay_id: number

  @column()
  public phone_pe_id: number

  @column()
  public payment_type: 'razorpay' | 'phonepe' | 'stripe' | 'apple' | 'free_trial'

  @column()
  public user_id: number

  @column()
  public trainer_id: number

  @column()
  public nutrition_plan_id: number

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Trainer, {
    foreignKey: 'trainer_id',
  })
  public trainer: BelongsTo<typeof Trainer>

  @belongsTo(() => Program, {
    foreignKey: 'program_id',
  })
  public program: BelongsTo<typeof Program>

  @belongsTo(() => NutritionPlan, {
    foreignKey: 'nutrition_plan_id',
  })
  public nutritionPlan: BelongsTo<typeof NutritionPlan>

  @hasMany(() => ApplePayTransaction, {
    foreignKey: 'apple_pay_id',
  })
  public applePayTransaction: HasMany<typeof ApplePayTransaction>

  @hasMany(() => PhonePeTransaction, {
    foreignKey: 'phone_pe_id',
  })
  public phonePeTransaction: HasMany<typeof PhonePeTransaction>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
