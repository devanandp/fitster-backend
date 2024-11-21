import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthController.register')
  Route.post('/login', 'AuthController.login')
  Route.get('/logout', 'AuthController.logoutUser').middleware('auth:api')
  Route.get('/get', 'UsersController.getUser').middleware('auth:api')
  Route.post('/is-valid', 'UsersController.isValidUser')
  Route.get('/delete/:id', 'UsersController.deleteUserAndLogs').middleware('auth:api')
  Route.post('/register-after-buying', 'AuthController.registerAfterBuying')
  Route.post('/assign-program', 'OrdersController.createOrder').middleware('auth:api')
  Route.get('/order-history', 'UsersController.getOrderHistory').middleware('auth:api')
  Route.post('/forgot-password', 'AuthController.forgotPassword')
  Route.post('/reset-password', 'AuthController.resetPassword')
  Route.post('/upload-progress-photo', 'UsersController.uploadProgressPhoto').middleware('auth:api')
  Route.get('/get-progress-photos', 'UsersController.getProgressPhotos').middleware('auth:api')
  Route.delete('/delete-progress-photo/:id', 'UsersController.deleteProgressPhoto').middleware(
    'auth:api'
  )
  Route.post('/register-for-free-trial', 'UsersController.registerForFreeTrial')
  Route.get('/check-free-trial', 'UsersController.checkIfFreeTrialExpired').middleware('auth:api')
}).prefix('api/user')

Route.get('/test', async () => {
  return { test: 'passed' }
})

Route.post('/phonepe', 'WebhooksController.phonepeWebhook')

Route.group(() => {
  Route.post('/register', 'TrainerAuthsController.register')
  Route.post('/login', 'TrainerAuthsController.login')
  Route.get('/logout', 'TrainerAuthsController.logoutUser').middleware('trainerApi')
  Route.get('/:username', 'TrainersController.getTrainerByUsername')
  Route.get('/terms-conditions/:username', 'TermsConditionsController.getTermsConditions')
  Route.get('/refund-policy/:username', 'TermsConditionsController.getRefundPolicy')
}).prefix('api/trainer')

Route.group(() => {
  Route.post('/create', 'ExercisesController.create').middleware('trainerApi')
  Route.get('/get/:id', 'ExercisesController.getById').middleware('auth:api')
}).prefix('api/exercise')

Route.group(() => {
  Route.post('/create', 'ProgramsController.create').middleware('trainerApi')
  Route.get('/get', 'ProgramsController.getProgramByUser').middleware(['auth:api'])
  Route.get('/save-number-of-days/:id', 'ProgramsController.computeAndSaveNumberOfDays').middleware(
    ['auth:api']
  )
  Route.get('/get/:id', 'ProgramsController.getProgramById')
  Route.get('/get-all', 'ProgramsController.getActivePrograms')
}).prefix('api/program')

Route.group(() => {
  Route.post('/create', 'WorkoutsController.create').middleware('trainerApi')
  Route.get('/get/:id', 'WorkoutsController.getById').middleware('auth:api')
  Route.get('/finish-workout/:id', 'WorkoutsController.finishWorkout').middleware('auth:api')
  Route.get('/get-history', 'WorkoutsController.getWorkoutHistory').middleware('auth:api')
  Route.get('/cancel-workout', 'WorkoutsController.cancelInProgressWorkout').middleware('auth:api')
}).prefix('api/workout')

Route.group(() => {
  Route.post('/create', 'WorkoutExercisesController.create').middleware('trainerApi')
  Route.get('/get-by-workout/:workoutId', 'WorkoutExercisesController.getByWorkout').middleware(
    'auth:api'
  )
}).prefix('api/workout-exercise')

Route.group(() => {
  Route.post('/create', 'UserLogsController.create').middleware('auth:api')
  Route.post('/update', 'UserLogsController.update').middleware('auth:api')
  Route.get('/get-by-workout/:workoutId', 'UserLogsController.getByWorkout').middleware('auth:api')
}).prefix('api/user-logs')

Route.group(() => {
  Route.post('/subscribe/user', 'UsersController.subscribe').middleware('auth:api')
}).prefix('api/user-subscription')

Route.group(() => {
  Route.get('/get/:programId', 'TestimonialsController.getTestimonialsByProgramId')
}).prefix('api/testimonial')

Route.group(() => {
  Route.post('/create', 'OrdersController.saveRazorpayOrder')
  Route.get('/get/:orderId', 'OrdersController.getOrderStatus')
  Route.post('/create-rp-order', 'OrdersController.createRazorpayOrder')
  Route.get('/get-rp-order/:orderId', 'OrdersController.getRazorpayOrder')
  Route.post('/create-apple-pay-order', 'OrdersController.createApplePayOrder').middleware(
    'auth:api'
  )
  Route.post('/create-phonepe-order', 'OrdersController.createPhonepeOrder')
  Route.post('/initiate-phonepe-order', 'OrdersController.initiatePhonePeOrder')
  Route.get(
    '/phonepe-order-status/:merchantTransactionId',
    'OrdersController.getPhonePeOrderStatus'
  )
  Route.get(
    '/check-phonepe-order-status/:merchantTransactionId',
    'OrdersController.checkPhonePeOrderStatus'
  )
  Route.post('/start-free-trial', 'OrdersController.startFreeTrial')
}).prefix('/api/order')

Route.group(() => {
  // Route.post('/razorpay', 'WebhooksController.razorpayWebhook')
  Route.post('/phonepe', 'WebhooksController.phonepeWebhook')
}).prefix('/api/webhook')

Route.group(() => {
  Route.get('/get-by-user', 'NutritionPlansController.getByUser').middleware('auth:api')
  Route.get('/finish-todays-plan', 'NutritionPlansController.finishTodaysDiet').middleware(
    'auth:api'
  )
  Route.get('/match-workout-day', 'NutritionPlansController.matchWorkoutDay').middleware('auth:api')
  Route.post('/log-nutrition', 'NutritionPlansController.logNutrition').middleware('auth:api')
  Route.get(
    '/nutrition-logs/:dayNumber',
    'NutritionPlansController.getNutritionLogsByUser'
  ).middleware('auth:api')
}).prefix('api/nutrition-plan')

Route.group(() => {
  Route.post('/create-many', 'MealsController.createManyMeals').middleware('trainerApi')
}).prefix('api/meal')

Route.group(() => {
  Route.get('/get-by-trainer', 'DishesController.getAllDishesByTrainer').middleware('trainerApi')
}).prefix('api/dish')

Route.group(() => {
  Route.post('/assign-dishes', 'MealDishesController.assignDishesToMeal').middleware('trainerApi')
}).prefix('api/meal-dish')
