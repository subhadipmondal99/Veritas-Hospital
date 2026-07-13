// --- IMPORT FIREBASE SDKS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyB2prg8KE4NY6R-kTo8zLjPHrdrBgF22rQ",
    authDomain: "verites-hospital.firebaseapp.com",
    projectId: "verites-hospital",
    storageBucket: "verites-hospital.firebasestorage.app",
    messagingSenderId: "458115728730",
    appId: "1:458115728730:web:e8470d1e8ab84c3a015f63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. SUPER ADMIN LOGIN LOGIC ---
    const loginOverlay = document.getElementById('adminLoginOverlay');
    const adminDashboard = document.getElementById('adminDashboard');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminError = document.getElementById('adminError');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('adminId').value;
            const pass = document.getElementById('adminPass').value;

            // Authentication Check
            if (id === 'i am subhadip' && pass === '321intel') {
                const btn = adminLoginForm.querySelector('button');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Decrypting Protocol...';

                setTimeout(() => {
                    loginOverlay.style.opacity = '0';
                    setTimeout(() => {
                        loginOverlay.style.display = 'none';
                        adminDashboard.style.display = 'flex';
                    }, 400);
                }, 1000);
            } else {
                adminError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ACCESS DENIED: Invalid Master Credentials.';
            }
        });
    }

    // Logout Logic
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            adminDashboard.style.display = 'none';
            loginOverlay.style.display = 'flex';
            setTimeout(() => { loginOverlay.style.opacity = '1'; }, 10);
            adminLoginForm.reset();
            adminError.innerHTML = '';
            adminLoginForm.querySelector('button').innerHTML = 'Authenticate Session <i class="fa-solid fa-arrow-right-to-bracket"></i>';
        });
    }

    // --- 2. DATABASE PROVISIONING LOGIC (FIRESTORE) ---
    const addStaffForm = document.getElementById('addStaffForm');
    const saveStaffBtn = document.getElementById('saveStaffBtn');
    const saToast = document.getElementById('saToast');
    const saToastMsg = document.getElementById('saToastMsg');
    const activityList = document.getElementById('activityList');

    if (addStaffForm) {
        addStaffForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const originalBtnText = saveStaffBtn.innerHTML;
            saveStaffBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Encrypting & Provisioning...';
            saveStaffBtn.disabled = true;

            const name = document.getElementById('staffName').value;
            const empId = document.getElementById('staffEmpId').value;
            const role = document.getElementById('staffRole').value;
            const dept = document.getElementById('staffDept').value;

            const staffData = {
                fullName: name,
                employeeId: empId,
                email: document.getElementById('staffEmail').value,
                password: document.getElementById('staffPass').value,
                role: role,
                department: dept,
                createdAt: serverTimestamp()
            };

            try {
                // IMPORTANT: Adding data to Firebase
                await addDoc(collection(db, "staff"), staffData);

                // Show Fixed Toast Notification
                saToastMsg.textContent = `${name} (${empId}) has been securely added to the system.`;
                saToast.classList.add('show');
                setTimeout(() => { saToast.classList.remove('show'); }, 4000);

                // Update "Recent Activity" UI dynamically
                const newLi = document.createElement('li');
                newLi.innerHTML = `
                    <div class="act-icon new-icon"><i class="fa-solid fa-user-check"></i></div>
                    <div class="act-details">
                        <p><strong>${name}</strong> added to ${dept}</p>
                        <span>Just now</span>
                    </div>
                `;
                activityList.prepend(newLi);
                addStaffForm.reset();

            } catch (error) {
                console.error("Firebase Error Detail: ", error);

                // BUG CATCHER: Tell you if Firebase Rules are blocking it
                if (error.code === 'permission-denied') {
                    alert("FIREBASE ERROR: Permission Denied. You need to update your Firestore Security Rules in the Firebase Console to allow writes!");
                } else {
                    alert("CRITICAL ERROR: Failed to connect to secure server. Check console.");
                }
            } finally {
                saveStaffBtn.innerHTML = originalBtnText;
                saveStaffBtn.disabled = false;
            }
        });
    }
});