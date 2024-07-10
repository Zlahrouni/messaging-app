import {Field, ObjectType} from "@nestjs/graphql";
import {Message} from "./model/Message";


@ObjectType()
export class MessageResponse {
    @Field()
    code: number;

    @Field()
    message: string;

    @Field(() => Message, {nullable: true})
    messageCreated?: Message;
}