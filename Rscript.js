import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {

    const patientIdInput = document.getElementById('patientId');
    function generatePatientId() {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        if (patientIdInput) patientIdInput.value = `P-${randomNum}`;
    }
    generatePatientId();

    const fullNameInput = document.getElementById('fullName');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const phoneInput = document.getElementById('phone');
    const diseaseInput = document.getElementById('disease');
    const deptSelect = document.getElementById('department');

    const priorityRadios = document.querySelectorAll('input[name="priority"]');
    const bedRadios = document.querySelectorAll('input[name="bedType"]');

    if (fullNameInput) {
        function animateValue(targetId, newValue) {
            const targetEl = document.getElementById(targetId);
            if (targetEl.textContent !== newValue) {
                targetEl.textContent = newValue;
                targetEl.classList.remove('pop-anim');
                void targetEl.offsetWidth;
                targetEl.classList.add('pop-anim');
            }
        }

        function checkFormProgress() {
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

            const priorityChecked = document.querySelector('input[name="priority"]:checked');
            const sec2Filled = diseaseInput.value.trim() !== '' &&
                deptSelect.value !== '' &&
                priorityChecked !== null;

            const step2 = document.getElementById('step2');
            const line1 = document.getElementById('line1');

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

        const allInputs = [fullNameInput, ageInput, genderSelect, phoneInput, diseaseInput, deptSelect];
        allInputs.forEach(input => {
            input.addEventListener('input', checkFormProgress);
            input.addEventListener('change', checkFormProgress);
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

                document.getElementById('step3').classList.add('completed');
                document.getElementById('step3').querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
                document.getElementById('line2').classList.add('line-active');
            });
        });

        function fullyResetForm() {
            document.getElementById('patientRegForm').reset();
            generatePatientId();

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


        const resetBtn = document.getElementById('resetRegFormBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fullyResetForm();
            });
        }

        const submitBtn = document.getElementById('submitRegBtn');
        const regToast = document.getElementById('regToast');
        const regToastMsg = document.getElementById('regToastMsg');

        document.getElementById('patientRegForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';
            submitBtn.disabled = true;

            const priorityInput = document.querySelector('input[name="priority"]:checked');
            const bedInput = document.querySelector('input[name="bedType"]:checked');
            const pName = fullNameInput.value;
            const pId = patientIdInput.value;

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
                registeredAt: serverTimestamp()
            };

            try {
                await addDoc(collection(db, "patients"), patientData);

                regToastMsg.textContent = `${pName} (${pId}) has been successfully registered to the database.`;
                regToast.classList.add('show');

                setTimeout(() => { regToast.classList.remove('show'); }, 4000);

                fullyResetForm();

            } catch (error) {
                console.error("Firebase Error:", error);

                if (error.code === 'permission-denied') {
                    alert("FIREBASE ERROR: Permission Denied. You need to update your Firestore Security Rules to allow writes!");
                } else {
                    alert("CRITICAL ERROR: Could not save patient to database. Check your internet connection.");
                }
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});
