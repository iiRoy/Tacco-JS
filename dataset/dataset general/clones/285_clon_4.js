const SphereView = SphereView || {};

SphereView.Visualizer = function(initialSettings) {
    'use strict';

    let internalConfiguration = initialSettings || {};
    let currentGeographicLocation;
    let currentMagnificationLevel;
    let panoramaIdentifier;
    const streetViewServiceClient = new google.maps.StreetViewService();
    let completedTileCount = 0;
    let expectedTotalTiles = 0;
    const drawingSurface = document.createElement('canvas');
    const drawingContext = drawingSurface.getContext('2d');

    let headingAngle = 0;
    let elevationAngle = 0;
    let legalNotice = '';
    let surfaceResizeCallback = null;
    let viewReadyCallback = null;
    let progressUpdateCallback = null;
    let errorSignalCallback = null;
    let dataAvailableCallback = null;
    let noDataCallback = null;

    const publicApi = {};

    const broadcastProgress = (completionRatio) => {
        if (progressUpdateCallback) {
            progressUpdateCallback(completionRatio);
        }
    };

    const dispatchError = (issueMessage) => {
        if (errorSignalCallback) {
            errorSignalCallback(issueMessage);
        } else {
            console.error(issueMessage);
        }
    };

    publicApi.adjustSurfaceDimensions = () => {
        const widthPx = 416 * Math.pow(2, currentMagnificationLevel);
        const heightPx = (416 * Math.pow(2, currentMagnificationLevel - 1));
        drawingSurface.width = widthPx;
        drawingSurface.height = heightPx;
        drawingContext.translate(drawingSurface.width, 0);
        drawingContext.scale(-1, 1);
        if (surfaceResizeCallback) {
            surfaceResizeCallback(widthPx, heightPx);
        }
    };

    const drawSingleTile = (colIdx, rowIdx, tileImage) => {
        drawingContext.drawImage(tileImage, colIdx * 512, rowIdx * 512);
        completedTileCount++;

        const currentProgress = Math.round(completedTileCount * 100 / expectedTotalTiles);
        broadcastProgress(currentProgress);

        if (completedTileCount === expectedTotalTiles) {
            publicApi.renderedCanvas = drawingSurface;
            if (viewReadyCallback) {
                viewReadyCallback();
            }
        }
    };

    publicApi.assembleView = (panoId) => {
        broadcastProgress(0);
        console.log(`Initiating panorama assembly for magnification ${currentMagnificationLevel}...`);

        const horizontalTiles = (currentMagnificationLevel === 3) ? 7 : Math.pow(2, currentMagnificationLevel);
        const verticalTiles = Math.pow(2, currentMagnificationLevel - 1);

        completedTileCount = 0;
        expectedTotalTiles = horizontalTiles * verticalTiles;

        const tilePromises = [];

        for (let r = 0; r < verticalTiles; r++) {
            for (let c = 0; c < horizontalTiles; c++) {
                const tileSourceUrl = `http://maps.google.com/cbk?output=tile&panoid=${panoId}&zoom=${currentMagnificationLevel}&x=${c}&y=${r}&${Date.now()}`;
                
                const tileLoadPromise = new Promise((resolve, reject) => {
                    const imageElement = new Image();
                    imageElement.crossOrigin = '';
                    imageElement.onload = () => {
                        drawSingleTile(c, r, imageElement);
                        resolve();
                    };
                    imageElement.onerror = () => {
                        reject(new Error(`Failed to load tile: ${tileSourceUrl}`));
                    };
                    imageElement.src = tileSourceUrl;
                });
                tilePromises.push(tileLoadPromise);
            }
        }

        Promise.all(tilePromises)
            .then(() => {
                // All tiles processed, final checks are handled within drawSingleTile
            })
            .catch(err => {
                dispatchError(`Error during tile assembly: ${err.message}`);
            });
    };

    publicApi.fetchLocationData = (targetLocation, completionHandler) => {
        console.log('Fetching data for:', targetLocation);
        streetViewServiceClient.getPanoramaByLocation(targetLocation, 50, (dataPayload, operationStatus) => {
            if (operationStatus === google.maps.StreetViewStatus.OK) {
                if (dataAvailableCallback) dataAvailableCallback(dataPayload);
                headingAngle = dataPayload.tiles.centerHeading * Math.PI / 180.0;
                elevationAngle = dataPayload.tiles.originPitch;
                legalNotice = dataPayload.copyright;
                panoramaIdentifier = dataPayload.location.pano;

                publicApi.currentLocation = targetLocation;
                publicApi.viewHeading = headingAngle;
                publicApi.viewElevation = elevationAngle;
                publicApi.imageCaptureDate = dataPayload.imageDate;
                publicApi.panoramaId = panoramaIdentifier;
                publicApi.copyrightInfo = legalNotice;

                completionHandler();
            } else {
                if (noDataCallback) noDataCallback(operationStatus);
                dispatchError('Could not retrieve panorama data: ' + operationStatus);
                completionHandler();
            }
        });
    };

    publicApi.configureMagnification = (magnificationLevel) => {
        currentMagnificationLevel = magnificationLevel;
        publicApi.adjustSurfaceDimensions();
    };

    publicApi.registerProgressCallback = (cb) => progressUpdateCallback = cb;
    publicApi.registerErrorCallback = (cb) => errorSignalCallback = cb;
    publicApi.registerSurfaceResizeCallback = (cb) => surfaceResizeCallback = cb;
    publicApi.registerViewReadyCallback = (cb) => viewReadyCallback = cb;
    publicApi.registerDataAvailableCallback = (cb) => dataAvailableCallback = cb;
    publicApi.registerNoDataCallback = (cb) => noDataCallback = cb;

    publicApi.configureMagnification(internalConfiguration.magnification || 1);

    return publicApi;
};