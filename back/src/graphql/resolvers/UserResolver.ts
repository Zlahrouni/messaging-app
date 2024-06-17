import {Query, Resolver} from "@nestjs/graphql";
import {User} from "../models/User";

@Resolver()
export class UserResolver {

    @Query((returns) => User)
    getUser() {
        return {
            id: 1,
            name: 'John Doe',
            username: 'john_doe',
            password: 'password',
            createdAt: new Date(),
            updatedAt: new Date()
        };

    }
}