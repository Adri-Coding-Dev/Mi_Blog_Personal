const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                projectCards.forEach(card => {
                    if (filterValue === 'all') {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.6s ease forwards';
                    } else {
                        const cardCategory = card.getAttribute('data-category');
                        if (cardCategory === filterValue) {
                            card.style.display = 'block';
                            card.style.animation = 'fadeInUp 0.6s ease forwards';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });
        });

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll effect to navigation
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(13, 13, 20, 0.98)';
            } else {
                navbar.style.background = 'rgba(13, 13, 20, 0.95)';
            }
        });