import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Habit from 'App/Models/Habit'

export default class HabitsController {
/**
 * @swagger
 * /api/habits:
 *   get:
 *     description: Lista de todos los hábitos en el sistema
 *     tags:
 *       - Habits
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: La búsqueda fue exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Título de la respuesta
 *                 message:
 *                   type: string
 *                   description: Mensaje de la respuesta
 *                 data: 
 *                   type: object
 *                   description: Datos de la respuesta
 *       500:
 *         description: Hubo un fallo en el servidor durante la solicitud 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Título del error
 *                 message:
 *                   type: string
 *                   description: Mensaje del error
 *                 errors: 
 *                   type: object
 *                   description: Datos del error 
 */
public async index({response}: HttpContextContract) {
  try {
    const habits = await Habit.all();

    return response.status(200).send({
      title: 'Recursos encontrados',
      message: 'La lista de recursos de hábitos ha sido encontrada con éxito',
      data: habits
    })
  } catch (error) {
    return response.status(500).send({
      title: 'Error de servidor',
      message: 'Hubo un fallo en el servidor durante la solicitud',
      errors: error
    })
  }
}

  /**
   * @swagger
   * /api/habits:
   *   post:
   *     description: Crea un nuevo recurso de hábito en la base de datos
   *     tags:
   *       - Habits
   *     security:
   *       - bearerAuth: []
   *     produces:
   *       - application/json
   *     requestBody:
   *       description: Ingresa los datos básicos para un hábito
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nombre del hábito
   *               description: 
   *                 type: string
   *                 description: Descripción del hábito
   *     responses:
   *       201:
   *         description: La creación del recurso fue exitosa
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta
   *                 message:
   *                   type: string
   *                   description: Mensaje de la respuesta
   *                 data: 
   *                   type: object
   *                   description: Datos de la respuesta
   *       422:
   *         description: Los datos en el cuerpo de la solicitud no son procesables
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título del error
   *                 message:
   *                   type: string
   *                   description: Mensaje del error
   *                 errors: 
   *                   type: object
   *                   description: Datos del error 
   *       500:
   *         description: Hubo un fallo en el servidor durante la solicitud 
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título del error
   *                 message:
   *                   type: string
   *                   description: Mensaje del error
   *                 errors: 
   *                   type: object
   *                   description: Datos del error 
   */
  public async store({request, response}: HttpContextContract) {
    try {

      // const {name, descripcion, user_id} = request.body()
      // const newHabit = new Habit()
      // newHabit.name = name
      // newHabit.description = descripcion

      const validatedData = await request.validate({
        schema: schema.create({
          name: schema.string(),
          description: schema.string(),
          user_id: schema.number()
        })
      })
  
      const habit = await Habit.create(validatedData)
  
      return response.status(201).send({
        title: 'Recurso creado',
        message: 'El hábito ha sido creado exitosamente',
        data: habit
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).send({
          title: 'Error de validación',
          message: 'Los datos en el cuerpo de la solicitud no son procesables',
          errors: error.messages
        })
      }
  
      return response.status(500).send({
        title: 'Error de servidor',
        message: 'Hubo un fallo en el servidor durante la solicitud',
        errors: error
      })
    }
  }
  /**
   * @swagger
   * /api/habits/{habit_id}:
   *   get:
   *     description: Muestra un hábito específico identificado por el número id que se pasa como parámetro.
   *     tags:
   *       - Habits
   *     security:
   *       - bearerAuth: []
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: path
   *         name: habit_id
   *         schema:
   *           type: number
   *         required: true
   *         description: Id de hábito que se va a mostrar
   *     responses:
   *       200:
   *         description: La búsqueda fue exitosa
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta
   *                 message:
   *                   type: string
   *                   description: Mensaje de la respuesta
   *                 data: 
   *                   type: object
   *                   description: Datos de la respuesta
   *       404:
   *         description: No se pudo encontrar el recurso de hábito
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título del error
   *                 message:
   *                   type: string
   *                   description: Mensaje del error
   *                 errors: 
   *                   type: object
   *                   description: Datos del error   
   *       500:
   *         description: Hubo un fallo en el servidor durante la solicitud 
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título del error
   *                 message:
   *                   type: string
   *                   description: Mensaje del error
   *                 errors: 
   *                   type: object
   *                   description: Datos del error 
   */
  public async show({params, response}: HttpContextContract) {
    try {
      const habit = await Habit.query()
        .where('id', params.habit_id)
        .firstOrFail()

      return response.status(200).send({
        title: 'Recurso encontrado',
        message: 'El recurso de hábito ha sido encontrado con éxito',
        data: habit
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).send({
          title: 'Recurso no encontrado',
          message: 'El recurso de hábito no pudo encontrarse',
          errors: []
        })
      }

      return response.status(500).send({
        title: 'Error de servidor',
        message: 'Hubo un fallo en el servidor durante la solicitud',
        errors: error
      })
    }
  }

