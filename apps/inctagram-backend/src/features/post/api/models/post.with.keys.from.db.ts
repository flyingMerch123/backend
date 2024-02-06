export type PostWithKeysFromDb = {
  id: string;
  description: string;
  createdAt: Date;
  userId: number;
  image: Key[];
};

type Key = {
  key: string;
};
