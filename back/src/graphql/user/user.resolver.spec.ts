import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { User } from './model/User';
import { ConflictException } from '@nestjs/common';

const mockUserService = {
  createOrSignUser: jest.fn(),
  getUsers: jest.fn(),
};

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get(UserService);
  });

  describe('createOrSignUser', () => {
    const email = 'test@example.com';

    it('should return 409 if user already exists', async () => {
      const conflictError = new ConflictException('User already exists');

      userService.createOrSignUser.mockRejectedValue(conflictError);

      const response = await resolver.createOrSignUser(email);

      expect(userService.createOrSignUser).toHaveBeenCalledWith(email);
      expect(response).toEqual({
        code: 409,
        message: 'User already exists',
        user: null,
      });
    });

    it('should create a new user and return 201 status code if the user does not exist', async () => {
      const createdUser: User = { email, createdAt: new Date() };

      userService.createOrSignUser.mockResolvedValue(createdUser);

      const response = await resolver.createOrSignUser(email);

      expect(userService.createOrSignUser).toHaveBeenCalledWith(email);
      expect(response).toEqual({
        code: 201,
        message: 'User created',
        user: createdUser,
      });
    });

    it('should return 409 if user already exists', async () => {
      const conflictError = new ConflictException('User already exists');

      userService.createOrSignUser.mockRejectedValue(conflictError);

      const response = await resolver.createOrSignUser(email);

      expect(userService.createOrSignUser).toHaveBeenCalledWith(email);
      expect(response).toEqual({
        code: 409,
        message: 'User already exists',
        user: null,
      });
    });
  });

  describe('getUsers', () => {
    it('should return users with 200 status code if users are found', async () => {
      const users: User[] = [
        { email: 'user1@example.com', createdAt: new Date() },
        { email: 'user2@example.com', createdAt: new Date() },
      ];

      userService.getUsers.mockResolvedValue(users);

      const response = await resolver.getUsers();

      expect(userService.getUsers).toHaveBeenCalled();
      expect(response).toEqual({
        code: 200,
        message: 'Users found',
        users,
      });
    });

    it('should return no users found with 200 status code if no users exist', async () => {
      userService.getUsers.mockResolvedValue([]);

      const response = await resolver.getUsers();

      expect(userService.getUsers).toHaveBeenCalled();
      expect(response).toEqual({
        code: 200,
        message: 'No users found',
        users: [],
      });
    });

    it('should return 500 if internal server error occurs', async () => {
      userService.getUsers.mockRejectedValue(
        new Error('Internal server error'),
      );

      const response = await resolver.getUsers();

      expect(userService.getUsers).toHaveBeenCalled();
      expect(response).toEqual({
        code: 500,
        message: 'Internal server error',
        users: [],
      });
    });
  });
});
