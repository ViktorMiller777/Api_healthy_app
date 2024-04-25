import axios from 'axios';
import Env from '@ioc:Adonis/Core/Env';

export default class EdamamResource {
  public static async getAllFoods() {
    try {
      const baseURL = 'https://api.edamam.com/api/food-database/v2/parser';
      const params = {
        app_id: Env.get('app_id'),
        app_key: Env.get('app_key')
      };
      const response = await axios.get(baseURL, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener información sobre los alimentos:', error.response.data);
      throw new Error('Error al obtener información sobre los alimentos');
    }
  }
  public static async getfood(nombrealimento: string) {
    try {
      const baseURL = 'https://api.edamam.com/api/food-database/v2/parser';
      const params = {
        app_id: '682c72ac',
        app_key:'b1f12eef79856885a89a3787aeb39a9e',
        ingr: nombrealimento,
      };
      const response = await axios.get(baseURL, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener información sobre los alimentos:', error.response.data);
      throw new Error('Error al obtener información sobre los alimentos');
    }
  }

  public static async getNutritionDetails(alimentos: any, unidad: string) {
    try {
        const baseURL = 'https://api.edamam.com/api/nutrition-details';
        const params = {
            app_id: Env.get('app_id_an'),
            app_key: Env.get('app_key_an'),
        };

        // Construir el objeto de datos para enviar en la solicitud POST
        const requestData = {
            title: 'Receta', // Título genérico para la receta
            ingr: alimentos.map((alimento: { nombre: string; peso: number }) => `${alimento.peso} ${unidad} ${alimento.nombre}`),
            // El formato de ingr debe ser un array de strings con la cantidad, unidad y nombre del alimento
        };

        // Realizar la solicitud POST a la API de Edamam con el peso total
        const response = await axios.post(baseURL, { ...requestData }, { params });

        // Retornar los datos obtenidos en la respuesta
        return response.data;
    } catch (error) {
        console.error('Error al obtener detalles nutricionales:', error);
        throw new Error('Error al obtener detalles nutricionales');
    }
}



}

