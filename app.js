document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const siteTitle = document.getElementById('siteTitle');
    
    // Make the site title clickable to return to homepage
    siteTitle.addEventListener('click', () => {
        window.location.hash = '';
    });
    
    // Handle navigation
    window.addEventListener('hashchange', handleRouting);
    
    // Initial routing
    handleRouting();
    
    function handleRouting() {
        try {
            const hash = window.location.hash.slice(1);
            
            if (!hash) {
                renderHomepage();
                return;
            }
            
            const [manhwaId, chapterNumber] = hash.split('/');
            const manhwa = manhwaData.find(m => m.id === manhwaId);
            
            if (!manhwa) {
                console.warn(`Manhwa with ID "${manhwaId}" not found`);
                renderHomepage();
                return;
            }
            
            if (chapterNumber) {
                const parsedChapterNumber = parseInt(chapterNumber);
                if (isNaN(parsedChapterNumber)) {
                    console.warn(`Invalid chapter number: "${chapterNumber}"`); 
                    renderManhwaPage(manhwa);
                    return;
                }
                
                const chapter = manhwa.chapters.find(c => c.number === parsedChapterNumber);
                if (chapter) {
                    renderChapter(manhwa, chapter);
                } else {
                    console.warn(`Chapter ${parsedChapterNumber} not found for "${manhwa.title}"`); 
                    renderManhwaPage(manhwa);
                }
            } else {
                renderManhwaPage(manhwa);
            }
        } catch (error) {
            console.error('Routing error:', error);
            renderHomepage();
        }
    }
    
    function renderHomepage() {
        app.innerHTML = `
            <div class="homepage-container">
                <h2>Popular Manhwa</h2>
                <div class="manhwa-grid">
                    ${manhwaData.map(manhwa => `
                        <div class="manhwa-tile" onclick="window.location.hash='${manhwa.id}'">
                            <img src="${manhwa.cover}" alt="${manhwa.title}" onerror="this.onerror=null; this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'150\' viewBox=\'0 0 100 150\' fill=\'none\'%3E%3Crect width=\'100\' height=\'150\' fill=\'%23121212\'/%3E%3Ctext x=\'50\' y=\'75\' font-family=\'Arial\' font-size=\'10\' fill=\'%23ffffff\' text-anchor=\'middle\'%3E${manhwa.title}%3C/text%3E%3C/svg%3E';">
                            <div class="manhwa-info">
                                <div class="manhwa-title">${manhwa.title}</div>
                                <div class="manhwa-chapters">${manhwa.chapters.length} chapters</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    function renderManhwaPage(manhwa) {
        // Get current chapter from hash if available
        const currentHash = window.location.hash.slice(1);
        const currentChapterNumber = currentHash.includes('/') ? parseInt(currentHash.split('/')[1]) : null;
        
        app.innerHTML = `
            <div class="chapters-container">
                <h3>${manhwa.title} - Chapters</h3>
                <div class="chapters-grid">
                    ${manhwa.chapters.map(chapter => `
                        <div class="chapter-button ${currentChapterNumber === chapter.number ? 'active' : ''}" onclick="window.location.hash='${manhwa.id}/${chapter.number}'">
                            <div class="chapter-number">Chapter ${chapter.number}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    function renderChapter(manhwa, chapter) {
        app.innerHTML = `
            <div class="reading-container">
                <div class="loading" id="pdf-loading">
                    <div class="spinner"></div>
                </div>
                <div class="error-message" id="pdf-error" style="display: none;">
                    <p>Failed to load the chapter. Please try again later.</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
                <iframe 
                    class="pdf-container" 
                    src="https://drive.google.com/file/d/${chapter.driveId}/preview" 
                    allowfullscreen
                    title="${manhwa.title} - Chapter ${chapter.number}"
                    onload="document.getElementById('pdf-loading').style.display = 'none';"
                    onerror="document.getElementById('pdf-loading').style.display = 'none'; document.getElementById('pdf-error').style.display = 'flex';"
                ></iframe>
                
                <div class="chapter-footer">
                    <select class="chapter-dropdown" onchange="if(this.value) window.location.hash='${manhwa.id}/'+this.value">
                        <option value="">Select Chapter</option>
                        ${manhwa.chapters.map(c => `
                            <option value="${c.number}" ${c.number === chapter.number ? 'selected' : ''}>
                                Chapter ${c.number}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;
        
        // Add a timeout to show error if iframe doesn't load within 10 seconds
        const loadTimeout = setTimeout(() => {
            const loadingElement = document.getElementById('pdf-loading');
            const errorElement = document.getElementById('pdf-error');
            if (loadingElement && loadingElement.style.display !== 'none') {
                loadingElement.style.display = 'none';
                if (errorElement) errorElement.style.display = 'flex';
            }
        }, 10000);
    }
});