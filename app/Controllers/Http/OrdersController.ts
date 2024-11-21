import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import Application from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'
import crypto from 'crypto'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

import Order from 'App/Models/Order'
import Program from 'App/Models/Program'
import ApplePayTransaction from 'App/Models/ApplePayTransaction'
import User from 'App/Models/User'
import Workout from 'App/Models/Workout'
import { PHONEPE_COMMISSION } from 'Config/constants'
import PhonePeTransaction from 'App/Models/PhonePeTransaction'
import { calulateXVerifyHeader } from 'App/Helpers/Phonepe'
import Database from '@ioc:Adonis/Lucid/Database'
import UserOtp from 'App/Models/UserOtp'

export default class OrdersController {
  public async createApplePayOrder({ request, response, auth }: HttpContextContract) {
    const { transaction_id, product_identifier, app_user_id, program_id, email, amount_paid } =
      request.body()

    const verifyPayment = await this.validateApplePaymentVerification(app_user_id)

    if (verifyPayment) {
      const workoutAndProgramData = await Workout.query()
        .where('day_number', 1)
        .where('program_id', program_id)
        .preload('trainer')
        .first()

      const applePayTransaction = await ApplePayTransaction.create({
        transaction_id,
        product_identifier,
        app_user_id,
      })

      if (!applePayTransaction) {
        return response.badRequest({ message: 'Apple pay transaction failed' })
      } else {
        const user = await User.findOrFail(auth.user?.id)
        user.current_program = program_id
        user.current_workout = workoutAndProgramData?.id!
        await user.save()

        const order = await Order.create({
          email,
          amount_paid: amount_paid,
          program_id: program_id,
          status: 'captured',
          user_id: user.id,
          payment_type: 'apple',
          trainer_id: workoutAndProgramData?.trainer.id,
          apple_pay_id: applePayTransaction.id,
        })

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
      }
    }
  }

