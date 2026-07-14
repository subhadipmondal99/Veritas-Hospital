document.addEventListener("DOMContentLoaded", () => {

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

    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const dotsContainer = document.querySelector('.slider-dots');

    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

  
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');

            dot.addEventListener('click', () => {
                goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.dot');

        function goToSlide(index) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');

            currentSlide = index;

            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');

            resetInterval();
        }

        function nextSlide() {
            let index = currentSlide + 1;
            if (index >= slides.length) index = 0;
            goToSlide(index);
        }

        function prevSlide() {
            let index = currentSlide - 1;
            if (index < 0) index = slides.length - 1;
            goToSlide(index);
        }

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 6500);
        }

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        resetInterval();
    }

    
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
});
