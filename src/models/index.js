// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const PostStatus = {
  "ACTIVE": "ACTIVE",
  "INACTIVE": "INACTIVE",
  "SUSPENDED": "SUSPENDED"
};

const { Post } = initSchema(schema);

export {
  Post,
  PostStatus
};