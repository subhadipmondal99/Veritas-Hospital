// --- 1. IMPORT FIREBASE SDKS ---
import { initializeApp } from "https:
import { getFirestore, collection, query, where, getDocs } from "https:

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

const DOCTORS = [
    { id: "DOC-001", name: "Dr. Arindam Sen", dept: "Cardiology", ext: "Ext. 401", status: "on-duty" },
    { id: "DOC-002", name: "Dr. Sumita Banerjee", dept: "Neurology", ext: "Ext. 502", status: "in-surgery" },
    { id: "DOC-003", name: "Dr. Rajesh Kumar", dept: "Orthopedics", ext: "Ext. 211", status: "on-duty" },
    { id: "DOC-004", name: "Dr. Anjali Mitra", dept: "Pediatrics", ext: "Ext. 305", status: "on-break" },
    { id: "DOC-005", name: "Dr. Vikram Singh", dept: "Cardiology", ext: "Ext. 405", status: "on-duty" },
    { id: "DOC-006", name: "Dr. Neha Sharma", dept: "Pediatrics", ext: "Ext. 308", status: "in-surgery" },
    { id: "DOC-007", name: "Dr. Siddhartha Roy", dept: "Oncology", ext: "Ext. 601", status: "on-duty" },
    { id: "DOC-008", name: "Dr. Priya Desai", dept: "Neurology", ext: "Ext. 505", status: "on-duty" },
    { id: "DOC-009", name: "Dr. Amit Patel", dept: "Orthopedics", ext: "Ext. 215", status: "off-duty" },
    { id: "DOC-010", name: "Dr. Sunita Roy", dept: "General Surgery", ext: "Ext. 101", status: "in-surgery" },
    { id: "DOC-011", name: "Dr. Kabir Ahmed", dept: "Emergency", ext: "Ext. 100", status: "on-duty" },
    { id: "DOC-012", name: "Dr. Meera Iyer", dept: "Radiology", ext: "Ext. 620", status: "on-duty" },
    { id: "DOC-013", name: "Dr. Tanvir Alam", dept: "General Surgery", ext: "Ext. 108", status: "on-break" },
    { id: "DOC-014", name: "Dr. Ishita Chowdhury", dept: "Oncology", ext: "Ext. 605", status: "off-duty" },
    { id: "DOC-015", name: "Dr. Farhan Chaudhury", dept: "Cardiology", ext: "Ext. 410", status: "on-duty" }
];

const STATUS_META = {
    "on-duty": { label: "On Duty", class: "on-duty" },
    "in-surgery": { label: "In Surgery", class: "in-surgery" },
    "on-break": { label: "On Break", class: "on-break" },
    "off-duty": { label: "Off Duty", class: "off-duty" }
};

const ALLOC_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STANDARD_ALLOC_MINUTES = [45, 50, 42, 60, 55, 30, 25];
const GREEDY_ALLOC_MINUTES = [12, 15, 10, 18, 14, 8, 7];

function computeAverageMinutesSaved() {
    const totalStandard = STANDARD_ALLOC_MINUTES.reduce((sum, m) => sum + m, 0);
    const totalGreedy = GREEDY_ALLOC_MINUTES.reduce((sum, m) => sum + m, 0);
    const totalSaved = totalStandard - totalGreedy;
    return Math.round(totalSaved / STANDARD_ALLOC_MINUTES.length);
}

function updateMinutesSavedStat() {
    const el = document.getElementById("minutesSavedStat");
    if (!el) return;
    const avgSaved = computeAverageMinutesSaved();
    el.textContent = `${avgSaved} Minutes Saved (avg/day)`;
}

function statusBadgeHTML(status) {
    const meta = STATUS_META[status] || STATUS_META["off-duty"];
    return `<span class="status-badge ${meta.class}"><i class="status-dot"></i>${meta.label}</span>`;
}

function doctorRowHTML(doc) {
    return `<tr>
        <td>${doc.id}</td>
        <td><strong>${doc.name}</strong></td>
        <td>${doc.dept}</td>
        <td>${doc.ext}</td>
        <td>${statusBadgeHTML(doc.status)}</td>
    </tr>`;
}

function renderDashboardDoctorTable() {
    const tbody = document.getElementById("presentDoctorsBody");
    if (!tbody) return;
    const top10 = DOCTORS.slice(0, 10);
    tbody.innerHTML = top10.map(doctorRowHTML).join("");
}

