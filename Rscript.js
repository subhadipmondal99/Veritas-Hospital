// --- 1. IMPORT FIREBASE SDKS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// --- 2. FIREBASE CONFIGURATION ---
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

    // --- HELPER: Auto Generate Patient ID ---
    const patientIdInput = document.getElementById('patientId');
    function generatePatientId() {
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
        if (patientIdInput) patientIdInput.value = `P-${randomNum}`;
    }
    generatePatientId(); // Run on load

    /* ========================================================
       REGISTRATION PROGRESS & LIVE PREVIEW
       ======================================================== */
    const fullNameInput = document.getElementById('fullName');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const phoneInput = document.getElementById('phone');
    const diseaseInput = document.getElementById('disease');
    const deptSelect = document.getElementById('department');

    const priorityRadios = document.querySelectorAll('input[name="priority"]');
    const bedRadios = document.querySelectorAll('input[name="bedType"]');

    if (fullNameInput) {
        // Text animation helper
        function animateValue(targetId, newValue) {
            const targetEl = document.getElementById(targetId);
            if (targetEl.textContent !== newValue) {
                targetEl.textContent = newValue;
                targetEl.classList.remove('pop-anim');
                void targetEl.offsetWidth; // Force reflow
                targetEl.classList.add('pop-anim');
            }
        }

        // --- BULLETPROOF STEPPER LOGIC ---
        function checkFormProgress() {
            // Step 1 Check: Are all Personal Details filled?
            const sec1Filled = fullNameInput.value.trim() !== '' &&
                ageInput.value.trim() !== '' &&
                genderSelect.value !== '' &&
                phoneInput.value.trim() !== '';

            const step1 = document.getElementById('step1');

            if (sec1Filled) {
                step1.classList.add('completed');
                step1.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
            } else {
                step1.classList.remove('completed');
                step1.querySelector('.step-circle').innerHTML = '1';
            }

            // Step 2 Check: Are Medical Details filled?
            const priorityChecked = document.querySelector('input[name="priority"]:checked');
            const sec2Filled = diseaseInput.value.trim() !== '' &&
                deptSelect.value !== '' &&
                priorityChecked !== null;

            const step2 = document.getElementById('step2');
            const line1 = document.getElementById('line1');

            // Only unlock Step 2 if Step 1 is ALSO finished
            if (sec2Filled && sec1Filled) {
                step2.classList.add('completed');
                step2.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
                line1.classList.add('line-active');
            } else {
                step2.classList.remove('completed');
                step2.querySelector('.step-circle').innerHTML = '2';
                line1.classList.remove('line-active');
            }
        }

        // Attach listeners for preview and stepper to EVERYTHING
        const allInputs = [fullNameInput, ageInput, genderSelect, phoneInput, diseaseInput, deptSelect];
        allInputs.forEach(input => {
            input.addEventListener('input', checkFormProgress);
            input.addEventListener('change', checkFormProgress); // Catches dropdown selections
        });

        fullNameInput.addEventListener('input', (e) => animateValue('prevName', e.target.value || '--'));
        ageInput.addEventListener('input', (e) => animateValue('prevAge', e.target.value || '--'));
        genderSelect.addEventListener('change', (e) => animateValue('prevGender', e.target.value || '--'));
        diseaseInput.addEventListener('input', (e) => animateValue('prevDisease', e.target.value || '--'));

        priorityRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const val = e.target.value;
                const prevPriority = document.getElementById('prevPriority');
                prevPriority.textContent = val;
                prevPriority.className = `tag tag-${val} pop-anim`;
                checkFormProgress();
            });
        });

        bedRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const prevBed = document.getElementById('prevBed');
                prevBed.textContent = e.target.value;
                prevBed.className = 'tag tag-Bed pop-anim';

                // Light up Step 3
                document.getElementById('step3').classList.add('completed');
                document.getElementById('step3').querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
                document.getElementById('line2').classList.add('line-active');
            });
        });

        // Helper to Reset entirely
        function fullyResetForm() {
            document.getElementById('patientRegForm').reset();
            generatePatientId(); // Generate a new ID for the next patient

            ['prevName', 'prevAge', 'prevGender', 'prevDisease'].forEach(id => animateValue(id, '--'));

            const pPriority = document.getElementById('prevPriority');
            pPriority.className = 'tag tag-empty';
            pPriority.textContent = 'Not Selected';

            const pBed = document.getElementById('prevBed');
            pBed.className = 'tag tag-empty';
            pBed.textContent = 'Not Selected';

            document.querySelectorAll('.step').forEach(step => step.classList.remove('completed'));
            document.getElementById('step1').querySelector('.step-circle').innerHTML = '1';
            document.getElementById('step2').querySelector('.step-circle').innerHTML = '2';
            document.getElementById('step3').querySelector('.step-circle').innerHTML = '3';
            document.querySelectorAll('.step-line').forEach(line => line.classList.remove('line-active'));
        }

        // Attach to the Reset Button
        const resetBtn = document.getElementById('resetRegFormBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fullyResetForm();
            });
        }

        /* ========================================================
           FIREBASE DATABASE SUBMISSION LOGIC
           ======================================================== */
        const submitBtn = document.getElementById('submitRegBtn');
        const regToast = document.getElementById('regToast');
        const regToastMsg = document.getElementById('regToastMsg');

        document.getElementById('patientRegForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show Loading State
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';
            submitBtn.disabled = true;

            // Gather values securely
            const priorityInput = document.querySelector('input[name="priority"]:checked');
            const bedInput = document.querySelector('input[name="bedType"]:checked');
            const pName = fullNameInput.value;
            const pId = patientIdInput.value;

            // Build Data Object
            const patientData = {
                patientId: pId,
                fullName: pName,
                age: ageInput.value,
                gender: genderSelect.value,
                phone: phoneInput.value,
                disease: diseaseInput.value,
                department: deptSelect.value,
                doctorAssigned: document.getElementById('doctor').value || "Unassigned",
                priority: priorityInput ? priorityInput.value : "Normal",
                bedRequirement: bedInput ? bedInput.value : "General",
                admissionDate: document.getElementById('adminDate').value,
                arrivalTime: document.getElementById('adminTime').value,
                notes: document.getElementById('notes').value || "",
                status: "Pending Allocation",
                registeredAt: serverTimestamp() // Official Firebase time
            };

            try {
                // Send to Firebase "patients" collection
                await addDoc(collection(db, "patients"), patientData);

                // Show Success Toast
                regToastMsg.textContent = `${pName} (${pId}) has been successfully registered to the database.`;
                regToast.classList.add('show');

                // Hide Toast after 4 seconds
                setTimeout(() => { regToast.classList.remove('show'); }, 4000);

                // Clear the form
                fullyResetForm();

            } catch (error) {
                console.error("Firebase Error:", error);

                if (error.code === 'permission-denied') {
                    alert("FIREBASE ERROR: Permission Denied. You need to update your Firestore Security Rules to allow writes!");
                } else {
                    alert("CRITICAL ERROR: Could not save patient to database. Check your internet connection.");
                }
            } finally {
                // Restore Button
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});