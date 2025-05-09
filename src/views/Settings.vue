<template>
  <div class="px-8 pt-12">
    <p class="text-2xl py-4">Settings</p>
    <div class="overflow-scroll scroll-container h-screen">
      <div class="pb-32">
        <!--p class="mt-6">Account</p>
                <SettingsButton @click="handlePwChange" text="Change password" icon="lock-closed-outline" />
                <SettingsButton @click="handleSignOut" text="Sign out" icon="log-out-outline" />
                <SettingsButton @click="setOpen(true)" text="Delete account" icon="close-outline" />
        <p class="mt-6">General</p>
        <SettingsButton
          text="Disable Notifications"
          icon="notifications-outline"
        />
        <p class="mt-6">About</p-->
        <SettingsButton
          @click="openModal('privacy')"
          text="Privacy Policy"
          icon="document-text-outline"
        />
        <SettingsButton
          @click="openModal('imprint')"
          text="Imprint"
          icon="document-text-outline"
        />
      </div>
    </div>
    <ion-modal :is-open="isImprintOpen">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
          <ion-title>Imprint</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="px-4">
          <p v-if="legalTexts?.imprint">{{ legalTexts.imprint }}</p>
          <p v-else>
            Imprint Anbieter: MG Services & Beratung Vertreten durch den
            Geschäftsführer: Maximilian Günzel Schießstättstraße 28 80339
            München Kontakt: E-Mail: kontakt@sunny-sites.com Verantwortlich für
            redaktionelle Inhalte gemäß § 55 Abs. 2 RStV: Maximilian Günzel
            Schießstättstraße 28 80339 München
          </p>
        </div>
      </ion-content>
    </ion-modal>
    <ion-modal :is-open="isPrivacyOpen">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
          <ion-title>Privacy</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="px-4">
          <p v-if="legalTexts?.privacy">{{ legalTexts.privacy }}</p>
          <p v-else>
            Privacy Policy Diese Datenschutzerklärung für MG Services & Beratung
            („Unternehmen“, „wir“, „uns“ oder „unser“) beschreibt, wie und warum
            wir personenbezogene Daten erheben, speichern, verwenden und
            weitergeben („verarbeiten“), wenn Sie unsere Dienste („Dienste“)
            nutzen, beispielsweise wenn Sie: • Unsere Website unter
            https://www.sunny-sites.com/ besuchen oder eine andere Website von
            uns aufrufen, die auf diese Datenschutzerklärung verweist • Unsere
            Anwendung(en) herunterladen und verwenden, z. B. unsere mobile App
            SunnySites, unsere Facebook-App oder eine andere Anwendung von uns,
            die auf diese Datenschutzerklärung verweist • Auf andere Weise mit
            uns interagieren, einschließlich im Rahmen von Verkauf, Marketing
            oder Veranstaltungen Fragen oder Bedenken? Das Lesen dieser
            Datenschutzerklärung hilft Ihnen, Ihre Datenschutzrechte und
            -optionen zu verstehen. Wenn Sie mit unseren Richtlinien und
            Praktiken nicht einverstanden sind, nutzen Sie bitte unsere Dienste
            nicht. Falls Sie weitere Fragen oder Bedenken haben, kontaktieren
            Sie uns unter kontakt@sunny-sites.com.
          </p>
        </div>
      </ion-content>
    </ion-modal>
  </div>
  <ion-alert
    :is-open="isOpen"
    header="Delete account?"
    message="This action cannot be undone"
    :buttons="alertButtons"
    @didDismiss="setOpen(false)"
  >
  </ion-alert>
  <ion-toast
    :is-open="showToast"
    :message="toastMessage"
    duration="2000"
    @didDismiss="showToast = false"
  >
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
import SettingsButton from "@/components/settings/Button.vue";
import { db } from "@/firebaseConfig";
import router from "@/router";
import { getAuth, sendPasswordResetEmail, signOut } from "firebase/auth";
import { collection, doc } from "firebase/firestore";
import { onMounted, ref, watchEffect } from "vue";
import { useDocument } from "vuefire";

const legalRef = doc(collection(db, "Legal"), "iV8EPKXn0nWLZ4fmLzKV");
const legalTexts = useDocument(legalRef);

const isPrivacyOpen = ref(false);
const isImprintOpen = ref(false);

const openModal = (type) => {
  if (type === "privacy") {
    isPrivacyOpen.value = true;
  } else {
    isImprintOpen.value = true;
  }
};

const closeModal = () => {
  isPrivacyOpen.value = false;
  isImprintOpen.value = false;
};

const alertButtons = [
  {
    text: "Cancel",
    role: "cancel",
  },
  {
    text: "Delete",
    role: "confirm",
    handler: () => {
      try {
        getAuth()
          .currentUser.delete()
          .then(() => {
            toastMessage.value = "Succesfully deleted account";
            showToast.value = true;
            setTimeout(() => {
              router.push("/login");
            }, 2000);
          })
          .catch((error) => {
            toastMessage.value =
              "Something went wrong. Try logging out and in again.";
            showToast.value = true;
          });
      } catch (error) {
        toastMessage.value =
          "Something went wrong. Try logging out and in again.";
        showToast.value = true;
      }
    },
  },
];

const isOpen = ref(false);

const showToast = ref(false);
const toastMessage = ref("");

const setOpen = (state) => {
  isOpen.value = state;
};

const handleSignOut = () => {
  try {
    signOut(getAuth())
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        toastMessage.value = "Something went wrong";
        showToast.value = true;
      });
  } catch (error) {
    toastMessage.value = "Something went wrong";
    showToast.value = true;
  }
};

const handlePwChange = () => {
  try {
    const email = getAuth().currentUser.email;
    if (!email) {
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
  } catch (error) {
    toastMessage.value = "Not logged in";
    showToast.value = true;
    return;
  }
};
</script>
