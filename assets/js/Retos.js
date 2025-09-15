// Variables globales
        let challenges = [];
        let filteredChallenges = [];
        let displayedChallenges = [];
        let currentPage = 0;
        const ITEMS_PER_PAGE = 10;
        let isLoading = false;
        let currentCategory = "todas";
        let searchTerm = "";
        let searchTimeout = null;

        // Configuración de categorías
        const categoryConfig = {
            "todas": { name: "Todas", color: "var(--accent)" },
            "bucles_condicionales": { name: "Bucles/Condicionales", color: "#ff6600" },
            "cadenas": { name: "Cadenas", color: "var(--success)" },
            "matematicas": { name: "Matemáticas", color: "var(--warning)" },
            "ordenamiento": { name: "Ordenamiento", color: "var(--secondary)" },
            "variables_operadores": { name: "Variables/Operadores", color: "var(--accent)" },
            "busqueda": { name: "Búsqueda", color: "#ff0066" },
            "Fácil":{name: "Fácil", color: "#26ff00ff"},
            "Medio":{name: "Medio", color: "#eaff00ff"},
            "Dificil":{name: "Dificil", color: "#b700ffff"}
        };

        // Cargar datos al inicio
        async function loadData() {
            try {
                // Cargar datos desde el archivo JSON
                const response = await fetch('ejercicios.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Mezclar aleatoriamente el array sin modificar el JSON original
                const shuffled = [...data].sort(() => Math.random() - 0.5);

                // Guardamos en challenges el array desordenado
                challenges = shuffled;

                // Ocultar loading y mostrar contenido
                document.getElementById('loadingIndicator').classList.add('hidden');
                document.getElementById('controlsSection').style.display = 'flex';
                document.getElementById('statsSection').style.display = 'grid';

                initializePage();
            } catch (error) {
                console.error('Error cargando ejercicios:', error);
                document.getElementById('loadingIndicator').innerHTML = `
                    <div style="color: var(--danger);">❌ ERROR AL CARGAR EJERCICIOS</div>
                    <div style="font-size: 0.9rem; margin-top: 10px; opacity: 0.7;">
                        Verifica que el archivo ejercicios.json esté en la misma carpeta
                    </div>
                `;
            }
        }


        function initializePage() {
            renderCategoryFilters();
            setupSearch();
            setupInfiniteScroll();
            resetAndRenderChallenges();
        }

        function renderCategoryFilters() {
            const filtersContainer = document.getElementById('categoryFilters');
            
            // Obtener categorías únicas de los challenges
            const categories = ["todas", ...new Set(challenges.map(c => c.category))];
            
            filtersContainer.innerHTML = categories.map(category => {
                const config = categoryConfig[category] || { name: category, color: "var(--border)" };
                return `
                    <button class="category-btn ${category === currentCategory ? 'active' : ''}" 
                            onclick="filterByCategory('${category}')">
                        ${config.name}
                    </button>
                `;
            }).join('');
        }

        function filterByCategory(category) {
            currentCategory = category;
            renderCategoryFilters();
            resetAndRenderChallenges();
        }

        function setupSearch() {
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    searchTerm = e.target.value.toLowerCase();
                    resetAndRenderChallenges();
                }, 300); // Debounce de 300ms
            });
        }

        function clearFilters() {
            currentCategory = "todas";
            searchTerm = "";
            document.getElementById('searchInput').value = "";
            renderCategoryFilters();
            resetAndRenderChallenges();
        }

        function getFilteredChallenges() {
            return challenges.filter(challenge => {
                const matchesCategory = currentCategory === "todas" || challenge.category === currentCategory;
                const matchesSearch = !searchTerm || 
                    challenge.title.toLowerCase().includes(searchTerm) ||
                    challenge.summary.toLowerCase().includes(searchTerm) ||
                    challenge.description.toLowerCase().includes(searchTerm);
                
                return matchesCategory && matchesSearch;
            });
        }

        function resetAndRenderChallenges() {
            filteredChallenges = getFilteredChallenges();
            displayedChallenges = [];
            currentPage = 0;
            document.getElementById('challengeList').innerHTML = '';
            loadMoreChallenges();
        }

        function loadMoreChallenges() {
            if (isLoading) return;
            
            isLoading = true;
            const loadMoreIndicator = document.getElementById('loadMoreIndicator');
            
            if (currentPage === 0 && filteredChallenges.length === 0) {
                document.getElementById('challengeList').innerHTML = `
                    <div class="no-results">
                        <div>NO SE ENCONTRARON RESULTADOS</div>
                        <div style="font-size: 1rem; margin-top: 1rem; opacity: 0.7;">
                            Intenta con otros términos de búsqueda o cambia la categoría
                        </div>
                    </div>
                `;
                isLoading = false;
                updateStats();
                return;
            }

            const startIndex = currentPage * ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredChallenges.length);
            const newChallenges = filteredChallenges.slice(startIndex, endIndex);
            
            if (newChallenges.length > 0) {
                const challengeList = document.getElementById('challengeList');
                
                newChallenges.forEach(challenge => {
                    const challengeElement = createChallengeElement(challenge);
                    challengeList.appendChild(challengeElement);
                });
                
                displayedChallenges.push(...newChallenges);
                currentPage++;
            }

            // Mostrar/ocultar indicador de carga
            if (endIndex < filteredChallenges.length) {
                loadMoreIndicator.style.display = 'block';
            } else {
                loadMoreIndicator.style.display = 'none';
            }

            isLoading = false;
            updateStats();
        }

        function createChallengeElement(challenge) {
            const categoryConfig = getCategoryConfig(challenge.category);
            const div = document.createElement('div');
            div.className = 'challenge-item fade-in';
            div.innerHTML = `
                <div class="challenge-header" onclick="toggleChallenge(${challenge.id})">
                    <div class="challenge-info">
                        <div class="challenge-title">${challenge.title}</div>
                        <div class="challenge-summary">${challenge.summary}</div>
                        <div class="challenge-meta">
                            <span class="category-tag" style="border-color: ${categoryConfig.color};">
                                ${categoryConfig.name}
                            </span>
                            <span class="difficulty ${challenge.difficulty}">
                                ${challenge.difficulty.toUpperCase()}
                            </span>
                            <span class="status ${challenge.completed ? 'completado' : 'pendiente'}">
                                ${challenge.completed ? '✅ COMPLETADO' : '⏳ PENDIENTE'}
                            </span>
                        </div>
                    </div>
                    <span class="expand-icon">▼</span>
                </div>
                <div class="challenge-content">
                    <div class="challenge-body">
                        <div class="section">
                            <h3>📋 DESCRIPCIÓN COMPLETA</h3>
                            <div class="description">${challenge.description}</div>
                        </div>
                        <div class="section">
                            <h3>💻 SOLUCIÓN EN JAVA</h3>
                            <div class="code-container">
                                <button class="copy-btn" onclick="copyCode(${challenge.id})">COPIAR</button>
                                <div class="code" id="code-${challenge.id}">${challenge.solution}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return div;
        }

        function getCategoryConfig(category) {
            return categoryConfig[category] || { name: category, color: "var(--border)" };
        }

        function updateStats() {
            const totalChallenges = document.getElementById('totalChallenges');
            const visibleChallenges = document.getElementById('visibleChallenges');
            const completedChallenges = document.getElementById('completedChallenges');
            const totalCategories = document.getElementById('totalCategories');

            totalChallenges.textContent = challenges.length;
            visibleChallenges.textContent = displayedChallenges.length;
            completedChallenges.textContent = challenges.filter(c => c.completed).length;
            totalCategories.textContent = new Set(challenges.map(c => c.category)).size;
        }

        function setupInfiniteScroll() {
            window.addEventListener('scroll', () => {
                if (isLoading) return;
                
                const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
                
                if (scrollTop + clientHeight >= scrollHeight - 300) {
                    loadMoreChallenges();
                }
            });
        }

        function toggleChallenge(id) {
            const challengeElements = document.querySelectorAll('.challenge-item');
            challengeElements.forEach(element => {
                const header = element.querySelector('.challenge-header');
                if (header.getAttribute('onclick').includes(id.toString())) {
                    element.classList.toggle('expanded');
                }
            });
        }

        function copyCode(id) {
            const codeElement = document.getElementById(`code-${id}`);
            const textArea = document.createElement('textarea');
            textArea.value = codeElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Feedback visual
            const copyBtn = codeElement.parentElement.querySelector('.copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '¡COPIADO!';
            copyBtn.style.background = 'var(--success)';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = 'var(--accent)';
            }, 1000);
        }

        // Inicializar la página
        document.addEventListener('DOMContentLoaded', loadData);