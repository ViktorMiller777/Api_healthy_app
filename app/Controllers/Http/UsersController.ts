import Mail from '@ioc:Adonis/Addons/Mail'
import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database';


export default class UsersController {
  /**
   * @swagger
   * /api/users:
   *  get:
   *    tags:
   *      - users
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
  
    const users = await User.query().preload('dispositivo',(habitUser) => {
      habitUser.preload('sensores')
    })
    return response.status(200).send({
      type: 'Success!!',
      title: 'Acceso a lista de usuarios',
      message: 'Lista de usuarios',
      data: users
    })
  }

    /**
   * @swagger
   * /api/users/{id}:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - users
   *    summary: Lista de usuarios
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: id
   *        in: path
   *        required: true
   *        description: ID del usuario a mostrar.
   *        schema:
   *          type: integer
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
    public async show({ response,params }: HttpContextContract) {
      const users = await User.query().where('id',params.id).preload('dispositivo',(dispositivo) => {
        dispositivo.preload('sensores',(sensor)=>{
          sensor.preload('sensorType')
        }).preload('tipoDispositivo')
      }).preload('configurations').first()
      if(!users){
        return response.status(404).send({
          type: 'Error',
          title: 'Error al obtener usuario por identificador',
          message: 'No se encontro usuario con este identificador'
        })
      }
      try{
      return response.status(200).send({
        type: 'Success!!',
        title: 'Mostrar usuario y dispositivo',
        message: 'Usuario',
        data: users
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).send({
          type: 'Error',
          title: 'Error al obtener usuario por identificador',
          message: 'No se encontro usuario con este identificador',
          error:error
        })
      }
    }

  }

  /**
   * @swagger
   * /api/users/code-verify/{id}:
   *  post:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - users
   *    summary: Codigo de verificacion
   *    description: Mandar codigo de verificacion 
   *    parameters:
   *      - name: id
   *        in: path
   *        required: true
   *        description: Id
   *        schema:
   *          type: string
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type: string
   *    responses:
   *       200:
   *        description: Datos de usuario actualizados exitosamente.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *                  description: Mensaje indicando el éxito de la actualización.
   */
  public async SendCodigo({response, params}:HttpContextContract){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const user = await User.findOrFail(params.id);
    const codigo = this.generateVerificationCode()
    const email = user.email

    await Mail.send((message) => {
      message
        .from(Env.get('SMTP_USERNAME'), 'Healthy App')
        .to(email)
        .subject('Healthy App - Codigo de verifiacion')
        .htmlView('emails/VerificationCode',{codigo});
    });
    user.verificationCode = codigo
    await user.save()
    return response.status(200).send({
      type: 'Success!!',
      title:'Codigo de verificacion enviado a tu correo electronico',
    })
  }
  /**
   * @swagger
   * /api/users:
   *  post:
   *      tags:
   *        - users
   *      summary: Crear un nuevo usuario
   *      description: Crea un nuevo usuario con los datos proporcionados y envía un correo electrónico de verificación.
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/UserInput'
   *            example:
   *              name: John
   *              lastname: Doe
   *              email: john.doe@example.com
   *              password: password123
   *      responses:
   *        201:
   *          description: Usuario creado exitosamente. Se ha enviado un correo electrónico de verificación.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  data:
   *                    type: object
   *                    properties:
   *                      user_id:
   *                        type: number
   *                        description: ID del usuario creado.
   *                      name:
   *                        type: string
   *                        description: Nombre del usuario.
   *                      lastname:
   *                        type: string
   *                        description: Apellido del usuario.
   *                      email:
   *                        type: string
   *                        description: Correo electrónico del usuario.
   *        400:
   *          description: Error al crear el usuario. El correo electrónico proporcionado ya está registrado.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  message:
   *                    type: string
   *                    example: Error al crear usuario
   *                  error:
   *                    type: string
   *                    example: Correo electrónico ya registrado
   *        500:
   *          description: Error interno del servidor al intentar crear el usuario.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  message:
   *                    type: string
   *                    example: Error al crear usuario
   *                  error:
   *                    type: string
   *                    example: Descripción del error interno
   *  components:
   *    schemas:
   *      UserInput:
   *        type: object
   *        properties:
   *          name:
   *            type: string
   *          lastname:
   *            type: string
   *          email:
   *            type: string
   *          password:
   *            type: string
   *        required:
   *          - name
   *          - lastname
   *          - email
   *          - password
   */
  public async register({ request, response}: HttpContextContract) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
      const name = request.input('name');
      const lastname = request.input('lastname');
      const email = request.input('email')
      const password = request.input('password');

      // Verificar si el correo electrónico ya existe
      const existingUser = await User.findBy('email', email);
      if (existingUser) {
        return response.status(400).json({
          type: 'Error',
          message: 'Error al crear usuario',
          error: 'Correo electrónico ya registrado',
        });
      }

