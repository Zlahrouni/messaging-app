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
    query getMessages($getMessage: GetMessage!) { 
      getMessages(getMessage: $getMessage) {
        code
        message
        messages {
          id
          senderEmail
          receiverEmail
          content
          chatId
          createdAt
        }
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