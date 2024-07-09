<template>
  <div class="view-livechat-container">
   
    <div class="livechat-container" >
      <div>
        <div class="h1">Bienvenue dans le Hub</div>
        <div class="h6">Connecté en tant que : {{ userId }}</div>
        <div class="h5">Chat Géneral</div>
        
      </div>

      <div class="row" >
        <div class="col-sm-3">

          <div class="d-flex flex-column bg-body-tertiary" 
          style="height: 50vh; 
          border: 5px solid black;
          border-radius: 5px;">
            <a class="d-flex align-items-center flex-shrink-0 p-3 link-body-emphasis text-decoration-none border-bottom">
              <span class="fs-5 fw-semibold">Conversation</span>
            </a>
            <div class="list-group list-group-flush border-bottom" style="overflow-y: auto; ">
              <div v-for="chat in chats" class="list-group-item list-group-item-action py-3 lh-sm">
                <!-- <button class="d-flex w-100 align-items-center justify-content-between" @click="selectChat(chat)">
                  {{ chat }}
                </button> -->
                <button class="d-flex w-100 align-items-center justify-content-between text-center"
                        @click="selectChat(chat)">
                  {{ chat.users.join(' ') }}
                </button>
              </div>
            </div>
          </div>


        </div>
        <div class="col-sm-9">

          <ul class="messages-container" ref="messagesContainer" >
            <li :class="message.senderId == userId ? 'message message-right' : 'message message-left'" 
                v-for="message in messages" :key="message.id">
              <div class="message-info">
                <div>
                  <p id="user">{{ message.senderId }}</p>
                  <p id="date">{{ message.date }}</p>
                </div>
                <div>
                  <p id="text">{{ message.content }}</p>
                </div>
              </div>
            </li>
          </ul>

        </div>
      </div>
      
      <div>
        <textarea autofocus placeholder="Message" v-model="newMessage" @keyup.enter="sendMessage"></textarea>
        <button ref="scrollContainer" @click="sendMessage">Envoyer</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { format } from "date-fns";
import { useMutation, useQuery  } from '@vue/apollo-composable';
import { GET_CHATS } from './../graphql/queries';
import { CREATE_MESSAGE } from './../graphql/mutations'; 

export default {
  name: 'Hub',
  data() {
    return {
      newMessage: "",
      messages: [],
      message: null,
      selectedChatId: null,
      chats: [
        {id: 1, users: ["Mka Videg", "inconnu1"], 
          messages: [
            {id: 1, senderId: "inconnu1", content: "yo salut", id_Chat: 1}, 
            {id: 2, senderId: "Mka Videg", content: "sa va", id_Chat: 1}
          ]
        }, 
        {id: 2, users: ["Mka Videg", "inconnu2"], 
          messages: [
            {id: 1, senderId: "Mka Videg", content: "tu es la ? ", id_Chat: 2}, 
            {id: 2, senderId: "inconnu2", content: "oui et toi", id_Chat: 2}
          ]
        },
        {id: 3, users: ["Mka Videg", "inconnu3"], 
          messages: [
            {id: 1, senderId: "inconnu3", content: "tu joue ?", id_Chat: 3}, 
            {id: 2, senderId: "Mka Videg", content: "oui j'arrive", id_Chat: 3}
          ]
        }, 
        {id: 4, users: ["Mka Videg", "inconnu4"], 
          messages: [
            {id: 1, senderId: "inconnu4",content: "tu dort ?", id_Chat: 4}, 
          ]
        }, 
      ],
      userId: null,
      user: null,

      hasMore: true,
      SERVER_PORT: import.meta.env.VITE_BACKEND_PORT || 3000,
    };
  },
  mounted() {
    this.initUser();
    this.scrollToBottom()
  },
  updated() {
    this.scrollToBottom();
  },
  created() {
   this.getData();
  },
  methods: {
    initUser() {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        
        if (user) {
          user.getIdToken().then((token) => {
            localStorage.setItem('token', token);
          });
          if (user.displayName == null) {
            const atIndex = user.email.indexOf("@");
            if (atIndex !== -1) {
              this.userId = user.email.substring(0, atIndex);
            } else {
              this.userId = "undefined";
            }
          } else {
            this.userId = user.displayName;
          }

          this.user = user;

        } else {
          this.user = null;
          this.userId = null;
        }
      });
    },
    selectChat(chat) {
      this.selectedChatId = chat.id;
      console.log(chat);
      this.messages = chat.messages;
      
    },
    async getData() {
      const { result, loading, error } = useQuery(GET_CHATS, { username: this.userId });

      if (error.value || result.value == undefined) {
        console.error('GraphQL error:', error.value);
        this.msgErr = "Erreur lors de la récupération des chats";
      } else {
       
        result.value.then(data => {
          this.chats = data.getChats.chat;
          
          if (this.chats.length > 0) {
           
            this.selectChat(this.chats[0]);
          }
        }).catch(err => {
          console.error('Error fetching chats:', err);
          this.msgErr = "Erreur lors de la récupération des chats";
        });
      }
    },
    async sendMessage() {
      if (this.newMessage.trim() !== "" && this.userId && this.selectedChatId) {
        const now = new Date();
        const formattedDate = format(now, "dd/MM/yyyy HH:mm");

        const message = {
          content: this.newMessage,
          senderId: this.userId,
          chatId: this.selectedChatId,
          date: formattedDate,
        };
        this.messages.push(message);
        this.newMessage = "";
        try {
          const { mutate: createMessage } = useMutation(CREATE_MESSAGE);
          const response = await createMessage({ message });

          console.log(response.data.createMessage.Message);
         
          this.newMessage = "";
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } catch (error) {
          console.error("GraphQL error:", error);
          this.msgErr = "Erreur lors de l'envoi du message";
        }
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
  },
};
</script>

