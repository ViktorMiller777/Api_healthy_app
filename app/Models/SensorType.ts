import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Sensor from 'App/Models/Sensor'


/**
 * @swagger
 * components:
 *  schemas:
 *    SensorType:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          example: 10
 *        name:
 *          type: string
 *          example:  Arthur Morgan
 *        unit:
 *          type: string
 *          example:  km
 *      required:
 *        - id
 *        - name
 *        - unit
 */
export default class SensorType extends BaseModel {
  public static table='sensor_types'
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public unit: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @hasMany(() => Sensor, {
    localKey: 'id',
    foreignKey: 'sensor_type_id', 
  })
  public sensors: HasMany<typeof Sensor>
}
