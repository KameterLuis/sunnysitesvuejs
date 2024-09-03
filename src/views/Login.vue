<template>
    <div class="px-12 w-full h-full flex flex-col justify-center items-center bg-white">
        <div>
            <div>
                <img src="@/assets/splash/LogoSplash.png" alt="Logo">
            </div>
            <div class="mt-6 w-full flex flex-col items-center">
                <p class="text-lg text-black">Login or sign up for free</p>
                <ion-item class="custom mt-8 w-full overflow-visible">
                    <ion-input v-model="email" type="email" class="custom -text--sunny-gray" label="Email" label-placement="floating" fill="outline" placeholder="max@mustermann.com"></ion-input>
                </ion-item>
                <ion-item class="custom mt-4 w-full overflow-visible">
                    <ion-input v-model="password" type="password" class="custom -text--sunny-gray" label="Password" label-placement="floating" fill="outline" placeholder="*****"></ion-input>
                </ion-item>
                <button @click="handleResetPassword" class="text-xs -text--sunny-gray w-full text-left mt-2 pl-4">forgot password?</button>
                <p v-if="errMsg" class="text-red-500 mt-4 text-base">{{ errMsg }}</p>
                <div class="w-full mt-8">
                    <div @click="login" class="w-full -bg--sunny-orange py-4">
                        <p class="text-white text-center">CONTINUE</p>
                    </div>
                    <div @click="goToRegister" class="w-full bg-white border-2 -border--sunny-orange py-4 mt-4">
                        <p class="-text--sunny-orange text-center">REGISTER</p>
                    </div>
                    <div class="w-full bg-gray-300 h-[1px] mt-4"></div>
                    <div @click="signInWithGoogle" class=" px-4 flex w-full mt-4 bg-white border-[1px] -border--sunny-gray py-4">
                        <div class="relative w-[25px] h-[25px]">
                            <img src="@/assets/login/google.png" alt="Google">
                        </div>
                        <p class="-text--sunny-gray text-center w-full -ml-[25px]">Login with Google</p>
                    </div>
                    <div @click="singInWithApple" class="hidden px-4 w-full mt-4 bg-white border-[1px] -border--sunny-gray py-4">
                        <div class="relative w-[25px] h-[25px]">
                            <img src="@/assets/login/apple.png" alt="Google">
                        </div>
                        <p class="-text--sunny-gray text-center w-full -ml-[25px]">Login with Apple</p>
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
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const errMsg = ref();
const router = useRouter();

const showToast = ref(false);
const toastMessage = ref('');

const login = () => {
    signInWithEmailAndPassword(getAuth(), email.value, password.value)
        .then(() => {
            router.push("/home");
        })
        .catch((error) => {
            switch(error.code) {
                case "auth/invalid-email":
                    errMsg.value = "Invalid email";
                    break;
                case "auth/user-not-found":
                    errMsg.value = "No account with that email was found";
                    break;
                case "auth/wrong-password":
                    errMsg.value = "Incorrect password";
                    break;
                default:
                    errMsg.value = "Email or password incorrect";
                    break;
            }
        })
}

const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(getAuth(), provider)
        .then(() => {
            router.push("/home");
        })
        .catch((error) => {
            toastMessage.value = error.message;
            showToast.value = true;
        });
}

const handleResetPassword = () => {
    if(!email.value) {
        toastMessage.value = "Enter email adress first!";
        showToast.value = true;
        return;
    }
    sendPasswordResetEmail(getAuth(), email.value)
        .then(() => {
            toastMessage.value = "Password reset email sent!";
            showToast.value = true;
        })
        .catch((error) => {
            toastMessage.value = error.message;
            showToast.value = true;
        });
}

const goToRegister = () => {
    router.push('/register');
};

</script>