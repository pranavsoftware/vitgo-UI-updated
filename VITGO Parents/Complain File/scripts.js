import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

// Complaint Form Submission
const complaintForm = document.getElementById("complaint-form");
complaintForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const parentName = document.getElementById("parentName").value;
    const complaintType = document.getElementById("complaintType").value;
    const driverName = document.getElementById("driverName").value;
    const taxiNumber = document.getElementById("taxiNumber").value;
    const driverMobile = document.getElementById("driverMobile").value;
    const complaintDetails = document.getElementById("complaintDetails").value;

    // Get the current user's UID
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to submit a complaint.");
        return;
    }

    const childUID = user.uid; // UID of the currently authenticated user (child)

    try {
        // Create a new collection with the child's UID as the document ID
        const complaintRef = doc(db, "complaints", childUID); // Use the UID as the document ID
        await setDoc(complaintRef, {
            parentName,
            complaintType,
            driverName,
            taxiNumber,
            driverMobile,
            complaintDetails,
            timestamp: new Date(),
        });

        alert("Thank you for submitting the form. We will work on this complaint.");
        complaintForm.reset();
    } catch (error) {
        console.error("Error submitting complaint:", error);
        alert("Failed to submit complaint. Please try again.");
    }
});

// Complaint History Retrieval
const historyButton = document.getElementById("view-history");
const historyList = document.getElementById("history-list");

historyButton.addEventListener("click", async () => {
    historyList.innerHTML = "<p>Loading...</p>";
    try {
        const user = auth.currentUser;
        if (!user) {
            historyList.innerHTML = "<p>Please log in to view your complaint history.</p>";
            return;
        }

        const childUID = user.uid; // UID of the currently authenticated user (child)
        const complaintRef = doc(db, "complaints", childUID); // Use the child's UID as the document ID
        const docSnapshot = await getDoc(complaintRef);

        if (!docSnapshot.exists()) {
            historyList.innerHTML = "<p>No complaints found.</p>";
            return;
        }

        const data = docSnapshot.data();
        const timestamp = data.timestamp?.toDate() || "N/A"; // Convert Firestore Timestamp to JavaScript Date
        const formattedDate = timestamp !== "N/A" ? new Date(timestamp).toLocaleString() : "N/A";

        historyList.innerHTML = `
            <ul>
                <li>
                    <strong>Complaint Type:</strong> ${data.complaintType}<br>
                    <strong>Driver Name:</strong> ${data.driverName}<br>
                    <strong>Taxi Number:</strong> ${data.taxiNumber}<br>
                    <strong>Driver Mobile:</strong> ${data.driverMobile}<br>
                    <strong>Details:</strong> ${data.complaintDetails}<br>
                    <strong>Date:</strong> ${formattedDate}
                </li>
            </ul>
        `;
    } catch (error) {
        console.error("Error fetching complaints:", error);
        historyList.innerHTML = "<p>Failed to load complaints. Please try again later.</p>";
    }
});

// Authentication Check
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/VITGO Parents/Login Page/index.html';
    }
});
