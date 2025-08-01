import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Form toggle functionality
document.getElementById("showLogin").addEventListener("click", () => {
    document.getElementById("login-section").classList.add("active");
    document.getElementById("registration-section").classList.remove("active");
    document.getElementById("showLogin").classList.add("active");
    document.getElementById("showRegister").classList.remove("active");
});

document.getElementById("showRegister").addEventListener("click", () => {
    document.getElementById("registration-section").classList.add("active");
    document.getElementById("login-section").classList.remove("active");
    document.getElementById("showRegister").classList.add("active");
    document.getElementById("showLogin").classList.remove("active");
});

// Function to show notification
function showNotification(message) {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notification-message");
    notificationMessage.innerText = message;
    notification.classList.remove("hidden");
    setTimeout(() => {
        notification.classList.add("hidden");
    }, 3000); // Auto-hide after 3 seconds
}

// Close notification button functionality
document.getElementById("close-notification").addEventListener("click", () => {
    document.getElementById("notification").classList.add("hidden");
});

// Login Form Submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const childUID = document.getElementById("childUID").value;

    try {
        const uidDoc = doc(db, "usersParent", childUID);
        const uidSnapshot = await getDoc(uidDoc);

        if (uidSnapshot.exists()) {
            const userData = uidSnapshot.data();
            const storedEmail = userData.parentEmail;

            if (storedEmail === email) {
                await signInWithEmailAndPassword(auth, email, password);
                showNotification("Login successful!");
                window.location.href = "../dashboard/index.html";
            } else {
                showNotification("Login failed: Email does not match the registered account.");
            }
        } else {
            showNotification("Login failed: No user found with the provided Child UID.");
        }
    } catch (error) {
        showNotification("Login failed: " + error.message);
    }
});

// Registration Form Submission
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parentName = document.getElementById("parentName").value;
    const parentPhone = document.getElementById("parentPhone").value;
    const parentEmail = document.getElementById("parentEmail").value;
    const parentPassword = document.getElementById("parentPassword").value;
    const childUID = document.getElementById("childUIDRegister").value;

    // Disable button to prevent multiple submissions
    const registerButton = e.target.querySelector("button[type='submit']");
    registerButton.disabled = true;

    if (!childUID) {
        showNotification("Child UID cannot be empty.");
        registerButton.disabled = false;
        return;
    }

    const uidDoc = doc(db, "usersParent", childUID);
    const uidSnapshot = await getDoc(uidDoc);

    if (uidSnapshot.exists()) {
        showNotification("This Child UID is already registered.");
        registerButton.disabled = false;
    } else {
        try {
            await createUserWithEmailAndPassword(auth, parentEmail, parentPassword);
            await setDoc(uidDoc, {
                parentName: parentName,
                parentPhone: parentPhone,
                parentEmail: parentEmail,
                childUID: childUID
            });

            showNotification("Registration successful!");
            window.location.href = "../dashboard/index.html";
        } catch (error) {
            showNotification("Registration failed: " + error.message);
            registerButton.disabled = false;
        }
    }
});
