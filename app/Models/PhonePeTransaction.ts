import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Order from './Order'

export default class PhonePeTransaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public merchant_transaction_id: string

  @column()
  public merchant_user_id: string

  @column()
  public transaction_id: string

  @column()
  public pg_transaction_id: string

  @belongsTo(() => Order)
  public trainer: BelongsTo<typeof Order>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
