import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Message } from 'src/graphql/message/model/Message';
import { User } from 'src/graphql/user/model/User';

@ObjectType()
export class Chat {
  @Field(() => ID)
  id: string;

  @Field(() => [String], { nullable: false })
  users: string[];

  @Field()
  createdAt: Date;

}
