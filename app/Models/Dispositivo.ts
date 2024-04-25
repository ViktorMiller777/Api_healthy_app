import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm';
import User from './User';
import TipoDispositivo from './TipoDispositivo';
import Sensor from './Sensor';

/**
 * @swagger
 * components:
 *  schemas:
 *    Dispositivo:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          example: 10
 *        tipoDispositivoId:
 *          type: integer
 *          example:  10
 *        id_usuario:
 *          type: integer
 *          example:  10
 *        nombre:
 *          type: string
 *          example: bolillo
 *      required:
 *        - id
 *        - tipoDispositivoId
 *        - id_usuario
 *        - nombre
 */

export default class Dispositivo extends BaseModel {

  public static table = 'dispositivo';

  @column({ isPrimary: true })
  public id: number;

  @column()
  public tipoDispositivoId: number;

  @column()
  public id_usuario: number;

  @column()
  public nombre: String;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @belongsTo(() => User)
  public usuario: BelongsTo<typeof User>;

  @hasMany(() => Sensor, {
    localKey: 'id',
    foreignKey: 'dispositivo_id', 
  })
  public sensores: HasMany<typeof Sensor>
  @belongsTo(() => TipoDispositivo)
  public tipoDispositivo: BelongsTo<typeof TipoDispositivo>;
}
