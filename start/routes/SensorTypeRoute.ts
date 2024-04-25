import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{
    Route.get('/','SensorTypesController.index')
    Route.post('/','SensorTypesController.store')
    Route.put('/:id','SensorTypesController.update')
    Route.delete('/:id','SensorTypesController.destroy')
}).prefix('/api/sensor-type').middleware('auth:api')