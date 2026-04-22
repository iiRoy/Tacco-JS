const GLOBAL_DISPLAY_PANEL_WIDTH = 512;
const GLOBAL_DISPLAY_PANEL_HEIGHT = 512;
const MINIMUM_DJATOKA_DIMENSION = 48;
const DJATOKA_SERVICE_ENDPOINT = '/adore-djatoka/resolver';

class DjatokaTileProviderInternal {
    #underlyingGridLayer;
    #imageDescriptor;
    #levelAdjustment;
    #scaleFactors;
    #nominalTileSize;
    #resourceIdentifierValue;
    #imageFormatType;
    #regionCoordinates;
    #regionDimensions;
    #specVersionValue = 'Z39.88-2004';
    #serviceIdentifierValue = 'info:lanl-repo/svc/getRegion';
    #serviceValueFormatType = 'info:ofi/fmt:kev:mtx:jpeg2000';
    #tileHeightLimit = null;

    constructor(layerName, serviceURL, configOptions, existingGridLayer = null) {
        if (existingGridLayer) {
            this.#underlyingGridLayer = existingGridLayer;
        } else {
            // This constructor is designed to be called after OpenLayers.Layer.Grid.initialize
            // has already run on the outer DjatokaImageSource instance.
            // However, to mimic the original's constructor logic for its own properties,
            // we will create a dummy OpenLayers.Layer.Grid instance here if not provided,
            // or just ensure the outer layer is linked.
            // For the primary constructor path, the outer layer will already be `this` for DjatokaImageSource.
            // The `existingGridLayer` parameter is used by `duplicate` to link to the target's grid layer.
            this.#underlyingGridLayer = new OpenLayers.Layer.Grid(layerName, serviceURL, {}, configOptions);
        }

        this.#resourceIdentifierValue = configOptions.rft_id;
        this.#imageFormatType = configOptions.format;

        if (!configOptions.imgMetadata) {
            const dataRequest = new XMLHttpRequest();
            dataRequest.open('GET', configOptions.metadataUrl, false);
            dataRequest.send(null);
            if (dataRequest.status === 200) {
                this.#imageDescriptor = JSON.parse(dataRequest.responseText);
            } else {
                throw new Error('Failed to retrieve image metadata synchronously: ' + dataRequest.status);
            }
        } else {
            this.#imageDescriptor = configOptions.imgMetadata;
        }

        const minimumLevel = this.#assessMinimumLevel();
        const displayLevel = this.#calculateDisplayLevel(minimumLevel);

        this.#levelAdjustment = minimumLevel - displayLevel;

        const initialWidth = this.#imageDescriptor.width / Math.pow(2, displayLevel);
        const initialHeight = this.#imageDescriptor.height / Math.pow(2, displayLevel);

        this.#scaleFactors = Array.from({ length: displayLevel + 1 }, (_, i) => Math.pow(2, displayLevel - i));
        
        this.#nominalTileSize = new OpenLayers.Size(Math.ceil(initialWidth), Math.ceil(initialHeight));

        this.#underlyingGridLayer.isBaseLayer = true;
        this.#underlyingGridLayer.tileOrigin = null;
        this.#underlyingGridLayer.resolutions = this.#scaleFactors;
        this.#underlyingGridLayer.tileSize = this.#nominalTileSize;
    }

    #assessMinimumLevel() {
        const imageLevels = this.#imageDescriptor.dwtLevels === undefined
            ? this.#imageDescriptor.levels
            : this.#imageDescriptor.dwtLevels;

