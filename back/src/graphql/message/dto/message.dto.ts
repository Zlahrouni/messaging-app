import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MessageInput {
  @Field()
  senderId: string;

  @Field()
  receiverId: string;

  @Field(() => String, { nullable: true })
  chatId?: string;

  @Field()
  content: string;

  @Field()
  createdAt: Date;

  @Field()
  token: string;
}
