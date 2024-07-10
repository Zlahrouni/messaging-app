<template>
  <div class="view-livechat-container">
   
    <div class="livechat-container" >
      <div>
        <div class="h1">Bienvenue dans le Hub</div>
        <div class="h6">Connecté en tant que : {{ userId }}</div>
        <div class="h5">Chat {{ selectedChatEmail ? "avec " + selectedChatEmail : "Général" }}</div>

        
        
      </div>

      <div class="row" >
        <div class="col-sm-3">

          <div class="d-flex flex-column bg-body-tertiary" 
          style="height: 50vh; 
          border: 5px solid black;
          border-radius: 5px;">
            <a class="d-flex align-items-center flex-shrink-0 p-3 link-body-emphasis text-decoration-none border-bottom">
              <span class="fs-5 fw-semibold">Conversation </span>
              <div class="dropdown">
                <button class="btn btn-primary rounded-circle " 
                  @click="toggleDropdown" :class="{ 'show': showDropdown }" type="button" id="dropdownMenuButton" aria-expanded="false">
                  +
                </button>
                <ul class="dropdown-menu" :class="{ 'show': showDropdown }" aria-labelledby="dropdownMenuButton">
                  <li v-for="email in usersByEmail" :key="email">
                    <button class="dropdown-item" @click="createChat(email)">{{ email }}</button>
                  </li>
                </ul>
              </div>
            </a>
            <div class="list-group list-group-flush border-bottom" style="overflow-y: auto; ">
              <div v-for="chat in chats" class="list-group-item list-group-item-action py-3 lh-sm">

                <button @click="selectChat(chat)">
                  <div v-for="useremail in chat.users">
                      <div class="text-center" v-if="useremail != userId">
                        {{ useremail }}

                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>


        </div>
        <div class="col-sm-9">

          <ul class="messages-container" ref="messagesContainer" >
            <li :class="message.senderEmail == userId ? 'message message-right' : 'message message-left'" 
                v-for="message in messages" :key="message.id">
              <div class="message-info">
                <div>
                  <p id="user">{{ message.senderEmail }}</p>
                  <p id="date">{{ message.createdAt }}</p>
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
import { GET_CHATS, GET_USERS } from './../graphql/queries';
import { CREATE_MESSAGE } from './../graphql/mutations'; 
import client from "../apollo/client";




export default {
  name: 'Hub',
  data() {
    return {
      newMessage: "",
      messages: [],
      message: null,
      selectedChatEmail: null,
      chatId: null,
      chats: [],
      userId: null,
      user: null,
      usersByEmail: [],
      showDropdown: false,
      token: null,
      hasMore: true,
      SERVER_PORT: import.meta.env.VITE_BACKEND_PORT || 3000,
    };
  },
  mounted() {
    this.initUser();
    this.scrollToBottom();
    
  },
  updated() {
    this.scrollToBottom();
  },
  created() {
    this.getUsers();
    this.getChat();
  },
  methods: {
    initUser() {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        
        if (user) {
          user.getIdToken().then((token) => {
            localStorage.setItem('token', token);
          });
          
          this.userId = user.email;
          this.user = user;

        } else {
          this.user = null;
          this.userId = null;
        }
      });
      
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    selectChat(chat) {

      chat.users.forEach(email => {
        if(email != this.userId){
          this.selectedChatEmail = email;
        }
      });

      this.messages = chat.messages || [];
      
    },
    createChat(email){
      this.showDropdown = !this.showDropdown;
      this.selectedChatEmail = email;
      this.chats.push(
        { id : email,
          users: [email]

        })
    },

    async getChat() {
      const token = localStorage.getItem('token');

      console.log(token)

      const { data: response } = await client.query({
          query: GET_CHATS, 
          variables: { token : token },
        });
        console.log(response);
        let get_chat = response.getMyChats.chats;
        if(get_chat.length > 0){
          get_chat.forEach(new_chat => {
            this.chats.push(new_chat)
          });
        }
    },
    async getUsers() {      
      const { data: response } = await client.query({
          query: GET_USERS
        });
      let userObjectList = response.getUsers.users;
      userObjectList.forEach(user => 
        {
          if(user.email != this.userId){
            this.usersByEmail.push(user.email);
          }   
        }
      );
    },
    async sendMessage() {
      if (this.newMessage.trim() !== "" && this.userId && this.selectedChatEmail) {
 
        const token = localStorage.getItem('token');

        const messageInput = {
          content: this.newMessage,
          receiveirEmail: this.selectedChatEmail,
          token: token
        };
        
       try {

          const response = await client.mutate({
            mutation: CREATE_MESSAGE, 
            variables: {messageInput},
          });


          console.log(response)
          const newMessage = {
            content: response.data.createMessage.messageCreated.content,
            senderEmail: response.data.createMessage.messageCreated.senderEmail,
            receiverEmail: response.data.createMessage.messageCreated.receiverEmail,
            chatId: response.data.createMessage.messageCreated.chatId,
            createdAt: response.data.createMessage.messageCreated.createdAt
          };
          

          this.messages.push(newMessage);
          this.newMessage = "";

          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } catch (error) {
          console.error("GraphQL error:", error);
           this.msgErr = "Erreur lors de l'envoi du message";
          
        }
      }
      if(this.msgErr){
        alert(this.msgErr);
      }
      
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
  },
};
</script>

