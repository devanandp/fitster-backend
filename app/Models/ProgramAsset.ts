import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Program from './Program'

export default class ProgramAsset extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public program_id: number

  @column()
  public asset_link: string

  @column()
  public asset_day: number

  @belongsTo(() => Program, {
    foreignKey: 'program_id',
  })
  public program: BelongsTo<typeof Program>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
