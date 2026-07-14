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

    reveals.forEach(reveal => revealOnScroll.observe(reveal));

    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

});
