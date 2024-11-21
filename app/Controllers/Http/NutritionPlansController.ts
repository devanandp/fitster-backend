import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import NutritionLog from 'App/Models/NutritionLog'
import NutritionPlan from 'App/Models/NutritionPlan'
import User from 'App/Models/User'
import Workout from 'App/Models/Workout'

export default class NutritionPlansController {
  public async getByUser({ auth, response, request }: HttpContextContract) {
    const user = auth.user as User

    const { nutrition_day } = request.qs()

    if (!user) {
      return response.unauthorized({ message: 'Not authorized' })
    }

    if (user.nutrition_plan_id === null) {
      return response.notFound({ message: 'You are not subscribed to a nutrition plan' })
    } else {
      const nutritionDay = nutrition_day ?? user.current_nutrition_day
      const nutritionPlanData = await NutritionPlan.query()
        .select('id', 'name')
        .where('id', user.nutrition_plan_id)
        .first()

      const nutritionPlanId = user.nutrition_plan_id

      const mealsAndFoods = await Database.rawQuery(
        `SELECT 
        md.day_number,
        md.meal_number,
        md.id as meal_dish_id,
        m.name AS meal_name,
        m.id as meal_id,
        d.name AS dish_name,
        d.id AS dish_id,
        i.name AS ingredient_name,
        i.unit AS unit,
        i.serving_size AS serving_size,
        di.quantity,
        di.quantity * i.carbs AS effective_carbs,
        di.quantity * i.protein AS effective_protein,
        di.quantity * i.fat AS effective_fat,
        di.quantity * i.fibre AS effective_fibre,
        di.quantity * i.calories AS effective_calories
        FROM meals m
        JOIN meals_dishes md ON m.id = md.meal_id
        JOIN dishes d ON md.dish_id = d.id
        JOIN dishes_ingredients di ON d.id = di.dish_id
        JOIN ingredients i ON di.ingredient_id = i.id
        WHERE md.day_number = :nutritionDay AND m.nutrition_plan_id = :nutritionPlanId
        ORDER BY md.meal_number;`,
        { nutritionDay, nutritionPlanId }
      )

      const planForTheDay = [] as any

      const mealMap = {} as any

      const totalMacros = {
        totalCarbs: 0,
        totalProtein: 0,
        totalFat: 0,
        totalFibre: 0,
        totalCalories: 0,
      }

      mealsAndFoods.rows.forEach((result) => {
        if (!mealMap[result.meal_id]) {
          mealMap[result.meal_id] = {
            mealName: result.meal_name,
            mealDishId: result.meal_dish_id,
            dishes: [],
            totalCarbs: 0,
            totalProtein: 0,
            totalFat: 0,
            totalFibre: 0,
            totalCalories: 0,
          }
          planForTheDay.push(mealMap[result.meal_id])
        }

        const meal = mealMap[result.meal_id]

        // Update meal macros
        meal.totalCarbs += result.effective_carbs
        meal.totalProtein += result.effective_protein
        meal.totalFat += result.effective_fat
        meal.totalFibre += result.effective_fibre
        meal.totalCalories += result.effective_calories

        // Update total macros
        totalMacros.totalCarbs += result.effective_carbs
        totalMacros.totalProtein += result.effective_protein
        totalMacros.totalFat += result.effective_fat
        totalMacros.totalFibre += result.effective_fibre
        totalMacros.totalCalories += result.effective_calories

        let dish = meal.dishes.find((d) => d.dishId === result.dish_id)
        if (!dish) {
          dish = {
            dishId: result.dish_id,
            name: result.dish_name,
            ingredients: [],
          }
          meal.dishes.push(dish)
        }

        dish.ingredients.push({
          name: result.ingredient_name,
          unit: result.unit,
          quantity: result.quantity * result.serving_size,
          carbs: result.effective_carbs,
          protein: result.effective_protein,
          fat: result.effective_fat,
          fibre: result.effective_fibre,
          calories: result.effective_calories,
        })
      })

      const nutritionPlan = {
        id: nutritionPlanData?.id,
        name: nutritionPlanData?.name,
        day: nutritionDay,
      }

      return response.ok({ nutritionPlan, totalMacros, planForTheDay })
    }
  }

  public async finishTodaysDiet({ auth, response }: HttpContextContract) {
    const user = auth.user as User

    if (!user) {
      return response.unauthorized({ message: 'Not authorized' })
    }

    if (user.nutrition_plan_id === null) {
      return response.notFound({ message: 'You are not subscribed to a nutrition plan' })
    }

    const nutritionPlan = await NutritionPlan.findOrFail(user.nutrition_plan_id)

    if (user.current_nutrition_day < nutritionPlan.numberOfDays) {
      user.current_nutrition_day += 1
      await user.save()
      return response.ok({ message: 'Day finished' })
    } else {
      user.current_nutrition_day = 1
      await user.save()
      return response.ok({ message: 'Day finished' })
    }
  }

