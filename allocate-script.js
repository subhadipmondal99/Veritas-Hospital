// --- 1. IMPORT FIREBASE SDKS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// --- 2. FIREBASE CONFIGURATION ---
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

    // --- USER AUTHENTICATION ---
    const userNameDisplay = document.getElementById('loggedInUserName');
    const navAvatar = document.getElementById('navAvatar');
    const activeUserId = localStorage.getItem("activeVeritasUser");

    if (activeUserId) {
        try {
            const q = query(collection(db, "staff"), where("employeeId", "==", activeUserId));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (userNameDisplay) userNameDisplay.innerText = data.fullName;
                    if (navAvatar) navAvatar.innerText = data.fullName.charAt(0).toUpperCase();
                });
            }
        } catch (error) { console.error(error); }
    } else {
        if (userNameDisplay) userNameDisplay.innerText = "System Admin";
        if (navAvatar) navAvatar.innerText = "S";
    }

    document.getElementById('dashboardLogoutBtn').addEventListener('click', () => {
        localStorage.removeItem("activeVeritasUser");
        window.location.href = "login.html";
    });

    // --- ALGORITHM & UI VARIABLES ---
    const algoConsole = document.getElementById('algoConsole');
    const resultsList = document.getElementById('resultsList');
    const pendingCount = document.getElementById('pendingCount');
    const runBtn = document.getElementById('runAlgorithmBtn');

    // DEFINE HOSPITAL MAXIMUM CAPACITY
    const MAX_ICU = 5;
    const MAX_ER = 8;
    const MAX_GEN = 15;

    // --- LIVE DATABASE SYNC FUNCTION ---
    // This perfectly calculates available beds based on who is currently "Admitted"
    async function syncHospitalData() {
        try {
            // 1. Fetch all 'Pending' patients
            const qPending = query(collection(db, "patients"), where("status", "==", "Pending Allocation"));
            const pendingSnap = await getDocs(qPending);
            pendingCount.innerText = pendingSnap.size;

            // 2. Fetch all 'Admitted' patients to calculate occupied beds
            const qAdmitted = query(collection(db, "patients"), where("status", "==", "Admitted"));
            const admittedSnap = await getDocs(qAdmitted);

            let usedICU = 0, usedER = 0, usedGen = 0;

            admittedSnap.forEach(doc => {
                const p = doc.data();
                if (p.bedRequirement === "ICU Bed") usedICU++;
                else if (p.bedRequirement === "Emergency Bed") usedER++;
                else if (p.bedRequirement === "General Bed") usedGen++;
            });

            // 3. Calculate Available Beds (Max Capacity - Occupied Beds)
            const availICU = Math.max(0, MAX_ICU - usedICU);
            const availER = Math.max(0, MAX_ER - usedER);
            const availGen = Math.max(0, MAX_GEN - usedGen);

            // 4. Update the UI Counters
            document.getElementById('invICU').innerText = availICU;
            document.getElementById('invER').innerText = availER;
            document.getElementById('invGen').innerText = availGen;

            // Return current inventory for the algorithm to use
            return {
                "ICU Bed": availICU,
                "Emergency Bed": availER,
                "General Bed": availGen,
                "pendingSnapshot": pendingSnap
            };

        } catch (error) {
            console.error("Sync Error:", error);
            return null;
        }
    }

    // Sync on page load so numbers are immediately accurate!
    syncHospitalData();


    // --- TERMINAL LOGGER FUNCTION ---
    async function printToConsole(message, type = "info") {
        const p = document.createElement('p');
        p.className = `log-${type}`;

        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
        p.innerHTML = `<span class="timestamp">[${timeStr}]</span> ${message}`;

        algoConsole.appendChild(p);
        algoConsole.scrollTop = algoConsole.scrollHeight; // Auto-scroll down

        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Add to Results List UI
    function addResultUI(patientName, bedType, status, isSuccess) {
        const li = document.createElement('li');
        li.className = isSuccess ? 'res-success' : 'res-fail';
        li.innerHTML = `
            <div class="res-info">
                <strong>${patientName}</strong>
                <small>Req: ${bedType}</small>
            </div>
            <span class="res-badge">${status}</span>
        `;
        resultsList.prepend(li);
    }

    // --- CORE GREEDY ALGORITHM ---
    runBtn.addEventListener('click', async () => {
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> EXECUTING...';
        resultsList.innerHTML = '';

        await printToConsole("Initiating Greedy Bed Allocation protocol...", "system");
        await printToConsole("Syncing live inventory with Firebase Firestore...", "info");

        // Fetch fresh inventory and pending patients right before running
        const liveData = await syncHospitalData();

        if (!liveData || liveData.pendingSnapshot.empty) {
            await printToConsole("0 pending patients found. Algorithm terminated.", "warn");
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="fa-solid fa-microchip"></i> EXECUTE GREEDY ALGORITHM';
            return;
        }

        let liveInventory = {
            "ICU Bed": liveData["ICU Bed"],
            "Emergency Bed": liveData["Emergency Bed"],
            "General Bed": liveData["General Bed"]
        };

        let patients = [];
        liveData.pendingSnapshot.forEach(doc => {
            patients.push({ id: doc.id, ...doc.data() });
        });

        await printToConsole(`Fetched ${patients.length} unallocated patients. Applying Greedy Sorting weights...`, "info");

        // STEP 1: GREEDY SORTING (Priority Weights)
        const priorityWeights = {
            "Critical": 4,
            "Emergency": 3,
            "Serious": 2,
            "Normal": 1
        };

        patients.sort((a, b) => {
            const weightA = priorityWeights[a.priority] || 1;
            const weightB = priorityWeights[b.priority] || 1;

            if (weightA !== weightB) {
                return weightB - weightA; // Highest priority first
            }
            // If Priority is equal, fallback to Wait Time (FIFO)
            const timeA = a.registeredAt ? a.registeredAt.toMillis() : 0;
            const timeB = b.registeredAt ? b.registeredAt.toMillis() : 0;
            return timeA - timeB;
        });

        await printToConsole("Sorting complete. Highest priority patients elevated to top of queue.", "success");
        await printToConsole("Beginning Allocation Pass...", "system");

        // STEP 2: GREEDY ALLOCATION PASS
        let allocatedCount = 0;

        for (let i = 0; i < patients.length; i++) {
            const p = patients[i];
            await printToConsole(`Evaluating [${p.patientId}] ${p.fullName} (Priority: ${p.priority})`, "info");

            const reqBed = p.bedRequirement;

            // Greedily check if requested bed is available in our live inventory
            if (liveInventory[reqBed] > 0) {

                // Optimal choice made: Assign Bed
                liveInventory[reqBed] -= 1;
                allocatedCount++;

                // Instantly update the UI Inventory Counters to look cool during the loop
                if (reqBed === "ICU Bed") document.getElementById('invICU').innerText = liveInventory[reqBed];
                if (reqBed === "Emergency Bed") document.getElementById('invER').innerText = liveInventory[reqBed];
                if (reqBed === "General Bed") document.getElementById('invGen').innerText = liveInventory[reqBed];

                await printToConsole(`SUCCESS: ${reqBed} available. Assigning to ${p.patientId}.`, "success");
                addResultUI(p.fullName, reqBed, "Admitted", true);

                // Update Firebase Database: Change status from 'Pending Allocation' to 'Admitted'
                const patientRef = doc(db, "patients", p.id);
                await updateDoc(patientRef, { status: "Admitted" });

            } else {
                // Greedy failure: No beds of that type available
                await printToConsole(`FAILED: No ${reqBed} available for ${p.patientId}. Remained in Waitlist.`, "warn");
                addResultUI(p.fullName, reqBed, "Waitlisted", false);
            }
        }

        await printToConsole(`Algorithm Execution Complete. Successfully allocated ${allocatedCount}/${patients.length} patients.`, "system");

        // Final sync to ensure everything is perfectly aligned with Firebase
        await syncHospitalData();

        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> RE-RUN OPTIMIZER';
    });
});