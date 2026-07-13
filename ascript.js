document.addEventListener("DOMContentLoaded", () => {

    /* ========================================================
       1. GLOBAL SCROLL REVEAL (Homepage & Sub-pages)
       ======================================================== */
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(reveal => revealOnScroll.observe(reveal));

    /* ========================================================
       2. NAVBAR SHADOW ON SCROLL
       ======================================================== */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    /* ========================================================
       3. LOGIN PAGE PASSWORD TOGGLE (login.html)
       ======================================================== */
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

    // Simulate Login Form submission
    const corpLoginForm = document.getElementById('corpLoginForm');
    if (corpLoginForm) {
        corpLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = corpLoginForm.querySelector('.corp-submit-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
            setTimeout(() => {
                window.location.href = "register.html";
            }, 1000);
        });
    }

    /* ========================================================
       4. REGISTRATION PROGRESS & LIVE PREVIEW (register.html)
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

        // Stepper checking logic
        function checkFormProgress() {
            // Step 1: Personal
            const sec1Filled = fullNameInput.value && ageInput.value && genderSelect.value && phoneInput.value;
            const step1 = document.getElementById('step1');
            if (sec1Filled) {
                step1.classList.add('completed');
                step1.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
            } else {
                step1.classList.remove('completed');
                step1.querySelector('.step-circle').innerHTML = '1';
            }

            // Step 2: Medical & Priority
            const priorityChecked = document.querySelector('input[name="priority"]:checked');
            const sec2Filled = diseaseInput.value && deptSelect.value && priorityChecked;
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

        // Attach listeners for preview and stepper
        [fullNameInput, ageInput, genderSelect, phoneInput, diseaseInput, deptSelect].forEach(input => {
            input.addEventListener('input', () => checkFormProgress());
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

        // Form Submit
        document.getElementById('patientRegForm').addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Patient Successfully Registered to Veritas Hospital System!");
            e.target.reset();

            // Reset Preview Card
            ['prevName', 'prevAge', 'prevGender', 'prevDisease'].forEach(id => animateValue(id, '--'));
            document.getElementById('prevPriority').className = 'tag tag-empty';
            document.getElementById('prevPriority').textContent = 'Not Selected';
            document.getElementById('prevBed').className = 'tag tag-empty';
            document.getElementById('prevBed').textContent = 'Not Selected';

            // Reset Stepper
            document.querySelectorAll('.step').forEach(step => step.classList.remove('completed'));
            document.getElementById('step1').querySelector('.step-circle').innerHTML = '1';
            document.getElementById('step2').querySelector('.step-circle').innerHTML = '2';
            document.getElementById('step3').querySelector('.step-circle').innerHTML = '3';
            document.querySelectorAll('.step-line').forEach(line => line.classList.remove('line-active'));
        });
    }
});