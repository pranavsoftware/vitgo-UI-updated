import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Show username and handle logout
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
onAuthStateChanged(auth, user => {
    if (user) {
        const parentDocRef = collection(db, 'usersParent');
        getDocs(parentDocRef).then((snapshot) => {
            snapshot.forEach(doc => {
                if (doc.data().parentEmail === user.email) {
                    userName.textContent = doc.data().parentName;
                }
            });
        });
    } else {
        window.location.href = '/VITGO Parents/Login Page/index.html';
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '/VITGO Parents/Login Page/index.html';

    });
});

// Fetch and display notices
const noticeContainer = document.getElementById('noticeContainer');
async function loadNotices() {
    const noticesRef = collection(db, "VITian Notice");
    const noticesSnapshot = await getDocs(noticesRef);
    noticeContainer.innerHTML = '';

    noticesSnapshot.forEach(doc => {
        const noticeData = doc.data();
        const noticeElement = document.createElement('div');
        noticeElement.classList.add('notice');

        noticeElement.innerHTML = `
            <h3>${noticeData.title}</h3>
            <p>${noticeData.content}</p>
            <p><em>Posted by: ${noticeData.postedBy}</em></p>
            <small>${new Date(noticeData.createdAt.seconds * 1000).toLocaleString()}</small>
        `;
        noticeContainer.appendChild(noticeElement);
    });
}

loadNotices();

// Toggle sidebar for mobile view
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('show');
});

