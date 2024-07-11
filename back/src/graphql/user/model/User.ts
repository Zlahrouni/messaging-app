import {Field, GraphQLISODateTime, ID, ObjectType} from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @Field(() => String)
  @PrimaryColumn()
  email: string;

  @Field(() => GraphQLISODateTime)
  @Column({ default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;
}
