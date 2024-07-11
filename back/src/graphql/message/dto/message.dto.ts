import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MessageInput {
  @Field()
  token: string;

  @Field()
  receiveirEmail: string;

  @Field()
  content: string;

}

@InputType()
export class GetMessage {
  @Field()
  token: string;

  @Field()
  chatId: string;
}
