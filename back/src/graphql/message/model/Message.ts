import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  senderId: string;

  @Field(() => ID)
  receiverId: string;

  @Field()
  content: string;

  @Field()
  chatId: string;

  @Field()
  createdAt: Date;
}
