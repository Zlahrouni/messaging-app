import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class ChatInput {
    @Field()
    token: string;

    @Field()
    recipientId: string;
}