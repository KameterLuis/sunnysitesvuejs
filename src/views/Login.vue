<template>
    <div class="px-8 w-full h-full flex flex-col justify-center items-center">
        <div>
            <img src="@/assets/splash/Logo.png" alt="Logo">
        </div>
        <div class="mt-auto w-full flex flex-col items-center mb-32">
            <p>Login or sign up for free</p>
            <ion-item>
                <ion-input fill="outline" aria-label="Email" placeholder="max@mustermann.com"></ion-input>
            </ion-item>
        </div>
    </div>
</template>

<style>
</style>

<script setup>

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const showToast = ref(false);
const router = useRouter();

const login = async () => {
    const auth = getAuth();
    try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/home');
    } catch (error) {
    errorMessage.value = error.message;
    showToast.value = true;
    }
};

const goToRegister = () => {
    router.push('/register');
};

</script>