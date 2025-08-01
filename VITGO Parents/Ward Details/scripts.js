import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

// Function to display child details
async function displayChildDetails() {
    const user = auth.currentUser;
    if (user) {
        const parentDoc = await getDocs(collection(db, 'usersParent'));
        let childUID = null;

        // Find the child's UID based on the logged-in parent's email
        parentDoc.forEach((doc) => {
            const parentData = doc.data();
            if (parentData.parentEmail === user.email) {
                childUID = parentData.childUID;
            }
        });

        if (childUID) {
            const childDocRef = doc(db, 'users', childUID);
            const childDoc = await getDoc(childDocRef);
            if (childDoc.exists()) {
                const childData = childDoc.data();
                document.getElementById('child-details').innerHTML = `
                    <div class="child">
                    <img src="${childData.faceScan}" alt="${childData.name}'s Face Scan" style="max-width: 200px;">
                        <h4>Name: ${childData.name}</h4>
                        <p>Email: ${childData.email}</p>
                        <p>Phone: ${childData.mobile}</p>
                        <p>Parents Email ID: ${childData.parentEmail}</p>
                        <p></p>Parent Mobile No: ${childData.parentsMobile}</p>
                        <p></p>hostelBlock: ${childData.hostelBlock}</p>
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

// Call the function to display child details when the user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayChildDetails();
    }
});