function renderFullDoctorList(statusFilter = "all", deptFilter = "all") {
    const tbody = document.getElementById("fullDoctorListBody");
    if (!tbody) return;

    const rows = DOCTORS.filter(doc => {
        const statusMatch = statusFilter === "all" || doc.status === statusFilter;
        const deptMatch = deptFilter === "all" || doc.dept === deptFilter;
        return statusMatch && deptMatch;
    });

    tbody.innerHTML = rows.length
        ? rows.map(doctorRowHTML).join("")
        : `<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">No doctors match this filter.</td></tr>`;

    const countEl = document.getElementById("doctorResultCount");
    if (countEl) countEl.textContent = rows.length;
}

function populateDeptFilter() {
    const select = document.getElementById("deptFilterSelect");
    if (!select) return;
    const depts = [...new Set(DOCTORS.map(d => d.dept))].sort();
    depts.forEach(dept => {
        const opt = document.createElement("option");
        opt.value = dept;
        opt.textContent = dept;
        select.appendChild(opt);
    });
}

function updateOnDutyCount() {
    const el = document.getElementById("onDutyCount");
    if (!el) return;
    const onDuty = DOCTORS.filter(d => d.status === "on-duty" || d.status === "in-surgery").length;
    el.textContent = onDuty;
}

document.addEventListener("DOMContentLoaded", async () => {

    renderDashboardDoctorTable();
    updateOnDutyCount();
    updateMinutesSavedStat();

    if (document.getElementById("fullDoctorListBody")) {
        populateDeptFilter();
        renderFullDoctorList();

        let activeStatus = "all";
        let activeDept = "all";

        document.querySelectorAll(".roster-filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".roster-filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeStatus = btn.getAttribute("data-status");
                renderFullDoctorList(activeStatus, activeDept);
            });
        });

        document.getElementById("deptFilterSelect")?.addEventListener("change", (e) => {
            activeDept = e.target.value;
            renderFullDoctorList(activeStatus, activeDept);
        });
    }

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
            } else {
                if (userNameDisplay) userNameDisplay.innerText = "Authorized User";
            }
        } catch (error) {
            console.error("Database Fetch Error:", error);
            if (userNameDisplay) userNameDisplay.innerText = "Authorized User";
        }
    } else {
        if (userNameDisplay) userNameDisplay.innerText = "System Admin";
        if (navAvatar) navAvatar.innerText = "S";
    }

    const dashLogout = document.getElementById('dashboardLogoutBtn');
    if (dashLogout) {
        dashLogout.addEventListener('click', () => {
            localStorage.removeItem("activeVeritasUser");
            window.location.href = "login.html";
        });
    }

    const reportModal = document.getElementById('reportModal');
    const openReportBtn = document.getElementById('openReportBtn');
    const closeReportBtn = document.getElementById('closeReportBtn');

    if (openReportBtn && reportModal) {
        openReportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            updateMinutesSavedStat();
            reportModal.style.display = 'flex';
        });
    }

    if (closeReportBtn && reportModal) {
        closeReportBtn.addEventListener('click', () => {
            reportModal.style.display = 'none';
        });
    }

    reportModal?.addEventListener('click', (e) => {
        if (e.target === reportModal) reportModal.style.display = 'none';
    });

    const ctxPie = document.getElementById('bedPieChart');
    if (ctxPie) {
        new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Occupied (ICU)', 'Occupied (General)', 'Available'],
                datasets: [{
                    data: [35, 53, 12],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 0,
                    hoverOffset: 5
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '75%',
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    const ctxBar = document.getElementById('efficiencyBarChart');
    if (ctxBar) {
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ALLOC_DAYS,
                datasets: [
                    { label: 'Standard Alloc (mins)', data: STANDARD_ALLOC_MINUTES, backgroundColor: '#cbd5e1', borderRadius: 6 },
                    { label: 'Greedy Alg (mins)', data: GREEDY_ALLOC_MINUTES, backgroundColor: '#00a8b5', borderRadius: 6 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } },
                plugins: { legend: { position: 'top' } }
            }
        });
    }

    const occupiedElem = document.getElementById('occupiedBedsCount');
    const emptyElem = document.getElementById('emptyBedsCount');

    if (occupiedElem && emptyElem) {
        setInterval(() => {
            let currentOccupied = parseInt(occupiedElem.innerText);
            let currentEmpty = parseInt(emptyElem.innerText);
            const randomEvent = Math.floor(Math.random() * 3);

            if (randomEvent === 0 && currentEmpty > 0) {
                currentOccupied++; currentEmpty--;
            } else if (randomEvent === 1 && currentOccupied > 0) {
                currentOccupied--; currentEmpty++;
            }

            occupiedElem.innerText = currentOccupied;
            emptyElem.innerText = currentEmpty;

            if (randomEvent !== 2) {
                occupiedElem.style.color = "#00a8b5";
                setTimeout(() => { occupiedElem.style.color = "#0f172a"; }, 500);
            }
        }, 3500);
    }
});
