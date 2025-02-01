import express from 'express';
import { USER_ROLES } from '../../../../../enums/user';
import auth from '../../../../middlewares/auth';
import { EventController } from './event.controller';

const router = express.Router();
const rolesOfAccess = Object.values(USER_ROLES);
router.post(
  '/add/:id',
  auth(...rolesOfAccess),
  EventController.addEventToWishList
);
router.post(
  '/remove/:id',
  auth(...rolesOfAccess),
  EventController.addEventToWishList
);

export const EventWishListRoutes = router;
