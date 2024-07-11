import {Field, ObjectType} from "@nestjs/graphql";


@ObjectType()
export class GeneralResponse {
    @Field()
    code: number;

    @Field()
    message: string;
}
