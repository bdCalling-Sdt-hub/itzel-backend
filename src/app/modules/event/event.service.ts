import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Event } from './event.model';
import { IEvent } from './event.interface';
import unlinkFile from '../../../shared/unlinkFile';
import { Group } from '../group/group.model';
import { IGroup } from '../group/group.interface';

const createEvent = async (payload: IEvent): Promise<IEvent> => {
  // await EventValidation.createEventZodSchema.parseAsync(payload);
  if (typeof payload.tags === 'string') payload.tags = JSON.parse(payload.tags);
  console.log(payload.location);
  if (typeof payload.location === 'string')
    payload.location = JSON.parse(payload.location);
  const result = await Event.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create event!');
  }
  const createGroup: IGroup = await Group.create({
    name: result.name,
    event: result._id,
    members: [result.creator],
  });
  if (!createGroup)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create group!');
  return result;
};

const getAllEvents = async (
  queryFields: Record<string, any>
): Promise<IEvent[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { thumbnailImage: { $regex: search, $options: 'i' } },
          { introMedia: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Event.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getEventById = async (id: string): Promise<IEvent | null> => {
  const result = await Event.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Event not found!');
  }
  return result;
};

const updateEvent = async (
  id: string,
  payload: IEvent
): Promise<IEvent | null> => {
  const isExistEvent = await getEventById(id);
  if (!isExistEvent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Event not found!');
  }
  if (
    typeof isExistEvent.thumbnailImage === 'string' &&
    typeof payload.thumbnailImage === 'string'
  ) {
    await unlinkFile(isExistEvent.thumbnailImage);
  }
  if (
    typeof isExistEvent.introMedia === 'string' &&
    typeof payload.introMedia === 'string'
  ) {
    await unlinkFile(isExistEvent.introMedia);
  }
  if (typeof payload.tags === 'string') payload.tags = JSON.parse(payload.tags);
  const result = await Event.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update event!');
  }
  return result;
};

const deleteEvent = async (id: string): Promise<IEvent | null> => {
  const isExistEvent = await getEventById(id);
  if (!isExistEvent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Event not found!');
  }

  if (typeof isExistEvent.thumbnailImage === 'string') {
    await unlinkFile(isExistEvent.thumbnailImage);
  }

  if (typeof isExistEvent.introMedia === 'string') {
    await unlinkFile(isExistEvent.introMedia);
  }

  const result = await Event.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete event!');
  }
  return result;
};

const perticipate = async (eventId: string, userId: string): Promise<any> => {};

export const EventService = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  perticipate,
};
