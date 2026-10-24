// Data layer. One small collection API with two backends:
//   - MongoDB (Mongoose) when MONGODB_URI is set  -> use this on Vercel
//   - in-memory demo store when it is not          -> local preview only
// All business logic (lib/logic.js, API routes) talks to col(name) only.
import mongoose from 'mongoose';
import { models, COLLECTIONS } from '@/models';
import { runSeed } from './seed';

const URI = process.env.MONGODB_URI;
export const isDemo = !URI;

const g = globalThis;
const state = g.__mohSiswa || (g.__mohSiswa = { mem: null, ready: null, conn: null });

const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function clean(d) {
  if (!d) return null;
  const { _id, __v, ...rest } = d;
  return { ...rest, id: String(_id) };
}

function memStore() {
  if (!state.mem) {
    state.mem = {};
    COLLECTIONS.forEach((n) => (state.mem[n] = []));
  }
  return state.mem;
}

function memCol(arr) {
  const match = (d, f) => Object.entries(f).every(([k, v]) => d[k] === v);
  return {
    async list(f = {}, sort) {
      const r = arr.filter((d) => match(d, f)).map((d) => structuredClone(d));
      if (sort) {
        const [k, dir] = Object.entries(sort)[0];
        r.sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir);
      }
      return r;
    },
    async get(id) {
      const d = arr.find((x) => x.id === id);
      return d ? structuredClone(d) : null;
    },
    async create(doc) {
      const now = new Date();
      const d = { ...structuredClone(doc), id: rid(), createdAt: now, updatedAt: now };
      arr.push(d);
      return structuredClone(d);
    },
    async update(id, patch) {
      const i = arr.findIndex((x) => x.id === id);
      if (i < 0) return null;
      arr[i] = { ...arr[i], ...structuredClone(patch), updatedAt: new Date() };
      return structuredClone(arr[i]);
    },
    async count(f = {}) {
      return arr.filter((d) => match(d, f)).length;
    },
  };
}

function mongoCol(M) {
  return {
    async list(f = {}, sort) {
      let q = M.find(f);
      if (sort) q = q.sort(sort);
      return (await q.lean()).map(clean);
    },
    async get(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return clean(await M.findById(id).lean());
    },
    async create(doc) {
      const d = await M.create(doc);
      return clean(d.toObject());
    },
    async update(id, patch) {
      if (!mongoose.isValidObjectId(id)) return null;
      return clean(await M.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean());
    },
    async count(f = {}) {
      return M.countDocuments(f);
    },
  };
}

const rawCol = (name) => (isDemo ? memCol(memStore()[name]) : mongoCol(models[name]));

async function init() {
  if (!isDemo) {
    await mongoose.connect(URI, {
      dbName: process.env.MONGODB_DB || 'mohsiswa',
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
  }
  // Seed sample content the first time the database is empty.
  if ((await rawCol('events').count()) === 0) await runSeed(rawCol);
}

export async function col(name) {
  if (!state.ready) {
    state.ready = init().catch((e) => {
      state.ready = null; // allow retry on next request
      throw e;
    });
  }
  await state.ready;
  return rawCol(name);
}
