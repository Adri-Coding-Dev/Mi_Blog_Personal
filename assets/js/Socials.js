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

        // Video card click functionality
        

        // Newsletter subscription
        document.querySelector('button').addEventListener('click', function() {
            const email = document.querySelector('input[type="email"]').value;
            if (email && email.includes('@')) {
                alert(`✅ ¡Gracias por suscribirte!\n\nEmail: ${email}\n\n¡Recibirás contenido exclusivo pronto!`);
                document.querySelector('input[type="email"]').value = '';
            } else {
                alert('❌ Por favor, introduce un email válido');
            }
        });

        const videos = [
        {
            "title": "Personalización Kali-Linux AL COMPLETO",
            "date": "hace 1 mes",
            "views": "239 visualizaciones",
            "description": "Buenas a tod@s a un nuevo video, donde explicamos a detalle como instalar y personalizar kali linux en un entorno virtualizado.",
            "duration": "25:42",
            "tags": ["KaliLinux", "Sistema","Personalizacion"],
            "link": "https://www.youtube.com/watch?v=eyy8SxSaon0&t=1124s",
            "thumbnail": "https://img.youtube.com/vi/eyy8SxSaon0/mqdefault.jpg"
        },
        {
            "title": "¿Que asignaturas se dan en DAMP?",
            "date": "hace 1 dia",
            "views": "5 visualizaciones",
            "description": "Muy buenas y bienvenidos a un video donde explico las 6 asignaturas relacionadas con la informática que se da en el 1º Año del Grado Superior de DAMP",
            "duration": "13:29",
            "tags": ["DAMP", "Clases", "Asignaturas","Programacion"],
            "link": "https://www.youtube.com/watch?v=e9P9HiIgSRc&t=317s",
            "thumbnail": "https://img.youtube.com/vi/e9P9HiIgSRc/mqdefault.jpg"
        }
        ];

        function renderVideos() {
        const container = document.getElementById("videos-container");
        container.innerHTML = "";

        videos.forEach(video => {
            const tagsHTML = video.tags.map(tag => `<span class="video-tag">${tag}</span>`).join("");

            const card = `
            <div class="video-card">
                <div class="video-thumbnail" data-link="${video.link}">
                <img src="${video.thumbnail}" alt="${video.title}" style="width:100%; height:100%; object-fit:cover;">
                <div class="play-button">▶</div>
                <div class="video-duration">${video.duration}</div>
                </div>
                <div class="video-content">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-meta">
                    <span>${video.date}</span>
                    <span>${video.views}</span>
                </div>
                <p class="video-description">${video.description}</p>
                <div class="video-tags">${tagsHTML}</div>
                </div>
            </div>
            `;
            container.innerHTML += card;
        });

        // Reasignamos eventos a las miniaturas
        document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
            const link = this.getAttribute("data-link");
            window.open(link, "_blank"); // abre en nueva pestaña
            });
        });
        }

        renderVideos();

        // Simulate live status (changes every 30 seconds)
        setInterval(() => {
            const liveIndicator = document.querySelector('.live-indicator');
            if (liveIndicator) {
                const isLive = Math.random() > 0.7; // 30% chance of being live
                if (isLive) {
                    liveIndicator.textContent = '🔴 LIVE';
                    liveIndicator.style.background = '#ff0000';
                } else {
                    liveIndicator.textContent = '⚫ OFFLINE';
                    liveIndicator.style.background = '#666';
                }
            }
        }, 30000);

        // Add hover effects to feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.borderColor = 'var(--discord)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.borderColor = 'var(--border)';
            });
        });

        // Dynamic stats update
        function updateStats() {
            const stats = document.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const current = parseInt(stat.textContent.replace(/\D/g, ''));
                const increment = Math.floor(Math.random() * 5) + 1;
                const newValue = current + increment;
                
                if (stat.textContent.includes('K')) {
                    stat.textContent = (newValue / 1000).toFixed(1) + 'K+';
                } else {
                    stat.textContent = newValue + '+';
                }
            });
        }

        // Update stats every 2 minutes
        setInterval(updateStats, 120000);

        // Add entrance animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });