import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import Order from 'App/Models/Order'
import Env from '@ioc:Adonis/Core/Env'
import crypto from 'crypto'
import User from 'App/Models/User'
import Workout from 'App/Models/Workout'
import Mail from '@ioc:Adonis/Addons/Mail'
import PhonePeTransaction from 'App/Models/PhonePeTransaction'
import Program from 'App/Models/Program'
// import Razorpay from 'razorpay'

export default class WebhooksController {
  // public async razorpayWebhook({ request, response }: HttpContextContract) {
  //   const razorPaySignature = request.header('x-razorpay-signature')
  //   const razorpayEventId = request.header('x-razorpay-event-id')
  //   const rawRequestBody = request.raw()
  //   const webhookSecret = process.env.RAZORPAY_WEBHOOK_CAPTURED_SECRET
  //   const requestBody = request.body()
  //   if (!razorPaySignature || !razorpayEventId) {
  //     return response.status(400).send('Bad Request')
  //   }
  //   const orderId = requestBody.payload.payment.entity.order_id
  //   const order = await Order.findBy('razorpay_order_id', orderId)
  //   // If order is not yet created, return 404 so webhook triggers again
  //   if (!order) {
  //     return response.status(404).send('Order not created yet')
  //   }
  //   const isSignatureVerified = Razorpay.validateWebhookSignature(
  //     rawRequestBody!,
  //     razorPaySignature!,
  //     webhookSecret!
  //   )
  //   // If signature is not verified, mark order as failed but return 200 so the webhook doesn't trigger again
  //   if (!isSignatureVerified) {
  //     order.status = 'failed'
  //     await order.save()
  //     return response.status(200).send('OK')
  //   }
  //   // If the event Id is already processed, return 200. This is for Idempotency - https://razorpay.com/docs/webhooks/validate-test/#idempotency
  //   if (order.razorpay_event_id === razorpayEventId) {
  //     return response.status(200).send('OK')
  //   }
  //   order.status = 'captured'
  //   order.razorpay_event_id = razorpayEventId!
  //   await order.save()
  //   return response.status(200).send('OK')
  // }

  public async phonepeWebhook({ request, response }: HttpContextContract) {
    const requestBody = request.body().response
    const xVerifyHeader = request.header('x-verify')
    const decodedRequestBody = JSON.parse(Buffer.from(requestBody, 'base64').toString('ascii'))

    const stringToHash = requestBody + Env.get('PHONEPE_SALT_KEY')
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex')
    const calculatedXVerifyHeader = sha256Hash + '###' + Env.get('PHONEPE_SALT_INDEX')

    console.log('verification correct?', xVerifyHeader === calculatedXVerifyHeader)

    console.log('decodedRequestBody', decodedRequestBody)

    if (xVerifyHeader === calculatedXVerifyHeader) {
      const phonepeTransaction = await PhonePeTransaction.query()
        .where('merchant_transaction_id', decodedRequestBody.data.merchantTransactionId)
        .firstOrFail()

      const order = await Order.query().where('phone_pe_id', phonepeTransaction.id).firstOrFail()
      if (decodedRequestBody.code === 'PAYMENT_SUCCESS') {
        phonepeTransaction.pg_transaction_id = decodedRequestBody.data.transactionId
        await phonepeTransaction.save()

        const workoutAndProgramData = await Workout.query()
          .where('day_number', 1)
          .where('program_id', order.program_id)
          .preload('trainer')
          .preload('program')
          .first()

        const existingUser = await User.findBy('email', order.email)

        if (existingUser) {
          const oldProgramId = existingUser.current_program
          existingUser.current_program = order.program_id
          existingUser.current_workout = workoutAndProgramData?.id!
          if (workoutAndProgramData?.program.nutrition_plan_id) {
            existingUser.nutrition_plan_id = workoutAndProgramData?.program.nutrition_plan_id
          }
          existingUser.nutrition_plan_id = order.nutrition_plan_id
          existingUser.current_nutrition_day = 1
          await existingUser.save()

          order.status = 'captured'
          order.user_id = existingUser.id
          order.trainer_id = workoutAndProgramData?.trainer.id!
          await order.save()

          try {
            const oldProgram = await Program.query()
              .where('id', oldProgramId)
              .preload('trainer', (trainerQuery) => {
                trainerQuery.select('first_name')
              })
              .first()
            await Mail.sendLater((message) => {
              message
                .from('info@fitster.io')
                .to(order.email)
                .subject('Welcome to fitster')
                .htmlView('emails/replace-program', {
                  trainerName: workoutAndProgramData?.trainer.first_name,
                  programName: workoutAndProgramData?.program.name,
                  oldProgramName: oldProgram?.name,
                  oldTrainerName: oldProgram?.trainer.first_name,
                })
                .embed(Application.publicPath('app-store.png'), 'apple-store')
                .embed(Application.publicPath('google-store.png'), 'google-store')
            })
            console.log('Email sent successfully!!')
          } catch (error) {
            console.log('error', error)
          }
          return response.created({ order })
        } else {
          const user = await User.create({
            email: order.email,
            current_program: order.program_id,
            current_workout: workoutAndProgramData?.id,
            nutrition_plan_id: workoutAndProgramData?.program.nutrition_plan_id,
            current_nutrition_day: 1,
          })

          if (user) {
            order.status = 'captured'
            order.user_id = user.id
            order.trainer_id = workoutAndProgramData?.trainer.id!
            await order.save()
            try {
              await Mail.sendLater((message) => {
                message
                  .from('info@fitster.io')
                  .to(order.email)
                  .subject('Welcome to fitster')
                  .htmlView('emails/welcome', {
                    trainerName: workoutAndProgramData?.trainer.first_name,
                    programName: workoutAndProgramData?.program.name,
                  })
                  .embed(Application.publicPath('app-store.png'), 'apple-store')
                  .embed(Application.publicPath('google-store.png'), 'google-store')
              })
              console.log('Email sent successfully')
            } catch (error) {
              console.log('error', error)
            }
            return response.created({ order })
          } else {
            return response.badRequest({ message: 'User creation failed' })
          }
        }
      } else if (decodedRequestBody.code === 'PAYMENT_FAILED') {
        const program = await Program.query()
          .where('id', order.program_id)
          .preload('trainer', (trainerQuery) => {
            trainerQuery.select('first_name')
          })
          .first()
        await Mail.sendLater((message) => {
          message
            .from('info@fitster.io')
            .to(order.email)
            .subject('Payment failed for your order of ' + program?.name)
            .htmlView('emails/payment-failed', {
              trainerName: program?.trainer.first_name,
              programName: program?.name,
            })
        })
      } else {
        return response.badRequest('Bad Request')
      }
    }
  }
}
