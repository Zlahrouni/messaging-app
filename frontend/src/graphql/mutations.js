import { gql } from '@apollo/client/core';

export const CREATE_USER = gql`
  mutation CreateUser($email: String!) {
    createUser(email: $email) {
      code
      message
      email
    }
  }
`;


  export const CREATE_MESSAGE = gql`
    mutation CreateMessage($messageInput: MessageInput!) {
      createMessage(messageInput: $messageInput) {
        code
        message
        Message{
          id
          senderId
          receiverId
          content
          id_Chat
          createdAt
        }
      }
    }
  `;

export const CREATE_CHAT = gql`
  mutation CreateChat($chatInput: ChatInput!) {
    createChat(chatInput: $chatInput) {
      code
      message
      chat {
        id
        token
        recipientId
      }
    }
  }
`;

