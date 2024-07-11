<template>
  <div class="view-login-container">
    <div class="login-container">
      <h1>Créer un compte</h1>
      <input type="text" placeholder="Email" v-model="email" />
      <input type="password" placeholder="Mot de passe" v-model="mdp" />
      <button @click="register">S'inscrire</button>
      <button @click="signInWithGoogle()">Se connecter avec Google</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "vue-router";

import { CREATE_USER } from './../graphql/mutations'; 
import client from "../apollo/client";

const email = ref("");
const mdp = ref("");
const msgErr = ref();
const router = useRouter();


const register = async () => {
  try {
    const result = await createUserWithEmailAndPassword(getAuth(), email.value, mdp.value);
    await createUser(result.user.email);
  } catch (error) {
    handleAuthError(error);
  }
};


const handleGraphQLError = (error) => {
  console.error("GraphQL error:", error);
};

const handleAuthError = (error) => {
  switch (error.code) {
    case "auth/invalid-email":
      msgErr.value = "Email invalide";
      break;
    case "auth/user-not-found":
      msgErr.value = "Utilisateur introuvable";
      break;
    case "auth/wrong-password":
      msgErr.value = "Mot de passe incorrect";
      break;
    default:
      msgErr.value = "Email ou mot de passe incorrect";
      break;
  }
};

const createUser = async (sendemail) => {
  try {
    await client.mutate({
      mutation: CREATE_USER,
      variables: { email: sendemail },
    });
    router.push("/hub");
  } catch (error) {
    console.error("GraphQL error:", error);
    handleGraphQLError(error);
  }
};


const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(getAuth(), provider);
    await createUser(result.user.email);
  } catch (error) {
    handleAuthError(error);
  }
};


</script>
