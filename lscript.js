
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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

    const empIdInput = document.getElementById('employeeId');
    if (empIdInput) {
        empIdInput.addEventListener('input', function () {
           
            this.value = this.value.replace(/\D/g, '');
        });
    }

    const toggleBtn = document.getElementById('toggleBtn');
    const passwordInput = document.getElementById('password');

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = toggleBtn.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    const corpLoginForm = document.getElementById('corpLoginForm');
    const loginError = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginSubmitBtn');

    if (corpLoginForm) {
        corpLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            loginError.classList.remove('show');
            loginError.textContent = "";

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying Credentials...';
            submitBtn.disabled = true;

            const enteredId = document.getElementById('employeeId').value.trim();
            const enteredPass = document.getElementById('password').value.trim();

            try {
                const q = query(collection(db, "staff"), where("employeeId", "==", enteredId));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    loginError.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Invalid Employee ID. Please contact Super Admin.';
                    loginError.classList.add('show');
                } else {
                    let userFound = false;

                    querySnapshot.forEach((doc) => {
                        const staffData = doc.data();

                        if (staffData.password === enteredPass) {
                            
                            userFound = true;

                            localStorage.setItem("activeVeritasUser", staffData.employeeId);

                            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Access Granted';
                            submitBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
                            submitBtn.style.boxShadow = "0 10px 20px rgba(16, 185, 129, 0.3)";

                            setTimeout(() => {
                                window.location.href = "dashbord.html";
                            }, 1000);
                        }
                    });

                    if (!userFound) {
                        loginError.innerHTML = '<i class="fa-solid fa-lock"></i> Incorrect Password. Try again.';
                        loginError.classList.add('show');
                    }
                }
            } catch (error) {
                console.error("Login Error:", error);
                loginError.innerHTML = "Database connection failed. Check your internet or Firebase Rules.";
                loginError.classList.add('show');
            } finally {
                if (loginError.textContent !== "") {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});