      if (password.length < 8) {
        return response.status(400).json({
          type: 'Error',
          message: 'Error al crear usuario',
          error: 'La contraseña debe tener al menos 8 caracteres',
        });
      }

      const newUser = new User();
      newUser.name = name;
      newUser.lastname = lastname;
      newUser.email = email;
      newUser.password = await Hash.make(password);

      const verificationCode = this.generateVerificationCode();
      newUser.verificationCode = verificationCode;

      await newUser.save();

      const emailData = { code: verificationCode };

      await Mail.send((message) => {
        message
          .from(Env.get('SMTP_USERNAME'), 'Healthy App')
          .to(email)
          .subject('Healthy App - Verificación de cuenta')
          .htmlView('emails/welcome', emailData);
      });
      
      const accountSid = Env.get('TWILIO_ACCOUNT_SID')
      const authToken = Env.get('TWILIO_AUTH_TOKEN')
      const client = require('twilio')(accountSid, authToken)


   
      await client.messages.create({
        body: "Gracias por registrarte en HealthyApp :D",
        from: Env.get('TWILIO_FROM_NUMBER'),
        to:`+528714446301`
      })

      return response.status(201).json({
        type: 'Success!!',
        title: 'Registro correctamente',
        message:'Usuario registrado correctamente',
        data: {
          user_id: newUser.id,
          name: newUser.name,
          lastname: newUser.lastname,
          email: newUser.email,
        message: 'Se ha enviado un codigo de verificacion a tu correo electromico'
        },
      });
    } catch (error) {
      return response.status(400).json({
        type: 'Error',
        title: 'Error registrar usuario',
        message: 'Error al crear usuario',
        error: error.message,
      });
    }
  }
  private generateVerificationCode() {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return randomNumber.toString();
  }
/**
 * @swagger
 * /api/users/actualizar:
 *  put:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - users
 *    summary: Actualización de datos de usuario
 *    description: Actualiza los datos de un usuario existente. Cada campo es opcional y se actualizará solo si está presente en la solicitud.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              lastname:
 *                type: string
 *              email:
 *                type: string
 *    responses:
 *       200:
 *        description: Datos de usuario actualizados exitosamente.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Mensaje indicando el éxito de la actualización.
 *       401:
 *        description: Usuario no autenticado.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Mensaje indicando el error de autenticación.
 *       500:
 *        description: Error interno del servidor al actualizar los datos del usuario.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Mensaje indicando el error interno del servidor.
 */
