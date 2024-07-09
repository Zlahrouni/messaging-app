import {Field, GraphQLISODateTime, ID, ObjectType} from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => String)
  email: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
