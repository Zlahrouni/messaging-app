import {Field, Int, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class User {
    @Field(type => Int)
    id: number;

    @Field()
    titre: string;

    @Field()
    content: string;

    @Field()
    id_conversation: number;

    @Field()
    createdAt: Date;

}