  /**
   * @swagger
   * /api/habits/{habit_id}:
   *   put:
   *     description: Actualiza el recurso de hábito
   *     tags:
   *       - Habits
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
   *               name:
   *                 type: string
   *                 description: Nombre del hábito
   *                 required: false
   *               description: 
   *                 type: string
   *                 description: Descripción del hábito
   *                 required: false
   *               user_id:
   *                 type: number
   *                 description: Id de usuario
   *                 required: false
   *     parameters:
   *       - in: path
   *         name: habit_id
   *         schema:
   *           type: number
   *         required: true
   *         description: Id de hábito que se va a actualizar
   *     responses:
   *       200:
   *         description: La actualización del recurso fue exitosa
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta
   *                 message:
   *                   type: string
   *                   description: Mensaje de la respuesta
   *                 data: 
   *                   type: object
   *                   description: Datos de la respuesta
   *       422:
   *         description: Los datos en el cuerpo de la solicitud no son procesables 
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título del error
   *                 message:
   *                   type: string
   *                   description: Mensaje del error
   *                 errors: 
   *                   type: object
   *                   description: Datos del error  
   *       404:
   *         description: No se pudo encontrar el recurso de hábito para su actualización
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título del error
   *                 message:
   *                   type: string
   *                   description: Mensaje del error
   *                 errors: 
   *                   type: object
   *                   description: Datos del error   
   *       500:
   *         description: Hubo un fallo en el servidor durante la solicitud 
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título del error
   *                 message:
   *                   type: string
   *                   description: Mensaje del error
   *                 errors: 
   *                   type: object
   *                   description: Datos del error 
   */
  public async update({params, request, response}: HttpContextContract) {
    try {
      const validatedData = await request.validate({
        schema: schema.create({
          name: schema.string.optional(),
          description: schema.string.optional(),
          user_id: schema.number.optional()
        })
      })

      const habit = await Habit.findOrFail(params.habit_id)

      habit.merge(validatedData)
      await habit.save()

      return response.status(200).send({
        title: 'Recurso actualizado',
        message: 'El recurso hábito ha sido actualizado exitosamente',
        data: habit
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).send({
          title: 'Error de validación',
          message: 'Los datos en el cuerpo de la solicitud no son procesables',
          errors: error.messages
        })
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).send({
          title: 'Recurso no encontrado',
          message: 'El recurso de hábito no pudo encontrarse',
          errors: []
        })
      }

      return response.status(500).send({
        title: 'Error de servidor',
        message: 'Hubo un fallo en el servidor durante la solicitud',
        errors: error
      })
    }
  }

  /**
   * @swagger
   * /api/habits/{habit_id}:
   *   delete:
   *     description: Elimina de la base de datos al hábito identificado por el número id indicado.
   *     tags:
   *       - Habits
   *     security:
   *       - bearerAuth: []
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: path
   *         name: habit_id
   *         schema:
   *           type: number
   *         required: true
   *         description: Id de hábito que se va a eliminar
   *     responses:
   *       200:
   *         description: La eliminación fue exitosa
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta
   *                 message:
   *                   type: string
   *                   description: Mensaje de la respuesta
   *                 data: 
   *                   type: object
   *                   description: Datos de la respuesta
   *       404:
   *         description: No se pudo encontrar el recurso de hábito para su eliminación
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título del error
   *                 message:
   *                   type: string
   *                   description: Mensaje del error
   *                 errors: 
   *                   type: object
   *                   description: Datos del error   
   *       500:
   *         description: Hubo un fallo en el servidor durante la solicitud 
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título del error
   *                 message:
   *                   type: string
   *                   description: Mensaje del error
   *                 errors: 
   *                   type: object
   *                   description: Datos del error 
   */
  public async destroy({params, response}: HttpContextContract) {
    try {
      const habit = await Habit.findOrFail(params.habit_id)
      await habit.delete()

      return response.status(200).send({
        title: 'Recurso eliminado',
        message: 'El recurso de hábito ha sido eliminado exitosamente',
        data: habit
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).send({
          title: 'Recurso no encontrado',
          message: 'El recurso de hábito no pudo encontrarse',
          errors: []
        })
      }

      return response.status(500).send({
        title: 'Error de servidor',
        message: 'Hubo un fallo en el servidor durante la solicitud',
        errors: error
      })
    }
  }
}
