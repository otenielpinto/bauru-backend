//Classe tem letras maiuculoas
import { TMongo } from "../infra/mongoClient.js";

const collection = "tmp_estoque";

class EstoqueRepository {
  constructor(id_tenant) {
    this.id_tenant = Number(id_tenant);
  }

  async init() {
    if (!this.db) {
      this.db = await TMongo.connect();
    }
  }
  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async create(payload) {
    const result = await this.db.collection(collection).insertOne(payload);
    return result.insertedId;
  }

  async update(codigo, payload) {
    payload.updated_at = new Date();
    const result = await this.db
      .collection(collection)
      .updateOne(
        { codigo: String(codigo) },
        { $set: payload },
        { upsert: true }
      );
    return result.modifiedCount > 0;
  }

  async delete(id) {
    const result = await this.db
      .collection(collection)
      .deleteOne({ id: Number(id) });
    return result.deletedCount > 0;
  }

  async findAll(criterio = {}) {
    return await this.db.collection(collection).find(criterio).toArray();
  }

  async findById(id) {
    return await this.db
      .collection(collection)
      .findOne({ id: Number(id), id_tenant: this.id_tenant });
  }

  async findByIdProduto(id_produto) {
    return await this.db
      .collection(collection)
      .findOne({ id_produto: Number(id_produto), id_tenant: this.id_tenant });
  }

  async insertMany(items) {
    if (!Array.isArray(items)) return null;
    try {
      return await this.db.collection(collection).insertMany(items);
    } catch (e) {
      console.log(e);
    }
  }

  async deleteMany(criterio = {}) {
    try {
      return await this.db.collection(collection).deleteMany(criterio);
    } catch (e) {
      console.log(e);
    }
  }
}

export { EstoqueRepository };
