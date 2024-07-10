import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
@ObjectType()
export class Message {
  @Field(() => ID, {nullable: false})
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID, {nullable: false})
  @Column()
  senderEmail: string;

  @Field(() => ID, {nullable: false})
  @Column()
  receiverEmail: string;

  @Field(() => String, {nullable: false})
  @Column()
  content: string;

  @Field( () => String, {nullable: false})
  @Column()
  chatId: string;

  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;
}
