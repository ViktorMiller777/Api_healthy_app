// start/routes.ts

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {

  Route.get('/', 'HabitsController.index')
  Route.get('/:habit_id', 'HabitsController.show')
  Route.post('/', 'HabitsController.store')
  Route.put('/:habit_id', 'HabitsController.update')
  Route.delete('/:habit_id', 'HabitsController.destroy')
}).prefix('/api/habits').middleware('auth:api')
