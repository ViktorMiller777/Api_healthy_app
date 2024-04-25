// start/routes.ts

import Route from '@ioc:Adonis/Core/Route'
Route.group(()=> {
  
  Route.get('/', 'DispositivosController.index');
  Route.post('/', 'DispositivosController.store');
  Route.get('/:id', 'DispositivosController.show');
  Route.put('/:id', 'DispositivosController.update');
  Route.delete('/:id', 'DispositivosController.destroy');
  Route.post('/crear-dispositivo','DispositivosController.creardispositivo');

}).prefix('/api/dispositivos').middleware('auth:api')


