import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { MessageService } from './message.service';
import { MessageValidation } from './message.validation';

const createMessage = catchAsync(async (req: Request, res: Response) => {
  req.body.from = req.user.id;
  await MessageValidation.createMessageZodSchema.safeParseAsync(req.body);
  const result = await MessageService.createMessage(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Message created successfully',
    data: result,
  });
});

const getAllMessages = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await MessageService.getAllMessages(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages fetched successfully',
    data: result,
  });
});

const getMessageById = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.getMessageById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message fetched successfully',
    data: result,
  });
});

const updateMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.updateMessage(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message updated successfully',
    data: result,
  });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.deleteMessage(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message deleted successfully',
    data: result,
  });
});

export const MessageController = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};
