import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import UserLog from 'App/Models/UserLog'

export default class UserLogsController {
  public async create({ request, response, auth }: HttpContextContract) {
    const requestData = request.body()

    requestData.user_id = auth.user?.id!

    const userLogCreationSchema = schema.create({
      program_id: schema.number([rules.exists({ table: 'programs', column: 'id' })]),
      user_id: schema.number([rules.exists({ table: 'users', column: 'id' })]),
      workout_id: schema.number([rules.exists({ table: 'workouts', column: 'id' })]),
      exercise_id: schema.number([rules.exists({ table: 'exercises', column: 'id' })]),
      sets_reps: schema.array().members(
        schema.object().members({
          set: schema.number(),
          reps: schema.number(),
          weight: schema.number(),
        })
      ),
    })

    const validatedData = await validator.validate({
      schema: userLogCreationSchema,
      data: requestData,
    })

    const finalValidatedData: any = { ...validatedData }
    finalValidatedData.sets_reps = JSON.stringify(finalValidatedData.sets_reps)

    const searchPayload = {
      workout_id: finalValidatedData.workout_id,
      exercise_id: finalValidatedData.exercise_id,
      user_id: finalValidatedData.user_id,
    }

    const userLog = await UserLog.updateOrCreate(searchPayload, finalValidatedData)
    return response.created({ userLog })
  }

  public async getByWorkout({ auth, response, params }: HttpContextContract) {
    const userId = auth.user?.id!
    const workoutId = params.workoutId

    const userLogs = await Database.rawQuery(
      'select exercises.id as exercise_id, exercises."name", user_logs.sets_reps from user_logs JOIN exercises ON user_logs.exercise_id = exercises.id and user_logs.user_id = :userId and user_logs.workout_id = :workoutId',
      {
        workoutId,
        userId,
      }
    )

    const responseData = { userLogs: userLogs.rows }

    return response.ok(responseData)
  }

  public async update({ request, response, auth }: HttpContextContract) {
    const requestData = request.body()

    const userLog = await UserLog.findOrFail(requestData.user_logs_id)

    userLog.sets_reps = JSON.stringify(requestData.sets_reps) as unknown as object

    if (userLog.user_id !== auth.user?.id) {
      return response.unauthorized()
    }

    const updateUserLog = await userLog.save()

    return response.ok({ userLog: updateUserLog })
  }
}
