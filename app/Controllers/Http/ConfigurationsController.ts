import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {  schema } from '@ioc:Adonis/Core/Validator'
import Configuration from 'App/Models/Configuration'


export default class ConfigurationsController {
  public async index({ response }: HttpContextContract) {
    /**
    * @swagger
    * /api/configurations:
    *   get:
    *     description: Lista de todas las configuraciones de los habitos en el sistema
    *     tags:
    *       - Configurations
    *     security:
    *       - bearerAuth: []
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: La busqueda fue exitosa
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de respuesta
    *                 title:
    *                   type: string
    *                   descripcion: titulo de la respuesta
    *                 message:
    *                   type: string
    *                   descripcion: mensaje de la respuesta
    *                 data: 
    *                   type: object
    *                   descripcion: Datos de la respuesta
    *       500:
    *         description: Hubo un fallo en el servidor durante la solicitud 
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de error
    *                 title:
    *                   type: string
    *                   descripcion: titulo del error
    *                 message:
    *                   type: string
    *                   descripcion: mensaje del error
    *                 errors: 
    *                   type: object
    *                   descripcion: Datos del error 
    * 
    */

    const configuration = await Configuration.query()
      .preload('user').preload('tipo_configuracion')


    return response.status(200).send({
      "type": "Exitoso",
      "title": "Recursos encontrados",
      "message": "La lista de recursos de configuraciones ha sido encontrada con exito",
      "data": configuration,
    })
  }

  public async store({ request, response }: HttpContextContract) {
    /**
    * @swagger
    * /api/configurations:
    *   post:
    *     description: Crea un nuevo recurso de configuracion de habito en la base de datos. 
    *     tags:
    *       - Configurations
    *     security:
    *       - bearerAuth: []
    *     produces:
    *       - application/json
    *     requestBody:
    *       description: Ingresa los datos basicos para una configuracion
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               tipo_configuracion_id:
    *                 type: number
    *                 descripcion: id de tipo de configuraciones
    *                 required: true
    *               data: 
    *                 type: string
    *                 descripcion: dato de la configuracion
    *                 required: true
    *               user_id:
    *                 type: number
    *                 descripcion: Id de usuario
    *                 required: true
    *     responses:
    *       201:
    *         description: La creacion del recurso fue exitosa
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de respuesta
    *                 title:
    *                   type: string
    *                   descripcion: titulo de la respuesta
    *                 message:
    *                   type: string
    *                   descripcion: mensaje de la respuesta
    *                 data: 
    *                   type: object
    *                   descripcion: Datos de la respuesta
    *       422:
    *         description: Los datos en el cuerpo de la solicitud no son procesables porque el formato es incorrecto o falta un elemento en el cuerpo de la solicitud 
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 errors:
    *                   type: array
    *                   items:
    *                     type: object
    *                   descripcion: errores en la solicitud   
    *       500:
    *         description: Hubo un fallo en el servidor durante la solicitud 
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de error
    *                 title:
    *                   type: string
    *                   descripcion: titulo del error
    *                 message:
    *                   type: string
    *                   descripcion: mensaje del error
    *                 errors: 
    *                   type: object
    *                   descripcion: Datos del error 
    * 
    */

    const body = request.all()

    await request.validate({
      schema: schema.create({
        tipo_configuracion_id: schema.number(),
        data: schema.string(),
        user_id: schema.number()
      }),
      messages: {
        'tipo_configuracion_id.required': 'El tipo de configuracion es obligatorio para crear un recurso de configuracion',
        'data.required': 'La descripcion de la configuracion es obligatoria para crear un recurso de configuracion',
        'user_id.required': 'El id de usuario es obligatorio para crear un recurso de configuracion',
        'user_id.number': 'El id de usuario debe ser un numero entero'
      }
    })

    const configuration = new Configuration()
    try {

      configuration.data = body.data
      configuration.tipo_configuracion_id = body.tipo_configuracion_id
      configuration.user_id = body.user_id
      await configuration.save()
    } catch (error) {
      response.internalServerError({
        "type": "Error",
        "title": "Error de sevidor",
        "message": "Hubo un fallo en el servidor durante el registro de los datos",
        "errors": error
      })
      return
    }

    response.status(201)
    response.send({
      "type": "Exitoso",
      "title": "Recurso creado",
      "message": "El recurso configuracion ha sido creado exitosamente",
      "data": configuration,
    })
  }

