import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import router from './router';

import { IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonicVue, IonImg, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import { addIcons } from 'ionicons';
import { cafe, cloudyNight, location, searchOutline, settingsOutline, stopwatch, sunny } from 'ionicons/icons';

addIcons({
  'search-outline': searchOutline,
  'settings-outline': settingsOutline,
  'location': location,
  'cloudy-night': cloudyNight,
  'stopwatch': stopwatch,
  'cafe': cafe,
  'sunny': sunny
})

const app = createApp(App)
  .use(IonicVue)
  .use(router);

  app.component('ion-page', IonPage);
  app.component('ion-title', IonTitle);
  app.component('ion-card-title', IonCardTitle);
  app.component('ion-back-button', IonBackButton);
  app.component('ion-content', IonContent);
  app.component('ion-grid', IonGrid);
  app.component('ion-row', IonRow);
  app.component('ion-col', IonCol);
  app.component('ion-icon', IonIcon);
  app.component('ion-buttons', IonButtons);
  app.component('ion-button', IonButton);
  app.component('ion-card', IonCard);
  app.component('ion-card-content', IonCardContent);
  app.component('ion-toolbar', IonToolbar);
  app.component('ion-header', IonHeader);
  app.component('ion-card-cubtitle', IonCardSubtitle);
  app.component('ion-card-header', IonCardHeader);
  app.component('ion-img', IonImg);
  app.component('ion-avatar', IonAvatar);

router.isReady().then(() => {
  app.mount('#app');
});
