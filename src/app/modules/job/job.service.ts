import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Job } from './job.model';
import { IJob } from './job.interface';

import unlinkFile from '../../../shared/unlinkFile';
import { User } from '../user/user.model';

const createJob = async (payload: IJob): Promise<IJob> => {
  if (typeof payload.questions === 'string')
    payload.questions = JSON.parse(payload.questions);
  if (typeof payload.requirements === 'string')
    payload.requirements = JSON.parse(payload.requirements);
  if (typeof payload.experience === 'string')
    payload.experience = JSON.parse(payload.experience);
  if (typeof payload.additionalRequirement === 'string')
    payload.additionalRequirement = JSON.parse(payload.additionalRequirement);

  const result = await Job.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create job!');
  }
  return result;
};

const getAllJobs = async (
  queryFields: Record<string, any>,
  user?: any
): Promise<IJob[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { image: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { level: { $regex: search, $options: 'i' } },
          { jobType: { $regex: search, $options: 'i' } },
          { salary: { $regex: search, $options: 'i' } },
          { questions: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Job.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  } else {
    queryBuilder = queryBuilder.skip(0).limit(10);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  if (user) {
    const finalResult = await queryBuilder;
    const result = await Promise.all(
      finalResult.map(async (job: any) => {
        const existUser = await User.findById(user.id);
        console.log(existUser);
        console.log(existUser?.jobWishList);
        const isFavourite = existUser?.jobWishList.includes(job._id);
        return { ...job.toObject(), isFavourite };
      })
    );
    return result;
  }
  return await queryBuilder;
};

const getJobById = async (id: string): Promise<IJob | null> => {
  const result = await Job.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Job not found!');
  }
  return result;
};

const updateJob = async (id: string, payload: IJob): Promise<IJob | null> => {
  if (typeof payload.questions === 'string')
    payload.questions = JSON.parse(payload.questions);
  if (typeof payload.requirements === 'string')
    payload.requirements = JSON.parse(payload.requirements);
  if (typeof payload.experience === 'string')
    payload.experience = JSON.parse(payload.experience);
  if (typeof payload.additionalRequirement === 'string')
    payload.additionalRequirement = JSON.parse(payload.additionalRequirement);
  const isExistJob = await getJobById(id);
  if (!isExistJob) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Job not found!');
  }
  if (
    typeof isExistJob.image === 'string' &&
    typeof payload.image === 'string'
  ) {
    await unlinkFile(isExistJob.image);
  }
  const result = await Job.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update job!');
  }
  return result;
};

const deleteJob = async (id: string): Promise<IJob | null> => {
  const isExistJob = await getJobById(id);
  if (!isExistJob) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Job not found!');
  }

  if (typeof isExistJob.image === 'string') {
    await unlinkFile(isExistJob.image);
  }

  const result = await Job.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete job!');
  }
  return result;
};

export const JobService = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};
