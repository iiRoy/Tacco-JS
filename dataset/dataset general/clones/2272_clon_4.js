const locationVisualizerModule = (function() {
    let geospatialCanvas;
    let pointDensityOverlay;
    let displayControlSettings = {
        baseLayerTransparency: 1,
        overlayTransparency: 1,
        dotSize: 25,
        blurRadius: 15
    };
    let initialDisplayControlSettings;

    function convertBytesToReadable(byteAmount) {
        if (byteAmount === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const index = Math.floor(Math.log(byteAmount) / Math.log(1024));
        return `${Math.round(byteAmount / Math.pow(1024, index), 2)} ${units[index]}`;
    }

    function manageDomElementClasses(elementId, action, className) {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            if (action === 'add') targetElement.classList.add(className);
            else if (action === 'remove') targetElement.classList.remove(className);
            else if (action === 'toggle') targetElement.classList.toggle(className);
            else if (action === 'setText') targetElement.textContent = className;
        }
    }

    function updateApplicationStateClass(stateIdentifier) {
        document.body.classList.remove('initial-setup', 'data-processing', 'operation-complete', 'map-view-active');
        document.body.classList.add(stateIdentifier);
    }

    function reportOperationFeedback(messageText) {
        manageDomElementClasses('currentStatus', 'setText', messageText);
    }

    function beginApplicationSetup() {
        updateApplicationStateClass('initial-setup');

        geospatialCanvas = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Location history visualization tool is open source. Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors.',
            maxZoom: 18,
            minZoom: 2
        }).addTo(geospatialCanvas);

        const mainContentArea = document.body;
        const dropHandler = (evt) => {
            evt.preventDefault();
            mainContentArea.classList.remove('drag-active-style');
            if (evt.dataTransfer.files.length > 0) {
                processUserProvidedFile(evt.dataTransfer.files[0]);
                // Disable further drag/drop events on body
                mainContentArea.removeEventListener('dragover', () => {});
                mainContentArea.removeEventListener('dragleave', () => {});
                mainContentArea.removeEventListener('drop', dropHandler);
            }
        };

        mainContentArea.addEventListener('dragover', (evt) => {
            evt.preventDefault();
            mainContentArea.classList.add('drag-active-style');
        });
        mainContentArea.addEventListener('dragleave', () => {
            mainContentArea.classList.remove('drag-active-style');
        });
        mainContentArea.addEventListener('drop', dropHandler);

        const explicitFileInput = document.getElementById('file');
        if (explicitFileInput) {
            explicitFileInput.addEventListener('change', (evt) => {
                if (evt.target.files.length > 0) {
                    processUserProvidedFile(evt.target.files[0]);
                    explicitFileInput.disabled = true;
                }
            });
        }
    }

    function processUserProvidedFile(incomingFile) {
        pointDensityOverlay = L.heatLayer([], displayControlSettings).addTo(geospatialCanvas);

        updateApplicationStateClass('data-processing');
        manageDomElementClasses('intro', 'add', 'hidden');
        manageDomElementClasses('working', 'remove', 'hidden');

        handleFileData(incomingFile);
    }

    function extractCoordinatesFromJson(rawJsonString) {
        const LATLNG_SCALAR = 0.0000001;
        const parsedObject = JSON.parse(rawJsonString);
        const locationEntries = parsedObject.locations;

        if (!locationEntries || locationEntries.length === 0) {
            throw new Error('No geographical coordinates found in the JSON data.');
        }

        return locationEntries.map(entry => [entry.latitudeE7 * LATLNG_SCALAR, entry.longitudeE7 * LATLNG_SCALAR]);
    }

    function extractCoordinatesFromKml(rawKmlString) {
        const KML_COORDINATE_PATTERN = /<when>(.*?)<\/when>\s*<gx:coord>(\S*)\s(\S*)\s(\S*)<\/gx:coord>/g;
        let detectedPoints = [];
        let currentKmlMatch;

        while ((currentKmlMatch = KML_COORDINATE_PATTERN.exec(rawKmlString)) !== null) {
            // [1] timestamp, [2] longitude, [3] latitude, [4] altitude
            detectedPoints.push([Number(currentKmlMatch[3]), Number(currentKmlMatch[2])]);
        }
        return detectedPoints;
    }

    function handleFileData(dataFile) {
        const dataFileSizeFormatted = convertBytesToReadable(dataFile.size);
        const fileReadingAgent = new FileReader();

        reportOperationFeedback(`Preparing to load file (${dataFileSizeFormatted})...`);

        fileReadingAgent.onprogress = (eventProgress) => {
            if (eventProgress.lengthComputable) {
                const percentageComplete = Math.round((eventProgress.loaded / eventProgress.total) * 100);
                reportOperationFeedback(`${percentageComplete}% of ${dataFileSizeFormatted} loaded...`);
            }
        };

        fileReadingAgent.onload = (eventLoad) => {
            let processedCoordinates;
            reportOperationFeedback('Constructing map from provided data...');

            try {
                if (/\.kml$/i.test(dataFile.name)) {
                    processedCoordinates = extractCoordinatesFromKml(eventLoad.target.result);
                } else {
                    processedCoordinates = extractCoordinatesFromJson(eventLoad.target.result);
                }
            } catch (exception) {
                reportOperationFeedback(`An issue arose during map construction. Please ensure you've uploaded a valid Google Takeout JSON or KML file containing location information. (Fault: ${exception.message})`);
                return;
            }

            pointDensityOverlay.setLatLngs(processedCoordinates);
            pointDensityOverlay.redraw();
            finalizeVisualization(processedCoordinates.length);
        };

        fileReadingAgent.onerror = () => {
            reportOperationFeedback(`Failed to read the input file. Please verify its integrity and try again. (Fault: ${fileReadingAgent.error.message})`);
        };

        fileReadingAgent.readAsText(dataFile);
    }

    function finalizeVisualization(totalPointsRendered) {
        const completionMessagePanel = document.getElementById('done');

        updateApplicationStateClass('operation-complete');
        manageDomElementClasses('working', 'add', 'hidden');
        manageDomElementClasses('done', 'remove', 'hidden');

        manageDomElementClasses('numberProcessed', 'setText', totalPointsRendered.toLocaleString());

        initialDisplayControlSettings = { ...displayControlSettings };

        completionMessagePanel.addEventListener('click', function dismissPanelHandler() {
            document.body.classList.add('map-view-active');
            completionMessagePanel.style.opacity = '0';
            completionMessagePanel.style.pointerEvents = 'none';
            establishInteractiveControls();
            completionMessagePanel.removeEventListener('click', dismissPanelHandler);
        }, { once: true });
    }

    function establishInteractiveControls() {
        const mapLayerContainer = document.querySelector('.leaflet-tile-pane');
        const overlayLayerContainer = document.querySelector('.leaflet-heatmap-layer');

        function updateControlElements() {
            for (const key in displayControlSettings) {
                if (displayControlSettings.hasOwnProperty(key)) {
                    const controlElement = document.getElementById(key);
                    if (controlElement) {
                        controlElement.value = displayControlSettings[key];
                    }
                }
            }
        }
        updateControlElements();

        document.querySelectorAll('.control').forEach(controlInput => {
            controlInput.addEventListener('input', function() {
                switch (this.id) {
                    case 'tileOpacity':
                        if (mapLayerContainer) mapLayerContainer.style.opacity = this.value;
                        break;
                    case 'heatOpacity':
                        if (overlayLayerContainer) overlayLayerContainer.style.opacity = this.value;
                        break;
                    default:
                        displayControlSettings[this.id] = Number(this.value);
                        pointDensityOverlay.setOptions(displayControlSettings);
                        break;
                }
            });
        });

        const resetConfigurationButton = document.getElementById('reset');
        if (resetConfigurationButton) {
            resetConfigurationButton.addEventListener('click', () => {
                Object.assign(displayControlSettings, initialDisplayControlSettings);
                updateControlElements();
                pointDensityOverlay.setOptions(displayControlSettings);

                if (overlayLayerContainer) overlayLayerContainer.style.opacity = initialDisplayControlSettings.overlayTransparency;
                if (mapLayerContainer) mapLayerContainer.style.opacity = initialDisplayControlSettings.baseLayerTransparency;
            });
        }
    }

    return {
        launch: beginApplicationSetup
    };

})();

document.addEventListener('DOMContentLoaded', locationVisualizerModule.launch);