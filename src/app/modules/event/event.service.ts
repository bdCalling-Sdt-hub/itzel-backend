import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Event } from './event.model';
import { IEvent } from './event.interface';
import unlinkFile from '../../../shared/unlinkFile';
import { Group } from '../group/group.model';
import { IGroup } from '../group/group.interface';
import { User } from '../user/user.model';
import { IUser } from '../user/user.interface';

const createEvent = async (payload: IEvent): Promise<IEvent> => {
  console.log(payload);
  // await EventValidation.createEventZodSchema.parseAsync(payload);
  if (typeof payload.tags === 'string') payload.tags = JSON.parse(payload.tags);
  console.log(payload.location);
  if (typeof payload.coordinate === 'string')
    payload.coordinate = JSON.parse(payload.coordinate);
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
  queryFields: Record<string, any>,
  user?: any
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
  if (user) {
    const finalResult = await queryBuilder;
    const result = await Promise.all(
      finalResult.map(async (event: any) => {
        const existUser = await User.findById(user.id);
        console.log(existUser);
        console.log(existUser?.eventWishList);
        const isFavourite = existUser?.eventWishList.includes(event._id);
        return { ...event.toObject(), isFavourite };
      })
    );
    return result;
  }
  const result = await queryBuilder;
  return result;
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
  if (typeof payload.coordinate === 'string')
    payload.coordinate = JSON.parse(payload.coordinate);
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
const getEventStatus = async (userId: string): Promise<any> => {
  const result = await Event.findOne({ creator: userId }).sort({
    createdAt: -1,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Event not found!');
  }
  const group = await Group.findOne({ event: result._id });
  const totalEarning = group?.members?.reduce(
    (acc: number, participant: any) => {
      return acc + result.price;
    },
    0
  );
  const finalResult = {
    ...result.toObject(),
    totalEarning,
    ticketSold: group?.members?.length,
  };
  return finalResult;
};

const getEventStatusAll = async (id: string): Promise<any> => {
  const result = await Event.find({ creator: id }).sort({ createdAt: -1 });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Event not found!');
  }
  const finalResult = await Promise.all([
    ...result.map(async (event: any) => {
      const group = await Group.findOne({ event: event._id });
      const totalEarning = group?.members?.reduce(
        (acc: number, participant: any) => {
          return acc + event.price;
        },
        0
      );
      return {
        ...event.toObject(),
        totalEarning,
        ticketSold: group?.members?.length,
      };
    }),
  ]);

  return finalResult;
};

export const EventService = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  perticipate,
  getEventStatus,
  getEventStatusAll,
};
