import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MealsDish from 'App/Models/MealsDish'
import NutritionPlan from 'App/Models/NutritionPlan'
import Trainer from 'App/Models/Trainer'

export default class MealDishesController {
    public async assignDishesToMeal({ auth, request, response}: HttpContextContract) {
        const trainer = auth.use('trainerApi').user as Trainer
        
        const {mealId, dishes, dayNumber, mealNumber, planId} = request.body()

        const nutritionPlan = await NutritionPlan.findOrFail(planId)

        if(nutritionPlan.trainerId !== trainer.id) {
            return response.unauthorized({ message: 'You are not authorized to assign dishes to this meal' })
        }

        try {
            const mealDish = await MealsDish.createMany(dishes.map((dish: any) => {
                return { mealId, dishId: dish.id, dayNumber, mealNumber }
            }))
            return response.created({ message: 'Dish assigned to meal successfully', mealDish })
        } catch (error) {
            return response.internalServerError({ message: 'Error while assigning dishes to meal' })
        }
    }
}
