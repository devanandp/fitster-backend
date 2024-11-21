import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TrainerAuth {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    const trainer = await auth.use('trainerApi').check()

    if (!trainer) {
      return response.unauthorized({ message: 'You dont have the rights to access this resource' })
    }

    await next()
  }
}
