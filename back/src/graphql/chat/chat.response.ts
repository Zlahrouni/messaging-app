import {Field, ObjectType} from "@nestjs/graphql";
import {Chat} from "./model/Chat";

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
export class GetChatByUsernameResponse {
    @Field()
    code: number;

    @Field()
    message: string;

    @Field(() => [Chat], {defaultValue: []})
    chat: Chat;
}