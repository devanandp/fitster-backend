import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Workout from 'App/Models/Workout'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import UserLog from 'App/Models/UserLog'
import Database from '@ioc:Adonis/Lucid/Database'

export default class WorkoutsController {
  public async create({ request, response, auth }: HttpContextContract) {
    const requestData = request.body()

    requestData['trainer_id'] = auth.use('trainerApi').user?.id

    const workoutCreationSchema = schema.create({
      name: schema.string({}),
      description: schema.string({}),
      program_id: schema.number([rules.exists({ table: 'programs', column: 'id' })]),
      trainer_id: schema.number([rules.exists({ table: 'trainers', column: 'id' })]),
    })

    const validatedData = await validator.validate({
      schema: workoutCreationSchema,
      data: requestData,
    })

    const workout = await Workout.create(validatedData)
    return response.created(workout)
  }

  public async getById({ params, response }: HttpContextContract) {
    const workout = await Workout.find(params.id)

    if (!workout) {
      return response.notFound({ message: 'Workout not found' })
    }

    return response.ok(workout)
  }

  public async finishWorkout({ params, response, auth }: HttpContextContract) {
    // find workout with id
    const currentWorkout = await Workout.findOrFail(params.id)

    // find next workout of program
    const nextWorkout = await Workout.query()
      .where('day_number', currentWorkout.day_number + 1)
      .where('program_id', currentWorkout.program_id)
      .first()

    // update user current workout

    const user = await User.findOrFail(auth.user?.id)

    user.current_workout = nextWorkout?.id!

    await user.save()

    return response.ok({
      message: 'Workout finished',
    })
  }

  public async getWorkoutHistory({ auth, response }: HttpContextContract) {
    const programId = (auth.user as User)?.current_program!
    const currentWorkout = await Workout.find((auth.user as User)?.current_workout!)

    const workouts = await Workout.query()
      .where('day_number', '<', currentWorkout?.day_number!)
      .where('program_id', programId)
      .where('is_rest_day', false)
      .orderBy('day_number', 'desc')

    return response.ok({ workoutHistory: workouts })
  }

  public async cancelInProgressWorkout({ auth, response }: HttpContextContract) {
    const user = await User.findOrFail(auth.user?.id)

    await UserLog.query()
      .delete()
      .where('user_id', user.id)
      .where('workout_id', user.current_workout)

    const workout = await Workout.findOrFail(user.current_workout)

    if (workout.day_number > 1) {
      const previousWorkout = await Workout.query()
        .where('day_number', workout.day_number - 1)
        .firstOrFail()

      user.current_workout = previousWorkout.id
      await user.save()
    }

    return response.ok({
      message: 'Workout cancelled',
    })
  }

  public async finishWorkoutAndLog({ params, response, auth }: HttpContextContract) {
    Database.transaction(async (trx) => {
      const workout = await Workout.findOrFail(params.id, { client: trx })

      const user = await User.findOrFail(auth.user?.id, { client: trx })

      const userLogs = await UserLog.query({ client: trx })
        .delete()
        .where('user_id', user.id)
        .where('workout_id', user.current_workout)

      user.current_workout = workout.day_number + 1
      user.useTransaction(trx)
      await user.save()

      return response.ok(userLogs)
    })
  }
}
