const machinesData = [
            {
                "name": "Injection",
                "platform": "DockerLabs",
                "difficulty": "Easy",
                "os": "Linux",
                "image": "assets/imgs/machines/Write_Up_Injection.png",
                "description": "Máquina Linux fácil que involucra explotar vulnerabilidades tipo SQL Injection, con robo de sesion (bypassing) y escalado de privilegios",
                "tags": ["SMB", "Samba", "CVE-2007-2447", "Linux"],
                "writeup": "assets/writeups/writeup.md",
                "images": [""],
                "date": "2024-01-15"
            },
        ];

        let filteredMachines = [...machinesData];

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            renderMachines(machinesData);
            updateStats(machinesData);
            setupFilters();
            setupModal();
        });

        // Render machines grid
        function renderMachines(machines) {
            const grid = document.getElementById('machinesGrid');
            const noResults = document.getElementById('noResults');
            
            if (machines.length === 0) {
                grid.style.display = 'none';
                noResults.style.display = 'block';
                return;
            }
            
            grid.style.display = 'grid';
            noResults.style.display = 'none';
            
            grid.innerHTML = machines.map(machine => `
                <div class="machine-card" data-machine='${JSON.stringify(machine)}'>
                    <div class="machine-image">
                        ${machine.image ? `<img src="${machine.image}" alt="${machine.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                        <div style="font-size: 4rem; ${machine.image ? 'display: none;' : 'display: flex;'} align-items: center; justify-content: center; width: 100%; height: 100%;">
                            ${getOSIcon(machine.os)}
                        </div>
                        <div class="machine-platform">${machine.platform}</div>
                        <div class="machine-difficulty difficulty-${machine.difficulty.toLowerCase()}">${machine.difficulty}</div>
                    </div>
                    <div class="machine-content">
                        <h3 class="machine-title">${machine.name}</h3>
                        <div class="machine-os">
                            ${getOSIcon(machine.os)} ${machine.os}
                        </div>
                        <p class="machine-description">${machine.description}</p>
                        <div class="machine-tags">
                            ${machine.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="machine-actions">
                            <button class="btn-writeup" onclick="openWriteup('${machine.writeup}', '${machine.name}', '${machine.images.join(',')}')">
                                📖 Ver Write-up
                            </button>
                            <button class="btn-info" onclick="showMachineInfo('${machine.name}')">
                                ℹ️ Info
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Get OS icon
        function getOSIcon(os) {
            const icons = {
                'Linux': '🐧',
                'Windows': '🪟',
                'FreeBSD': '👹',
                'Other': '💻'
            };
            return icons[os] || icons['Other'];
        }

        // Update statistics
        function updateStats(machines) {
            document.getElementById('totalMachines').textContent = machines.length;
            
            const platforms = [...new Set(machines.map(m => m.platform))];
            document.getElementById('totalPlatforms').textContent = platforms.length;
            
            const writeups = machines.filter(m => m.writeup).length;
            document.getElementById('totalWriteups').textContent = writeups;
            
            // Calculate average difficulty
            const difficultyValues = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Insane': 4 };
            const avgDiff = machines.reduce((sum, m) => sum + (difficultyValues[m.difficulty] || 0), 0) / machines.length;
            const difficultyNames = { 1: 'Fácil', 2: 'Medio', 3: 'Difícil', 4: 'Insano' };
            document.getElementById('avgDifficulty').textContent = difficultyNames[Math.round(avgDiff)] || '-';
        }

        // Setup filters
        function setupFilters() {
            const nameFilter = document.getElementById('nameFilter');
            const difficultyFilter = document.getElementById('difficultyFilter');
            const platformFilter = document.getElementById('platformFilter');
            const osFilter = document.getElementById('osFilter');

            [nameFilter, difficultyFilter, platformFilter, osFilter].forEach(filter => {
                filter.addEventListener('input', applyFilters);
                filter.addEventListener('change', applyFilters);
            });
        }

        // Apply filters
        function applyFilters() {
            const nameValue = document.getElementById('nameFilter').value.toLowerCase();
            const difficultyValue = document.getElementById('difficultyFilter').value;
            const platformValue = document.getElementById('platformFilter').value;
            const osValue = document.getElementById('osFilter').value;

            filteredMachines = machinesData.filter(machine => {
                const matchesName = machine.name.toLowerCase().includes(nameValue);
                const matchesDifficulty = !difficultyValue || machine.difficulty === difficultyValue;
                const matchesPlatform = !platformValue || machine.platform === platformValue;
                const matchesOS = !osValue || machine.os === osValue;

                return matchesName && matchesDifficulty && matchesPlatform && matchesOS;
            });

            renderMachines(filteredMachines);
            updateStats(filteredMachines);
        }

        // Clear filters
        function clearFilters() {
            document.getElementById('nameFilter').value = '';
            document.getElementById('difficultyFilter').value = '';
            document.getElementById('platformFilter').value = '';
            document.getElementById('osFilter').value = '';
            
            filteredMachines = [...machinesData];
            renderMachines(filteredMachines);
            updateStats(filteredMachines);
        }

        // Setup modal
        function setupModal() {
            const modal = document.getElementById('markdownModal');
            const closeBtn = document.querySelector('.close');

            closeBtn.onclick = function() {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            }

            // Setup marked.js options
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {}
                    }
                    return hljs.highlightAuto(code).value;
                },
                breaks: true,
                gfm: true
            });
        }

        // Open writeup modal
        async function openWriteup(writeupFile, machineName, images) {
            const modal = document.getElementById('markdownModal');
            const modalTitle = document.getElementById('modalTitle');
            const content = document.getElementById('markdownContent');
            
            modalTitle.textContent = `Write-up: ${machineName}`;
            content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            try {
                // In a real implementation, you would fetch the actual .md file
                // For demo purposes, we'll generate sample content
                const response = await fetch(`/${writeupFile}`);
                const markdownContent = await response.text();
                
                // Process images in markdown
                let processedContent = markdownContent;
                if (images) {
                    const imageList = images.split(',');
                    imageList.forEach(img => {
                        const imgPath = `/write-ups-img/${img}`;
                        processedContent = processedContent.replace(`![${img}]`, `![${img}](${imgPath})`);
                    });
                }

                // Convert markdown to HTML
                const htmlContent = marked.parse(processedContent);
                content.innerHTML = htmlContent;

                // Re-highlight code blocks
                content.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });

            } catch (error) {
                console.error('Error loading writeup:', error);
                content.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--secondary);">
                        <h3>❌ Error al cargar el write-up</h3>
                        <p>No se pudo cargar el archivo: ${writeupFile}</p>
                        <p>Verifica que el archivo existe en la carpeta de write-ups.</p>
                    </div>
                `;
            }
        }
        // Show machine info (placeholder function)
        function showMachineInfo(machineName) {
            const machine = machinesData.find(m => m.name === machineName);
            if (machine) {
                alert(`📊 Información de ${machine.name}\\n\\n` +
                      `🏢 Plataforma: ${machine.platform}\\n` +
                      `⚡ Dificultad: ${machine.difficulty}\\n` +
                      `💻 SO: ${machine.os}\\n` +
                      `📅 Fecha: ${machine.date}\\n\\n` +
                      `📝 Descripción:\\n${machine.description}`);
            }
        }

        // Add search functionality with Enter key
        document.getElementById('nameFilter').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });

        // Add smooth scrolling for navigation
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

        // Add navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(13, 13, 20, 0.98)';
            } else {
                navbar.style.background = 'rgba(13, 13, 20, 0.95)';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // ESC to close modal
            if (e.key === 'Escape') {
                const modal = document.getElementById('markdownModal');
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            }
            
            // Ctrl+F to focus on search
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('nameFilter').focus();
            }
        });

        // Auto-save filter preferences to localStorage (if available)
        function saveFilterPreferences() {
            const preferences = {
                name: document.getElementById('nameFilter').value,
                difficulty: document.getElementById('difficultyFilter').value,
                platform: document.getElementById('platformFilter').value,
                os: document.getElementById('osFilter').value
            };
            
            try {
                localStorage.setItem('writeup_filter_preferences', JSON.stringify(preferences));
            } catch (e) {
                // localStorage not available
            }
        }

        // Load filter preferences from localStorage
        function loadFilterPreferences() {
            try {
                const preferences = JSON.parse(localStorage.getItem('writeup_filter_preferences'));
                if (preferences) {
                    document.getElementById('nameFilter').value = preferences.name || '';
                    document.getElementById('difficultyFilter').value = preferences.difficulty || '';
                    document.getElementById('platformFilter').value = preferences.platform || '';
                    document.getElementById('osFilter').value = preferences.os || '';
                    applyFilters();
                }
            } catch (e) {
                // localStorage not available or invalid data
            }
        }

        // Load preferences on page load
        document.addEventListener('DOMContentLoaded', loadFilterPreferences);

        // Save preferences when filters change
        ['nameFilter', 'difficultyFilter', 'platformFilter', 'osFilter'].forEach(id => {
            document.getElementById(id).addEventListener('change', saveFilterPreferences);
        });