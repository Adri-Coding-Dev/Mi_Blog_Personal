// Variables globales
let blogPosts = []; // Ahora se cargará desde blogs.json
let filteredPosts = [];
let currentSort = 'date-desc';

// Función para cargar los datos del blog
async function loadBlogData() {
    try {
        // Mostrar indicador de carga
        showLoadingIndicator();
        
        const response = await fetch('blogs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        blogPosts = await response.json();
        filteredPosts = [...blogPosts];
        
        // Ocultar loading y mostrar contenido
        hideLoadingIndicator();
        
        // Inicializar la página con los datos cargados
        initializePage();
        
    } catch (error) {
        console.error('Error cargando blogs:', error);
        showErrorMessage('Error al cargar los blogs. Verifica que el archivo blogs.json esté en la misma carpeta.');
    }
}

// Función para mostrar indicador de carga
function showLoadingIndicator() {
    const loadingHTML = `
        <div id="blogLoadingIndicator" style="
            text-align: center; 
            padding: 50px; 
            font-size: 1.2rem; 
            color: var(--secondary);
        ">
            <div style="margin-bottom: 15px;">⏳ Cargando blogs...</div>
            <div class="loading-spinner"></div>
        </div>
    `;
    
    // Insertar el loading al principio del main o donde corresponda
    const mainContent = document.querySelector('main') || document.body;
    mainContent.insertAdjacentHTML('afterbegin', loadingHTML);
}

// Función para ocultar indicador de carga
function hideLoadingIndicator() {
    const loadingElement = document.getElementById('blogLoadingIndicator');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Función para mostrar mensaje de error
function showErrorMessage(message) {
    hideLoadingIndicator();
    
    const errorHTML = `
        <div id="blogErrorMessage" style="
            text-align: center; 
            padding: 50px; 
            color: var(--danger);
            border: 1px solid var(--danger);
            border-radius: 8px;
            margin: 20px;
            background: rgba(220, 53, 69, 0.1);
        ">
            <h3>❌ Error al cargar el blog</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                margin-top: 15px;
                padding: 10px 20px;
                background: var(--danger);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">🔄 Intentar de nuevo</button>
        </div>
    `;
    
    const mainContent = document.querySelector('main') || document.body;
    mainContent.insertAdjacentHTML('afterbegin', errorHTML);
}

// Función para inicializar la página una vez cargados los datos
function initializePage() {
    renderBlogPosts(blogPosts);
    updateStats(blogPosts);
    setupFilters();
    setupModal();
    loadPreferences(); // Cargar preferencias guardadas
}

// Initialize page - MODIFICADO
document.addEventListener('DOMContentLoaded', function() {
    // Ahora llamamos a loadBlogData en lugar de inicializar directamente
    loadBlogData();
});

// Render blog posts
function renderBlogPosts(posts) {
    const grid = document.getElementById('blogGrid');
    const noResults = document.getElementById('noResults');
    
    if (!grid) {
        console.warn('No se encontró el elemento blogGrid');
        return;
    }
    
    if (posts.length === 0) {
        grid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    grid.innerHTML = posts.map(post => `
        <article class="blog-post ${post.featured ? 'featured' : ''}" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-info">
                    <div class="post-meta">
                        <span class="post-date">
                            📅 ${formatDate(post.date)}
                        </span>
                        <span class="post-category">${post.category}</span>
                        <span class="post-reading-time">⏱️ ${post.readingTime} min</span>
                    </div>
                    <h2 class="post-title" onclick="openBlogPost(${post.id})">${post.title}</h2>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="post-thumbnail">
                    ${post.thumbnail ? 
                        `<img src="${post.thumbnail}" alt="${post.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='📝';">` : 
                        getCategoryIcon(post.category)
                    }
                </div>
            </div>
            <div class="post-actions">
                <button class="btn-read" onclick="openBlogPost(${post.id})">
                    📖 Leer más
                </button>
                <button class="btn-share" onclick="sharePost(${post.id})">
                    🔗 Compartir
                </button>
            </div>
        </article>
    `).join('');
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'Día a día': '📔',
        'Tutorial': '🎓',
        'Reflexión': '🤔',
        'Reflexiones': '🤔',
        'CTF': '🏆',
        'Proyecto': '🚀',
        'Proyectos': '🚀',
        'Noticia': '📰',
        'Experiencias': '💭',
        'Consejos': '💡',
        'Recomendaciones': '⭐',
        'Curiosidades': '🎯',
        'Programación': '💻',
        'Ciberseguridad': '🔐',
        'Opiniones': '💬',
        'Historia personal': '👤',
        'Hábitos': '🎯'
    };
    return `<span style="font-size: 4rem;">${icons[category] || '📝'}</span>`;
}

// Format date
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Europe/Madrid'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Update statistics
function updateStats(posts) {
    const totalPostsEl = document.getElementById('totalPosts');
    const totalWordsEl = document.getElementById('totalWords');
    const totalCategoriesEl = document.getElementById('totalCategories');
    const avgReadTimeEl = document.getElementById('avgReadTime');
    
    if (totalPostsEl) totalPostsEl.textContent = posts.length;
    
    if (totalWordsEl) {
        const totalWords = posts.reduce((sum, post) => sum + post.wordCount, 0);
        totalWordsEl.textContent = totalWords.toLocaleString();
    }
    
    if (totalCategoriesEl) {
        const categories = [...new Set(posts.map(p => p.category))];
        totalCategoriesEl.textContent = categories.length;
    }
    
    if (avgReadTimeEl) {
        const avgReadTime = posts.reduce((sum, post) => sum + post.readingTime, 0) / posts.length;
        avgReadTimeEl.textContent = Math.round(avgReadTime);
    }
}

// Setup filters
function setupFilters() {
    const searchFilter = document.getElementById('searchFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortButtons = document.querySelectorAll('.sort-btn');

    if (searchFilter) {
        searchFilter.addEventListener('input', applyFilters);
        // Search functionality with Enter key
        searchFilter.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
        // Poblar categorías dinámicamente
        populateCategories();
    }

    sortButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            sortButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSort = this.dataset.sort;
            applyFilters();
        });
    });
}