  public async show({ params, response }: HttpContextContract) {
    /**
    * @swagger
    * /api/configurations/{id}:
    *   get:
    *     description: Muestra una configuracion especifica identificada por el numero id que se pasa como parametro.
    *     tags:
    *       - Configurations
    *     security:
    *       - bearerAuth: []
    *     produces:
    *       - application/json
    *     parameters:
    *       - in: path
    *         name: id
    *         schema:
    *           type: number
    *         required: true
    *         description: Id de configuracion que se va a mostrar
    *     responses:
    *       200:
    *         description: La busqueda fue exitosa
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de respuesta
    *                 title:
    *                   type: string
    *                   descripcion: titulo de la respuesta
    *                 message:
    *                   type: string
    *                   descripcion: mensaje de la respuesta
    *                 data: 
    *                   type: object
    *                   descripcion: Datos de la respuesta
    *       404:
    *         description: No se pudo encontrar el recurso 
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de error
    *                 title:
    *                   type: string
    *                   descripcion: titulo del error
    *                 message:
    *                   type: string
    *                   descripcion: mensaje del error
    *                 errors: 
    *                   type: object
    *                   descripcion: Datos del error   
    *       500:
    *         description: Hubo un fallo en el servidor durante la solicitud 
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de error
    *                 title:
    *                   type: string
    *                   descripcion: titulo del error
    *                 message:
    *                   type: string
    *                   descripcion: mensaje del error
    *                 errors: 
    *                   type: object
    *                   descripcion: Datos del error 
    * 
    */
    const configuration = await Configuration.query()
      .where('id', params.id)
      .preload('user').preload('tipo_configuracion')
      .first()
    if (configuration) {
      response.send({
        "type": "Exitoso",
        "title": "Recurso encontrado",
        "message": "El recurso de configuracion ha sido encontrado con exito",
        "data": configuration,
      })
    }
    else {
      response.notFound({
        "type": "Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de configuracion no pudo encontrarse",
        "errors": []
      })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    /**
    * @swagger
    * /api/configurations/{id}:
    *   put:
    *     description: Actualiza el recurso de configuracion, se pueden actualizar los datos que se necesiten.
    *     tags:
    *       - Configurations
    *     security:
    *       - bearerAuth: []
    *     produces:
    *       - application/json
    *     requestBody:
    *       description: Se pueden cambiar los datos que sean necesarios
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               data: 
    *                 type: string
    *                 descripcion: dato de la configuracion
    *                 required: false
    *     parameters:
    *       - in: path
    *         name: id
    *         schema:
    *           type: number
    *         required: true
    *         description: Id de configuracion que se va a actualizar
    *     responses:
    *       200:
    *         description: La actualizacion del recurso fue exitosa
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de respuesta
    *                 title:
    *                   type: string
    *                   descripcion: titulo de la respuesta
    *                 message:
    *                   type: string
    *                   descripcion: mensaje de la respuesta
    *                 data: 
    *                   type: object
    *                   descripcion: Datos de la respuesta
    *       422:
    *         description: Los datos en el cuerpo de la solicitud no son procesables porque el formato es incorrecto o falta un elemento en el cuerpo de la solicitud 
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 errors:
    *                   type: array
    *                   items:
    *                     type: object
    *                   descripcion: errores en la solicitud  
    *       400:
    *         description: Los datos en el cuerpo de la solicitud no estan bien formulados, por un tipo de dato incorrecto 
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de error
    *                 title:
    *                   type: string
    *                   descripcion: titulo del error
    *                 message:
    *                   type: string
    *                   descripcion: mensaje del error
    *                 errors: 
    *                   type: object
    *                   descripcion: Datos del error  
    *       404:
    *         description: No se pudo encontrar el recurso de habito para su actualizacion
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de error
    *                 title:
    *                   type: string
    *                   descripcion: titulo del error
    *                 message:
    *                   type: string
    *                   descripcion: mensaje del error
    *                 errors: 
    *                   type: object
    *                   descripcion: Datos del error   
    *       500:
    *         description: Hubo un fallo en el servidor durante la solicitud 
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de error
    *                 title:
    *                   type: string
    *                   descripcion: titulo del error
    *                 message:
    *                   type: string
    *                   descripcion: mensaje del error
    *                 errors: 
    *                   type: object
    *                   descripcion: Datos del error 
    * 
    */

    const body = request.all()

    await request.validate({
      schema: schema.create({
        data: schema.string.nullableAndOptional()
      })
    })

    var configuration = await Configuration.find(params.id)
    if (!configuration) {
      response.notFound({
        "type": "Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de habito no pudo encontrarse",
        "errors": []
      })
      return
    }

    try {
      if (body.data) {
        configuration.data = body.data
      }
      configuration.save()
    } catch (error) {
      response.internalServerError({
        "type": "Error",
        "title": "Error de sevidor",
        "message": "Hubo un fallo en el servidor durante el registro de los datos",
        "errors": error
      })
      return
    }

    response.send({
      "type": "Exitoso",
      "title": "Recurso actualizado",
      "message": "El recurso configuracion ha sido actualizado exitosamente",
      "data": configuration,
    })

  }

  public async destroy({ params, response }: HttpContextContract) {
    /**
    * @swagger
    * /api/configurations/{id}:
    *   delete:
    *     description: Elimina de la base de datos la configuracion identificada por el numero id indicado.
    *     tags:
    *       - Configurations
    *     security:
    *       - bearerAuth: []
    *     produces:
    *       - application/json
    *     parameters:
    *       - in: path
    *         name: id
    *         schema:
    *           type: number
    *         required: true
    *         description: Id de configuracion que se va a eliminar
    *     responses:
    *       200:
    *         description: La eliminacion fue exitosa
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de respuesta
    *                 title:
    *                   type: string
    *                   descripcion: titulo de la respuesta
    *                 message:
    *                   type: string
    *                   descripcion: mensaje de la respuesta
    *                 data: 
    *                   type: object
    *                   descripcion: Datos de la respuesta
    *       404:
    *         description: No se pudo encontrar el recurso de habito para su eliminacion
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de error
    *                 title:
    *                   type: string
    *                   descripcion: titulo del error
    *                 message:
    *                   type: string
    *                   descripcion: mensaje del error
    *                 errors: 
    *                   type: object
    *                   descripcion: Datos del error   
    *       500:
    *         description: Hubo un fallo en el servidor durante la solicitud 
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 type:
    *                   type: string
    *                   descripcion: tipo de error
    *                 title:
    *                   type: string
    *                   descripcion: titulo del error
    *                 message:
    *                   type: string
    *                   descripcion: mensaje del error
    *                 errors: 
    *                   type: object
    *                   descripcion: Datos del error 
    * 
    */
    const configuration = await Configuration.query().where('id', params.id).first()

    if (configuration) {
      await configuration.delete()

      response.send({
        "type": "Exitoso",
        "title": "Recurso eliminado",
        "message": "El recurso configuracion ha sido eliminado exitosamente",
        "data": configuration,
      })
    }
    else {
      response.notFound({
        "type": "Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de configuracion no pudo encontrarse",
        "errors": []
      })
    }

  }
}
