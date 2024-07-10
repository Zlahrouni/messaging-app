import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { ConflictException } from '@nestjs/common';

describe('UserResolver', () => {
  let userResolver: UserResolver;
  let userService: UserService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [UserResolver, UserService],
    }).compile();

    userResolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  describe('createOrSignUser', () => {
    const email = 'test@example.com';
    it('should create a new user and return a success response', async () => {
      const createdUser = { id: 1, email, createdAt: new Date()};

      jest
        .spyOn(userService, 'createOrSignUser')
        .mockResolvedValue(createdUser);

      const result = await userResolver.createOrSignUser(email);

      expect(result).toEqual({
        code: 200,
        message: 'User authenticated successfully',
        user: createdUser,
      });
      expect(userService.createOrSignUser).toHaveBeenCalledWith(email);
    });

    it('should handle ConflictException and return a conflict response', async () => {
      const conflictError = new ConflictException('User already exists');

      jest
        .spyOn(userService, 'createOrSignUser')
        .mockRejectedValue(conflictError);

      const result = await userResolver.createOrSignUser(email);

      expect(result).toEqual({
        code: 409,
        message: conflictError.message,
        user: null,
      });
      expect(userService.createOrSignUser).toHaveBeenCalledWith(email);
    });

    it('should rethrow other errors', async () => {
      const unknownError = new Error('Unknown error');

      jest
        .spyOn(userService, 'createOrSignUser')
        .mockRejectedValue(unknownError);

      await expect(userResolver.createOrSignUser(email)).rejects.toThrow(
        unknownError,
      );
      expect(userService.createOrSignUser).toHaveBeenCalledWith(email);
    });
  });
});
