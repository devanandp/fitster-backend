import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Testimonial from 'App/Models/Testimonial'

export default class TestimonialsController {
  public async getTestimonialsByProgramId({ response, params }: HttpContextContract) {
    const programId = params.programId
    const testimonials = await Testimonial.query()
      .where('program_id', programId)
      .preload('user', (userQuery) => {
        userQuery.select('username')
      })
    return response.ok({ testimonials })
  }
}
