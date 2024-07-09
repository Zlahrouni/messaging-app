<template>
  <div class="view-livechat-container">
    <div class="livechat-container">
      <div>
        <h1>Bienvenue dans le Hub</h1>
        <h6>Connecté en tant que : {{ userId }}</h6>
        <h5>Chat Géneral</h5>
      </div>
        <ul class="messages-container" ref="messagesContainer">
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
import axios from "axios";

export default {
  name: 'Hub',
  data() {
    return {
      newMessage: "",
      messages: [],
      message: null,
      userId: null,
      user: null,
      page: 1,
      limit: 50,
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

          // this.connect(user);
        } else {
          this.user = null;
          this.userId = null;
        }
      });
    },
    async getData() {
      await axios
        .get(`http://localhost:${this.SERVER_PORT}/api/messages`, {
          params: { page: this.page, limit: this.limit },
        })
        .then((response) => {
          this.messages = response.data;
          console.log("Messages fetched successfully:", this.messages);
        })
        .catch((error) => {
          console.error("Error fetching messages:", error);
        });
    },
    sendMessage() {
      if (this.newMessage.trim() !== "" && this.userId) {
        const now = new Date();
        const formattedDate = format(now, "dd/MM/yyyy HH:mm");

        // const message = {
        //   text: this.newMessage,
        //   userId: this.userId,
        //   date: formattedDate,
        // };

        const message = {
          content: this.newMessage,
          senderId: this.userId,
          chatId: "test",
          date: formattedDate,
        };

        
        this.messages.push(message);
        // this.ws.send(JSON.stringify(message));
        this.newMessage = "";
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
  },
};
</script>

