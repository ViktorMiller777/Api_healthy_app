// app/Models/TipoDispositivo.ts
import { DateTime } from 'luxon';
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';
import Dispositivo from './Dispositivo';


/**
 * @swagger
 * components:
 *  schemas:
 *    TipoDispositivo:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          example: 10
 *        name:
 *          type: string
 *          example:  Alcoholimetro
 *      required:
 *        - id
 *        - name
 */
export default class TipoDispositivo extends BaseModel {
  public static table='tipo_dispositivo'
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @hasMany(() => Dispositivo)
  public dispositivos: HasMany<typeof Dispositivo>;
}
