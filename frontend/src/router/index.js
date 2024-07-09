
import { onAuthStateChanged } from "firebase/auth";
import { createRouter, createWebHistory } from "vue-router";
import { getAuth } from "firebase/auth";

const router = createRouter({
    history: createWebHistory(),
    routes:[
        { path: "/", component: () => import("../components/HelloWorld.vue")},
        { path: "/hub", component: () => import("../components/HomeHub.vue"), meta: { requiresAuth: true }},
        { path: "/inscription", component: () => import("../components/Inscription.vue"), meta: { requiresAuth: false } },
        { path: "/login", component: () => import("../components/Connexion.vue"), meta: { requiresAuth: false } },
    ]
});

const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const removeListener = onAuthStateChanged(
            getAuth(),
            (user)=>{
                removeListener();
                resolve(user);
            },
            reject
        )
    });
};


router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const currentUser = await getCurrentUser();

    if (requiresAuth && !currentUser) {
        
        next("/login");
    } else if (!requiresAuth && currentUser) {
        next("/hub");
    } else {
        next();
    }
});

export default router;
