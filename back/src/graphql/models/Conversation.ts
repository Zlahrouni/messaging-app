import {Field, Int, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class User {
    @Field(type => Int)
    id: number;

    @Field()
    id_user_recever : number;

    @Field()
    id_user_sender : number;

    @Field()
    createdAt: Date;

}