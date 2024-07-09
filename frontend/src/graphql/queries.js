import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats($username: String!) {
    getChats(username: $username) {
      code
      message
      chat {
        id
        users
        createdAt
        messages {
          id
          senderId
          receiverId
          content
          id_Chat
          createdAt
        }
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
      id_Chat
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
      id
      username
      createdAt
    }
  }
}
`;