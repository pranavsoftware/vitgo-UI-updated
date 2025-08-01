import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore(app);

// Function to display booking details of the child
async function displayChildBookingDetails() {
    const user = auth.currentUser;
    if (user) {
        try {
            // Fetch the parent's data to retrieve childUID
            const parentRef = query(collection(db, 'usersParent'), where("parentEmail", "==", user.email));
            const parentSnapshot = await getDocs(parentRef);
            let childUID = null;

            // Retrieve the childUID from the parent's document
            parentSnapshot.forEach(doc => {
                childUID = doc.data().childUID;
            });

            if (childUID) {
                // Query the bookings collection for bookings with the childUID
                const bookingsRef = query(collection(db, 'bookings'), where("userId", "==", childUID));
                const bookingsSnapshot = await getDocs(bookingsRef);

                if (!bookingsSnapshot.empty) {
                    let bookingDetailsHTML = '';
                    bookingsSnapshot.forEach(doc => {
                        const bookingData = doc.data();
                        bookingDetailsHTML += `
                            <div class="booking">
        <h4>Booking ID: ${doc.id}</h4>
        <p><strong>Cab Name:</strong> ${bookingData.cabName}</p>
        <p><strong>Car:</strong> ${bookingData.car}</p>
        <p><strong>Amount:</strong> ₹${bookingData.amount}</p>
        <p><strong>From:</strong> ${bookingData.from}</p>
        <p><strong>To:</strong> ${bookingData.to}</p>
        <p><strong>Date:</strong> ${bookingData.date}</p>
        <p><strong>Time:</strong> ${bookingData.time}</p>
        <p><strong>Estimated Pickup Time:</strong> ${bookingData.estimatedPickTime}</p>
        <p><strong>No. of Students:</strong> ${bookingData.noOfStudents}</p>
        <p><strong>Payment Mode:</strong> ${bookingData.paymentMode}</p>
        <p><strong>Driver Name:</strong> ${bookingData.driverName}</p>
        <p><strong>Driver Phone:</strong> ${bookingData.driverPhone}</p>
        <p><strong>Taxi Number:</strong> ${bookingData.taxiNumber}</p>
        <p><strong>Driver Message:</strong> ${bookingData.driverMessage}</p>
        <p><strong>Message:</strong> ${bookingData.message}</p>
        <p><strong>Timestamp:</strong> ${new Date(bookingData.timestamp).toLocaleString()}</p>
    </div>
`;
                    });
                    document.getElementById('booking-details').innerHTML = bookingDetailsHTML;
                } else {
                    document.getElementById('booking-details').innerHTML = '<p>No bookings found for this child.</p>';
                }
            } else {
                document.getElementById('booking-details').innerHTML = '<p>No child associated with this parent.</p>';
            }
        } catch (error) {
            console.error("Error fetching child booking details:", error);
            document.getElementById('booking-details').innerHTML = '<p>Failed to retrieve booking details. Please try again later.</p>';
        }
    } else {
        document.getElementById('booking-details').innerHTML = '<p>Please log in to see your child\'s booking details.</p>';
    }
}

// Call the function to display booking details when the user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayChildBookingDetails();
    } else {
        // If the user is not authenticated, redirect them to the login page
        window.location.href = '/VITGO Parents/Login Page/index.html';
    }
});