  public async matchWorkoutDay({ auth, response }: HttpContextContract) {
    const user = auth.user as User

    if (!user) {
      return response.unauthorized({ message: 'Not authorized' })
    }

    if (user.nutrition_plan_id === null) {
      return response.notFound({ message: 'You are not subscribed to a nutrition plan' })
    }

    const nutritionPlan = await NutritionPlan.findOrFail(user.nutrition_plan_id)
    const userWorkout = await Workout.findOrFail(user.current_workout)

    if (userWorkout.day_number < nutritionPlan.numberOfDays) {
      user.current_nutrition_day = userWorkout.day_number
      user.save()
      return response.ok({ message: 'Day matched' })
    } else {
      user.current_nutrition_day = 1
      user.save()
      return response.ok({ message: 'Day matched' })
    }
  }

  public async logNutrition({ auth, request, response }: HttpContextContract) {
    const user = auth.user as User

    const { mealDishId } = request.body()

    const nutritionLog = await NutritionLog.create({
      user_id: user.id,
      meal_dish_id: mealDishId,
    })

    if (nutritionLog) {
      return response.ok({ message: 'Nutrition logged' })
    } else {
      return response.badRequest({ message: 'Nutrition log failed' })
    }
  }

  public async getNutritionLogsByUser({ auth, params, response }: HttpContextContract) {
    const user = auth.user as User

    const { dayNumber } = params

    const nutritionLogsQueryResponse = await Database.rawQuery(
      `SELECT 
        md.day_number,
        md.meal_number,
        md.id AS meal_dish_id,
        m.name AS meal_name,
        m.id as meal_id,
        d.name AS dish_name,
        d.id AS dish_id,
        i.name AS ingredient_name,
        i.unit AS unit,
        i.serving_size AS serving_size,
        di.quantity,
        di.quantity * i.carbs AS effective_carbs,
        di.quantity * i.protein AS effective_protein,
        di.quantity * i.fat AS effective_fat,
        di.quantity * i.fibre AS effective_fibre,
        di.quantity * i.calories AS effective_calories,
        nl.*
        FROM meals m
        JOIN meals_dishes md ON m.id = md.meal_id
        JOIN dishes d ON md.dish_id = d.id
        JOIN dishes_ingredients di ON d.id = di.dish_id
        JOIN ingredients i ON di.ingredient_id = i.id
        JOIN nutrition_logs nl ON md.id = nl.meal_dish_id
        WHERE nl.user_id = :userId
        AND md.day_number = :dayNumber
        ORDER BY md.meal_number;
      `,
      { userId: user.id, dayNumber }
    )

    const nutritionLogs = nutritionLogsQueryResponse.rows

    const totalMacrosConsumed = nutritionLogs.reduce(
      (acc, log) => {
        acc.totalCarbs += log.effective_carbs || 0
        acc.totalProtein += log.effective_protein || 0
        acc.totalFat += log.effective_fat || 0
        acc.totalFibre += log.effective_fibre || 0
        acc.totalCalories += log.effective_calories || 0
        return acc
      },
      { totalCarbs: 0, totalProtein: 0, totalFat: 0, totalFibre: 0, totalCalories: 0 }
    )

    // Group logs by meal
    const logsGroupedByMeal = nutritionLogs.reduce((acc, log) => {
      const { meal_name, day_number, created_at } = log
      const key = `${meal_name}-${day_number}-${created_at}`
      if (!acc[key]) {
        acc[key] = {
          mealName: meal_name,
          dayNumber: day_number,
          loggedAt: created_at,
          totalMacrosConsumedInMeal: { ...totalMacrosConsumed },
          dishes: [],
        }
      }
      acc[key].dishes.push({
        dishId: log.dish_id,
        name: log.dish_name,
        ingredients: [
          {
            name: log.ingredient_name,
            unit: log.unit,
            quantity: log.quantity,
            carbs: log.effective_carbs,
            protein: log.effective_protein,
            fat: log.effective_fat,
            fibre: log.effective_fibre,
            calories: log.effective_calories,
          },
        ],
      })
      return acc
    }, {})

    // Convert grouped data to array
    const logs = Object.values(logsGroupedByMeal)

    return response.ok({
      totalMacrosConsumed,
      logs,
    })
  }
}
