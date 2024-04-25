import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TipoDispositivo from 'App/Models/TipoDispositivo'


export default class DeviceTypesController {
  /**
  * @swagger
  * /api/tipo-dispositivo:
  *  get:
  *    tags:
  *      - TiposDispositivos
  *    summary: Lista de usuarios
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
  public async index({ response }: HttpContextContract) {
    const tiposDis = await TipoDispositivo.all()
    return response.status(200).send({
      type: 'Exitoso!!',
      title: 'Lista de tipos dispositivos',
      message: 'Lista de tipos dispositivos obtenido',
      data: tiposDis
    })
  }
}
