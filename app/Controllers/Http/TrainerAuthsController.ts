import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import Trainer from 'App/Models/Trainer'

export default class TrainerAuthsController {
  public async register({ request, auth }: HttpContextContract) {
    const requestData = request.body()

    const trainerCreateSchema = schema.create({
      email: schema.string({}, [
        rules.email(),
        rules.unique({ table: 'trainers', column: 'email' }),
      ]),
      password: schema.string(),
      first_name: schema.string({}, [rules.required()]),
      last_name: schema.string({}, [rules.required()]),
    })

    const validatedData = await validator.validate({
      schema: trainerCreateSchema,
      data: requestData,
    })

    const trainer = await Trainer.create(validatedData)

    const token = await auth.use('trainerApi').login(trainer)

    return token
  }

  public async login({ request, auth }: HttpContextContract) {
    const { email, password } = request.all()

    const token = await auth.use('trainerApi').attempt(email, password)

    return token
  }

  public async logoutUser({ auth }: HttpContextContract) {
    await auth.use('trainerApi').logout()
    return { loggedOut: true }
  }
}
