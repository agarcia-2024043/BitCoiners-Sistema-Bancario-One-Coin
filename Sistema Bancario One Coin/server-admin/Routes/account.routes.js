import { Router } from 'express';
import { 
    createAccount, 
    getAccounts, 
    deposit, 
    withdraw 
} from '../Controllers/account.controller.js';
import { validateJWT, requireRole } from '../Middleware/validate-jwt.js';

const router = Router();
// Todas las rutas de cuentas requieren autenticación
router.use(validateJWT);

router.post('/create', validateJWT, requireRole('Admin', 'Cliente'), createAccount);
router.get('/', validateJWT, getAccounts);
router.post('/deposit', validateJWT, deposit);
router.post('/withdraw', validateJWT, withdraw);

export default router;
