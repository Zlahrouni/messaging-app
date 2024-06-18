import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MessageDTO {
  @Field()
  from: string;

  @Field()
  to: string;

  @Field()
  subject: string;

  @Field()
  text: string;

  [key: string]: any;
}