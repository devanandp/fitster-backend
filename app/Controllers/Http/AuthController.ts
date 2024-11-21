import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import Mail from '@ioc:Adonis/Addons/Mail'
import UserOtp from 'App/Models/UserOtp'
import Database from '@ioc:Adonis/Lucid/Database'

export default class AuthController {
  public async registerAfterBuying({ request, auth }: HttpContextContract) {
    const { username, email, password } = await request.body()

    const userCreateSchema = schema.create({
      username: schema.string(),
      password: schema.string(),
    })

    const validatedData = await validator.validate({
      schema: userCreateSchema,
      data: { password, username },
    })

    const user = await User.findByOrFail('email', email)

    await user.merge(validatedData).save()

    const token = await auth.login(user)

    return token
  }

  public async register({ request, auth }: HttpContextContract) {
    const { username, email, password } = await request.body()

    const userCreateSchema = schema.create({
      username: schema.string(),
      password: schema.string(),
      email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
    })

    const validatedData = await validator.validate({
      schema: userCreateSchema,
      data: { password, username, email },
    })

    const user = await User.create(validatedData)

    const token = await auth.login(user)

    return token
  }

  public async login({ request, auth }: HttpContextContract) {
    const { email, password } = request.all()

    const token = await auth.attempt(email, password)

    return token
  }

  public async logoutUser({ auth }: HttpContextContract) {
    await auth.logout()
    return { loggedOut: true }
  }

  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email } = request.body()

    const user = await User.findByOrFail('email', email)

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    const userOtp = new UserOtp()

    userOtp.otp = Math.floor(100000 + Math.random() * 900000).toString()

    userOtp.user_id = user.id

    await userOtp.save()

    await Mail.sendLater((message) => {
      message
        .from('info@fitster.io')
        .to(email)
        .subject('Reset your password')
        .htmlView('emails/forgot-password', {
          otp: userOtp.otp,
        })
    })

    return response.ok({ message: 'OTP sent successfully' })
  }

  public async resetPassword({ request, response }: HttpContextContract) {
    const { email, otp, password } = request.body()

    const user = await User.findByOrFail('email', email)

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')

    const userOtp = await UserOtp.query()
      .where('user_id', user.id)
      .where('created_at', '>', fiveMinutesAgo)
      .orderBy('created_at', 'desc')
      .first()

    if (!userOtp) {
      return response.notFound({ message: 'OTP not found' })
    }

    if (userOtp.otp !== otp) {
      return response.badRequest({ message: 'OTP is incorrect' })
    }

    user.password = password

    await user.save()

    // Delete all entries of userOtp and api_tokens for this user

    await UserOtp.query().where('user_id', user.id).delete()

    await Database.from('api_tokens').where('user_id', user.id).delete()

    return response.ok({ message: 'Password reset successfully' })
  }
}
