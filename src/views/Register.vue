<template>
    <div class="px-12 w-full h-full flex flex-col justify-center items-center bg-white">
        <div>
            <div>
                <img src="@/assets/splash/LogoSplash.png" alt="Logo">
            </div>
            <div class="mt-6 w-full flex flex-col items-center">
                <p class="text-lg text-black">Create a new account</p>
                <ion-item class="custom mt-8 w-full">
                    <ion-input v-model="email" type="email" class="custom -text--sunny-gray" label="Email" label-placement="floating" fill="outline" placeholder="max@mustermann.com"></ion-input>
                </ion-item>
                <ion-item class="custom mt-4 w-full">
                    <ion-input v-model="password" type="password" class="custom -text--sunny-gray" label="Password" label-placement="floating" fill="outline" placeholder="*****"></ion-input>
                </ion-item>
                <div class="w-full mt-8">
                    <div @click="register" class="w-full -bg--sunny-orange py-4">
                        <p class="text-white text-center">CONTINUE</p>
                    </div>
                    <div @click="goToLogin" class="w-full bg-white border-2 -border--sunny-orange py-4 mt-4">
                        <p class="-text--sunny-orange text-center">BACK TO LOGIN</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      duration="2000"
      @didDismiss="showToast = false">
    </ion-toast>
</template>

<script setup>
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const showToast = ref(false);
const toastMessage = ref('');

const register = () => {
    createUserWithEmailAndPassword(getAuth(), email.value, password.value)
        .then(() => {
            router.push("/home");
        })
        .catch((error) => {
            switch(error.code) {
                case "auth/invalid-email":
                    toastMessage.value = "Invalid email";
                    break;
                case "auth/user-not-found":
                    toastMessage.value = "No account with that email was found";
                    break;
                case "auth/wrong-password":
                    toastMessage.value = "Incorrect password";
                    break;
                default:
                    toastMessage.value = "Email or password incorrect";
                    break;
            }
            showToast.value = true;
        })
}

const goToLogin = () => {
    router.push('/login');
};

</script>