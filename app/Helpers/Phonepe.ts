import Env from '@ioc:Adonis/Core/Env'
import crypto from 'crypto'

export const calulateXVerifyHeader = (requestObject) => {
  const base64EncodedRequest = Buffer.from(JSON.stringify(requestObject)).toString('base64')
  const stringToHash = base64EncodedRequest + '/pg/v1/pay' + Env.get('PHONEPE_SALT_KEY')
  const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex')

  const xVerify = sha256Hash + '###' + Env.get('PHONEPE_SALT_INDEX')

  return xVerify
}
