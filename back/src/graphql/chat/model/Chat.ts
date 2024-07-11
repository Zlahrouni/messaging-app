import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Chat {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => [String], { nullable: false })
  @Column('text', { array: true })
  users: string[];

  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

}
