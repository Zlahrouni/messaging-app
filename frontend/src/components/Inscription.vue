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
import { useMutation } from '@vue/apollo-composable';
import { CREATE_USER } from './../graphql/mutations'; 
import client from "../apollo/client";

const email = ref("");
const mdp = ref("");
const msgErr = ref();
const router = useRouter();

const { mutate: createUser } = useMutation(CREATE_USER, {
    client: client
});

const register = () => {
  createUserWithEmailAndPassword(getAuth(), email.value, mdp.value)
    .then((result) => {
      createUser({ email: result.user.email })
        .then(response => {
          if(response.data.createOrSignUser.code == 200){
            console.log("Inscription réussite !");
            router.push("/hub");
          }
        }).catch(error => {
          console.log(error);
          console.error("GraphQL error:", error);
        });
    })
    .catch((error) => {
      console.log(error.code);  
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
    });
};



const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(getAuth(), provider)
    .then((result) => {

      createUser({ email: result.user.email })
        .then(response => {
          if(response.data.createOrSignUser.code == 200){
            console.log("Connexion réussite !");
            router.push("/hub");
          }
          
        }).catch(error => {
          console.log(error);
          console.error("GraphQL error:", error);
        });
    })
    .catch((error) => {
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
    });
};
</script>
