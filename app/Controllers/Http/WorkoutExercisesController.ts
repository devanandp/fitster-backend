import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Workout from 'App/Models/Workout'
import WorkoutExercise from 'App/Models/WorkoutExercise'

export default class WorkoutExercisesController {
  public async create({ request, response }: HttpContextContract) {
    const requestData = request.body()

    const workoutExerciseCreateSchema = schema.create({
      workout_id: schema.number([rules.exists({ table: 'workouts', column: 'id' })]),
      exercise_id: schema.number([rules.exists({ table: 'exercises', column: 'id' })]),
      sets_reps: schema.array().members(
        schema.object().members({
          sets: schema.number(),
          reps: schema.string(),
          isDropSet: schema.boolean.optional(),
        })
      ),
    })

    const validatedData = await validator.validate({
      schema: workoutExerciseCreateSchema,
      data: requestData,
    })

    const finalValidatedData: any = { ...validatedData }
    finalValidatedData.sets_reps = JSON.stringify(finalValidatedData.sets_reps)

    const workoutExercise = await WorkoutExercise.create(finalValidatedData)

    return response.created({ workoutExercise })
  }

  public async getByWorkout({ request, response }: HttpContextContract) {
    const workoutId = request.param('workoutId')

    const workoutExercises = await Database.rawQuery(
      'select exercises.id as exercise_id, workout_exercises.workout_id as workout_id, exercises."name", exercises.description, exercises.video_url, workout_exercises.sets_reps from workout_exercises JOIN exercises ON workout_exercises.exercise_id = exercises.id and workout_exercises.workout_id = :workoutId',
      {
        workoutId,
      }
    )

    const workout = await Workout.find(workoutId)

    const responseData = { workoutExercises: workoutExercises.rows, workout }

    return response.ok(responseData)
  }
}
