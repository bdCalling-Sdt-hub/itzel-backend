import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Category } from './category.model';
import { ICategory } from './category.interface';
import { CategoryValidation } from './category.validation';
import unlinkFile from '../../../shared/unlinkFile';

const createCategory = async (payload: ICategory): Promise<ICategory> => {
  await CategoryValidation.createCategoryZodSchema.parseAsync(payload);
  const result = await Category.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create category!');
  }
  return result;
};

const getAllCategorys = async (
  queryFields: Record<string, any>
): Promise<ICategory[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { image: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Category.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getCategoryById = async (id: string): Promise<ICategory | null> => {
  const result = await Category.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Category not found!');
  }
  return result;
};

const updateCategory = async (
  id: string,
  payload: ICategory
): Promise<ICategory | null> => {
  await CategoryValidation.updateCategoryZodSchema.parseAsync(payload);
  const isExistCategory = await getCategoryById(id);
  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Category not found!');
  }
  if (
    typeof isExistCategory.image === 'string' &&
    typeof payload.image === 'string'
  ) {
    await unlinkFile(isExistCategory.image);
  }
  const result = await Category.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update category!');
  }
  return result;
};

const deleteCategory = async (id: string): Promise<ICategory | null> => {
  const isExistCategory = await getCategoryById(id);
  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Category not found!');
  }

  if (typeof isExistCategory.image === 'string') {
    await unlinkFile(isExistCategory.image);
  }

  const result = await Category.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete category!');
  }
  return result;
};

export const CategoryService = {
  createCategory,
  getAllCategorys,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
