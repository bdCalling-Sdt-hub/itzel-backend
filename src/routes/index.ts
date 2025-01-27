import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { EventRoutes } from '../app/modules/event/event.route';
import { GroupRoutes } from '../app/modules/group/group.route';
import { MessageRoutes } from '../app/modules/message/message.route';

const router = express.Router();

const apiRoutes = [
{
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/event',
    route: EventRoutes,
  },
  {
    path: '/group',
    route: GroupRoutes,
  },
  {
    path: '/message',
    route: MessageRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
