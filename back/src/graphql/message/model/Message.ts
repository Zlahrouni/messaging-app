import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/graphql/user/model/User';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  sender: string;

  @Field(() => User)
  receiver: string;

  @Field()
  id_Chat: number;

  @Field()
  createdAt: Date;
}
