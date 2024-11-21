import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Dish from 'App/Models/Dish'
import Trainer from 'App/Models/Trainer'

export default class DishesController {
    public async getAllDishesByTrainer({auth, response}: HttpContextContract) {
        const trainer = auth.use('trainerApi').user as Trainer

        const dishes = await Dish.query().where('trainerId', trainer.id).select('id', 'name')

        return response.ok({ dishes })
    }
}
