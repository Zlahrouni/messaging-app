import { gql } from '@apollo/client';

export const GET_POSTS_QUERY = gql`
  query GetPosts {
    getPosts {
      id
      title
      body
      authorId
      comments {
        id
        comment
        authorId
      }
      usersLikes {
        id
        userId
      }
    }
  }
`;

