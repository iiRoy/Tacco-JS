const credentialSet = ['5371eb9743a8c619876d4e967d558f82', '0dc8789a4e3488e1ba3d798f48b6a5e7'];

const analyticsTracker = {
    recordEvent: (category, action) => {
        // Placeholder for analytics, original uses 'ga'
    }
};

const mediaDisplayManager = (function() {
    const configuration = {
        columnCount: 3,
        rowCount: 2,
        activeCellCoordinates: { row: -1, col: -1 },
        cellDimensionX: 0,
        cellDimensionY: 0,
        interactionFrozen: false,
        playerUnitCollection: [],
        availableRecordings: [],
        mainContainerElement: null,
        topBannerElement: null,
        queryInputElement: null,
        welcomeOverlayElement: null
    };

    let soundCloudService = null;
    function initializeSoundCloudClient() {
        if (typeof SC !== 'undefined') {
            SC.initialize({
                client_id: credentialSet[0]
            });
            soundCloudService = SC;
        } else {
            console.error("SoundCloud SDK (SC) is not available.");
        }
    }

    function adjustLayoutDimensions() {
        const viewportHeight = window.innerHeight;
        const bannerHeight = configuration.topBannerElement ? configuration.topBannerElement.offsetHeight : 0;
        
        if (configuration.mainContainerElement) {
            configuration.mainContainerElement.style.height = `${viewportHeight - bannerHeight}px`;
            configuration.cellDimensionX = configuration.mainContainerElement.offsetWidth / configuration.columnCount;
            configuration.cellDimensionY = configuration.mainContainerElement.offsetHeight / configuration.rowCount;
        }
        synchronizeComponentSizing();
    }

    function constructLayoutElements() {
        configuration.interactionFrozen = false;
        
        if (configuration.mainContainerElement) {
            configuration.mainContainerElement.innerHTML = '';
        }
        configuration.playerUnitCollection = [];

        for (let r = 0; r < configuration.rowCount; r++) {
            for (let c = 0; c < configuration.columnCount; c++) {
                const audioEl = document.createElement('audio');
                audioEl.id = `media-widget-audio-${r}-${c}`;
                audioEl.setAttribute('loop', 'true');
                audioEl.setAttribute('controls', 'true');
                audioEl.setAttribute('autoplay', 'true');
                audioEl.dataset.gridRow = r;
                audioEl.dataset.gridCol = c;

                const imgEl = document.createElement('img');
                imgEl.id = `artwork-display-img-${r}-${c}`;
                imgEl.dataset.gridRow = r;
                imgEl.dataset.gridCol = c;
                
                const titleEl = document.createElement('h2');
                titleEl.id = `track-title-heading-${r}-${c}`;
                titleEl.dataset.gridRow = r;
                titleEl.dataset.gridCol = c;

                if (configuration.mainContainerElement) {
                    configuration.mainContainerElement.appendChild(imgEl);
                    configuration.mainContainerElement.appendChild(titleEl);
                    configuration.mainContainerElement.appendChild(audioEl);
                }

                configuration.playerUnitCollection.push({
                    row: r,
                    col: c,
                    audioElement: audioEl,
                    imageElement: imgEl,
                    titleElement: titleEl
                });
            }
        }
        synchronizeComponentSizing();
    }

    function clearDisplayComponents() {
        if (configuration.mainContainerElement) {
            configuration.mainContainerElement.innerHTML = '';
        }
        configuration.playerUnitCollection = [];
        configuration.availableRecordings = [];
        configuration.activeCellCoordinates = { row: -1, col: -1 };
    }

    function processSearchInput(event) {
        if (event.key === 'Enter') {
            analyticsTracker.recordEvent('user_input', 'search_triggered');
            event.preventDefault();
            const queryText = configuration.queryInputElement ? configuration.queryInputElement.value : '';
            if (queryText) {
                populateDisplay(queryText);
            }
        }
    }

    function processGlobalKeyPress(event) {
        if (event.shiftKey && event.key === 'L') {
            analyticsTracker.recordEvent('user_input', 'lock_toggle');
            configuration.interactionFrozen = !configuration.interactionFrozen;
        }
    }

    async function populateDisplay(queryText) {
        clearDisplayComponents();
        constructLayoutElements();

        if (!soundCloudService) {
            console.error("SoundCloud service not ready.");
            return;
        }

        try {
            const trackResults = await new Promise((resolve, reject) => {
                soundCloudService.get('/tracks', { q: queryText, limit: 5 * configuration.columnCount * configuration.rowCount }, (tracks, error) => {
                    if (error) reject(error);
                    else resolve(tracks);
                });
            });

            trackResults.sort(() => 0.5 - Math.random());
            configuration.availableRecordings = trackResults;
            assignMediaSources();
        } catch (error) {
            console.error("Failed to retrieve recordings:", error);
        }
    }

    function assignMediaSources() {
        let recordingsAssigned = 0;
        const streamableRecords = configuration.availableRecordings.filter(record => record.streamable);

        configuration.playerUnitCollection.forEach(unit => {
            if (recordingsAssigned < streamableRecords.length) {
                const currentRecord = streamableRecords[recordingsAssigned];
                const keyIndex = recordingsAssigned % credentialSet.length;

                unit.audioElement.src = `${currentRecord.stream_url}?client_id=${credentialSet[keyIndex]}`;
                unit.audioElement.volume = 0;
                unit.audioElement.play();

                unit.titleElement.innerHTML = `<a href="${currentRecord.permalink_url}" target="_blank">${currentRecord.title}</a>`;

                if (currentRecord.artwork_url) {
                    unit.imageElement.src = currentRecord.artwork_url.replace("large", "t500x500");
                } else {
                    unit.imageElement.src = "images/default.png";
                }
                recordingsAssigned++;
            } else {
                unit.audioElement.src = '';
                unit.titleElement.innerHTML = '';
                unit.imageElement.src = '';
            }
        });
    }

    function handleContainerHover(event) {
        if (configuration.interactionFrozen) {
            return;
        }
        analyticsTracker.recordEvent('user_input', 'unit_hovered');

        const containerBounds = configuration.mainContainerElement.getBoundingClientRect();
        const pointerX = event.clientX - containerBounds.left;
        const pointerY = event.clientY - containerBounds.top;

        const targetRow = Math.max(0, Math.min(Math.floor(pointerY / configuration.cellDimensionY), configuration.rowCount - 1));
        const targetCol = Math.max(0, Math.min(Math.floor(pointerX / configuration.cellDimensionX), configuration.columnCount - 1));

        const activeUnit = configuration.playerUnitCollection.find(unit => unit.row === targetRow && unit.col === targetCol);
        if (activeUnit) {
            activeUnit.audioElement.volume = 1;
            activeUnit.imageElement.classList.add("active-visual");
            activeUnit.titleElement.classList.add("active-visual");
            deactivateOtherUnits(targetRow, targetCol);
            configuration.activeCellCoordinates = { row: targetRow, col: targetCol };
        }
    }

    function deactivateOtherUnits(activeRow, activeCol) {
        configuration.playerUnitCollection.forEach(unit => {
            if (unit.row !== activeRow || unit.col !== activeCol) {
                unit.audioElement.volume = 0;
                unit.imageElement.classList.remove("active-visual");
                unit.titleElement.classList.remove("active-visual");
            }
        });
    }

    function synchronizeComponentSizing() {
        configuration.playerUnitCollection.forEach(unit => {
            const { imageElement, titleElement, audioElement } = unit;

            imageElement.style.width = `${configuration.cellDimensionX}px`;
            imageElement.style.height = `${configuration.cellDimensionY}px`;

            const cellTop = unit.row * configuration.cellDimensionY;
            const cellLeft = unit.col * configuration.cellDimensionX;

            imageElement.style.position = 'absolute';
            imageElement.style.top = `${cellTop}px`;
            imageElement.style.left = `${cellLeft}px`;

            const estimatedTitleHeight = titleElement.offsetHeight || 30; // Default if not rendered
            const estimatedAudioControlsHeight = audioElement.offsetHeight || 30;

            titleElement.style.position = 'absolute';
            titleElement.style.top = `${cellTop}px`;
            titleElement.style.left = `${cellLeft}px`;
            titleElement.style.width = `${configuration.cellDimensionX}px`;
            titleElement.style.zIndex = '2';

            audioElement.style.position = 'absolute';
            audioElement.style.top = `${cellTop + configuration.cellDimensionY - estimatedAudioControlsHeight}px`;
            audioElement.style.left = `${cellLeft}px`;
            audioElement.style.width = `${configuration.cellDimensionX}px`;
            audioElement.style.zIndex = '2';
        });
    }

    function manageWelcomeOverlay() {
        const hasSeenWelcome = localStorage.getItem("welcomeAcknowledged");
        
        if (hasSeenWelcome) {
            populateDisplay("armin van buuren");
        } else {
            if (configuration.welcomeOverlayElement) {
                configuration.welcomeOverlayElement.style.display = 'block';
                configuration.welcomeOverlayElement.addEventListener('click', (e) => {
                    // Simulate Bootstrap modal hide event logic
                    if (e.target.dataset.dismiss === 'modal' || e.target === configuration.welcomeOverlayElement) {
                         configuration.welcomeOverlayElement.style.display = 'none';
                         localStorage.setItem('welcomeAcknowledged', 'true');
                         populateDisplay("armin van buuren");
                    }
                });
            }
        }
    }

    return {
        startApplication: function() {
            configuration.mainContainerElement = document.getElementById('grid');
            configuration.topBannerElement = document.getElementById('header');
            configuration.queryInputElement = document.getElementById('searchterm');
            configuration.welcomeOverlayElement = document.getElementById('intro-modal');

            initializeSoundCloudClient();

            adjustLayoutDimensions();

            window.addEventListener('resize', adjustLayoutDimensions);
            
            if (configuration.queryInputElement) {
                configuration.queryInputElement.addEventListener('keypress', processSearchInput);
            }
            window.addEventListener('keydown', processGlobalKeyPress);

            if (configuration.mainContainerElement) {
                configuration.mainContainerElement.addEventListener('mouseover', handleContainerHover);
            }

            manageWelcomeOverlay();
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    mediaDisplayManager.startApplication();
});