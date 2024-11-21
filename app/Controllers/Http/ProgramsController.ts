import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import Program from 'App/Models/Program'
import { PHONEPE_COMMISSION, RAZORPAY_COMMISSION } from 'Config/constants'
import User from 'App/Models/User'
import Order from 'App/Models/Order'
import S3Service from 'App/Services/S3Service'

export default class ProgramsController {
  public async create({ request, response, auth }: HttpContextContract) {
    const requestData = request.body()

    requestData['trainer_id'] = auth.use('trainerApi').user?.id.toString()

    const programCreationSchema = schema.create({
      name: schema.string({}),
      description: schema.string({}),
      trainer_id: schema.number([rules.exists({ table: 'trainers', column: 'id' })]),
    })

    const validatedData = await validator.validate({
      schema: programCreationSchema,
      data: requestData,
    })

    const program = await Program.create(validatedData)

    return response.created({ program })
  }

  public async getProgramByUser({ auth, response }: HttpContextContract) {
    const user = auth.user as User

    const programId = user?.current_program

    if (!programId) {
      return response.notFound({ message: 'You are not subscribed to a program' })
    }

    const order = await Order.query()
      .where('user_id', user.id)
      .where('program_id', programId)
      .orderBy('created_at', 'desc')
      .first()

    if (!order) {
      return response.notFound({ message: 'You are not subscribed to a program' })
    }

    const program = await Program.query().where('id', programId).preload('trainer').first()

    if (!program) {
      return response.notFound({ message: 'Program not found' })
    }

    if (program.type === 'ebook') {
      const programAsset = await program.related('asset').query().first()

      if (!programAsset) {
        return response.notFound({ message: 'Something went wrong!' })
      }

      const assetUrl = await S3Service.getPresignedUrl(programAsset.asset_link, 3600)

      const programWithAssetAndStatus = Object.assign({}, program?.toJSON(), {
        assetUrl: assetUrl,
        orderStatus: order.status,
      })

      return response.ok({ program: programWithAssetAndStatus })
    } else {
      const programWithStatus = Object.assign({}, program?.toJSON(), { orderStatus: order.status })

      return response.ok({ program: programWithStatus })
    }
  }

  public async computeAndSaveNumberOfDays({ params, response }: HttpContextContract) {
    const program = await Program.find(params.id)

    if (!program) {
      return response.notFound({ message: 'Program not found' })
    }

    const workouts = await program.related('workout').query()

    program.number_of_days = workouts.length

    await program.save()

    return response.ok({ program })
  }

  public async getProgramById({ params, response }: HttpContextContract) {
    const program = await Program.query()
      .where('id', params.id)
      .select(
        'id',
        'name',
        'description',
        'number_of_days',
        'price',
        'discount',
        'level',
        'list_image',
        'main_image',
        'about',
        'trainer_id',
        'free_trial_days',
        'tags'
      )
      .first()

    const programClone = JSON.parse(JSON.stringify(program))

    // TODO: Figure out a better way to handle service fee
    programClone.service_fee = (
      (programClone.price - programClone.discount) *
      (PHONEPE_COMMISSION / 100)
    ).toString()

    return response.ok({ program: programClone })
  }

  public async getActivePrograms({ response }: HttpContextContract) {
    const programs = await Program.query()
      .where('is_active', true)
      .preload('trainer', (userQuery) => {
        userQuery.select('id', 'username', 'email', 'first_name', 'last_name')
      })
      .limit(10)

    const programsClone = JSON.parse(JSON.stringify(programs))

    const programsWithServiceFee = programsClone.map((program) => {
      program.service_fee = (
        (program.price - program.discount) *
        (RAZORPAY_COMMISSION / 100)
      ).toString()
      return program
    })

    return response.ok({ programs: programsWithServiceFee })
  }
}
