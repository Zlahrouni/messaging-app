import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query getMyChats($token: String!) {
    getMyChats(token: $token) {
      code
      message
      chats {
        id
        users
        createdAt
      }
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages {
    getMessages {
      id
      senderId
      receiverId
      content
      chatId
      createdAt
    }
  }
`;

export const GET_USERS = gql`
query GetUsers {
  getUsers {
    code
    message
    users {
      email
      createdAt
    }
  }
}
`;