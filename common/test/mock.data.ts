import {v4 as uuid} from "uuid";
import {PostEntity} from "../../src/posts/post.entity";
import {Role} from "../enums/users.role";
import {UserEntity} from "../../src/users/user.entity";

export const mockUser = {
        id: 1,
        email: 'test@test.com',
        role: Role.Admin
    } as UserEntity;

export const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1234,
    destination: '/path/to/destination',
    filename: 'test.txt',
    path: '/path/to/destination/test.txt',
    buffer: Buffer.from('fake-file-data'),
    stream: null,
};

export const mockPost = {
    id: 1,
    text: "Text",
    description: "This is the test",
    published: false,
    imageKey: `${uuid()}-${mockFile.originalname}`,
} as PostEntity;