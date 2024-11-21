import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Order from 'App/Models/Order'
import Program from 'App/Models/Program'
import Testimonial from 'App/Models/Testimonial'
import User from 'App/Models/User'
import UserLog from 'App/Models/UserLog'
import Drive from '@ioc:Adonis/Core/Drive'
import ProgressPhoto from 'App/Models/ProgressPhoto'
import UserOtp from 'App/Models/UserOtp'
import Database from '@ioc:Adonis/Lucid/Database'
import generateOtp from 'App/Helpers/user'
import Mail from '@ioc:Adonis/Addons/Mail'
import Workout from 'App/Models/Workout'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class UsersController {
  public async subscribe({ request, auth, response }: HttpContextContract) {
    const { programId } = request.all()
    const user = await User.findOrFail(auth.user?.id!)
    user.current_program = programId

    const program = await Program.query().where('id', programId).preload('workout')

    const workout = program[0].workout.find((workout) => workout.day_number === 1)

    user.current_workout = workout?.id!
    const userResponse = await user.save()

    return response.created({ userResponse })
  }

  public async getUser({ auth, response }: HttpContextContract) {
    if (auth.user) {
      return response.ok(auth.user)
    } else {
      return response.unauthorized({ message: 'User not found' })
    }
  }

  public async isValidUser({ request, response }: HttpContextContract) {
    const { email } = request.body()
    const user = await User.findBy('email', email)

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    if (user?.password) {
      return response.ok({ isActiveUser: true })
    } else {
      return response.ok({ isActiveUser: false })
    }
  }

  public async deleteUserAndLogs({ params, response, auth }: HttpContextContract) {
    const userId = params.id

    if (auth.user?.id.toString() !== userId.toString()) {
      return response.unauthorized({ message: 'You are not authorized to do this' })
    }

    // Todo: Wrap the delete in a transaction for safety
    // Todo: Delete the user's progress photos
    try {
      await Testimonial.query().where('testimonial_given_by', userId).delete()
      await UserLog.query().where('user_id', userId).delete()
      await User.query().where('id', userId).delete()
      return response.ok({ message: 'User deleted successfully' })
    } catch (error) {
      console.log('error', error)
      return response.internalServerError({ message: 'Something went wrong' })
    }
  }

  public async getOrderHistory({ auth, response }: HttpContextContract) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Not Authorized' })
    }

    const orderHistory = await Order.query().where('email', user.email).preload('program')

    return response.ok({ orderHistory })
  }

  public async uploadProgressPhoto({ request, response, auth }: HttpContextContract) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Not Authorized' })
    }

    const tmpImage = request.file('progress_photo')

    if (tmpImage) {
      const folderName = `${user.id}/progress/`
      const fileName = `${new Date().getTime()}.${tmpImage.extname}`
      try {
        await tmpImage.moveToDisk(folderName, { name: fileName }, 's3')
        const progressPhoto = new ProgressPhoto()

        progressPhoto.user_id = user.id

        progressPhoto.image = `${folderName}${fileName}`

        progressPhoto.save()
      } catch (error) {
        console.log('file upload error', error)
        return response.internalServerError({ message: 'Something went wrong' })
      }

      return response.ok({ message: 'File uploaded successfully' })
    }

    return response.badRequest({ message: 'Please upload the file' })
  }

  public async getProgressPhotos({ auth, response }: HttpContextContract) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Not Authorized' })
    }

    const progressPhotos = await ProgressPhoto.query()
      .where('user_id', user.id)
      .limit(5)
      .orderBy('created_at', 'desc')

    const imageUrls: { url: string; createdAt: string; id: number }[] = []

    // TODO: Add pagination
    if (progressPhotos.length > 0) {
      for (const progressPhoto of progressPhotos) {
        const preSignedUrl = await Drive.use('s3').getSignedUrl(progressPhoto.image, {
          expiresIn: '30mins',
        })
        imageUrls.push({
          url: preSignedUrl,
          createdAt: progressPhoto.createdAt.toString(),
          id: progressPhoto.id,
        })
      }
    }

    return response.ok({ imageUrls })
  }

  public async deleteProgressPhoto({ params, response, auth }: HttpContextContract) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Not Authorized' })
    }

    const progressPhoto = await ProgressPhoto.find(params.id)

    if (!progressPhoto) {
      return response.notFound({ message: 'Progress photo not found' })
    }

    if (progressPhoto.user_id !== user.id) {
      return response.unauthorized({ message: 'You are not authorized to do this' })
    }

    try {
      await Drive.use('s3').delete(progressPhoto.image)
    } catch (error) {
      console.log('error', error)
    }

    await progressPhoto.delete()

    return response.ok({ message: 'Progress photo deleted successfully' })
  }

  public async registerForFreeTrial({ request, response }: HttpContextContract) {
    const freeTrialSchema = schema.create({
      email: schema.string([rules.unique({ table: 'users', column: 'email' })]),
      programId: schema.number(),
    })

    const validatedData = await request.validate({
      schema: freeTrialSchema,
    })

    try {
      await Database.transaction(async (trx) => {
        const program = await Program.query()
          .useTransaction(trx)
          .where('id', validatedData.programId)
          .first()

        if (!program) return response.badRequest('Program does not exist!')

        const user = new User()
        user.email = validatedData.email
        user.useTransaction(trx)
        await user.save()

        const userOtp = new UserOtp()
        userOtp.otp = generateOtp()
        userOtp.user_id = user.id
        userOtp.useTransaction(trx)
        await userOtp.save()

        await Mail.sendLater((message) => {
          message
            .from('info@fitster.io')
            .to(user.email)
            .subject('Your otp to get your free trial!')
            .htmlView('emails/free-trial-otp', {
              programName: program.name,
              otp: userOtp.otp,
            })
        })
      })

      return response.ok({ message: 'OTP generated succesfully' })
    } catch (error) {
      console.log('error in registerForFreeTrial', error)
      return response.internalServerError({ message: 'Something went wrong!' })
    }
  }

  public async checkIfFreeTrialExpired({ auth, response }: HttpContextContract) {
    const user = auth.user as User

    const currentWorkout = await Workout.query()
      .where('id', user.current_workout)
      .where('program_id', user.current_program)
      .first()

    if (!currentWorkout) {
      return response.internalServerError({ message: 'Could not find workout' })
    }

    const program = await Program.query()
      .where('id', user.current_program)
      .select('free_trial_days')
      .first()

    if (!program) {
      return response.internalServerError({ messsage: 'Could not find program' })
    }

    if (currentWorkout?.day_number > program?.free_trial_days) {
      return response.unauthorized({ message: 'Your free trial has expired!' })
    } else {
      return response.ok({ message: 'Free trial in progress!' })
    }
  }
}
