import {forwardRef, Module} from "@nestjs/common";
import {ChatModule} from "../chat/chat.module";
import {ChatService} from "../chat/chat.service";
import {UserService} from "../user/user.service";
import {MessageService} from "./message.service";
import {BullModule} from "@nestjs/bull";


@Module({
    imports: [
        forwardRef(() => ChatModule),
        BullModule.registerQueue({
        name: 'messageSend',
        }
    ),],
    providers: [ChatService, UserService, MessageService],
    exports: [ChatService]
})
export class MessageModule{}