  private async validateApplePaymentVerification(app_user_id) {
    try {
      const res = await axios({
        method: 'get',
        url: 'https://api.revenuecat.com/v1/subscribers/' + app_user_id,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + Env.get('REVENUE_CAT_API_KEY'), //replace this with your public sdk key
        },
      })
      if (res.data.subscriber.non_subscriptions.fitster_program_purchase) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.log('error', error.data)
    }
  }

  // public async saveRazorpayOrder({ request, response }: HttpContextContract) {
  //   const {
  //     email,
  //     amountPaid,
  //     programId,
  //     razorpay_order_id,
  //     razorpay_payment_id,
  //     razorpay_signature,
  //   } = request.body()

  //   const verifiedPayment = await validatePaymentVerification(
  //     { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
  //     razorpay_signature,
  //     process.env.RAZORPAY_KEY_SECRET!
  //   )

  //   if (verifiedPayment) {
  //     // Todo: Move mails to it's own helpers

  //     const workoutAndProgramData = await Workout.query()
  //       .where('day_number', 1)
  //       .where('program_id', 2)
  //       .preload('trainer')
  //       .preload('program')
  //       .first()

  //     const existingUser = await User.findBy('email', email)

  //     // Replacing existing program
  //     if (existingUser) {
  //       const razorpayOrder = await RazorpayPayment.create({
  //         razorpay_order_id,
  //         razorpay_payment_id,
  //       })

  //       const oldProgramId = existingUser.current_program

  //       const order = await Order.create({
  //         email,
  //         amount_paid: amountPaid,
  //         program_id: programId,
  //         status: 'captured',
  //         user_id: existingUser.id,
  //         payment_type: 'razorpay',
  //         trainer_id: workoutAndProgramData?.trainer_id,
  //         razorpay_id: razorpayOrder.id,
  //       })

  //       existingUser.current_program = programId
  //       existingUser.current_workout = workoutAndProgramData?.id!
  //       await existingUser.save()

  //       try {
  //         const oldProgram = await Program.query()
  //           .where('id', oldProgramId)
  //           .preload('trainer', (trainerQuery) => {
  //             trainerQuery.select('first_name')
  //           })
  //           .first()
  //         await Mail.sendLater((message) => {
  //           message
  //             .from('info@fitster.io')
  //             .to(order.email)
  //             .subject('Welcome to fitster')
  //             .htmlView('emails/replace-program', {
  //               trainerName: workoutAndProgramData?.trainer.first_name,
  //               programName: workoutAndProgramData?.program.name,
  //               oldProgramName: oldProgram?.name,
  //               oldTrainerName: oldProgram?.trainer.first_name,
  //             })
  //             .embed(Application.publicPath('app-store.png'), 'apple-store')
  //             .embed(Application.publicPath('google-store.png'), 'google-store')
  //         })
  //         console.log('Email sent successfully!!')
  //       } catch (error) {
  //         console.log('error', error)
  //       }

  //       return response.created({ order })
  //     }
  //     // New user from website flow
  //     const user = new User()
  //     user.email = email
  //     user.current_program = programId
  //     user.role = 'user'
  //     user.current_workout = workoutAndProgramData?.id!

  //     const savedUser = await user.save()

  //     const razorpayOrder = await RazorpayPayment.create({
  //       razorpay_order_id,
  //       razorpay_payment_id,
  //     })

  //     const order = await Order.create({
  //       email,
  //       amount_paid: amountPaid,
  //       program_id: programId,
  //       status: 'captured',
  //       user_id: user.id,
  //       payment_type: 'razorpay',
  //       trainer_id: workoutAndProgramData?.trainer_id,
  //       razorpay_id: razorpayOrder.id,
  //     })

  //     if (savedUser) {
  //       try {
  //         await Mail.sendLater((message) => {
  //           message
  //             .from('info@fitster.io')
  //             .to(order.email)
  //             .subject('Welcome to fitster')
  //             .htmlView('emails/welcome', {
  //               trainerName: workoutAndProgramData?.trainer.first_name,
  //               programName: workoutAndProgramData?.name,
  //             })
  //             .embed(Application.publicPath('app-store.png'), 'apple-store')
  //             .embed(Application.publicPath('google-store.png'), 'google-store')
  //         })
  //         console.log('Email sent successfully')
  //       } catch (error) {
  //         console.log('error', error)
  //       }
  //       return response.created({ order })
  //     } else {
  //       return response.badRequest({ message: 'User creation failed' })
  //     }
  //   } else {
  //     try {
  //       const program = await Program.query()
  //         .where('id', programId)
  //         .preload('trainer', (trainerQuery) => {
  //           trainerQuery.select('first_name')
  //         })
  //         .first()
  //       await Mail.sendLater((message) => {
  //         message
  //           .from('info@fitster.io')
  //           .to(email)
  //           .subject('Payment failed for your order of ' + program?.name)
  //           .htmlView('emails/payment-failed', {
  //             trainerName: program?.trainer.first_name,
  //             programName: program?.name,
  //           })
  //       })
  //       console.log('Email sent successfully')
  //     } catch (error) {
  //       console.log('error', error)
  //     }
  //     return response.badRequest({ message: 'Payment verification failed' })
  //   }
  // }

  public async getOrderStatus({ params, response }: HttpContextContract) {
    const orderId = params.orderId

    const order = await Order.findBy('razorpay_order_id', orderId)

    if (!order) {
      return response.notFound({ message: 'Order not found' })
    }

    return response.ok({ status: order.status })
  }

  // public async createRazorpayOrder({ request, response }: HttpContextContract) {
  //   const { programId, email, replaceExistingProgram } = request.body()

  //   const program = await Program.find(programId)

  //   if (!program) {
  //     return response.notFound({ message: 'Program not found' })
  //   }

  //   if (!replaceExistingProgram) {
  //     const user = await User.findBy('email', email)
  //     if (user && user.current_program) {
  //       return response.ok({
  //         allowBuying: false,
  //       })
  //     }
  //   }

  //   const amount =
  //     (program.price - program.discount + (program.price * RAZORPAY_COMMISSION) / 100) * 100

  //   // Create a razorpay order
  //   const order = await razorpayInstance.orders.create({
  //     amount,
  //     currency: 'INR',
  //     receipt: `receipt_${programId}_${email}`,
  //     notes: {
  //       programId,
  //       email,
  //     },
  //   })

  //   return response.created({ allowBuying: true, order })
  // }

  public async getRazorpayOrder({ params, response }: HttpContextContract) {
    const { orderId } = params

    const order = await Order.query().where('id', orderId).preload('program').first()

    if (!order) {
      return response.notFound({ message: 'Order not found' })
    }

    return response.ok({ order })
  }

  public async initiatePhonePeOrder({ request, response }: HttpContextContract) {
    const { programId, email, path, replaceExistingProgram } = request.body()

    if (!replaceExistingProgram) {
      const user = await User.findBy('email', email)

      if (user && user.current_program) {
        return response.ok({
          allowBuying: false,
        })
      }
    }

    const merchantTransactionId = uuidv4().replaceAll('-', '')

    const merchantUserId = uuidv4().replaceAll('-', '_')

    const program = await Program.findOrFail(programId)

    const amount =
      (program.price - program.discount + (program.price * PHONEPE_COMMISSION) / 100) * 100

    const requestObject = {
      merchantId: Env.get('PHONEPE_MERCHANT_ID'),
      merchantTransactionId,
      merchantUserId,
      amount,
      redirectUrl: `${path}/order/processing?transaction_id=${merchantTransactionId}`,
      redirectMode: 'POST',
      callbackUrl: Env.get('PHONEPE_CALLBACK_URL'),
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    }

    console.log('**********************')
    console.log('requestObject', requestObject)
    console.log('**********************')

    const base64EncodedRequest = Buffer.from(JSON.stringify(requestObject)).toString('base64')

    console.log('**********************')
    console.log('base64EncodedRequest', base64EncodedRequest)
    console.log('**********************')

    const xVerify = calulateXVerifyHeader(requestObject)

    console.log('**********************')
    console.log('xVerify', xVerify)
    console.log('**********************')

    try {
      const phonepeResponse = await axios({
        url: `${Env.get('PHONEPE_URL')}/pg/v1/pay`,
        method: 'post',
        data: { request: base64EncodedRequest },
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
        },
      })

      if (phonepeResponse) {
        const phonePeTransaction = await PhonePeTransaction.create({
          merchant_transaction_id: merchantTransactionId,
          transaction_id: phonepeResponse.data.transactionId ?? null,
          merchant_user_id: merchantUserId,
        })

        await Order.create({
          email,
          amount_paid: amount,
          program_id: programId,
          status: 'pending',
          payment_type: 'phonepe',
          phone_pe_id: phonePeTransaction.id,
          nutrition_plan_id: program.nutrition_plan_id,
        })

        return response.ok({
          data: phonepeResponse.data.data.instrumentResponse.redirectInfo,
          message: 'Phonepe order initiated successfully',
          allowBuying: true,
        })
      }
    } catch (error) {
      console.log('error', error)
      return response.internalServerError({
        message: 'Phonepe order initiation failed',
        data: null,
      })
    }
  }

  public async getPhonePeOrderStatus({ params, response }: HttpContextContract) {
    const merchantTransactionId = params.merchantTransactionId

    const phonePeTransaction = await PhonePeTransaction.query()
      .where('merchant_transaction_id', merchantTransactionId)
      .firstOrFail()

    const order = await Order.query().where('phone_pe_id', phonePeTransaction.id).firstOrFail()

    if (!order) {
      return response.notFound({ message: 'Order not found' })
    } else {
      return response.ok({ orderId: order.id, status: order.status })
    }
  }

  public async checkPhonePeOrderStatus({ params, response }: HttpContextContract) {
    const merchantTransactionId = params.merchantTransactionId

    const phonePeTransaction = await PhonePeTransaction.query()
      .where('merchant_transaction_id', merchantTransactionId)
      .firstOrFail()

    const order = await Order.query().where('phone_pe_id', phonePeTransaction.id).firstOrFail()

    console.log('checking order status', order.status)

    if (order.status === 'captured') {
      return response.ok({ orderId: order.id, orderStatus: 'SUCCESS' })
    }

    const phonePeEndpoint = `/pg/v1/status/${Env.get(
      'PHONEPE_MERCHANT_ID'
    )}/${merchantTransactionId}`

    const xVerifyHeader =
      crypto
        .createHash('sha256')
        .update(phonePeEndpoint + Env.get('PHONEPE_SALT_KEY'))
        .digest('hex') +
      '###' +
      Env.get('PHONEPE_SALT_INDEX')

    try {
      const phonepeResponse = await axios({
        url: `${Env.get('PHONEPE_URL')}/status/${Env.get(
          'PHONEPE_MERCHANT_ID'
        )}/${merchantTransactionId}`,
        method: 'get',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader,
          'x-merchant-id': Env.get('PHONEPE_MERCHANT_ID'),
        },
      })

      if (phonepeResponse.data.code === 'PAYMENT_SUCCESS') {
        order.status = 'captured'
        await order.save()

        return response.ok({ orderStatus: 'SUCCESS', orderId: order.id })
      } else if (phonepeResponse.data.code === 'PAYMENT_PENDING') {
        return response.ok({ orderStatus: 'PENDING', orderId: order.id })
      } else {
        return response.ok({ orderStatus: 'ERROR', orderId: order.id })
      }
    } catch (error) {
      response.internalServerError({ error })
    }
  }

  public async startFreeTrial({ request, response }: HttpContextContract) {
    const { email, otp, programId } = request.body()

    try {
      await Database.transaction(async (trx) => {
        const user = await User.query().useTransaction(trx).where('email', email).first()

        if (!user) return response.notFound({ message: 'User not found' })

        const userOtp = await UserOtp.query()
          .useTransaction(trx)
          .where('user_id', user.id)
          .orderBy('created_at', 'desc')
          .first()

        if (!userOtp) return response.notFound({ message: 'No otp found for the user' })

        if (userOtp.otp === otp) {
          await UserOtp.query().useTransaction(trx).where('user_id', user.id).delete()

          const order = new Order()
          order.program_id = programId
          order.amount_paid = 0.0
          order.user_id = user.id
          order.payment_type = 'free_trial'
          order.status = 'free_trial'
          order.email = email

          order.useTransaction(trx)
          await order.save()

          const workoutAndProgramData = await Workout.query()
            .useTransaction(trx)
            .where('day_number', 1)
            .where('program_id', programId)
            .preload('program')
            .preload('trainer')
            .first()

          user.current_program = programId
          user.current_workout = workoutAndProgramData?.id!
          if (workoutAndProgramData?.program.nutrition_plan_id) {
            user.nutrition_plan_id = workoutAndProgramData.program.nutrition_plan_id
            user.current_nutrition_day = workoutAndProgramData.program.free_trial_days
          }
          await user.save()

          await Mail.sendLater((message) => {
            message
              .from('info@fitster.io')
              .to(order.email)
              .subject('Welcome to your free trial!')
              .htmlView('emails/free-trial', {
                trainerName: workoutAndProgramData?.trainer.first_name,
                programName: workoutAndProgramData?.program.name,
              })
              .embed(Application.publicPath('app-store.png'), 'apple-store')
              .embed(Application.publicPath('google-store.png'), 'google-store')
          })
          return response.ok({ message: 'Free trial created succesfully!', orderId: order.id })
        } else {
          return response.badRequest({ message: 'Incorrect response' })
        }
      })
    } catch (error) {
      console.log('error in free trial', error)
      return response.internalServerError({ message: 'Something went wrong!' })
    }
  }
}