public async update({ auth, request, response }: HttpContextContract) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  try {
    const user = await User.query().where('id',auth.user?.id).preload('dispositivo',(dispositivo) => {
      dispositivo.preload('sensores',(sensor)=>{
        sensor.preload('sensorType')
      }).preload('tipoDispositivo')
    }).preload('configurations').first();

    if(!user){
      return response.status(404).json({ 
        type: 'Error',
        title: 'Usuario no encontrado',
        message: 'Error al encontrar los datos del usuario', 
        error: [] 
      })
    }
    
    const { name, lastname, email } = request.only(['name', 'lastname', 'email']);

    // Construye un objeto con los campos que se van a actualizar
    const updates: { [key: string]: any } = {};
    if (name !== undefined) {
      updates.name = name;
    }

    if (lastname !== undefined) {
      updates.lastname = lastname;
    }

    if (email !== undefined) {
      updates.email = email;
    }

    // Actualiza los datos del usuario en la base de datos directamente
    await Database.from('users').where('id', user.id).update(updates);

    // Obtiene los datos actualizados del usuario
    const updatedUser = await Database.from('users').where('id', user.id).first();

    // Envía el correo electrónico
    await Mail.send((message) => {
      message
        .from(Env.get('SMTP_USERNAME'), 'Healthy App')
        .to(user.email)
        .subject('Healthy App - Personalizacion de cuenta')
        .htmlView('emails/actualizarUser', { name: updates.name || user.name, lastname: updates.lastname || user.lastname, email: updates.email || user.email });
    });

    return response.status(200).json({
      type: 'Success!!',
      title: 'Datos actualizados',
      message: 'Datos de usuario actualizados', 
      data: updatedUser 
    });
  } catch (error) {
    return response.status(500).json({ 
      type: 'Error',
      title: 'Error de servidor',
      message: 'Error interno del servidor al actualizar los datos del usuario', 
      error: error.message 
    });
  }
}
 /**
 * @swagger
 * /api/users/update-password:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - users
 *     summary: Actualización de contraseña de usuario
 *     description: Actualiza la contraseña de un usuario autenticado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña de usuario actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje indicando el éxito de la actualización de contraseña.
 *       400:
 *         description: Error de solicitud debido a datos faltantes o inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error indicando el problema con la solicitud.
 *       401:
 *         description: No autorizado, token de acceso inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error indicando la falta de autorización.
 *       500:
 *         description: Error interno del servidor al actualizar la contraseña del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error indicando el problema interno del servidor.
 */
 public async updatePassword({ auth, request, response }: HttpContextContract) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  try {
    const userId = auth.user?.id;

    if (!userId) {
      return response.status(401).json({ error: 'Usuario no autenticado' });
    }

    const user = await User.query()
    .where('id', userId)
    .preload('dispositivo',(dispositivo) => {
      dispositivo.preload('sensores',(sensor)=>{
        sensor.preload('sensorType')
      }).preload('tipoDispositivo')
    }).preload('configurations').first();

    if(!user){
      return response.status(404).json({ 
        type: 'Error',
        title: 'Usuario no encontrado',
        message: 'Error al encontrar los datos del usuario', 
        error: [] 
      })
    }


    const oldPassword: string = request.input('oldPassword');
    const newPassword: string = request.input('newPassword');

    const isPasswordValid = await Hash.verify(user.password, oldPassword);
    if (!isPasswordValid) {
      return response.status(401).json({ error: 'La contraseña anterior es incorrecta' });
    }

    if (newPassword.length < 8) {
      return response.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }

    user.password = await Hash.make(newPassword);
    await user.save();

    await Mail.send((message) => {
      message
        .from(Env.get('SMTP_USERNAME'), 'Healthy App')
        .to(user.email)
        .subject('Healthy App - Recuperacion de Contraseña')
        .htmlView('emails/nuevaContrasena', { email: user.email });
    });

    return response.status(200).json({ 
      type: 'Exitoso!!',
      title: 'Contraseña actualizada',
      message: 'Contraseña de usuario actualizada' ,
      data: user
    });
  } catch (error) {
    return response.status(500).json({ 
      type: 'Error',
      title: 'Error al actualizar contraseña',
      message: 'Error interno del servidor al actualizar la contraseña del usuario', 
      error: error.message});
  }
}
  /**
   * @swagger
   * /api/users/{id}:
   *  delete:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - users
   *    summary: Eliminación de cuenta de usuario
   *    description: Elimina la cuenta de usuario actual.
   *    responses:
   *      '200':
   *        description: Cuenta de usuario eliminada exitosamente.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *                  description: Mensaje indicando el éxito de la eliminación.
   */
  public async destroy({ response, auth }: HttpContextContract) {
    try {
      const usuario = auth.user!
      await usuario.delete()
      return response.status(204).send({
        type: 'Exitoso!!',
        title: 'Exito al eliminar usuario',
        message: 'Usuario eliminado exitosamente',
        data: usuario
      })
      
    } catch (error) {
      return response.status(400).send({
        type: 'Error',
        title: 'Error al aliminar usuario',
        message: 'Se produjo un error al eliminar usuario'
      })
    }
  }
  /**
   * @swagger
   * /api/users/auth-login:
   *  post:
   *    tags:
   *      - users
   *    summary: Verificar sesión de usuario.
   *    description: Inicia sesión de usuario verificando el correo electrónico y el código de verificación.
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              user_email:
   *                type: string
   *                format: email
   *              password:
   *                type: string
   *              verification_code:
   *                type: string
   *            required:
   *              - user_email
   *              - password
   *              - verification_code
   *    responses:
   *      200:
   *        description: Inicio de sesión exitoso.
   *        content:
   *          application/json:
   *            example:
   *              message: Inicio de sesión exitoso
   *      401:
   *        description: Datos inválidos o usuario no verificado.
   *        content:
   *          application/json:
   *            example:
   *              title: Datos inválidos
   *              message: Usuario no verificado o datos incorrectos
   *              type: warning
   *      400:
   *        description: Error al iniciar sesión.
   *        content:
   *          application/json:
   *            example:
   *              message: Error al iniciar sesión
   *              error: Descripción del error
   */
  public async authLogin({ request, response }: HttpContextContract) {
    try {
      const user_email = request.input('user_email');
      const password = request.input('password');
      const verificationCode = request.input('verification_code');

      const user = await User.query()
        .where('email', user_email)
        .where('verification_code', verificationCode)
        .whereNull('deleted_at')
        .first();

      if (!user || user.verificationCode !== verificationCode) {
        // Devolver error de datos inválidos
        return response.status(401).send({
          type: 'warning',
          title: 'Datos inválidos',
          message: 'Usuario no verificado o datos incorrectos',
        });
      }

      if (!(await Hash.verify(user.password, password))) {
        return response.status(401).send({
          type: 'warning',
          title: 'Datos inválidos',
          message: 'Contraseña incorrecta',
        });
      }

      user.verificationCode = null;
      await user.save();

      return response.status(200).json({ 
        type: 'Exitoso!!',
        title: 'Verificado',
        message: 'Cuenta Verificada Correctamente'
       });
    } catch (error) {
      return response.status(400).json({
        type: 'Error',
        title: 'Error de inicio',
        message: 'Error al iniciar sesión',
        error: error.message,
      });
    }
  }
  /**
   * @swagger
   * /api/users/logout:
   *  post:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - users
   *    summary: Cierre de sesión de usuario
   *    description: Cierra la sesión actual del usuario.
   *    responses:
   *       200:
   *        description: Sesión cerrada exitosamente.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *                  description: Mensaje indicando el éxito del cierre de sesión.
   */
  public async logout({ auth, response }: HttpContextContract) {
    try {
      await auth.logout()
      return response.status(200).send({
        type: 'Exitoso!!',
        title: 'Logout exitoso',
        message: 'Logout exitosamente '
      })
      
    } catch (error) {
      return response.status(200).send({
        type: 'Error',
        title: 'Error al cerrar sesion',
        message: 'Se produjo un error al cerrar sesion'
      })
      
    }
  }
  /**
   * @swagger
   * /api/users/login:
   *  post:
   *    tags:
   *      - users
   *    summary: Iniciar sesión de usuario
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type: string
   *                description: Correo electrónico del usuario
   *              password:
   *                type: string
   *                description: Contraseña del usuario
   *    responses:
   *      200:
   *        description: Inicio de sesión exitoso
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                token:
   *                  type: string
   *                  description: Token de autenticación generado
   *      401:
   *        description: Credenciales inválidas
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *                  example: Usuario no encontrado
   *      500:
   *        description: Error interno del servidor
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *                  example: Error al iniciar sesión
   *                error:
   *                  type: string
   */
  public async login({ request, auth, response }: HttpContextContract) {
    try {
      const email = request.input('email');
      const password = request.input('password');

      // Verificar las credenciales del usuario
      const user = await User.query().where('email', email).preload('dispositivo',(dispositivo) => {
        dispositivo.preload('sensores',(sensor)=>{
          sensor.preload('sensorType')
        }).preload('tipoDispositivo')
      }).preload('configurations').first()

      if (!user) {
        return response.status(401).json({ message: 'Usuario no encontrado' });
      }

      const isPasswordValid = await Hash.verify(user.password, password);

      if (!isPasswordValid) {
        return response.status(401).json({ message: 'Contraseña incorrecta' });
      }
      // Verificar si el usuario ya está verificado con su código
      if (user.verificationCode !== null) {
        return response.status(401).json({ message: 'El usuario aún no está verificado. Por favor, verifique su cuenta.' });
      }

      const token = await auth.use('api').generate(user, { expiresIn: '3 days' });

      return response.status(200).json({
        type: 'Exitoso!!',
        title: 'Login exitoso',
        message: 'Login exitosamente',
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      return response.status(500).json({
        type: 'Error',
        title: 'Error al iniciar sesion',
        message: 'Error al iniciar sesión', error: error.message });
    }
  }
  /**
   * @swagger
   * /api/users/recuperar-contra:
   *   post:
   *     tags:
   *       - users
   *     summary: Solicitar recuperación de contraseña
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Correo electrónico del administrador para recuperar la contraseña
   *     responses:
   *       200:
   *         description: Correo electrónico enviado con éxito
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Se ha enviado un correo electrónico con un código de recuperación.
   *       400:
   *         description: Correo electrónico no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: No se encontró un administrador con este correo electrónico.
   *       500:
   *         description: Error del servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Error al enviar el correo electrónico de recuperación.
   *                 error:
   *                   type: string
   *                   example: Mensaje de error detallado
   */
  public async correorecuperacion({ request, response }: HttpContextContract) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
      const email = request.input('email')
      const user = await User.query().where('email', email).preload('dispositivo',(dispositivo) => {
        dispositivo.preload('sensores',(sensor)=>{
          sensor.preload('sensorType')
        }).preload('tipoDispositivo')
      }).preload('configurations').first()

      if (!user) {
        return response.status(400).json({
          message: 'No se encontró un usuario con este correo electrónico.',
        })
      }

      const verificationCode = this.generarcodigo()

      user.verificationCode = verificationCode
      await user.save()

      await Mail.send((message) => {
        message
          .from(Env.get('SMTP_USERNAME'), 'Healthy App')
          .to(email)
          .subject('Recuperación de Contraseña')
          .htmlView('emails/recuperacion', { verificationCode })
      })

      return response.status(200).json({
        message: 'Se ha enviado un correo electrónico con un código de recuperación.',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al enviar el correo electrónico de recuperación.',
        error: error.message,
      })
    }
  }
  public generarcodigo() {
    const randomNumber = Math.floor(1000 + Math.random() * 9000)
    return randomNumber.toString()
  }
}