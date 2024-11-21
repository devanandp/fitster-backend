import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Meal from 'App/Models/Meal'
import NutritionPlan from 'App/Models/NutritionPlan'
import Trainer from 'App/Models/Trainer'

export default class MealsController {
    public async createMeal({auth, request, response}: HttpContextContract) {
        const trainer = auth.user as Trainer

        const {name, planId} = request.body()

        const nutritionPlan = await NutritionPlan.findOrFail(planId)

        if(nutritionPlan.trainerId !== trainer.id) {
            return response.unauthorized({ message: 'You are not authorized to create meals for this nutrition plan' })
        }

        const meal = await Meal.create({ name, trainerId: trainer.id, nutritionPlanId: planId })

        if(meal) {
            return response.created({ message: 'Meal created successfully', meal })
        } else {
            return response.badRequest({ message: 'Meal could not be created' })
        }
    }

    public async createManyMeals({auth, request, response}: HttpContextContract) {
        const trainer = auth.use('trainerApi').user as Trainer

        const {meals, planId} = request.body()

        const nutritionPlan = await NutritionPlan.findOrFail(planId)

        if(nutritionPlan.trainerId !== trainer.id) {
            return response.unauthorized({ message: 'You are not authorized to create meals for this nutrition plan' })
        }

        const createdMeals = await Meal.createMany(meals.map((meal: any) => {
            return { name: meal.name, trainerId: trainer.id, nutritionPlanId: planId }
        }))

        if(createdMeals) {
            return response.created({ message: 'Meals created successfully', createdMeals })
        } {
            return response.badRequest({ message: 'Meals could not be created' })
        }
    }
}
