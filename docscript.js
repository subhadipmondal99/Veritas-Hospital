document.addEventListener("DOMContentLoaded", () => {

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

    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    const filterBtns = document.querySelectorAll('.filter-btn');
    const doctorCards = document.querySelectorAll('.doc-card');

    if (filterBtns.length > 0 && doctorCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {

                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                doctorCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');

                    if (filterValue === 'all' || filterValue === cardCategory) {
                        card.classList.remove('hide');
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
