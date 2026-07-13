document.addEventListener("DOMContentLoaded", () => {

    /* ========================================================
       1. GLOBAL SCROLL REVEAL
       ======================================================== */
    const reveals = document.querySelectorAll('.reveal');
    let delayCounter = 0;

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, delayCounter * 150);

                delayCounter++;
                setTimeout(() => { delayCounter = 0; }, 500);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (reveals.length > 0) {
        reveals.forEach(reveal => revealOnScroll.observe(reveal));
    }

    /* ========================================================
       2. PREMIUM NAVBAR SHADOW ON SCROLL
       ======================================================== */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    /* ========================================================
       3. DOCTORS DIRECTORY FILTER (Premium Smooth Filter)
       ======================================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const doctorCards = document.querySelectorAll('.doc-card');

    if (filterBtns.length > 0 && doctorCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {

                // Manage Button Active State
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                // Filter Cards Safely with animation reset
                doctorCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');

                    if (filterValue === 'all' || filterValue === cardCategory) {
                        card.classList.remove('hide');
                        // Quick animation re-trigger for smooth pop-in
                        card.classList.remove('active');
                        setTimeout(() => card.classList.add('active'), 20);
                    } else {
                        card.classList.add('hide');
                    }
                });
            });
        });
    }
});