import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function fetchNotices() {
    const noticesList = document.getElementById('noticesList');

    const noticesQuery = query(collection(db, "notices"), orderBy("createdAt", "desc"));

    onSnapshot(noticesQuery, (querySnapshot) => {
        noticesList.innerHTML = '';

        if (querySnapshot.empty) {
            noticesList.innerHTML = '<p>No notices available.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const noticeData = doc.data();
                console.log("Notice data:", noticeData);

                if (noticeData.createdAt && noticeData.createdAt.seconds) {
                    const createdAtDate = new Date(noticeData.createdAt.seconds * 1000).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "full",
                        timeStyle: "short"
                    });

                    let editedAtDisplay = '';
                    if (noticeData.editedAt && noticeData.editedAt.seconds) {
                        const editedAtDate = new Date(noticeData.editedAt.seconds * 1000).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            dateStyle: "full",
                            timeStyle: "short"
                        });
                       // editedAtDisplay = `<div class="notice-edited">Last Edited: ${editedAtDate}</div>`;
                    }

                    const noticeItem = document.createElement('div');
                    noticeItem.classList.add('notice-item');
                    noticeItem.innerHTML = `
                        <div class="notice-text">${noticeData.text || 'No content available'}</div>
                        <div class="notice-postedBy">Posted By: ${noticeData.username || 'Unknown User'}</div>
                        <div class="notice-date">Posted On: ${createdAtDate}</div>
                        ${editedAtDisplay}
                    `;
                    noticesList.appendChild(noticeItem);
                } else {
                    console.error("Notice data is missing the createdAt field:", noticeData);

                    const noticeItem = document.createElement('div');
                    noticeItem.classList.add('notice-item', 'notice-incomplete');
                    noticeItem.innerHTML = `
                        <div class="notice-text">${noticeData.text || 'No content available'}</div>
                        <div class="notice-postedBy">Posted By: ${noticeData.username || 'Unknown User'}</div>
                        <div class="notice-date">Posted On: Date unavailable</div>
                        <div class="notice-error">⚠️ Missing timestamp data</div>
                    `;
                    noticesList.appendChild(noticeItem);
                }
            });
        }
    }, (error) => {
        console.error("Error fetching notices:", error);
        noticesList.innerHTML = '<p>Error loading notices. Please try again later.</p>';
    });
}

// Call the function to start fetching notices
fetchNotices();