// Poblar categorías dinámicamente
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter || blogPosts.length === 0) return;
    
    const categories = [...new Set(blogPosts.map(post => post.category))].sort();
    
    // Limpiar opciones existentes excepto la primera
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Agregar nuevas categorías
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Apply filters and sorting
function applyFilters() {
    const searchFilter = document.getElementById('searchFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    const searchValue = searchFilter ? searchFilter.value.toLowerCase() : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';

    filteredPosts = blogPosts.filter(post => {
        const matchesSearch = !searchValue || 
            post.title.toLowerCase().includes(searchValue) ||
            post.excerpt.toLowerCase().includes(searchValue) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchValue));
        
        const matchesCategory = !categoryValue || post.category === categoryValue;

        return matchesSearch && matchesCategory;
    });

    // Apply sorting
    filteredPosts.sort((a, b) => {
        switch(currentSort) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    renderBlogPosts(filteredPosts);
    updateStats(filteredPosts);
    savePreferences(); // Guardar preferencias
}

// Setup modal
function setupModal() {
    const modal = document.getElementById('blogModal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) {
        closeBtn.onclick = function() {
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Setup marked.js options
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight: function(code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {}
                }
                return code;
            },
            breaks: true,
            gfm: true
        });
    }
}

// Open blog post modal
async function openBlogPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    const modal = document.getElementById('blogModal');
    const modalTitle = document.getElementById('modalTitle');
    const content = document.getElementById('blogContent');
    
    if (!modal || !modalTitle || !content) {
        console.warn('No se encontraron elementos del modal');
        return;
    }
    
    modalTitle.textContent = post.title;
    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    try {
        const response = await fetch(post.content);
        if(!response.ok){
            throw new Error(`No se pudo cargar el archivo: ${post.content}`);
        }

        const markdownContent = await response.text();
        
        // Convert markdown to HTML
        const htmlContent = typeof marked !== 'undefined' ? marked.parse(markdownContent) : markdownContent.replace(/\n/g, '<br>');
        content.innerHTML = htmlContent;

        // Re-highlight code blocks if available
        if (typeof hljs !== 'undefined') {
            content.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

    } catch (error) {
        console.error('Error loading blog post:', error);
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--secondary);">
                <h3>❌ Error al cargar el post</h3>
                <p>No se pudo cargar el archivo: ${post.content}</p>
                <p>Verifica que el archivo existe en la carpeta correcta.</p>
            </div>
        `;
    }
}

// Share post function
function sharePost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    if (navigator.share) {
        navigator.share({
            title: post.title,
            text: post.excerpt,
            url: window.location.href + '#post-' + postId
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        const url = window.location.href + '#post-' + postId;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                alert('🔗 Enlace copiado al portapapeles');
            }).catch(() => {
                // Fallback para navegadores más antiguos
                prompt('Copia este enlace:', url);
            });
        } else {
            prompt('Copia este enlace:', url);
        }
    }
}

// Newsletter subscription
document.addEventListener('DOMContentLoaded', function() {
    const newsletterBtn = document.querySelector('.newsletter-btn');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function() {
            const emailInput = document.querySelector('.newsletter-input');
            const email = emailInput ? emailInput.value : '';
            
            if (email && email.includes('@')) {
                alert(`📧 ¡Gracias por suscribirte con ${email}! (Función de demo)`);
                if (emailInput) emailInput.value = '';
            } else {
                alert('❌ Por favor, introduce un email válido');
            }
        });
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('blogModal');
        if (modal && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    // Ctrl+F to focus on search
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchFilter = document.getElementById('searchFilter');
        if (searchFilter) searchFilter.focus();
    }
});

// Add smooth scrolling for navigation
document.addEventListener('DOMContentLoaded', function() {
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
});

// Add navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(13, 13, 20, 0.98)';
        } else {
            navbar.style.background = 'rgba(13, 13, 20, 0.95)';
        }
    }
});

// Auto-save and load preferences
function savePreferences() {
    const searchFilter = document.getElementById('searchFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    const preferences = {
        search: searchFilter ? searchFilter.value : '',
        category: categoryFilter ? categoryFilter.value : '',
        sort: currentSort
    };
    
    try {
        localStorage.setItem('blog_preferences', JSON.stringify(preferences));
    } catch (e) {
        // localStorage not available
        console.warn('No se pudieron guardar las preferencias');
    }
}

function loadPreferences() {
    try {
        const preferences = JSON.parse(localStorage.getItem('blog_preferences') || '{}');
        const searchFilter = document.getElementById('searchFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (searchFilter && preferences.search) {
            searchFilter.value = preferences.search;
        }
        
        if (categoryFilter && preferences.category) {
            categoryFilter.value = preferences.category;
        }
        
        if (preferences.sort) {
            document.querySelectorAll('.sort-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.sort === preferences.sort) {
                    btn.classList.add('active');
                    currentSort = preferences.sort;
                }
            });
        }
        
        // Aplicar filtros después de cargar preferencias
        setTimeout(applyFilters, 100);
        
    } catch (e) {
        console.warn('No se pudieron cargar las preferencias');
    }
}

// Social sharing in modal
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalTitle = document.getElementById('modalTitle');
            const title = modalTitle ? modalTitle.textContent : 'Blog Post';
            const url = window.location.href;
            
            if (this.title && this.title.includes('Twitter')) {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
            } else if (this.title && this.title.includes('LinkedIn')) {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
            } else if (this.title && this.title.includes('Copiar')) {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                        this.textContent = '✅';
                        setTimeout(() => this.textContent = '🔗', 2000);
                    });
                }
            }
        });
    });
});

// Función adicional para debugging
function debugBlogSystem() {
    console.log('Blog Posts:', blogPosts.length);
    console.log('Filtered Posts:', filteredPosts.length);
    console.log('Current Sort:', currentSort);
    console.log('Elements found:', {
        blogGrid: !!document.getElementById('blogGrid'),
        searchFilter: !!document.getElementById('searchFilter'),
        categoryFilter: !!document.getElementById('categoryFilter'),
        modal: !!document.getElementById('blogModal')
    });
}