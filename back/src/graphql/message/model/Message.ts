import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
@ObjectType()
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  senderId: string;

  @Field(() => ID)
  @Column()
  receiverId: string;

  @Field()
  @Column()
  content: string;

  @Field()
  @Column()
  chatId: string;

  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;
}
