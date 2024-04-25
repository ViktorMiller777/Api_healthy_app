import { DateTime } from 'luxon'
import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Configuration from './Configuration'

/**
 * @swagger
 * components:
 *  schemas:
 *    TipoConfiguracion:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          example: 10
 *        name:
 *          type: string
 *          example:  meta_calorica
 *      required:
 *        - id
 *        - name
 */
export default class TipoConfiguracion extends BaseModel {
  public static table = "tipo_configuracion"

  @column({ isPrimary: true })
  public id: number
  
  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @hasMany(() => Configuration, {
    localKey: 'id',  
    foreignKey: 'user_id',
  })
  public configuration: HasMany<typeof Configuration>
}
