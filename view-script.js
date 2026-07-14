
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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
                    if (userRoleDisplay) userRoleDisplay.innerText = staffData.role || "Staff Member";
                    if (navAvatar) navAvatar.innerText = staffData.fullName.charAt(0).toUpperCase();
                });
            }
        } catch (error) {
            console.error("Database Fetch Error:", error);
        }
    } else {
        if (userNameDisplay) userNameDisplay.innerText = "System Admin";
        if (navAvatar) navAvatar.innerText = "S";
    }

    
    document.getElementById('dashboardLogoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = "login.html";
    });

    
    const tbody = document.getElementById('patientTableBody');
    const totalBadge = document.getElementById('totalPatientsBadge');

    function generateLocation(department, bedType, patientId) {
        let floor = "1st Floor";
        let roomPrefix = "GEN";

        if (department === "Cardiology") { floor = "4th Floor"; roomPrefix = "CAR"; }
        else if (department === "Neurology") { floor = "5th Floor"; roomPrefix = "NEU"; }
        else if (department === "Pediatrics") { floor = "2nd Floor"; roomPrefix = "PED"; }
        else if (department === "General") { floor = "3rd Floor"; roomPrefix = "GEN"; }

        if (bedType === "ICU Bed") roomPrefix = "ICU";
        else if (bedType === "Emergency Bed") { floor = "Ground Floor"; roomPrefix = "ER"; }

        const idNumber = parseInt(patientId.replace(/\D/g, '')) || 101;
        const roomNum = (idNumber % 40) + 1;
        const bedLetter = ["A", "B", "C", "D"][idNumber % 4];

        return `<strong>${floor}</strong><br><small>${roomPrefix}-${roomNum}, Bed ${bedLetter}</small>`;
    }

    function getPriorityTag(priority) {
        if (priority === "Critical") return `<span class="severity-badge critical"><i class="fa-solid fa-triangle-exclamation"></i> Critical</span>`;
        if (priority === "Emergency") return `<span class="severity-badge high"><i class="fa-solid fa-truck-fast"></i> Emergency</span>`;
        if (priority === "Serious") return `<span class="severity-badge high">Serious</span>`;
        return `<span class="severity-badge normal">Normal</span>`;
    }

    try {
        const q = query(collection(db, "patients"));
        const querySnapshot = await getDocs(q);

        tbody.innerHTML = '';
        let count = 0;

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No patients currently registered in the database.</td></tr>`;
            totalBadge.innerText = "0 Patients";
        } else {
            querySnapshot.forEach((doc) => {
                count++;
                const p = doc.data();

                const pId = p.patientId || `P-UNK${count}`;
                const age = p.age || '--';
                const gender = p.gender ? p.gender.charAt(0) : '-';
                const dept = p.department || 'General';
                const bedReq = p.bedRequirement || 'General Bed';

                const locationHtml = generateLocation(dept, bedReq, pId);
                const priorityHtml = getPriorityTag(p.priority || 'Normal');

                const tr = document.createElement('tr');
                tr.className = "patient-row";
                tr.innerHTML = `
                    <td>
                        <div class="patient-id-cell">
                            <strong>${p.fullName || 'Unknown Patient'}</strong>
                            <small>${pId} | ${age}Y, ${gender}</small>
                        </div>
                    </td>
                    <td class="contact-cell"><i class="fa-solid fa-phone"></i> ${p.phone || '--'}</td>
                    <td>
                        <div class="patient-id-cell">
                            <span class="disease-text">${p.disease || 'Undiagnosed'}</span>
                            <small>${dept} Dept.</small>
                        </div>
                    </td>
                    <td>${priorityHtml}</td>
                    <td class="location-cell">${locationHtml}</td>
                    <td><span class="status-badge ${p.status === 'Admitted' ? 'success' : 'pending'}">${p.status || 'Pending Allocation'}</span></td>
                `;
                tbody.appendChild(tr);
            });

            totalBadge.innerText = `${count} Active Patients`;
        }

    } catch (error) {
        console.error("Error fetching patients: ", error);
        tbody.innerHTML = `<tr><td colspan="6" class="error-state">Failed to connect to Secure Database. Check your internet or Firebase connection.</td></tr>`;
        totalBadge.innerText = "Connection Error";
    }

    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
        searchInput.addEventListener('keyup', function () {
            const filterText = this.value.toLowerCase();
            const rows = tbody.querySelectorAll('.patient-row');

            if (filterText.length > 0) clearSearchBtn.style.display = 'block';
            else clearSearchBtn.style.display = 'none';

            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                if (rowText.includes(filterText)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            const rows = tbody.querySelectorAll('.patient-row');
            rows.forEach(row => row.style.display = '');
        });
    }
});
