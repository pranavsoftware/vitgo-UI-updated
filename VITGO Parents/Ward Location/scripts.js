import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

// OpenCage API Key (replace with your actual key)
const openCageApiKey = "5121470f5b734f968aa3b2894d664a74";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Map and UI Initialization using Leaflet
let map;
const initMap = (lat, lon) => {
    map = L.map("map").setView([lat, lon], 14); // Initialize map at the given lat, lon

    // Use OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a marker at the location
    L.marker([lat, lon]).addTo(map).bindPopup("Child's Location").openPopup();
};

// Fetch Address Using OpenCage API
const fetchAddressFromCoordinates = async (lat, lon) => {
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${openCageApiKey}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].formatted; // Return the formatted address
        }
        console.error("No address found for the given coordinates.");
        return "Address not found";
    } catch (error) {
        console.error("Error fetching address from OpenCage:", error);
        return "Address not found";
    }
};

// Find the Child UID Based on Parent's Email
const fetchChildUID = async (parentEmail) => {
    const usersParentRef = collection(db, "usersParent");
    const querySnapshot = await getDocs(usersParentRef);

    for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (data.parentEmail === parentEmail) {
            return docSnapshot.id; // Return the document ID (child UID)
        }
    }

    console.error("No child linked to this parent email.");
    return null;
};

// Fetch Child's Location
const fetchChildLocation = async (childUID) => {
    const locationRef = doc(db, "child_locations", childUID);
    const locationDoc = await getDoc(locationRef);

    if (locationDoc.exists()) {
        const data = locationDoc.data();
        const { lat, lon } = data.location;
        const timestamp = new Date(data.timestamp).toLocaleString();

        // Fetch address from coordinates
        const address = await fetchAddressFromCoordinates(lat, lon);

        // Update UI
        document.getElementById("latitude").innerText = `Latitude: ${lat}`;
        document.getElementById("longitude").innerText = `Longitude: ${lon}`;
        document.getElementById("address").innerText = `Address: ${address}`;
        document.getElementById("timestamp").innerText = `Last Updated: ${timestamp}`;

        initMap(lat, lon);
    } else {
        console.error("No location data found for this child.");
    }
};

// Authenticate Parent and Fetch Child's Location
onAuthStateChanged(auth, async (parentUser) => {
    if (parentUser) {
        const parentEmail = parentUser.email; // Get the parent's email
        const childUID = await fetchChildUID(parentEmail); // Get child's UID based on parent's email

        if (childUID) {
            fetchChildLocation(childUID); // Fetch location using child's UID
        } else {
            console.error("No child UID linked to this parent.");
        }
    } else {
        window.location.href = '/VITGO Parents/Login Page/index.html';
    }
});
