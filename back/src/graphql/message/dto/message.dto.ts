import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MessageInput {
  @Field()
  content: string;

  @Field()
  senderId: string;

  @Field()
  receiverId: string;
}
