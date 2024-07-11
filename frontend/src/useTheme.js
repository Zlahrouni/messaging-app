import { ref, watchEffect } from 'vue';

export default function useTheme() {
    const theme = ref(localStorage.getItem('theme') || 'light');

    watchEffect(() => {
        document.documentElement.setAttribute('data-theme', theme.value);
        localStorage.setItem('theme', theme.value);
    });

    function toggleTheme() {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
    }

    return { theme, toggleTheme };
}
