import { Model, Types } from 'mongoose';

export type IEvent = {
  thumbnailImage: string;
  introMedia: string;
  name: string;
  time: Date;
  location: string;
  description: string;
  tags: Array<string>;
  price: number;
  creator: Types.ObjectId;
  category: Types.ObjectId;
};

export type EventModel = Model<IEvent>;
