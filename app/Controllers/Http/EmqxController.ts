import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import axios from 'axios';
import Env from '@ioc:Adonis/Core/Env'
import SensorType from 'App/Models/SensorType';
import Configuration from 'App/Models/Configuration';

export default class EmqxController {
  /**
  * @swagger
  * /api/emqx/topic-retained:
  *   post:
  *     security:
  *      - bearerAuth: []
  *     tags:
  *       - EMQX
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: topic
  *         in: query
  *         required: true
  *         schema:
  *           type: string
  *     responses:
  *       200:
  *         description: Todo salió bien cuando mandamos este estatus
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 type:
  *                   type: string
  *                 title:
  *                   type: string
  *                   description: Titulo de la respuesta
  *                 message:
  *                   type: string
  *                 data:
  *                   type: object
  *                   description: Datos de respuesta
  *                   properties:
  *                     user:
  *                       type: object
  *                       $ref: '#/components/schemas/User'
  */
  public async getEMQXTopic({ request, response }: HttpContextContract) {
    try {
      const topic = request.input('topic');
      const url = Env.get('MQTT_HOST') + '/mqtt/retainer/message/' + topic;

      const axiosResponse = await axios.get(url, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (axiosResponse.status !== 200) {
        return response.status(axiosResponse.status).send({
          title: 'Error',
          message: 'Ocurrió un error al obtener el mensaje retenido más reciente.',
          type: 'error',
          data: {
            error: axiosResponse.statusText
          },
        });
      }

      const retainedMessage = axiosResponse.data;

      // Decodificar el payload del mensaje retenido
      const decodedPayload = Buffer.from(retainedMessage.payload, 'base64').toString('utf-8');

      // Intentar analizar el contenido decodificado como JSON
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(decodedPayload);
      } catch (error) {
        // Si no se puede analizar como JSON, simplemente usa el contenido decodificado
        parsedPayload = decodedPayload;
      }

      return response.status(200).send({
        title: 'Mensaje retenido más reciente obtenido con éxito',
        message: 'El último mensaje retenido del tema ha sido recuperado correctamente.',
        type: 'success',
        data: {
          retained_message: parsedPayload
        },
      });
    } catch (error) {
      let errorMessage = 'Ocurrió un error interno al procesar la solicitud.';
      if (error.response) {
        errorMessage = `Se recibió una respuesta con el estado ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió ninguna respuesta del servidor.';
      } else {
        errorMessage = `Error al realizar la solicitud: ${error.message}`;
      }
      return response.status(500).send({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }

  /**
     * @swagger
     * /api/emqx/publish-emqx-topic:
     *   post:
     *    security:
     *      - bearerAuth: []
     *     tags:
     *       - EMQX
     *     produces:
     *       - application/json
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               topic_name:
     *                 topic: string
     *               topic_message:
     *                 topic: string
     *             required:
     *               - topic_name
     *               - topic_message
     *     responses:
     *       200:
     *         description: Todo salió bien cuando mandamos este estatus
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 type:
     *                   type: string
     *                 title:
     *                   type: string
     *                   description: Titulo de la respuesta
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   description: Datos de respuesta
     *                   properties:
     *                     user:
     *                       type: object
     *                       $ref: '#/components/schemas/User'
     */
  public async publishEMQXTopic({ request, response }: HttpContextContract) {
    try {
      const body = request.all()
      const url = Env.get('MQTT_HOST') + '/publish'
      const payload = {
        "payload_encoding": "plain",
        "topic": body.topic_name,
        "qos": 0,
        "payload": body.topic_message,
        "properties": {
          "user_properties": {
            "foo": "bar"
          }
        },
        "retain": true
      }

      const res = await axios.post(url, payload, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      }).catch((error) => error)
      if (!res.status && res.response.status !== 202) {
        return response.status(res.response.status).send({
          title: 'Error',
          message: 'Ocurrio un error',
          type: 'error',
          data: {
            error: res.response
          },
        })
      }

      return response.status(200).send({
        title: 'Topico enviado',
        message: '',
        type: 'success',
        data: res.data,
      })

    } catch (error) {
      return response.status(500).send({
        title: 'Error',
        message: 'Ocurrio un error',
        type: 'error',
        data: {
          error: error.message
        },
      })
    }
  }

  public async webhookRes({ request, response }: HttpContextContract) {
    const body = request.all()
    console.log('============================= INICIA LOG DE WEBHOOK ============================')
    console.log(body)
    console.log('============================= TERMINA =============================')
    return response.send(body)
  }
  /**
   * @swagger
   * /api/emqx/obtener-ritmo:
   *   post:
   *     security:
   *      - bearerAuth: []
   *     tags:
   *       - EMQX
   *     summary: Obtener el último mensaje retenido de ritmo cardiaco.
   *     description: |
   *       Esta ruta permite obtener el último mensaje retenido de ritmo cardiaco desde el servidor EMQX.
   *     responses:
   *       200:
   *         description: Último mensaje retenido del ritmo cardiaco obtenido correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta.
   *                 message:
   *                   type: string
   *                   description: Mensaje de éxito.
   *                 type:
   *                   type: string
   *                   description: Tipo de respuesta.
   *                 data:
   *                   type: object
   *                   description: Datos de respuesta.
   *                   properties:
   *                     retained_message:
   *                       type: object
   *                       description: Último mensaje retenido de pasos.
   *       500:
   *         description: Error interno al procesar la solicitud.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                 message:
   *                   type: string
   *                   description: Descripción del error.
   *                 type:
   *                   type: string
   *                   description: Tipo de error.
   *                 data:
   *                   type: object
   *                   description: Datos adicionales relacionados con el error.
   *                   properties:
   *                     error:
   *                       type: string
   *                       description: Mensaje de error detallado.
   */
  public async obtenerRitmo({ response }: HttpContextContract) {
    try {
      const url = Env.get('MQTT_HOST') + '/mqtt/retainer/message/BrazaletePulso';

      const sensorType = await SensorType.findBy('name', 'Ritmo');

      if (!sensorType) {
        return response.status(404).send({
          title: 'Error',
          message: 'No se encontró el tipo de sensor especificado.',
          type: 'error',
        });
      }
      const unit = sensorType.unit;

      const axiosResponse = await axios.get(url, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (axiosResponse.status !== 200) {
        return response.status(axiosResponse.status).send({
          title: 'Error',
          message: 'Ocurrió un error al obtener el ritmo cardiaco más reciente.',
          type: 'error',
          data: {
            error: axiosResponse.statusText
          },
        });
      }

      const retainedMessage = axiosResponse.data;

      const decodedPayload = Buffer.from(retainedMessage.payload, 'base64').toString('utf-8');

      let parsedPayload;
      try {
        parsedPayload = JSON.parse(decodedPayload);
      } catch (error) {
        parsedPayload = decodedPayload;
      }

      return response.status(200).send({
        title: 'ritmo cardiaco más reciente obtenido con éxito',
        message: 'El último ritmo cardiaco ha sido recuperado correctamente.',
        type: 'success',
        data: {
          retained_message: parsedPayload,
          unit: unit
        },
      });
    } catch (error) {
      let errorMessage = 'Ocurrió un error interno al procesar la solicitud.';
      if (error.response) {
        errorMessage = `Se recibió una respuesta con el estado ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió ninguna respuesta del servidor.';
      } else {
        errorMessage = `Error al realizar la solicitud: ${error.message}`;
      }
      return response.status(500).send({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }
  /**
   * @swagger
   * /api/emqx/obtener-pasos:
   *   post:
   *     security:
   *      - bearerAuth: []
   *     tags:
   *       - EMQX
   *     summary: Obtener el último mensaje retenido de pasos.
   *     description: |
   *       Esta ruta permite obtener el último mensaje retenido de pasos desde el servidor EMQX.
   *     responses:
   *       200:
   *         description: Último mensaje retenido de pasos obtenido correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta.
   *                 message:
   *                   type: string
   *                   description: Mensaje de éxito.
   *                 type:
   *                   type: string
   *                   description: Tipo de respuesta.
   *                 data:
   *                   type: object
   *                   description: Datos de respuesta.
   *                   properties:
   *                     retained_message:
   *                       type: object
   *                       description: Último mensaje retenido del ritmo cardíaco.
   *       500:
   *         description: Error interno al procesar la solicitud.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                 message:
   *                   type: string
   *                   description: Descripción del error.
   *                 type:
   *                   type: string
   *                   description: Tipo de error.
   *                 data:
   *                   type: object
   *                   description: Datos adicionales relacionados con el error.
   *                   properties:
   *                     error:
   *                       type: string
   *                       description: Mensaje de error detallado.
   */
  public async obtenerPasos({ response }: HttpContextContract) {
    try {
      const url = Env.get('MQTT_HOST') + '/mqtt/retainer/message/BrazaletePasos';
      const sensorType = await SensorType.findBy('name', 'Pasos');

      if (!sensorType) {
        return response.status(404).send({
          title: 'Error',
          message: 'No se encontró el tipo de sensor especificado.',
          type: 'error',
        });
      }
      const unit = sensorType.unit;

      const axiosResponse = await axios.get(url, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (axiosResponse.status !== 200) {
        return response.status(axiosResponse.status).send({
          title: 'Error',
          message: 'Ocurrió un error al obtener los pasos más reciente.',
          type: 'error',
          data: {
            error: axiosResponse.statusText
          },
        });
      }

      const retainedMessage = axiosResponse.data;

      const decodedPayload = Buffer.from(retainedMessage.payload, 'base64').toString('utf-8');

      let parsedPayload;
      try {
        parsedPayload = JSON.parse(decodedPayload);
      } catch (error) {
        parsedPayload = decodedPayload;
      }

      return response.status(200).send({
        title: 'pasos más recientes obtenido con éxito',
        message: 'Los pasos han sido recuperado correctamente.',
        type: 'success',
        data: {
          retained_message: parsedPayload,
          unit: unit
        },
      });
    } catch (error) {
      let errorMessage = 'Ocurrió un error interno al procesar la solicitud.';
      if (error.response) {
        errorMessage = `Se recibió una respuesta con el estado ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió ninguna respuesta del servidor.';
      } else {
        errorMessage = `Error al realizar la solicitud: ${error.message}`;
      }
      return response.status(500).send({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }
  /**
   * @swagger
   * /api/emqx/obtener-distancia:
   *   post:
   *     security:
   *      - bearerAuth: []
   *     tags:
   *       - EMQX
   *     summary: Obtener el último mensaje retenido de distancia.
   *     description: |
   *       Esta ruta permite obtener el último mensaje retenido de distancia desde el servidor EMQX.
   *     responses:
   *       200:
   *         description: Último mensaje retenido de distancia obtenido correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta.
   *                 message:
   *                   type: string
   *                   description: Mensaje de éxito.
   *                 type:
   *                   type: string
   *                   description: Tipo de respuesta.
   *                 data:
   *                   type: object
   *                   description: Datos de respuesta.
   *                   properties:
   *                     retained_message:
   *                       type: object
   *                       description: Último mensaje retenido de distancia.
   *       500:
   *         description: Error interno al procesar la solicitud.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                 message:
   *                   type: string
   *                   description: Descripción del error.
   *                 type:
   *                   type: string
   *                   description: Tipo de error.
   *                 data:
   *                   type: object
   *                   description: Datos adicionales relacionados con el error.
   *                   properties:
   *                     error:
   *                       type: string
   *                       description: Mensaje de error detallado.
   */
  public async obtenerDistancia({ response }: HttpContextContract) {
    try {
      const url = Env.get('MQTT_HOST') + '/mqtt/retainer/message/BrazaleteDistancia';
      const sensorType = await SensorType.findBy('name', 'Distancia');

      if (!sensorType) {
        return response.status(404).send({
          title: 'Error',
          message: 'No se encontró el tipo de sensor especificado.',
          type: 'error',
        });
      }
      const unit = sensorType.unit;
      const axiosResponse = await axios.get(url, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (axiosResponse.status !== 200) {
        return response.status(axiosResponse.status).send({
          title: 'Error',
          message: 'Ocurrió un error al obtener la distancia más reciente.',
          type: 'error',
          data: {
            error: axiosResponse.statusText
          },
        });
      }

      const retainedMessage = axiosResponse.data;

      const decodedPayload = Buffer.from(retainedMessage.payload, 'base64').toString('utf-8');

      let parsedPayload;
      try {
        parsedPayload = JSON.parse(decodedPayload);
      } catch (error) {
        parsedPayload = decodedPayload;
      }

      return response.status(200).send({
        title: 'Distancia más reciente obtenida con éxito',
        message: 'La Distancia ha sido recuperada correctamente.',
        type: 'success',
        data: {
          retained_message: parsedPayload,
          unit: unit
        },
      });
    } catch (error) {
      let errorMessage = 'Ocurrió un error interno al procesar la solicitud.';
      if (error.response) {
        errorMessage = `Se recibió una respuesta con el estado ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió ninguna respuesta del servidor.';
      } else {
        errorMessage = `Error al realizar la solicitud: ${error.message}`;
      }
      return response.status(500).send({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }
  /**
   * @swagger
   * /api/emqx/obtener-alcohol:
   *   post:
   *     security:
   *      - bearerAuth: []
   *     tags:
   *       - EMQX
   *     summary: Obtener el último mensaje retenido de alcohol.
   *     description: |
   *       Esta ruta permite obtener el último mensaje retenido de alcohol desde el servidor EMQX.
   *     responses:
   *       200:
   *         description: Último mensaje retenido de alcohol obtenido correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta.
   *                 message:
   *                   type: string
   *                   description: Mensaje de éxito.
   *                 type:
   *                   type: string
   *                   description: Tipo de respuesta.
   *                 data:
   *                   type: object
   *                   description: Datos de respuesta.
   *                   properties:
   *                     retained_message:
   *                       type: object
   *                       description: Último mensaje retenido de alcohol.
   *       500:
   *         description: Error interno al procesar la solicitud.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                 message:
   *                   type: string
   *                   description: Descripción del error.
   *                 type:
   *                   type: string
   *                   description: Tipo de error.
   *                 data:
   *                   type: object
   *                   description: Datos adicionales relacionados con el error.
   *                   properties:
   *                     error:
   *                       type: string
   *                       description: Mensaje de error detallado.
   */
  public async obtenerAlcohol({ response }: HttpContextContract) {
    try {
      const url = Env.get('MQTT_HOST') + '/mqtt/retainer/message/BrazaleteAlcohol';
      const sensorType = await SensorType.findBy('name', 'Alcohol');

      if (!sensorType) {
        return response.status(404).send({
          title: 'Error',
          message: 'No se encontró el tipo de sensor especificado.',
          type: 'error',
        });
      }
      const unit = sensorType.unit;
      const axiosResponse = await axios.get(url, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (axiosResponse.status !== 200) {
        return response.status(axiosResponse.status).send({
          title: 'Error',
          message: 'Ocurrió un error al obtener el nivel de alcohol más reciente.',
          type: 'error',
          data: {
            error: axiosResponse.statusText
          },
        });
      }

      const retainedMessage = axiosResponse.data;

      const decodedPayload = Buffer.from(retainedMessage.payload, 'base64').toString('utf-8');

      let parsedPayload;
      try {
        parsedPayload = JSON.parse(decodedPayload);
      } catch (error) {
        parsedPayload = decodedPayload;
      }

      return response.status(200).send({
        title: 'Nivel de alcohol más reciente obtenido con éxito',
        message: 'El nivel de alcohol ha sido recuperado correctamente.',
        type: 'success',
        data: {
          retained_message: parsedPayload,
          unit: unit
        },
      });
    } catch (error) {
      let errorMessage = 'Ocurrió un error interno al procesar la solicitud.';
      if (error.response) {
        errorMessage = `Se recibió una respuesta con el estado ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió ninguna respuesta del servidor.';
      } else {
        errorMessage = `Error al realizar la solicitud: ${error.message}`;
      }
      return response.status(500).send({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }
  /**
   * @swagger
   * /api/emqx/mandar-a-pantalla:
   *   post:
   *     security:
   *      - bearerAuth: []
   *     summary: Enviar mensaje a pantalla.
   *     tags: 
   *     - EMQX
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               topic_message:
   *                 type: string
   *     responses:
   *       200:
   *         description: Tópico enviado correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                 message:
   *                   type: string
   *                 type:
   *                   type: string
   *                 data:
   *                   type: object
   *       500:
   *         description: Error interno al procesar la solicitud.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                 message:
   *                   type: string
   *                 type:
   *                   type: string
   *                 data:
   *                   type: object
   */
  public async MandarAPantalla({ request, response }: HttpContextContract) {
    try {
      const body = request.all()
      const { topic_message } = body;

      if (topic_message < 1 || topic_message > 4) {
        return response.status(400).send({
          title: 'Error de validación',
          message: 'El valor debe estar entre 1 y 4.',
          type: 'error',
        });
      }

      const url = Env.get('MQTT_HOST') + '/publish/'
      const payload = {
        "payload_encoding": "plain",
        "topic": "BrazaletePantalla",
        "qos": 0,
        "payload": topic_message.toString(),
        "properties": {
          "user_properties": {
            "foo": "bar"
          }
        },
        "retain": true
      }

      const res = await axios.post(url, payload, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (res.status !== 202) {
        return response.status(res.status).send({
          title: 'Error',
          message: 'Ocurrió un error al enviar el mensaje al tópico.',
          type: 'error',
          data: {
            error: res.statusText
          },
        });
      }

      return response.status(200).send({
        title: 'Tópico enviado',
        message: 'Mensaje enviado correctamente al tópico.',
        type: 'success',
        data: res.data,
      });

    } catch (error) {
      return response.status(500).send({
        title: 'Error',
        message: 'Ocurrió un error interno al procesar la solicitud.',
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }
  /**
   * @swagger
   * /api/emqx/obtener-temperatura:
   *   post:
   *     security:
   *      - bearerAuth: []
   *     tags:
   *       - EMQX
   *     summary: Obtener el último mensaje retenido de temperatura.
   *     description: |
   *       Esta ruta permite obtener el último mensaje retenido de temperatura desde el servidor EMQX.
   *     responses:
   *       200:
   *         description: Último mensaje retenido de temperatura obtenido correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta.
   *                 message:
   *                   type: string
   *                   description: Mensaje de éxito.
   *                 type:
   *                   type: string
   *                   description: Tipo de respuesta.
   *                 data:
   *                   type: object
   *                   description: Datos de respuesta.
   *                   properties:
   *                     retained_message:
   *                       type: object
   *                       description: Último mensaje retenido de temperatura.
   *       500:
   *         description: Error interno al procesar la solicitud.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                 message:
   *                   type: string
   *                   description: Descripción del error.
   *                 type:
   *                   type: string
   *                   description: Tipo de error.
   *                 data:
   *                   type: object
   *                   description: Datos adicionales relacionados con el error.
   *                   properties:
   *                     error:
   *                       type: string
   *                       description: Mensaje de error detallado.
   */
  public async obtenerTemperatura({ response }: HttpContextContract) {
    try {
      const url = Env.get('MQTT_HOST') + '/mqtt/retainer/message/BrazaleteTemperatura';
      const sensorType = await SensorType.findBy('name', 'Temperatura');

      if (!sensorType) {
        return response.status(404).send({
          title: 'Error',
          message: 'No se encontró el tipo de sensor especificado.',
          type: 'error',
        });
      }
      const unit = sensorType.unit;
      const axiosResponse = await axios.get(url, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (axiosResponse.status !== 200) {
        return response.status(axiosResponse.status).send({
          title: 'Error',
          message: 'Ocurrió un error al obtener el último mensaje de temperatura.',
          type: 'error',
          data: {
            error: axiosResponse.statusText
          },
        });
      }

      const retainedMessage = axiosResponse.data;

      const decodedPayload = Buffer.from(retainedMessage.payload, 'base64').toString('utf-8');

      let parsedPayload;
      try {
        parsedPayload = JSON.parse(decodedPayload);
      } catch (error) {
        parsedPayload = decodedPayload;
      }

      return response.status(200).send({
        title: 'Último mensaje de temperatura obtenido con éxito',
        message: 'El último mensaje de temperatura ha sido recuperado correctamente.',
        type: 'success',
        data: {
          retained_message: parsedPayload,
          unit: unit
        },
      });
    } catch (error) {
      let errorMessage = 'Ocurrió un error interno al procesar la solicitud.';
      if (error.response) {
        errorMessage = `Se recibió una respuesta con el estado ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió ninguna respuesta del servidor.';
      } else {
        errorMessage = `Error al realizar la solicitud: ${error.message}`;
      }
      return response.status(500).send({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }
  /**
  * @swagger
  * /api/emqx/obtener-peso:
  *   post:
  *    security:
  *      - bearerAuth: []
  *     tags:
  *       - EMQX
  *     summary: Obtener el último mensaje retenido de peso.
  *     description: 
  *       Esta ruta permite obtener el último mensaje retenido de peso desde el servidor EMQX.
  *     responses:
  *       200:
  *         description: Último mensaje retenido de peso obtenido correctamente.
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 title:
  *                   type: string
  *                   description: Título de la respuesta.
  *                 message:
  *                   type: string
  *                   description: Mensaje de éxito.
  *                 type:
  *                   type: string
  *                   description: Tipo de respuesta.
  *                 data:
  *                   type: object
  *                   description: Datos de respuesta.
  *                   properties:
  *                     retained_message:
  *                       type: object
  *                       description: Último mensaje retenido de peso.
  *       500:
  *         description: Error interno al procesar la solicitud.
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 title:
  *                   type: string
  *                 message:
  *                   type: string
  *                   description: Descripción del error.
  *                 type:
  *                   type: string
  *                   description: Tipo de error.
  *                 data:
  *                   type: object
  *                   description: Datos adicionales relacionados con el error.
  *                   properties:
  *                     error:
  *                       type: string
  *                       description: Mensaje de error detallado.
  */
  public async obtenerPeso({ response }: HttpContextContract) {
    try {
      const url = Env.get('MQTT_HOST') + '/mqtt/retainer/message/Peso';
      const sensorType = await SensorType.findBy('name', 'Peso');

      if (!sensorType) {
        return response.status(404).send({
          title: 'Error',
          message: 'No se encontró el tipo de sensor especificado.',
          type: 'error',
        });
      }
      const unit = sensorType.unit;
      const axiosResponse = await axios.get(url, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (axiosResponse.status !== 200) {
        return response.status(axiosResponse.status).send({
          title: 'Error',
          message: 'Ocurrió un error al obtener el último mensaje de peso.',
          type: 'error',
          data: {
            error: axiosResponse.statusText
          },
        });
      }

      const retainedMessage = axiosResponse.data;

      const decodedPayload = Buffer.from(retainedMessage.payload, 'base64').toString('utf-8');

      let parsedPayload;
      try {
        parsedPayload = JSON.parse(decodedPayload);
      } catch (error) {
        parsedPayload = decodedPayload;
      }

      return response.status(200).send({
        title: 'Último mensaje de peso obtenido con éxito',
        message: 'El último mensaje de peso ha sido recuperado correctamente.',
        type: 'success',
        data: {
          retained_message: parsedPayload,
          unit: unit
        },
      });
    } catch (error) {
      let errorMessage = 'Ocurrió un error interno al procesar la solicitud.';
      if (error.response) {
        errorMessage = `Se recibió una respuesta con el estado ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió ninguna respuesta del servidor.';
      } else {
        errorMessage = `Error al realizar la solicitud: ${error.message}`;
      }
      return response.status(500).send({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }
  /**
   * @swagger
   * /api/emqx/meta-pasos:
   *   post:
   *     security:
   *      - bearerAuth: []
   *     tags:
   *       - EMQX
   *     summary: Obtener el último mensaje retenido de pasos.
   *     description: |
   *       Esta ruta permite obtener el último mensaje retenido de pasos desde el servidor EMQX.
   *     responses:
   *       200:
   *         description: Último mensaje retenido de pasos obtenido correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta.
   *                 message:
   *                   type: string
   *                   description: Mensaje de éxito.
   *                 type:
   *                   type: string
   *                   description: Tipo de respuesta.
   *                 data:
   *                   type: object
   *                   description: Datos de respuesta.
   *                   properties:
   *                     retained_message:
   *                       type: object
   *                       description: Último mensaje retenido del ritmo cardíaco.
   *       500:
   *         description: Error interno al procesar la solicitud.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                 message:
   *                   type: string
   *                   description: Descripción del error.
   *                 type:
   *                   type: string
   *                   description: Tipo de error.
   *                 data:
   *                   type: object
   *                   description: Datos adicionales relacionados con el error.
   *                   properties:
   *                     error:
   *                       type: string
   *                       description: Mensaje de error detallado.
   */
  public async metaPasos({ response }: HttpContextContract) {
    try {
      const url = Env.get('MQTT_HOST') + '/mqtt/retainer/message/BrazaletePasos';
      const sensorType = await SensorType.findBy('name', 'Pasos');

      if (!sensorType) {
        return response.status(404).send({
          title: 'Error',
          message: 'No se encontró el tipo de sensor especificado.',
          type: 'error',
        });
      }

      const unit = sensorType.unit;

      const axiosResponse = await axios.get(url, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (axiosResponse.status !== 200) {
        return response.status(axiosResponse.status).send({
          title: 'Error',
          message: 'Ocurrió un error al obtener los pasos más reciente.',
          type: 'error',
          data: {
            error: axiosResponse.statusText
          },
        });
      }

      const retainedMessage = axiosResponse.data;
      const decodedPayload = Buffer.from(retainedMessage.payload, 'base64').toString('utf-8');
      let parsedPayload;

      const tablaConfig = await Configuration.query().firstOrFail()
      const metaPasos = tablaConfig.data

      const meta = await Configuration.query()
      .whereHas('tipo_configuracion', (query)=>{
        query.where('name','alarma_pasos')
      })
      .first()

      try {
        parsedPayload = JSON.parse(decodedPayload);
      } catch (error) {
        parsedPayload = decodedPayload.toString;
      }

      // aca se hace la comparacion de los ultimos datos del sensor con los que el usuario puso como meta de pasos //
      if (parsedPayload == meta?.data) {
        return response.status(200).send({
          title: 'Datos coinciden',
          message: 'Los datos obtenidos coinciden con lo registrado.',
          type: 'success',
          data: {
            retained_message: parsedPayload,
            unit: unit,
            metaPasos: metaPasos,
            meta:meta
          },
        });
      } else {
        return response.status(400).send({
          title: 'Error',
          message: 'Los datos obtenidos no coinciden con lo registrado.',
          type: 'error',
          metaPasos: metaPasos,
          meta:meta
        });
      }

    } catch (error) {
      let errorMessage = 'Ocurrió un error interno al procesar la solicitud.';
      if (error.response) {
        errorMessage = `Se recibió una respuesta con el estado ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió ninguna respuesta del servidor.';
      } else {
        errorMessage = `Error al realizar la solicitud: ${error.message}`;
      }
      return response.status(500).send({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }
  /**
   * @swagger
   * /api/emqx/meta-distancia:
   *   post:
   *     security:
   *      - bearerAuth: []
   *     tags:
   *       - EMQX
   *     summary: Obtener el último mensaje retenido de distancia.
   *     description: |
   *       Esta ruta permite obtener el último mensaje retenido de distancia desde el servidor EMQX.
   *     responses:
   *       200:
   *         description: Último mensaje retenido de distancia obtenido correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                   description: Título de la respuesta.
   *                 message:
   *                   type: string
   *                   description: Mensaje de éxito.
   *                 type:
   *                   type: string
   *                   description: Tipo de respuesta.
   *                 data:
   *                   type: object
   *                   description: Datos de respuesta.
   *                   properties:
   *                     retained_message:
   *                       type: object
   *                       description: Último mensaje retenido de distancia.
   *       500:
   *         description: Error interno al procesar la solicitud.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 title:
   *                   type: string
   *                 message:
   *                   type: string
   *                   description: Descripción del error.
   *                 type:
   *                   type: string
   *                   description: Tipo de error.
   *                 data:
   *                   type: object
   *                   description: Datos adicionales relacionados con el error.
   *                   properties:
   *                     error:
   *                       type: string
   *                       description: Mensaje de error detallado.
   */
  public async metaDistancia({ response }: HttpContextContract) {
    try {
      const url = Env.get('MQTT_HOST') + '/mqtt/retainer/message/BrazaleteDistancia';
      const sensorType = await SensorType.findBy('name', 'Distancia');

      if (!sensorType) {
        return response.status(404).send({
          title: 'Error',
          message: 'No se encontró el tipo de sensor especificado.',
          type: 'error',
        });
      }
      const unit = sensorType.unit;
      const axiosResponse = await axios.get(url, {
        auth: {
          username: Env.get('MQTT_API_KEY'),
          password: Env.get('MQTT_SECRET_KEY')
        }
      });

      if (axiosResponse.status !== 200) {
        return response.status(axiosResponse.status).send({
          title: 'Error',
          message: 'Ocurrió un error al obtener la distancia más reciente.',
          type: 'error',
          data: {
            error: axiosResponse.statusText
          },
        });
      }

      const retainedMessage = axiosResponse.data;

      const decodedPayload = Buffer.from(retainedMessage.payload, 'base64').toString('utf-8');

      let parsedPayload;

      const tablaConfig = await Configuration.query().firstOrFail()
      const metaDistancia = tablaConfig.data

      const meta = await Configuration.query()
      .whereHas('tipo_configuracion', (query)=>{
        query.where('name','alarma_distancia')
      })
      .first()


      try {
        parsedPayload = JSON.parse(decodedPayload);
      } catch (error) {
        parsedPayload = decodedPayload.toString;
      }
      if (parsedPayload == meta?.data) {
        return response.status(200).send({
          title: 'Datos coinciden',
          message: 'Los datos obtenidos coinciden con lo registrado.',
          type: 'success',
          data: {
            retained_message: parsedPayload,
            unit: unit,
            metaDistancia: metaDistancia,
            meta: meta
          },
        });
      } else {
        return response.status(400).send({
          title: 'Error',
          message: 'Los datos obtenidos no coinciden con lo registrado.',
          type: 'error',
          data:{
            retainde_message: parsedPayload,
            unit: unit,
            metaDistancia: metaDistancia,
            meta:meta
          }
        });
      }
    } catch (error) {
      let errorMessage = 'Ocurrió un error interno al procesar la solicitud.';
      if (error.response) {
        errorMessage = `Se recibió una respuesta con el estado ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió ninguna respuesta del servidor.';
      } else {
        errorMessage = `Error al realizar la solicitud: ${error.message}`;
      }
      return response.status(500).send({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        data: {
          error: error.message
        },
      });
    }
  }
}    

