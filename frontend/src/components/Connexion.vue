<template>
  <div class="view-login-container">
    <div class="login-container">
      <h1>Login</h1>
      <input type="text" placeholder="Email" v-model="email" />
      <input type="password" placeholder="Mot de passe" v-model="mdp" />
      <p v-if="msgErr">{{ msgErr }}</p>
      <button @click="login">Se connecter</button>
      <button @click="signInWithGoogle">Se connecter avec Google</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "vue-router";

const email = ref("");
const mdp = ref("");
const msgErr = ref();
const router = useRouter();

const login = () => {
  signInWithEmailAndPassword(getAuth(), email.value, mdp.value)
    .then((result) => {
      console.log(result);
      console.log("Connexion réussite !");
      router.push("/hub");
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

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();

  signInWithPopup(getAuth(), provider)
    .then((result) => {
      console.log("Connexion réussite !");
      console.log(result);
      router.push("/hub");
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
