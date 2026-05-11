import express from 'express';
import User from '../models/user.model.js';

const router = express.Router();

// Helper para obtener el usuario o crear uno de prueba si el ID no es válido
async function getOrCreateUser(id) {
  // Verifica si el ID es un ObjectId válido de MongoDB (24 caracteres hexadecimales)
  const isValidId = /^[0-9a-fA-F]{24}$/.test(id);
  
  if (isValidId) {
    const user = await User.findById(id);
    if (user) return user;
  }

  // Si el ID es inválido (como 'USER_ID_HERE') o no se encontró, usamos un usuario de prueba
  let defaultUser = await User.findOne({ email: 'default@test.com' });
  if (!defaultUser) {
    defaultUser = new User({ 
      name: 'Estudiante Prueba', 
      email: 'default@test.com', 
      asignaturas: [] 
    });
    await defaultUser.save();
  }
  return defaultUser;
}

// Función auxiliar para calcular estadísticas
function calculateStats(asignaturas) {
  let totalCreditos = 0;
  let sumaPonderada = 0;
  let notaAlta = { nombre: '', nota: -Infinity };
  let notaBaja = { nombre: '', nota: Infinity };

  if (asignaturas.length === 0) {
    return { promedio: 0, clasificacion: 'N/A', notaAlta: null, notaBaja: null };
  }

  asignaturas.forEach(asig => {
    totalCreditos += asig.creditos;
    sumaPonderada += asig.nota * asig.creditos;
    if (asig.nota > notaAlta.nota) notaAlta = asig;
    if (asig.nota < notaBaja.nota) notaBaja = asig;
  });

  const promedio = totalCreditos === 0 ? 0 : sumaPonderada / totalCreditos;
  let clasificacion = 'Reprobado';
  if (promedio >= 4.0) clasificacion = 'Excelente';
  else if (promedio >= 3.0) clasificacion = 'Aprobado';

  return { promedio, clasificacion, notaAlta, notaBaja };
}

// GET: Obtener perfil de usuario
router.get('/:userId/profile', async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        asignaturas: user.asignaturas
      },
      stats: calculateStats(user.asignaturas)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Añadir asignatura
router.post('/:userId/asignaturas', async (req, res) => {
  try {
    const { nombre, nota, creditos } = req.body;
    const user = await getOrCreateUser(req.params.userId);

    user.asignaturas.push({ nombre, nota, creditos });
    await user.save();
    
    res.status(201).json({ 
      asignaturas: user.asignaturas, 
      stats: calculateStats(user.asignaturas)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Editar asignatura
router.put('/:userId/asignaturas/:id', async (req, res) => {
  try {
    const { nombre, nota, creditos } = req.body;
    const user = await getOrCreateUser(req.params.userId);

    const asignatura = user.asignaturas.id(req.params.id);
    if (!asignatura) return res.status(404).json({ message: 'Asignatura no encontrada en este usuario' });

    asignatura.nombre = nombre;
    asignatura.nota = nota;
    asignatura.creditos = creditos;

    await user.save();
    
    res.json({ 
      asignaturas: user.asignaturas, 
      stats: calculateStats(user.asignaturas)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Eliminar asignatura
router.delete('/:userId/asignaturas/:id', async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);

    user.asignaturas.pull(req.params.id);
    await user.save();
    
    res.json({ 
      asignaturas: user.asignaturas, 
      stats: calculateStats(user.asignaturas)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
