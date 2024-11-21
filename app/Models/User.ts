import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasOne,
  HasOne,
  HasMany,
  hasMany,
} from '@ioc:Adonis/Lucid/Orm'
import Program from './Program'
import Workout from './Workout'
import Testimonial from './Testimonial'
import ProgressPhoto from './ProgressPhoto'

export default class User extends BaseModel {
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
  public years_of_experience: number

  @column()
  public people_trained: number

  @column()
  public certifications: Array<string>

  @column()
  public about: string

  @column()
  public social_media_links: object

  @column()
  public website_cover_url: string

  @column()
  public role: 'user' | 'trainer' | 'admin'

  @column()
  public current_program: number

  @column()
  public current_workout: number

  @column()
  public rememberMeToken?: string

  @column()
  public nutrition_plan_id: number

  @column()
  public current_nutrition_day: number

  @hasOne(() => Program)
  public program: HasOne<typeof Program>

  @hasOne(() => Workout)
  public workout: HasOne<typeof Workout>

  @hasMany(() => Testimonial, {
    foreignKey: 'testimonialGivenBy',
  })
  public testimonialGivenBy: HasMany<typeof Testimonial>

  @hasMany(() => Testimonial, {
    foreignKey: 'testimonialGivenTo',
  })
  public testimonialGivenTo: HasMany<typeof Testimonial>

  @hasMany(() => ProgressPhoto, {
    foreignKey: 'user_id',
  })
  public progressPhotos: HasMany<typeof ProgressPhoto>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
