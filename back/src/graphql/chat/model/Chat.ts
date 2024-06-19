import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Message } from './Message';
import { User } from './User';

@ObjectType()
export class Chat {
  @Field((type) => ID)
  id: string;

  @Field(() => [User])
  users: User[];

  @Field()
  createdAt: Date;

  @Field(() => [Message])
  messages: Message[];
}
