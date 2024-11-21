import { AuthConfig } from '@ioc:Adonis/Addons/Auth'

const authConfig: AuthConfig = {
  guard: 'api',
  guards: {
    api: {
      driver: 'oat',
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email'],
        model: () => import('App/Models/User'),
      },
      tokenProvider: {
        driver: 'database',
        type: 'database',
        table: 'api_tokens',
        foreignKey: 'user_id',
      },
    },
    trainerApi: {
      driver: 'oat',
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email'],
        model: () => import('App/Models/Trainer'),
      },
      tokenProvider: {
        driver: 'database',
        type: 'database_trainer',
        table: 'api_tokens',
        foreignKey: 'trainer_id',
      },
    },
  },
}

export default authConfig
