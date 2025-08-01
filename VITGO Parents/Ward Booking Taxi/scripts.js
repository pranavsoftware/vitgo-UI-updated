import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Function to display child details
async function displayChildDetails() {
    const user = auth.currentUser;
    if (user) {
        const parentQuery = query(collection(db, 'usersParent'), where("parentEmail", "==", user.email));
        const parentSnapshot = await getDocs(parentQuery);
        if (!parentSnapshot.empty) {
            const parentDoc = parentSnapshot.docs[0].data();
            const childUID = parentDoc.childUID;
            const childDocRef = doc(db, 'users', childUID);
            const childDoc = await getDoc(childDocRef);
            if (childDoc.exists()) {
                const childData = childDoc.data();
                document.getElementById('child-details').innerHTML = `
                    <div class="child">
                        <h4>Name: ${childData.name}</h4>
                        <p>Email: ${childData.email}</p>
                        <img src="${childData.faceScan}" alt="${childData.name}'s Face Scan" style="max-width: 200px;">
                    </div>
                `;
            } else {
                document.getElementById('child-details').innerHTML = '<p>No details found for this child.</p>';
            }
        } else {
            document.getElementById('child-details').innerHTML = '<p>No child associated with this parent.</p>';
        }
    } else {
        document.getElementById('child-details').innerHTML = '<p>Please log in to see your child\'s details.</p>';
    }
}

// Function to handle booking form submission
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const bookingData = {
        from: e.target.from.value,
        to: e.target.to.value,
        date: e.target.date.value,
        time: e.target.time.value,
        noOfStudents: parseInt(e.target.noOfStudents.value),
        car: e.target.car.value,
        paymentMode: e.target.paymentMode.value,
        message: e.target.message.value,
        timestamp: new Date().toISOString()
    };

    const user = auth.currentUser;
    if (user) {
        try {
            // Fetch parent document to get child UID
            const parentQuery = query(collection(db, "usersParent"), where("parentEmail", "==", user.email));
            const parentSnapshot = await getDocs(parentQuery);

            if (!parentSnapshot.empty) {
                const parentDoc = parentSnapshot.docs[0].data();
                const childUID = parentDoc.childUID;

                // Add childUID to booking data and save booking
                bookingData.userId = childUID;
                await addDoc(collection(db, "bookings"), bookingData);

                console.log("Booking saved successfully!");
                e.target.reset();
                showSuccessPopup(); // Show pop-up animation
                displayLatestBooking(); // Call to display latest booking
            } else {
                console.log("Parent document not found for parent email:", user.email);
                alert("Parent document not found! Please ensure the parent email matches the authenticated user’s email in Firestore.");
            }
        } catch (error) {
            console.error("Error in booking process:", error);
        }
    } else {
        alert("User not authenticated!");
    }
});

// Function to display the latest booking
async function displayLatestBooking() {
    const user = auth.currentUser;
    if (!user) {
        console.error("User is not authenticated.");
        return;
    }

    const bookingsRef = collection(db, "bookings");
    const latestBookingQuery = query(
        bookingsRef,
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(1)
    );

    try {
        const latestSnapshot = await getDocs(latestBookingQuery);
        const bookingDiv = document.getElementById("bookingDetails");

        if (!latestSnapshot.empty) {
            const booking = latestSnapshot.docs[0].data();
            const bookingId = latestSnapshot.docs[0].id;

            bookingDiv.innerHTML = `
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>From:</strong> ${booking.from}</p>
                <p><strong>To:</strong> ${booking.to}</p>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Car:</strong> ${booking.car}</p>
                <p><strong>Number of Students:</strong> ${booking.noOfStudents}</p>
                <p><strong>Payment Mode:</strong> ${booking.paymentMode}</p>
                <p><strong>Message:</strong> ${booking.message}</p>
            `;
        } else {
            bookingDiv.innerHTML = "<p>No bookings available.</p>";
        }
    } catch (error) {
        if (error.code === 'failed-precondition') {
            console.error("Query requires an index that is still building. Please check Firestore console.");
            alert("Your latest booking cannot be displayed yet. Please try again later.");
        } else {
            console.error("Error fetching latest booking:", error);
        }
    }
}

// Function to show a success pop-up animation
function showSuccessPopup() {
    const popup = document.createElement("div");
    popup.className = "success-popup";
    popup.textContent = "Booking successful!";
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add("visible");
    }, 100);

    setTimeout(() => {
        popup.classList.remove("visible");
        setTimeout(() => document.body.removeChild(popup), 500);
    }, 3000);
}

