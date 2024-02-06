export type SavePostImageToS3Model = {
  userId: number;
  postId: string;
  buffer: Buffer;
  mimetype: string;
};
