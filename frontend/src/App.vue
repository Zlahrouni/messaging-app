<template>
  <nav>
    <ul>
      <div class="ul-container">
        <i class="fa-solid fa-house"></i>
        <li><router-link to="/">Home</router-link></li>
      </div>
      <div class="ul-container">
        <i class="fa-solid fa-comments"></i>
        <li><router-link to="/hub">HubChat</router-link></li>
      </div>
      <div class="ul-container" v-if="!isLoggedIn">
        <i class="fa-solid fa-user"></i>
        <li v-if="!isLoggedIn">
          <router-link to="/login">Connexion</router-link>
        </li>
      </div>
      <div class="ul-container" v-if="!isLoggedIn">
        <i class="fa-solid fa-user-plus"></i>
        <li v-if="!isLoggedIn">
          <router-link to="/inscription">Inscription</router-link>
        </li>
      </div>
      <div class="ul-container" v-if="isLoggedIn">
        <i class="fa-solid fa-right-from-bracket" ></i>
        <li @click="handleSignOut">Se déconnecter</li>
      </div>
      <div class="ul-container">
        <i class="fa-solid fa-circle-half-stroke"></i>
        <li @click="toggleTheme">Changer de thème</li>
      </div>
    </ul>
  </nav>
  <div class="view-container">
    <router-view/>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import useTheme from "./useTheme";

const { toggleTheme } = useTheme();

const router = useRouter();
const isLoggedIn = ref(false);

let auth;

onMounted(() => {
  auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isLoggedIn.value = true;
    } else {
      isLoggedIn.value = false;
    }
  });
});

const handleSignOut = () => {
  signOut(auth).then(() => {
    router.push("/");
  });
};
</script>
