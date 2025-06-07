import { defineStore } from 'pinia';
import axios from 'axios';

export const useDiagramApiStore = defineStore('diagramApi', {
  state: () => ({
    schemas: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUserSchemas(userId) {
      this.loading = true;
      try {
        const res = await axios.get(`http://localhost:3003/api/schemas/user/${userId}`);
        this.schemas = res.data.schemas;
        console.log(this.schemas);
        this.error = null;
      } catch (err) {
        this.error = err.response?.data?.error || err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchSchemaById(schemaId) {
      try {
        const res = await axios.get(`http://localhost:3003/api/schemas/${schemaId}`);
        return res.data.schema;
      } catch (err) {
        console.error('Ошибка загрузки схемы:', err);
        throw err;
      }
    },

    async saveSchema({ userId, name, elements, relations }) {
      try {
        const res = await axios.post('http://localhost:3003/api/schemas/save', {
          userId,
          name,
          elements,
          relations
        });
        return res.data.schema;
      } catch (err) {
        console.error('Ошибка сохранения схемы:', err);
        throw err;
      }
    },

    async updateSchema(id, upd) {
      try {
        const res = await axios.patch(`http://localhost:3003/api/schemas/update/${id}`, upd);
        return res.data.schema;
      } catch (err) {
        console.error('Ошибка обновления схемы:', err);
        throw err;
      }
    },

    async deleteSchema(id) {
      try {
        const res = await axios.delete(`http://localhost:3003/api/schemas/${id}`);
        return res.data.schema;
      } catch (err) {
        console.error('Ошибка обновления схемы:', err);
        throw err;
      }
    }
  }
});
