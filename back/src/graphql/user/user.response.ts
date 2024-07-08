// src/user/dto/create-user-response.ts
import { ObjectType, Field } from '@nestjs/graphql';
import {User} from "./model/User";

@ObjectType()
export class GetUsersResponse {
    @Field()
    code: number;

    @Field()
    message: string;

    @Field(() => [User], { defaultValue: [] })
    users: User[];
}

@ObjectType()
export class CreateUserResponse {
    @Field()
    code: number;

    @Field()
    message: string;

    @Field(() => User, { nullable: true })
    user?: User;
}

@ObjectType()
export class SignInResponse {
    @Field()
    code: number;

    @Field()
    message: string;

    @Field(() => String, { nullable: true })
    token?: string;
}
