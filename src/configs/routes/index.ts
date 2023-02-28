import UserControler from '../../controller/UserControler';
import { Router} from 'express';

const router = Router();

router.get('/', UserControler.exampleAPI);


export default router;
