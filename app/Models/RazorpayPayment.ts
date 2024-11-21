import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class RazorpayPayment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public razorpay_payment_id: string

  @column()
  public razorpay_order_id: string

  @column()
  public razorpay_event_id: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
