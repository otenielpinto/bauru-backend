//Classe tem letras maiuculoas
import { TMongo } from "../infra/mongoClient.js";
const collection = "auth_tenant";

class AuthRepository {
  constructor() {}

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
    let obj = this.findById(payload?.id);
    if (obj) return null;
    const result = await this.db.collection(collection).insertOne(payload);
    return result.insertedId;
  }

  async update(id, payload) {
    const result = await this.db
      .collection(collection)
      .updateOne({ id: Number(id) }, { $set: payload }, { upsert: true });
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

  async validateCredentials(client_id, client_secret) {
    return await this.db
      .collection(collection)
      .findOne({ client_id, client_secret });
  }

  async findById(id) {
    return await this.db.collection(collection).findOne({ id: Number(id) });
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

export { AuthRepository };
