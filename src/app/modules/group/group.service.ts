import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Group } from './group.model';
import { IGroup } from './group.interface';

const createGroup = async (payload: IGroup): Promise<IGroup> => {
  const result = await Group.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create group!');
  }
  return result;
};

const getAllGroups = async (
  queryFields: Record<string, any>
): Promise<IGroup[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? { $or: [{ name: { $regex: search, $options: 'i' } }] }
    : {};
  let queryBuilder = Group.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getGroupById = async (id: string): Promise<IGroup | null> => {
  const result = await Group.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Group not found!');
  }
  return result;
};

const updateGroup = async (
  id: string,
  payload: IGroup
): Promise<IGroup | null> => {
  const isExistGroup = await getGroupById(id);
  if (!isExistGroup) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Group not found!');
  }

  const result = await Group.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update group!');
  }
  return result;
};

const deleteGroup = async (id: string): Promise<IGroup | null> => {
  const isExistGroup = await getGroupById(id);
  if (!isExistGroup) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Group not found!');
  }

  const result = await Group.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete group!');
  }
  return result;
};

export const GroupService = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
};
