import { gql } from '@apollo/client/core';

export const CREATE_USER = gql`
  mutation CreateUser($email: String!) {
    createUser(email: $email) {
      code
      message
      user {
        id
        email
      }
    }
  }
`;
