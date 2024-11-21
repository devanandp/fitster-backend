import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Program from 'App/Models/Program'
import Trainer from 'App/Models/Trainer'

export default class TrainersController {
  public async getTrainerByUsername({ params, response }: HttpContextContract) {
    const { username } = params
    const trainer = await Trainer.findByOrFail('username', username)

    const programs = await Program.query().where('trainer_id', trainer.id!).where('is_active', true)

    return response.ok({
      firstName: trainer.first_name,
      lastName: trainer.last_name,
      socialMedia: trainer.social_media_links,
      certifications: trainer.certifications,
      about: trainer.about,
      yearsOfExperience: trainer.years_of_experience,
      peopleTrained: trainer.people_trained,
      websiteCoverUrl: trainer.website_cover_url,
      programs: programs,
    })
  }
}
