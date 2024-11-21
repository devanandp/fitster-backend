import { DateTime } from 'luxon'
import { BaseModel, HasMany, beforeSave, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Program from './Program'
import NutritionPlan from './NutritionPlan'

export default class Trainer extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public username: string

  @column()
  public first_name: string

  @column()
  public last_name: string

  @column()
  public social_media_links: object

  @column()
  public certifications: Array<string>

  @column()
  public about: string

  @column()
  public years_of_experience: number

  @column()
  public people_trained: number

  @hasMany(() => Program)
  public program: HasMany<typeof Program>

  @column()
  public website_cover_url: string

  @hasMany(() => NutritionPlan)
  public nutritionPlan: HasMany<typeof NutritionPlan>

  @beforeSave()
  public static async hashPassword(trainer: Trainer) {
    if (trainer.$dirty.password) {
      trainer.password = await Hash.make(trainer.password)
    }
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
