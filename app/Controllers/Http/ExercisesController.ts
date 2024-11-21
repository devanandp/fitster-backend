import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Exercise from 'App/Models/Exercise'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'

export default class ExercisesController {
  public async create({ request, response, auth }: HttpContextContract) {
    const requestData = request.body()

    requestData['trainer_id'] = auth.use('trainerApi').user?.id

    const exerciseCreateSchema = schema.create({
      name: schema.string({}),
      description: schema.string({}),
      video_url: schema.string({}),
      trainer_id: schema.number([rules.exists({ table: 'trainers', column: 'id' })]),
    })

    const validatedData = await validator.validate({
      schema: exerciseCreateSchema,
      data: requestData,
    })

    const exercise = await Exercise.create(validatedData)

    return response.created({ exercise })
  }

  public async getById({ params, response }: HttpContextContract) {
    const exercise = await Exercise.find(params.id)

    if (!exercise) {
      return response.notFound({ message: 'Exercise not found' })
    }

    return response.ok({ exercise })
  }
}
