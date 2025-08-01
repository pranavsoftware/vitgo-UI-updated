import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, getDocs, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

// Show loading state for user name
function showLoadingState() {
    const userName = document.getElementById('userName');
    userName.textContent = 'Loading...';
    userName.style.opacity = '0.7';
}

// Show username and handle logout
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

showLoadingState();

onAuthStateChanged(auth, user => {
    if (user) {
        const parentDocRef = collection(db, 'usersParent');
        getDocs(parentDocRef).then((snapshot) => {
            let userFound = false;
            snapshot.forEach(doc => {
                if (doc.data().parentEmail === user.email) {
                    userName.textContent = doc.data().parentName || 'Parent User';
                    userName.style.opacity = '1';
                    userFound = true;
                }
            });
            if (!userFound) {
                userName.textContent = 'Parent User';
                userName.style.opacity = '1';
            }
        }).catch(() => {
            userName.textContent = 'Parent User';
            userName.style.opacity = '1';
        });
    } else {
        window.location.href = '../Login Page/index.html';
    }
});

logoutBtn.addEventListener('click', () => {
    // Add loading state to logout button
    const originalText = logoutBtn.innerHTML;
    logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing Out...';
    logoutBtn.disabled = true;
    
    signOut(auth).then(() => {
        window.location.href = '../Login Page/index.html';
    }).catch(() => {
        // Restore button if there's an error
        logoutBtn.innerHTML = originalText;
        logoutBtn.disabled = false;
    });
});

// Enhanced notice loading with better UI
function showNoticeLoadingState() {
    const noticeContainer = document.getElementById('noticeContainer');
    noticeContainer.innerHTML = `
        <div class="notice-item">
            <div class="notice-text">📢 Loading latest notices...</div>
            <div class="notice-postedBy">VITGO System</div>
            <div class="notice-date">Please wait</div>
        </div>
    `;
}

// Fetch and display notices with real-time updates
const noticeContainer = document.getElementById('noticeContainer');

async function loadNotices() {
    showNoticeLoadingState();
    
    try {
        const noticesQuery = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        
        onSnapshot(noticesQuery, (querySnapshot) => {
            noticeContainer.innerHTML = '';

            if (querySnapshot.empty) {
                noticeContainer.innerHTML = `
                    <div class="notice-item">
                        <div class="notice-text">📋 No notices available at the moment.</div>
                        <div class="notice-postedBy">VITGO System</div>
                        <div class="notice-date">Check back later for updates</div>
                    </div>
                `;
            } else {
                querySnapshot.forEach((doc, index) => {
                    const noticeData = doc.data();
                    const noticeElement = document.createElement('div');
                    noticeElement.classList.add('notice-item');
                    
                    // Add staggered animation
                    noticeElement.style.opacity = '0';
                    noticeElement.style.transform = 'translateY(20px)';
                    noticeElement.style.transition = 'all 0.6s ease';
                    
                    setTimeout(() => {
                        noticeElement.style.opacity = '1';
                        noticeElement.style.transform = 'translateY(0)';
                    }, index * 100);

                    if (noticeData.createdAt && noticeData.createdAt.seconds) {
                        const createdAtDate = new Date(noticeData.createdAt.seconds * 1000).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            dateStyle: "full",
                            timeStyle: "short"
                        });

                        noticeElement.innerHTML = `
                            <div class="notice-text">${noticeData.text || 'No content available'}</div>
                            <div class="notice-postedBy">👤 Posted By: ${noticeData.username || 'Unknown User'}</div>
                            <div class="notice-date">📅 Posted On: ${createdAtDate}</div>
                        `;
                    } else {
                        noticeElement.classList.add('notice-incomplete');
                        noticeElement.innerHTML = `
                            <div class="notice-text">${noticeData.text || 'No content available'}</div>
                            <div class="notice-postedBy">👤 Posted By: ${noticeData.username || 'Unknown User'}</div>
                            <div class="notice-date">📅 Posted On: Date unavailable</div>
                            <div class="notice-error">⚠️ Missing timestamp data</div>
                        `;
                    }
                    
                    noticeContainer.appendChild(noticeElement);
                });
            }
        });
    } catch (error) {
        console.error("Error loading notices:", error);
        noticeContainer.innerHTML = `
            <div class="notice-item notice-incomplete">
                <div class="notice-text">❌ Error loading notices. Please check your connection and try again.</div>
                <div class="notice-postedBy">VITGO System</div>
                <div class="notice-date">Connection Error</div>
            </div>
        `;
    }
}

loadNotices();

// Enhanced UI interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add loading states to action buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.id !== 'logoutBtn') { // Don't modify logout button
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                this.style.pointerEvents = 'none';
                
                // Restore original state after navigation
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.pointerEvents = 'auto';
                }, 2000);
            }
        });
    });
});

