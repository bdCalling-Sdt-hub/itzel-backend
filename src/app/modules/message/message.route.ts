import express from 'express';
import { MessageController } from './message.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MessageValidation } from './message.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.CREATOR];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(MessageValidation.createMessageZodSchema),
  MessageController.createMessage
);

router.get('/', MessageController.getAllMessages);
router.get('/:id', MessageController.getMessageById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(MessageValidation.updateMessageZodSchema),
  MessageController.updateMessage
);
router.delete('/:id', auth(...rolesOfAccess), MessageController.deleteMessage);

export const MessageRoutes = router;
