import {forwardRef, Module} from "@nestjs/common";
import {ChatService} from "./chat.service";
import {UserService} from "../user/user.service";
import {MessageModule} from "../message/message.module";
import {MessageService} from "../message/message.service";
import {BullModule} from "@nestjs/bull";

@Module({
    imports: [
        forwardRef(() => MessageModule),
        BullModule.registerQueue({
            name: 'messageSend',
        }),
    ],
    providers: [ChatService, UserService, MessageService],
    exports: [ChatService]
})
export class ChatModule {}