import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TermsCondition from 'App/Models/TermsCondition'
import Trainer from 'App/Models/Trainer'

export default class TermsConditionsController {
  public async getTermsConditions({ params, response }: HttpContextContract) {
    const username = params.username

    const trainer = await Trainer.findBy('username', username)

    if (!trainer) {
      return response.badRequest({ message: 'Trainer not found' })
    }

    const data = await TermsCondition.query()
      .where('trainer_id', trainer.id)
      .select('terms_conditions')
      .first()

    if (data) {
      return response.ok({
        termsConditions: data.termsConditions,
      })
    } else {
      return response.badRequest({ message: 'Terms and conditions could not be retrieved' })
    }
  }

  public async getRefundPolicy({ params, response }: HttpContextContract) {
    const username = params.username

    const trainer = await Trainer.findBy('username', username)

    if (!trainer) {
      return response.badRequest({ message: 'Trainer not found' })
    }

    const data = await TermsCondition.query()
      .where('trainer_id', trainer.id)
      .select('refund_policy')
      .first()

    if (data) {
      return response.ok({ refundPolicy: data.refundPolicy })
    }
  }
}
