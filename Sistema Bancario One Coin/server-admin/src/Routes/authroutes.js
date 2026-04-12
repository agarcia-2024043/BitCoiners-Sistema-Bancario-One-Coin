import { Router } from 'express';
// Asegúrate de que el nombre del archivo del controlador coincida (authController o auth.controller)
import { register, login } from '../controllers/authController.js'; 

const router = Router();

router.post('/register', register);
router.post('/login', login);


// Exportación por defecto para que el import en index.js o app.js funcione
export default router;