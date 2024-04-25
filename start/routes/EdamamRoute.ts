import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{
    Route.get('/obtener-alimento','EdamamsController.findFood')
    Route.post('/calcular-nutricion','EdamamsController.calculateNutrition')
}).prefix('/api/foods').middleware('auth:api')