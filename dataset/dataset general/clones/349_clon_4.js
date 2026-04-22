function MapCentroidPointer(optionsObject) {
    var currentOptions = optionsObject || {};

    if (!currentOptions.displaySize) {
        currentOptions.displaySize = new OpenLayers.Size(48, 48);
    }

    OpenLayers.Control.call(this, currentOptions);

    var specificEventLabels = ["indicatorTapped"];
    this.EVENT_TYPES = specificEventLabels.concat(OpenLayers.Control.prototype.EVENT_TYPES);

    this.renderedSize = currentOptions.displaySize;
    this.coordinateLabelElement = null;
    this.componentTag = "MapCentroidPointer";
}

MapCentroidPointer.prototype = Object.create(OpenLayers.Control.prototype);
MapCentroidPointer.prototype.constructor = MapCentroidPointer;

MapCentroidPointer.prototype.constructVisualization = function() {
    var horizontalPosition = (this.map.div.offsetWidth - this.renderedSize.w) / 2;
    var verticalPosition = (this.map.div.offsetHeight - this.renderedSize.h) / 2;
    var placementPixel = new OpenLayers.Pixel(horizontalPosition, verticalPosition);

    OpenLayers.Control.prototype.draw.call(this, placementPixel);

    this.coordinateLabelElement = document.createElement('div');
    this.coordinateLabelElement.classList.add('map-indicator-info');

    var currentGeographicPoint = this.determineGeographicCenter();
    this.coordinateLabelElement.textContent = currentGeographicPoint.lon + " / " + currentGeographicPoint.lat;

    this.div.appendChild(this.coordinateLabelElement);

    this.div.addEventListener('click', this.handleVisualizationClick.bind(this));
    this.map.events.register("move", this, this.updateCoordinateDisplay);

    return this.div;
};

MapCentroidPointer.prototype.updateCoordinateDisplay = function() {
    var currentGeographicPoint = this.determineGeographicCenter();
    this.coordinateLabelElement.textContent = currentGeographicPoint.lon + " / " + currentGeographicPoint.lat;
};

MapCentroidPointer.prototype.handleVisualizationClick = function() {
    var currentGeographicPoint = this.determineGeographicCenter();
    this.events.triggerEvent("indicatorTapped", {
        locationData: currentGeographicPoint
    });
};

MapCentroidPointer.prototype.determineGeographicCenter = function() {
    var adjustedPixel = this.position.clone();
    adjustedPixel.x += this.renderedSize.w / 2;
    adjustedPixel.y += this.renderedSize.h / 2;
    return this.map.getLonLatFromPixel(adjustedPixel);
};