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

// Enhanced form toggle functionality with loading states
document.getElementById("showLogin").addEventListener("click", () => {
    switchForm('login');
});

document.getElementById("showRegister").addEventListener("click", () => {
    switchForm('register');
});

function switchForm(formType) {
    const loginSection = document.getElementById("login-section");
    const registerSection = document.getElementById("registration-section");
    const loginBtn = document.getElementById("showLogin");
    const registerBtn = document.getElementById("showRegister");
    
    if (formType === 'login') {
        loginSection.classList.add("active");
        registerSection.classList.remove("active");
        loginBtn.classList.add("active");
        registerBtn.classList.remove("active");
    } else {
        registerSection.classList.add("active");
        loginSection.classList.remove("active");
        registerBtn.classList.add("active");
        loginBtn.classList.remove("active");
    }
}

// Enhanced notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notification-message");
    const notificationIcon = document.getElementById("notification-icon");
    
    // Set message and icon based on type
    notificationMessage.textContent = message;
    
    if (type === 'error') {
        notificationIcon.textContent = '⚠️';
        notification.classList.add('error');
    } else {
        notificationIcon.textContent = '✓';
        notification.classList.remove('error');
    }
    
    // Show notification with animation
    notification.classList.add("show");
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    const notification = document.getElementById("notification");
    notification.classList.remove("show");
}

// Close notification button functionality
document.getElementById("close-notification").addEventListener("click", hideNotification);

// Loading state management
function setLoadingState(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        button.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    } else {
        button.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

// Enhanced Login Form Submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const childUID = document.getElementById("childUID").value;

    // Validate inputs
    if (!email || !password || !childUID) {
        showNotification("Please fill in all fields", 'error');
        return;
    }

    setLoadingState(submitBtn, true);

    try {
        const uidDoc = doc(db, "usersParent", childUID);
        const uidSnapshot = await getDoc(uidDoc);

        if (uidSnapshot.exists()) {
            const userData = uidSnapshot.data();
            const storedEmail = userData.parentEmail;

            if (storedEmail === email) {
                await signInWithEmailAndPassword(auth, email, password);
                showNotification("Login successful! Redirecting...", 'success');
                
                // Smooth redirect with delay
                setTimeout(() => {
                    window.location.href = "../dashboard/index.html";
                }, 1500);
            } else {
                showNotification("Email does not match the registered account", 'error');
                setLoadingState(submitBtn, false);
            }
        } else {
            showNotification("No account found with this Child UID", 'error');
            setLoadingState(submitBtn, false);
        }
    } catch (error) {
        let errorMessage = "Login failed";
        
        // Handle specific Firebase errors
        if (error.code === 'auth/user-not-found') {
            errorMessage = "No account found with this email";
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = "Incorrect password";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Invalid email format";
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = "Too many failed attempts. Please try again later";
        }
        
        showNotification(errorMessage, 'error');
        setLoadingState(submitBtn, false);
    }
});

// Enhanced Registration Form Submission
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const parentName = document.getElementById("parentName").value;
    const parentPhone = document.getElementById("parentPhone").value;
    const parentEmail = document.getElementById("parentEmail").value;
    const parentPassword = document.getElementById("parentPassword").value;
    const childUID = document.getElementById("childUIDRegister").value;

    // Validate inputs
    if (!parentName || !parentPhone || !parentEmail || !parentPassword || !childUID) {
        showNotification("Please fill in all fields", 'error');
        return;
    }

    // Validate password strength
    if (parentPassword.length < 6) {
        showNotification("Password must be at least 6 characters long", 'error');
        return;
    }

    // Validate phone number format (basic)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(parentPhone.replace(/\D/g, ''))) {
        showNotification("Please enter a valid 10-digit phone number", 'error');
        return;
    }

    setLoadingState(submitBtn, true);

    try {
        const uidDoc = doc(db, "usersParent", childUID);
        const uidSnapshot = await getDoc(uidDoc);

        if (uidSnapshot.exists()) {
            showNotification("This Child UID is already registered", 'error');
            setLoadingState(submitBtn, false);
        } else {
            await createUserWithEmailAndPassword(auth, parentEmail, parentPassword);
            await setDoc(uidDoc, {
                parentName: parentName,
                parentPhone: parentPhone,
                parentEmail: parentEmail,
                childUID: childUID,
                createdAt: new Date().toISOString()
            });

            showNotification("Registration successful! Redirecting...", 'success');
            
            // Smooth redirect with delay
            setTimeout(() => {
                window.location.href = "../dashboard/index.html";
            }, 1500);
        }
    } catch (error) {
        let errorMessage = "Registration failed";
        
        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "An account with this email already exists";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Invalid email format";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "Password is too weak";
        }
        
        showNotification(errorMessage, 'error');
        setLoadingState(submitBtn, false);
    }
});

// Input validation and real-time feedback
document.addEventListener('DOMContentLoaded', () => {
    // Add input event listeners for real-time validation
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearValidationError);
    });
});

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    // Remove existing error styling
    input.classList.remove('error');
    
    // Email validation
    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            input.classList.add('error');
        }
    }
    
    // Password validation
    if (input.type === 'password' && value) {
        if (value.length < 6) {
            input.classList.add('error');
        }
    }
    
    // Phone validation
    if (input.type === 'tel' && value) {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
            input.classList.add('error');
        }
    }
}

function clearValidationError(e) {
    e.target.classList.remove('error');
}
