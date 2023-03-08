import UserControler from '../../controller/UserControler';
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', UserControler.exampleAPI);


export default router;
