import mongoose from 'mongoose';

const AsignaturaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nota: { type: Number, required: true },
  creditos: { type: Number, required: true }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  asignaturas: [AsignaturaSchema]
}, { timestamps: true });

// Cambiado: module.exports -> export default
export default mongoose.model('User', UserSchema);