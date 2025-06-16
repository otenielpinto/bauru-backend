//Classe tem letras maiuculoas
import { TMongo } from "../infra/mongoClient.js";

const collection = "tmp_generator";

class GenRepository {
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
    await this.init();
    const result = await this.db.collection(collection).insertOne(payload);
    return result.insertedId;
  }

  async getNextId(name) {
    await this.init();
    const result = await this.db
      .collection(collection)
      .findOneAndUpdate({ name }, { $inc: { seq: 1 } }, { upsert: true });
    return result.seq;
  }

  async update(id, payload) {
    await this.init();
    const result = await this.db
      .collection(collection)
      .updateOne({ id: String(id) }, { $set: payload }, { upsert: true });
    return result.modifiedCount > 0;
  }

  async delete(id) {
    await this.init();
    const result = await this.db
      .collection(collection)
      .deleteOne({ id: String(id) });
    return result.deletedCount > 0;
  }

  async findAll(criterio = {}) {
    await this.init();
    return await this.db.collection(collection).find(criterio).toArray();
  }

  async findById(id) {
    await this.init();
    return await this.db.collection(collection).findOne({ id: String(id) });
  }

  async findByName(name) {
    await this.init();
    return await this.db.collection(collection).findOne({ name: String(name) });
  }

  async insertMany(items) {
    await this.init();
    if (!Array.isArray(items)) return null;
    try {
      return await this.db.collection(collection).insertMany(items);
    } catch (e) {
      console.log(e);
    }
  }

  async deleteMany(criterio = {}) {
    await this.init();
    try {
      return await this.db.collection(collection).deleteMany(criterio);
    } catch (e) {
      console.log(e);
    }
  }
}

export { GenRepository };
