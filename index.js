// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import {
  getAuth,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  orderBy,
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  query,
} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');
const username = document.getElementById('name');
const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

let rsvpListener = null;
let guestbookListener = null;

let db, auth;

async function main() {
  // Add Firebase project configuration object here
  const firebaseConfig = {
    apiKey: 'AIzaSyB6OdzUOiaEch8RJtCsFArUXn9aHoZPQZE',
    authDomain: 'meet-up-30714.firebaseapp.com',
    projectId: 'meet-up-30714',
    storageBucket: 'meet-up-30714.appspot.com',
    messagingSenderId: '587591399325',
    appId: '1:587591399325:web:06962bdaa3e262ba1ba174',
    measurementId: 'G-7D000QMKYE',
  };

  try {
    if (firebaseConfig && firebaseConfig.apiKey) {
      initializeApp(firebaseConfig);
    }
    auth = getAuth();
  } catch (e) {
    console.log('error:', e);
  }

  db = getFirestore();

  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // Handle sign-in.

        // Return false to avoid redirect.
        return false;
      },
    },
  };

  // Initialize the FirebaseUI widget using Firebase
  const ui = new firebaseui.auth.AuthUI(getAuth());

  // Listen to RSVP button clicks
  startRsvpButton.addEventListener('click', () => {
    if (auth.currentUser) {
      // User is signed in; allows user to sign out
      signOut(auth);
    } else {
      // No user is signed in; allows user to sign in
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  // Listen to the current Auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT';
      guestbook.style.display = 'block';
      username.textContent = `(icon) userName : ${auth.currentUser.displayName}`;
      suscribe()
    } else {
      startRsvpButton.innerHTML = 'Sign-in';
      guestbook.style.display = 'none';
      username.textContent = 'Sign in to chat';
      unsuscribe()
    }
  });

  form.addEventListener('submit', (e) => {
    // Prevent the default form redirect
    // e.preventDefault();
    // Write a new message to the database collection "guestbook"
    addDoc(collection(db, 'guestbook'), {
      text: input.value,
      timestamp: Date.now(),
      name: auth.currentUser.displayName,
      userId: auth.currentUser.uid,
    });
    // clear message input field
    input.value = '';
    // Return false to avoid redirect
    return false;
  });

  function  suscribe(){
  const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
  guestbookListener = onSnapshot(q, (snaps) => {
    // Reset page
    guestbook.innerHTML = '';
    // Loop through documents in database
    snaps.forEach((doc) => {
      // Create an HTML entry for each document and add it to the chat
      const entry = document.createElement('p');
      entry.textContent = doc.data().name + ': ' + doc.data().text;
      guestbook.appendChild(entry);
    });
  });
}

function  unsuscribe () {

  if(guestbookListener != null){
   guestbookListener()
  guestbookListener=null
  }
}

}
main();
