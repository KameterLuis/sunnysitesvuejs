<template>
    <div class="px-8 pt-8">
        <p class="text-2xl py-4">Settings</p>
        <div class="overflow-scroll scroll-container h-screen">
            <div class="pb-32">
                <p class="mt-6">Account</p>
                <SettingsButton @click="handlePwChange" text="Change password" icon="lock-closed-outline" />
                <SettingsButton @click="handleSignOut" text="Sign out" icon="log-out-outline" />
                <SettingsButton @click="setOpen(true)" text="Delete account" icon="close-outline" />
                <p class="mt-6">General</p>
                <SettingsButton text="Disable Notifications" icon="notifications-outline" />
                <p class="mt-6">About</p>
                <SettingsButton text="Privacy Policy" icon="document-text-outline" />
                <SettingsButton text="Imprint" icon="document-text-outline" />
            </div>
        </div>
    </div>
    <ion-alert
        :is-open="isOpen"
        header="Delete account?"
        message="This action cannot be undone"
        :buttons="alertButtons"
        @didDismiss="setOpen(false)">
    </ion-alert>
    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      duration="2000"
      @didDismiss="showToast = false">
    </ion-toast>
</template>

<style>
p {
    color: var(--sunny-gray);
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<script setup>
import SettingsButton from '@/components/settings/Button.vue';
import router from "@/router";
import { getAuth, sendPasswordResetEmail, signOut } from "firebase/auth";
import { ref } from 'vue';

const alertButtons = [
    {
        text: 'Cancel',
        role: 'cancel',
    },
    {
        text: 'Delete',
        role: 'confirm',
        handler: () => {
            try {
                getAuth().currentUser.delete().then(() => {
                    toastMessage.value = "Succesfully deleted account";
                    showToast.value = true;
                    setTimeout(() => {
                        router.push("/login");
                    }, 2000);
                }).catch((error) => {
                    toastMessage.value = "Something went wrong. Try logging out and in again.";
                    showToast.value = true;
                });
            } catch(error) {
                toastMessage.value = "Something went wrong. Try logging out and in again.";
                showToast.value = true;
            }
        }
    }
]

const isOpen = ref(false);

const showToast = ref(false);
const toastMessage = ref('');

const setOpen = (state) => {
    isOpen.value = state;
};

const handleSignOut = () => {
    try {
        signOut(getAuth()).then(() => {
            router.push("/login")
        }).catch((error) => {
            toastMessage.value = "Something went wrong";
            showToast.value = true;
        });
    } catch(error) {
        toastMessage.value = "Something went wrong";
        showToast.value = true;
    }
}

const handlePwChange = () => {
    try {
        const email = getAuth().currentUser.email;
        if(!email) {
            toastMessage.value = "Not logged in";
            showToast.value = true;
            return;
        }
        sendPasswordResetEmail(getAuth(), getAuth().currentUser.email)
        .then(() => {
            toastMessage.value = "Password reset email sent!";
            showToast.value = true;
        })
        .catch((error) => {
            toastMessage.value = error.message;
            showToast.value = true;
        });
    } catch(error) {
        toastMessage.value = "Not logged in";
        showToast.value = true;
        return;
    }
}

</script>