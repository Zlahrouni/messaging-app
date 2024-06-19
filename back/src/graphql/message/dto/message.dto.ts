import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MessageInput {
  @Field()
  content: string;

  @Field()
  sender: string;

  @Field()
  receiver: string;
}
