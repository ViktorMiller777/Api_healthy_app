import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{

    Route.get('/','DeviceTypesController.index')

}).prefix('/api/tipo-dispositivo')