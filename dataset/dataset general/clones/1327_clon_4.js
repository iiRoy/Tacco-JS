let globalAnnotationSet = [];

const resolveLocationCoordinates = (addressText) => {
    return new Promise((resolve, reject) => {
        const coordinateResolver = new google.maps.Geocoder();
        coordinateResolver.geocode({ 'address': addressText }, (responseResults, statusOutcome) => {
            if (statusOutcome === google.maps.GeocoderStatus.OK) {
                resolve(responseResults[0].geometry.location);
            } else {
                reject(new Error('Geocoding failed: ' + statusOutcome));
            }
        });
    });
};

class GeographicDisplayManager {
    constructor(domElement, initialConfiguration) {
        this.displayTarget = domElement;
        this.displayConfiguration = this._synthesizeConfiguration(initialConfiguration);
        this.activeAnnotations = [];

        google.maps.visualRefresh = true;

        if (window.screen.width < this.displayConfiguration.responsiveBreakpoint) {
            this._showFixedImage();
        } else {
            this._renderDynamicView();
        }
    }

    _synthesizeConfiguration(userProvidedConfig) {
        const defaultGeneralSettings = {
            responsiveBreakpoint: 580,
            annotationPoints: []
        };

        const defaultCoreParameters = {
            geographicFocus: '',
            magnificationLevel: '5',
            dimensions: `${window.screen.width}x480`,
            pixelDensity: window.devicePixelRatio || 1,
            visualStyle: 'roadmap',
            sensorStatus: false
        };

        let processedConfig = Object.assign({}, defaultGeneralSettings, userProvidedConfig);

        processedConfig.coreParameters = Object.assign({}, defaultCoreParameters);

        processedConfig.coreParameters.geographicFocus = this.displayTarget.dataset.focusLocation || processedConfig.coreParameters.geographicFocus;
        processedConfig.coreParameters.magnificationLevel = this.displayTarget.dataset.zoomLevel || processedConfig.coreParameters.magnificationLevel;
        processedConfig.coreParameters.visualStyle = this.displayTarget.dataset.mapStyle || processedConfig.coreParameters.visualStyle;

        processedConfig.staticImageEndpoint = 'https://maps.googleapis.com/maps/api/staticmap?';

        return processedConfig;
    }

    async _renderDynamicView() {
        this.displayTarget.classList.add('interactive-map-view');
        const currentConfig = this.displayConfiguration;
        const currentParameters = currentConfig.coreParameters;

        try {
            const centralCoordinates = await resolveLocationCoordinates(currentParameters.geographicFocus);

            const canvasOptions = {
                zoom: parseInt(currentParameters.magnificationLevel, 10),
                center: centralCoordinates,
                mapTypeId: currentParameters.visualStyle
            };

            const interactiveCanvas = new google.maps.Map(this.displayTarget, canvasOptions);
            this.activeCanvas = interactiveCanvas;

            for (const currentPoint of currentConfig.annotationPoints) {
                let pointConfiguration = Object.assign({}, currentPoint, { map: interactiveCanvas });

                if (!pointConfiguration.position || pointConfiguration.position === 'center') {
                    pointConfiguration.position = centralCoordinates;
                }

                if (typeof pointConfiguration.position === 'string') {
                    try {
                        pointConfiguration.position = await resolveLocationCoordinates(pointConfiguration.position);
                        this._placeAnnotationPoint(pointConfiguration);
                    } catch (error) {
                        console.error('Failed to geocode marker location:', error);
                    }
                } else {
                    this._placeAnnotationPoint(pointConfiguration);
                }
            }
        } catch (error) {
            console.error('Failed to initialize dynamic map:', error);
        }
    }

    _placeAnnotationPoint(pointConfiguration) {
        let annotationPayload;
        if (pointConfiguration.informationContent) {
            annotationPayload = pointConfiguration.informationContent;
            delete pointConfiguration.informationContent;
        }

        const generatedPoint = new google.maps.Marker(pointConfiguration);

        if (annotationPayload) {
            const informationOverlay = new google.maps.InfoWindow({
                content: annotationPayload
            });

            google.maps.event.addListener(generatedPoint, 'click', () => {
                informationOverlay.open(pointConfiguration.map, generatedPoint);
            });

            if (pointConfiguration.displayInformationOnLoad) {
                window.setTimeout(() => {
                    informationOverlay.open(pointConfiguration.map, generatedPoint);
                }, 100);
            }
        }
        this.activeAnnotations.push(generatedPoint);
        globalAnnotationSet.push(generatedPoint);
    }

    _showFixedImage() {
        this.displayTarget.classList.add('static-map-view');
        const currentConfig = this.displayConfiguration;
        const currentParameters = currentConfig.coreParameters;

        const parameterList = [];
        for (const key in currentParameters) {
            if (Object.prototype.hasOwnProperty.call(currentParameters, key)) {
                parameterList.push(`${key}=${currentParameters[key]}`);
            }
        }

        const markerSegments = currentConfig.annotationPoints.map(point => {
            const tempMarkerAttributes = [];
            for (const prop in point) {
                if (Object.prototype.hasOwnProperty.call(point, prop)) {
                    if (prop === 'position') {
                        const effectivePosition = (!point[prop] || point[prop] === 'center')
                            ? currentParameters.geographicFocus
                            : String(point[prop]).replace(/ /g, '+');
                        tempMarkerAttributes.push(effectivePosition);
                    } else if (prop !== 'informationContent' && prop !== 'displayInformationOnLoad') {
                        tempMarkerAttributes.push(`${prop}:${point[prop]}`);
                    }
                }
            }
            return `&markers=${tempMarkerAttributes.join('%7C')}`;
        });

        const imageSourceURL = currentConfig.staticImageEndpoint + parameterList.join('&') + markerSegments.join('');

        const imageObject = document.createElement('img');
        imageObject.src = imageSourceURL;
        imageObject.alt = 'Static Map Image';

        const linkWrapper = document.createElement('a');
        linkWrapper.href = `//maps.google.com/maps?q=${encodeURIComponent(currentParameters.geographicFocus)}`;
        linkWrapper.target = '_blank';
        linkWrapper.rel = 'noopener noreferrer';
        linkWrapper.appendChild(imageObject);

        this.displayTarget.innerHTML = '';
        this.displayTarget.appendChild(linkWrapper);
    }
}

const createMapVisualizerInstance = (elementSelector, configuration = {}) => {
    const targetElement = document.querySelector(elementSelector);
    if (!targetElement) {
        console.error('Target element not found for map visualization:', elementSelector);
        return null;
    }
    return new GeographicDisplayManager(targetElement, configuration);
};