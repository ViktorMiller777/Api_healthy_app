// start/routes.ts

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/','UsersController.index')

  Route.post('/code-verify/:id','UsersController.SendCodigo')
  
  Route.post('/logout', 'UsersController.logout').middleware('auth:api')

  Route.get('/:id', 'UsersController.show').middleware('auth:api')

  Route.post('/', 'UsersController.register')

  Route.put('/actualizar', 'UsersController.update').middleware('auth:api')

  Route.delete('/:id', 'UsersController.destroy').middleware('auth:api')

  Route.post('/auth-login', 'UsersController.authLogin')

  Route.get('/foods','EdamamsController.obtenerAlimentos')

  Route.post('/publishEMQXTopic','EmqxController.publishEMQXTopic')

  Route.get('/obtenerMensajesDelTopico','EmqxController.obtenerMensajesDelTopico')

  Route.post('/login','UsersController.login')

  Route.post('/recuperar-contra','UsersController.correorecuperacion')

  Route.put('/update-password','UsersController.updatePassword').middleware('auth:api')

}).prefix('/api/users')