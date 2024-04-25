import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Configuration from './Configuration'

/**
 * @swagger
 * components:
 *  schemas:
 *    Habits:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          example: 10
 *        name:
 *          type: string
 *          example:  Arthur Morgan
 *        description:
 *          type: string
 *          example:  Descripcion
 *      required:
 *        - id
 *        - name
 *        - description
 */
export default class Habit extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  public static table = "habitos"

  @column()
  public name: String 

  @column()
  public description: String 

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime


  @hasMany(() => Configuration, {
    localKey: 'id',  
    foreignKey: 'habit_id',
  })
  public configuration: HasMany<typeof Configuration>

}