        const djatokaMinLevels = this.#imageDescriptor.dwtLevels === undefined
            ? Math.floor((Math.log(Math.max(this.#imageDescriptor.width, this.#imageDescriptor.height)) -
                          Math.log(MINIMUM_DJATOKA_DIMENSION)) / Math.log(2))
            : this.#imageDescriptor.levels;
        
        return Math.min(imageLevels, djatokaMinLevels);
    }

    #calculateDisplayLevel(minLvl) {
        const widthLogRatio = Math.log(this.#imageDescriptor.width) - Math.log(GLOBAL_DISPLAY_PANEL_WIDTH);
        const heightLogRatio = Math.log(this.#imageDescriptor.height) - Math.log(GLOBAL_DISPLAY_PANEL_HEIGHT);
        const maxLogRatio = Math.max(widthLogRatio, heightLogRatio);
        const levelCalc = Math.max(0, Math.min(minLvl, maxLogRatio / Math.log(2)));
        return Math.ceil(levelCalc);
    }

    disposeInternal() {
        // No specific internal resources to release beyond what the OpenLayers.Layer.Grid handles
    }

    duplicateInternal(targetProvider) {
        targetProvider.#imageDescriptor = { ...this.#imageDescriptor };
        targetProvider.#levelAdjustment = this.#levelAdjustment;
        targetProvider.#scaleFactors = [...this.#scaleFactors];
        targetProvider.#nominalTileSize = this.#nominalTileSize.clone();
        targetProvider.#resourceIdentifierValue = this.#resourceIdentifierValue;
        targetProvider.#imageFormatType = this.#imageFormatType;
        targetProvider.#regionCoordinates = this.#regionCoordinates ? this.#regionCoordinates.clone() : null;
        targetProvider.#regionDimensions = this.#regionDimensions ? this.#regionDimensions.clone() : null;

        targetProvider.#specVersionValue = this.#specVersionValue;
        targetProvider.#serviceIdentifierValue = this.#serviceIdentifierValue;
        targetProvider.#serviceValueFormatType = this.#serviceValueFormatType;
        targetProvider.#tileHeightLimit = this.#tileHeightLimit;

        // Ensure the underlying grid layer's properties are also updated if needed,
        // though the outer clone method should handle most of this.
        targetProvider.#underlyingGridLayer.isBaseLayer = this.#underlyingGridLayer.isBaseLayer;
        targetProvider.#underlyingGridLayer.tileOrigin = this.#underlyingGridLayer.tileOrigin ? this.#underlyingGridLayer.tileOrigin.clone() : null;
        targetProvider.#underlyingGridLayer.resolutions = [...this.#underlyingGridLayer.resolutions];
        targetProvider.#underlyingGridLayer.tileSize = this.#underlyingGridLayer.tileSize.clone();

        return targetProvider;
    }

    fetchTileURLInternal(tileBounds) {
        const adjustedBounds = this.#underlyingGridLayer.adjustBounds(tileBounds);
        this.#deriveRegionDetails(adjustedBounds);

        const currentZoomLevel = this.#underlyingGridLayer.map.getZoom() + this.#levelAdjustment;

        const pathSegment = `?url_ver=${this.#specVersionValue}&rft_id=${this.#resourceIdentifierValue}&svc_id=${this.#serviceIdentifierValue}&svc_val_fmt=${this.#serviceValueFormatType}&svc.format=${this.#imageFormatType}&svc.level=${currentZoomLevel}&svc.rotate=0&svc.region=${this.#regionCoordinates.lat},${this.#regionCoordinates.lon},${this.#regionDimensions.h},${this.#regionDimensions.w}`;

        let finalURL = this.#underlyingGridLayer.url;
        if (Array.isArray(finalURL)) {
            const hash = pathSegment.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            finalURL = finalURL[hash % finalURL.length];
        }
        return finalURL + pathSegment;
    }

    insertTileElementInternal(tileBounds, tilePosition) {
        this.#deriveRegionDetails(tileBounds);
        return new OpenLayers.Tile.Image(this.#underlyingGridLayer, tilePosition, tileBounds, null, this.#regionDimensions);
    }

    assignMapReferenceInternal(mapInstance) {
        if (!this.#underlyingGridLayer.tileOrigin) {
            this.#underlyingGridLayer.tileOrigin = new OpenLayers.LonLat(mapInstance.maxExtent.left, mapInstance.maxExtent.bottom);
        }
    }

    #deriveRegionDetails(currentBounds) {
        const mapRef = this.#underlyingGridLayer.map;
        const maxExtent = mapRef.getMaxExtent();
        const currentResolution = mapRef.getResolution();

        const xTileCount = Math.round(1 / (this.#nominalTileSize.w / maxExtent.getWidth()));
        const xPositionIndex = Math.round((currentBounds.left / maxExtent.getWidth()) * xTileCount);
        const calculatedX = xPositionIndex * (this.#nominalTileSize.w + 1);
        
        let widthCalculated;
        const xExtentAtResolution = maxExtent.getWidth() / currentResolution;
        if (xPositionIndex === xTileCount - 1) {
            widthCalculated = xExtentAtResolution % (this.#nominalTileSize.w + 1);
        } else {
            widthCalculated = this.#nominalTileSize.w;
        }

        const yTileCount = Math.round(1 / (this.#nominalTileSize.h / maxExtent.getHeight()));
        let invertedY = maxExtent.getHeight() - currentBounds.top;
        invertedY = invertedY < 0 ? 0 : invertedY;
        const yPositionIndex = Math.round((invertedY / maxExtent.getHeight()) * yTileCount);
        const calculatedY = yPositionIndex * (this.#nominalTileSize.h + 1);

        let heightCalculated;
        const yExtentAtResolution = maxExtent.getHeight() / currentResolution;
        if (yPositionIndex === yTileCount - 1) {
            heightCalculated = yExtentAtResolution % (this.#nominalTileSize.h + 1);
        } else {
            heightCalculated = this.#nominalTileSize.h;
        }

        this.#regionCoordinates = new OpenLayers.LonLat(calculatedX, calculatedY);
        this.#regionDimensions = new OpenLayers.Size(widthCalculated, heightCalculated);
    }

    retrieveImageDescriptorInternal() {
        return this.#imageDescriptor;
    }

    obtainScaleFactorsInternal() {
        return this.#scaleFactors;
    }

    acquireNominalTileSizeInternal() {
        return this.#nominalTileSize;
    }

    get baseLayerObject() {
        return this.#underlyingGridLayer;
    }
}

function DjatokaImageSource(name, url, options) {
    OpenLayers.Layer.Grid.prototype.initialize.apply(this, arguments);

    // Link the internal provider to this OpenLayers layer instance
    this.privateProvider = new DjatokaTileProviderInternal(name, url, options, this);

    // Copy properties from the internal provider's baseLayerObject to `this`
    // This is necessary because OpenLayers.Layer.Grid expects these on `this`.
    this.isBaseLayer = this.privateProvider.baseLayerObject.isBaseLayer;
    this.tileOrigin = this.privateProvider.baseLayerObject.tileOrigin;
    this.resolutions = this.privateProvider.baseLayerObject.resolutions;
    this.tileSize = this.privateProvider.baseLayerObject.tileSize;
}

DjatokaImageSource.prototype = Object.create(OpenLayers.Layer.Grid.prototype);
DjatokaImageSource.prototype.constructor = DjatokaImageSource;
DjatokaImageSource.prototype.CLASS_NAME = "DjatokaImageSource";

DjatokaImageSource.prototype.destroy = function() {
    this.privateProvider.disposeInternal();
    OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);
};

DjatokaImageSource.prototype.clone = function(targetObject) {
    let finalTarget = targetObject;
    if (finalTarget === null || finalTarget === undefined) {
        finalTarget = new DjatokaImageSource(this.name, this.url, this.options);
    }
    
    finalTarget = OpenLayers.Layer.Grid.prototype.clone.apply(this, [finalTarget]);

    // Deep clone the internal DjatokaTileProvider state
    this.privateProvider.duplicateInternal(finalTarget.privateProvider);

    return finalTarget;
};

DjatokaImageSource.prototype.getURL = function(bounds) {
    return this.privateProvider.fetchTileURLInternal(bounds);
};

DjatokaImageSource.prototype.addTile = function(bounds, position) {
    return this.privateProvider.insertTileElementInternal(bounds, position);
};

DjatokaImageSource.prototype.setMap = function(map) {
    OpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
    this.privateProvider.assignMapReferenceInternal(map);
};

DjatokaImageSource.prototype.getImageMetadata = function() {
    return this.privateProvider.retrieveImageDescriptorInternal();
};

DjatokaImageSource.prototype.getResolutions = function() {
    return this.privateProvider.obtainScaleFactorsInternal();
};

DjatokaImageSource.prototype.getTileSize = function() {
    return this.privateProvider.acquireNominalTileSizeInternal();
};

DjatokaImageSource.viewerWidth = GLOBAL_DISPLAY_PANEL_WIDTH;
DjatokaImageSource.viewerHeight = GLOBAL_DISPLAY_PANEL_HEIGHT;
DjatokaImageSource.minDjatokaLevelDimension = MINIMUM_DJATOKA_DIMENSION;
DjatokaImageSource.djatokaURL = DJATOKA_SERVICE_ENDPOINT;