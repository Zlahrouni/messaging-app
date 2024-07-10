import {Field, ID, ObjectType} from "@nestjs/graphql";
import {Chat} from "./model/Chat";
import {Column, PrimaryGeneratedColumn} from "typeorm";

@ObjectType()
export class CreateChatResponse {
    @Field()
    code: number;

    @Field()
    message: string;

    @Field(() => Chat, {nullable: true})
    chat?: Chat;
}

@ObjectType()
export class GetChatsByUsernameResponse {
    @Field()
    code: number;

    @Field()
    message: string;

    @Field(() => [ChatDto], {defaultValue: []})
    chats: ChatDto[];
}

@ObjectType()
export class ChatDto {
    @Field(() => ID)
    id: string;

    @Field(() => [String], { nullable: false })
    users: string[];

    @Field()
    lastMessage: string;

    @Field()
    createdAt: Date;
}