import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import SensorType from 'App/Models/SensorType'
import Dispositivo from './Dispositivo'
/**
 * @swagger
 * components:
 *  schemas:
 *    Sensor:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          example: 10
 *        sensor_type_id:
 *          type: integer
 *          example:  10
 *        dispositivo_id:
 *          type: integer
 *          example:  1
 *        activo:
 *          type: integer
 *          example:  1 
 *        value: 
 *          type: 
 *      required:
 *        - id
 *        - sensor_type_id
 *        - dispositivo_id
 *        - activo
 *        - value
 */
export default class Sensor extends BaseModel {
  public static table ='sensors'

  @column({ isPrimary: true })
  public id: number

  @column()
  public sensor_type_id: number

  
  @column()
  public dispositivo_id: number

  @column()
  public activo: number

  @column()
  public value: number

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  // Relación con el modelo SensorType (pertenece a un tipo de sensor)
  @belongsTo(() => SensorType,{
    localKey: 'id',  
    foreignKey: 'sensor_type_id',
  })
  public sensorType: BelongsTo<typeof SensorType>

  @belongsTo(() => Dispositivo, {
    localKey: 'id',  
    foreignKey: 'dispositivo_id',
  })
  public dispositivo: BelongsTo<typeof Dispositivo>
}
