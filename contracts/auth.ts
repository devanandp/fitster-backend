import Trainer from 'App/Models/Trainer'
import User from 'App/Models/User'

declare module '@ioc:Adonis/Addons/Auth' {
  interface ProvidersList {
    user: {
      implementation: LucidProviderContract<typeof User>
      config: LucidProviderConfig<typeof User>
    }
    trainer: {
      implementation: LucidProviderContract<typeof Trainer>
      config: LucidProviderConfig<typeof Trainer>
    }
  }
  interface GuardsList {
    api: {
      implementation: OATGuardContract<'user', 'api'>
      config: OATGuardConfig<'user'>
    }
    trainerApi: {
      implementation: OATGuardContract<'trainer', 'trainerApi'>
      config: OATGuardConfig<'trainer'>
    }
  }
}
