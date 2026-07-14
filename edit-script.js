import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB2prg8KE4NY6R-kTo8zLjPHrdrBgF22rQ",
    authDomain: "verites-hospital.firebaseapp.com",
    projectId: "verites-hospital",
    storageBucket: "verites-hospital.firebasestorage.app",
    messagingSenderId: "458115728730",
    appId: "1:458115728730:web:e8470d1e8ab84c3a015f63"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {

    const userNameDisplay = document.getElementById('loggedInUserName');
    const userRoleDisplay = document.getElementById('loggedInUserRole');
    const navAvatar = document.getElementById('navAvatar');

    const activeUserId = localStorage.getItem("activeVeritasUser");

    if (activeUserId) {
        try {
            const q = query(collection(db, "staff"), where("employeeId", "==", activeUserId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const staffData = doc.data();
                    if (userNameDisplay) userNameDisplay.innerText = staffData.fullName;
                    if (userRoleDisplay) userRoleDisplay.innerText = staffData.role;
                    if (navAvatar) navAvatar.innerText = staffData.fullName.charAt(0).toUpperCase();
                });
            } else {
                if (userNameDisplay) userNameDisplay.innerText = "User Data Missing";
            }
        } catch (error) {
            console.error("Database Fetch Error:", error);
            if (userNameDisplay) userNameDisplay.innerText = "DB Connection Error";
        }
    } else {
        if (userNameDisplay) userNameDisplay.innerText = "System Admin (Test)";
        if (navAvatar) navAvatar.innerText = "S";
    }

    document.getElementById('dashboardLogoutBtn').addEventListener('click', () => {
        localStorage.removeItem("activeVeritasUser");
        window.location.href = "login.html";
    });
    const patientList = document.getElementById('patientSelectList');
    const searchInput = document.getElementById('editSearchInput');
    const editForm = document.getElementById('editPatientForm');
    const noSelectionState = document.getElementById('noSelectionState');
    let currentFirebaseDocId = null;

    function showToast(title, message, isError = false) {
        const toast = document.getElementById('unifiedToast');
        document.getElementById('toastTitle').innerText = title;
        document.getElementById('toastMsg').innerText = message;

        const icon = document.getElementById('toastIcon');
        if (isError) {
            toast.style.borderLeftColor = '#ef4444';
            icon.className = 'fa-solid fa-circle-exclamation';
            icon.style.color = '#ef4444';
        } else {
            toast.style.borderLeftColor = '#10b981';
            icon.className = 'fa-solid fa-circle-check';
            icon.style.color = '#10b981';
        }

        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 4000);
    }
    async function loadPatients() {
        try {
            const q = query(collection(db, "patients"));
            const snapshot = await getDocs(q);

            patientList.innerHTML = '';

            if (snapshot.empty) {
                patientList.innerHTML = `<li class="loading-list-item">No active patients found.</li>`;
                return;
            }

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const li = document.createElement('li');
                li.className = 'patient-select-item';
                li.innerHTML = `
                    <div class="item-name">${data.fullName || "Unknown"}</div>
                    <div class="item-details">${data.patientId || "N/A"} | ${data.department || "General"}</div>
                `;

                li.addEventListener('click', () => {
                    document.querySelectorAll('.patient-select-item').forEach(el => el.classList.remove('active'));
                    li.classList.add('active');
                    openEditForm(docSnap.id, data);
                });

                patientList.appendChild(li);
            });
        } catch (error) {
            console.error("Fetch Error:", error);
            patientList.innerHTML = `<li class="loading-list-item" style="color:#ef4444;">Database Connection Error</li>`;
        }
    }

    searchInput.addEventListener('keyup', (e) => {
        const filter = e.target.value.toLowerCase();
        const items = patientList.querySelectorAll('.patient-select-item');

        items.forEach(item => {
            if (item.textContent.toLowerCase().includes(filter)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    function openEditForm(firebaseDocId, patientData) {
        currentFirebaseDocId = firebaseDocId;
        noSelectionState.style.display = 'none';
        editForm.style.display = 'block';

        document.getElementById('editDisplayId').innerText = `ID: ${patientData.patientId || 'N/A'}`;
        document.getElementById('editName').value = patientData.fullName || '';
        document.getElementById('editAge').value = patientData.age || '';
        document.getElementById('editPhone').value = patientData.phone || '';
        document.getElementById('editDisease').value = patientData.disease || '';

        if (patientData.department) document.getElementById('editDept').value = patientData.department;
        if (patientData.doctorAssigned) document.getElementById('editDoctor').value = patientData.doctorAssigned;
        if (patientData.priority) document.getElementById('editPriority').value = patientData.priority;
        if (patientData.bedRequirement) document.getElementById('editBed').value = patientData.bedRequirement;
    }

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('saveEditBtn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        btn.disabled = true;

        const updatedData = {
            fullName: document.getElementById('editName').value,
            age: document.getElementById('editAge').value,
            phone: document.getElementById('editPhone').value,
            disease: document.getElementById('editDisease').value,
            department: document.getElementById('editDept').value,
            doctorAssigned: document.getElementById('editDoctor').value,
            priority: document.getElementById('editPriority').value,
            bedRequirement: document.getElementById('editBed').value
        };

        try {
            const patientRef = doc(db, "patients", currentFirebaseDocId);
            await updateDoc(patientRef, updatedData);

            showToast("Update Successful", `${updatedData.fullName}'s medical records have been updated.`);
            await loadPatients();

        } catch (error) {
            console.error("Update Error:", error);
            showToast("System Error", "Could not save changes to the database. Please check your connection.", true);
        } finally {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    });

    const confirmModal = document.getElementById('confirmModal');
    const cancelDischargeBtn = document.getElementById('cancelDischargeBtn');
    const proceedDischargeBtn = document.getElementById('proceedDischargeBtn');
    const confirmPatientName = document.getElementById('confirmPatientName');

    document.getElementById('dischargeBtn').addEventListener('click', () => {
        const patientName = document.getElementById('editName').value;
        confirmPatientName.innerText = patientName;
        confirmModal.style.display = 'flex';
    });

    cancelDischargeBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
    });

    proceedDischargeBtn.addEventListener('click', async () => {
        confirmModal.style.display = 'none';

        if (currentFirebaseDocId) {
            const btn = document.getElementById('dischargeBtn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;

            try {
                const patientRef = doc(db, "patients", currentFirebaseDocId);
                const patientName = document.getElementById('editName').value;

                await deleteDoc(patientRef);

                showToast("Patient Discharged", `${patientName} has been successfully cleared from the database.`);

                editForm.style.display = 'none';
                noSelectionState.style.display = 'flex';
                currentFirebaseDocId = null;

                await loadPatients();

            } catch (error) {
                console.error("Delete Error:", error);
                showToast("System Error", "Failed to discharge the patient. Ensure you have proper permissions.", true);
            } finally {
                btn.innerHTML = '<i class="fa-solid fa-user-minus"></i> Discharge Patient';
                btn.disabled = false;
            }
        }
    });

    loadPatients();
});
