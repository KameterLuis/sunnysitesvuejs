<template>
    <div class="px-12 w-full h-full flex flex-col justify-center items-center">
        <div>
            <img src="@/assets/splash/Logo.png" alt="Logo">
        </div>
        <div class="mt-auto w-full flex flex-col items-center mb-32">
            <p class="text-lg text-black">Create a new account</p>
            <ion-item class="mt-8 w-full">
                <ion-input v-model="email" type="email" class="-text--sunny-gray" label="Email" label-placement="floating" fill="outline" placeholder="max@mustermann.com"></ion-input>
            </ion-item>
            <ion-item class="mt-4 w-full">
                <ion-input v-model="password" type="password" class="-text--sunny-gray" label="Password" label-placement="floating" fill="outline" placeholder="*****"></ion-input>
            </ion-item>
            <div class="w-full mt-8">
                <div @click="register" class="w-full -bg--sunny-orange py-4">
                    <p class="text-white text-center">CONTINUE</p>
                </div>
                <div @click="goToLogin" class="w-full bg-white border-2 -border--sunny-orange py-4 mt-4">
                    <p class="-text--sunny-orange text-center">BACK TO LOGIN</p>
                </div>
                <div class="w-full bg-gray-300 h-[1px] mt-6"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFirebaseAuth } from 'vuefire';

const auth = useFirebaseAuth();

const email = ref('');
const password = ref('');
const router = useRouter();

const register = () => {
    createUserWithEmailAndPassword(getAuth(), email.value, password.value)
        .then((data) => {
            console.log("Successfully registered!");
            router.push("/home");
        })
        .catch((error) => {
            console.log(error.code);
            alert(error.message);
        })
}

const signInWithGoogle = () => {
    
}

const goToLogin = () => {
    router.push('/login');
};

onMounted(() => {
    getRedirectResult(auth).catch((reason) => {
        console.error('Failed redirect result', reason)
        error.value = reason
    })
})

</script>