import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Sensor from 'App/Models/Sensor'

export default class SensorsController {
  /**
   * 
   * @swagger
   * /api/sensor:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Sensors
   *    summary: list of sensors
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: Success!!
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                title:
   *                  type: string
   *                  description: title 
   *                data:
   *                  type: string 
   *                  description: jajajaj
   */
  public async index({response}: HttpContextContract) {
    const sensores = await Sensor.query().preload('sensorType')
    return response.status(200).send({
      title:'Success!!',
      message:'List of sensors',
      data:sensores
    })
  }
  /**
  * @swagger
  * /api/sensor:
  *   post:
  *     security:
  *      - bearerAuth: []
  *     tags:
  *       - Sensors
  *     summary: Create new sensor
  *     produces:
  *       - application/json 
  *     requestBody:
  *       response: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               sensor_type_id:
  *                 type: number
  *                 description: Type sensor
  *               value:
  *                 type: number
  *                 description: value
  *     responses:
  *       200:
  *         description: Success! Tout va bien :)
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 name:
  *                   type: string
  *                   description: Titulo de la respuestinha sinha sinha
  *                 last_name:
  *                   type: string
  *                   description: datos de respuesta
  */ 
  public async store({request, response}: HttpContextContract) {
    const {sensor_type_id, value} = request.body()
    const newSensor = new Sensor()

    newSensor.sensor_type_id = sensor_type_id
    newSensor.activo = 1
    newSensor.value = value

    await newSensor.save()

    return response.status(200).send({
      type: 'Success!!',
      title:'Sensor obtenido',
      message:'Sensor creado con exito',
      data: newSensor
    })
  }
  /**
   * 
   * @swagger
   * /api/sensor/{id}:
   *  put:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Sensors
   *    summary:  Activate sensor by id
   *    parameters:
   *      - name: id
   *        in: path
   *        required: true
   *        description: id sensor
   *        schema: 
   *          type: integer 
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: Success! Tout va bien :)
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                title:
   *                  type: string
   *                  description: Titulo de la respuestinha sinha sinha
   *                data:
   *                  type: string
   *                  description: datos de respuesta
   */
  public async update({response, request, params}: HttpContextContract) {
    try {
      const {} = request.body()
      const updateSensor = await Sensor.findOrFail(params.id)
      if(updateSensor.activo==1){
        updateSensor.activo = 0
        await updateSensor.save()
    
        return response.status(200).send({
          type: 'Exito!!',
          title: 'Sensor desactivado',
          message:'Sensor desactivado exitosamente',
          data:updateSensor
        })  

        }else if(updateSensor.activo==0){
          updateSensor.activo = 1
          await updateSensor.save()
      
          return response.status(200).send({
            type: 'Exito!!',
            title: 'Sensor activado',
            message:'Sensor activado exitosamente',
            data:updateSensor
          })  
        
      }
    } catch (error) {
      if(error.code === 'E_ROW_NOT_FOUND'){
        return response.status(200).send({
          type: 'Error',
          title: 'Error al obtener sensor',
          message:'Sensor no encontrado'
        })
      }
    
    }
  
     
  }
  /**
   * 
   * @swagger
   * /api/sensor/{id}:
   *  delete:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Sensors
   *    summary:  drop sensor by id
   *    parameters:
   *      - name: id
   *        in: path
   *        required: true
   *        description: id sensor
   *        schema: 
   *          type: integer 
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: Success! Tout va bien :)
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                title:
   *                  type: string
   *                  description: Titulo de la respuestinha sinha sinha
   *                data:
   *                  type: string
   *                  description: datos de respuesta
   */
  public async destroy({response, params}: HttpContextContract) {
    try {
      const delSensor = await Sensor.findOrFail(params.id)
      await delSensor.delete()
      return response.status(204).send({
        type: 'Exitoso!!',
        title: 'Sensor eliminado',
        message: 'Sensor eliminado exitosamente',
        data: delSensor
      })
    } catch (error) {
      if(error.code === 'E_ROW_NOT_FOUND'){
        return response.status(200).send({
          type: 'Error',
          title:'Error al eliminar sensor',
          message:'Se produjo un error al eliminar sensor D:'
        })
      }
    }
  }
}
