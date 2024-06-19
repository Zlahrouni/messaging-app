import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './User';

@ObjectType()
export class Message {
  @Field((type) => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  sender: string;

  @Field()
  id_Chat: number;

  @Field()
  createdAt: Date;
}
