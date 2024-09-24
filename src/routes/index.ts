import {Router} from 'express';
import usersRouter from '~/routes/users.routes';

const rootRouterV1 = Router();
rootRouterV1.use('/users', usersRouter);

export default rootRouterV1;

