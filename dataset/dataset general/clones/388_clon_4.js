var geomap = geomap || {};

if (!window.typeIdentifier) {
    window.typeIdentifier = function(item){
        var itemType = typeof item;
        if(itemType === "object") {
            if(item) {
                if(item instanceof Array) itemType = "array";
            } else {
                itemType = "null";
            }
        }
        return itemType;
    };
}

if (!window.consoleOutput) { window.consoleOutput = { "logMessage": function() {} }; }

geomap.objectComposer = function(...sources) {
    const target = {};
    for (const source of sources) {
        if (source) {
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
};

google.maps.LatLng.prototype.exportGeoPoint = function() { return [this.lng(), this.lat()]; };
google.maps.MVCArray.prototype.exportGeoPoint = function() {
    return this.getArray().map(element => element.exportGeoPoint());
};

(function() {
    class GeographicShape {
        static #defaultBaseOptions = {
            canClick: true,
            fillColorProperty: "#BBBBBB",
            outlineColorProperty: "#000000",
            outlineWeightProperty: 1.0,
            outlineOpacityProperty: 0.20
        };

        static #defaultSelectedOptions = {
            outlineOpacityProperty: 1.0,
            outlineWeightProperty: 1.0,
            outlineColorProperty: "#0000FF"
        };

        static #defaultHighlightedOptions = {
            outlineOpacityProperty: 1.0,
            outlineWeightProperty: 1.0,
            outlineColorProperty: "#00FF00"
        };

        #identifier;
        #shapeComponents = [];
        #attributeData;
        #managingEntity;
        #currentlySelected = false;
        #currentlyHighlighted = false;
        #onHighlight;
        #onSelect;
        #baseVisualOptions;
        #responsiveBaseOptsProvider;
        #responsiveHighlightedOptsProvider;
        #responsiveSelectedOptsProvider;

        constructor(config) {
            this.#identifier = config.shapeId;
            this.#attributeData = config.attributeData || {};

            this.#managingEntity = config.managingEntity;

            this.#onHighlight = config.onHighlight;
            this.#onSelect = config.onSelect;

            const noOpOptions = () => ({});

            this.#responsiveBaseOptsProvider = config.responsiveBaseOptions || noOpOptions;
            this.#responsiveHighlightedOptsProvider = config.responsiveHighlightedOptions || noOpOptions;
            this.#responsiveSelectedOptsProvider = config.responsiveSelectedOptions || noOpOptions;

            let initialVisualProperties = geomap.objectComposer({}, GeographicShape.#defaultBaseOptions);
            if (config.fillColorCode) {
                initialVisualProperties.fillColorProperty = config.fillColorCode;
            }
            this.#baseVisualOptions = initialVisualProperties;

            this.handleMouseOverEvent = this.handleMouseOverEvent.bind(this);
            this.handleMouseOutEvent = this.handleMouseOutEvent.bind(this);
            this.handleClickEvent = this.handleClickEvent.bind(this);

            if (config.multiGeometry) {
                config.multiGeometry.forEach(geomPart => {
                    const polygonOptions = geomap.objectComposer(
                        {},
                        this.#baseVisualOptions,
                        this.#responsiveBaseOptsProvider(),
                        {
                            paths: geomPart,
                            map: config.renderingMap
                        }
                    );
                    const newPolygon = new google.maps.Polygon(polygonOptions);
                    this.#shapeComponents.push(newPolygon);

                    google.maps.event.addListener(newPolygon, "mousemove", this.handleMouseOverEvent);
                    google.maps.event.addListener(newPolygon, "mouseout", this.handleMouseOutEvent);
                    google.maps.event.addListener(newPolygon, "click", this.handleClickEvent);
                });
            }
        }

        handleMouseOverEvent() {
            this.alterHighlightState(true);
        }

        handleMouseOutEvent() {
            this.alterHighlightState(false);
        }

        handleClickEvent() {
            this.alterSelectionState(!this.querySelectionState());
        }

        removeDrawingElements() {
            this.#shapeComponents.forEach(poly => {
                google.maps.event.clearListeners(poly, "mousemove");
                google.maps.event.clearListeners(poly, "mouseout");
                google.maps.event.clearListeners(poly, "click");
                poly.setMap(null);
            });
            this.#managingEntity = null;
            this.#shapeComponents = [];
        }

        retrieveGeoJSON() {
            return this.#shapeComponents.map(poly => poly.getPaths().exportGeoPoint());
        }

        updateVisualStyle() {
            let currentOptions = geomap.objectComposer({}, this.#baseVisualOptions, this.#responsiveBaseOptsProvider());

            if (this.#currentlyHighlighted) {
                currentOptions = geomap.objectComposer(currentOptions, GeographicShape.#defaultHighlightedOptions, this.#responsiveHighlightedOptsProvider());
            }

            if (this.#currentlySelected) {
                currentOptions = geomap.objectComposer(currentOptions, GeographicShape.#defaultSelectedOptions, this.#responsiveSelectedOptsProvider());
            }

            this.#shapeComponents.forEach(poly => {
                const gmOptions = {
                    clickable: currentOptions.canClick,
                    fillColor: currentOptions.fillColorProperty,
                    strokeColor: currentOptions.outlineColorProperty,
                    strokeWeight: currentOptions.outlineWeightProperty,
                    strokeOpacity: currentOptions.outlineOpacityProperty,
                    zIndex: currentOptions.zIndex
                };
                poly.setOptions(gmOptions);
            });
        }

        querySelectionState() {
            return this.#currentlySelected;
        }

        queryHighlightState() {
            return this.#currentlyHighlighted;
        }

        alterSelectionState(newValue) {
            if (newValue === true) {
                if (this.#managingEntity && this.#managingEntity.currentSelection !== null && this.#managingEntity.currentSelection !== this) {
                    this.#managingEntity.currentSelection.alterSelectionState(false);
                }
                this.#currentlySelected = true;
                if (this.#managingEntity) {
                    this.#managingEntity.currentSelection = this;
                }
                this.updateVisualStyle();
                if (this.#onSelect) {
                    this.#onSelect();
                }
            } else if (newValue === false) {
                this.#currentlySelected = false;
                if (this.#managingEntity && this.#managingEntity.currentSelection === this) {
                    this.#managingEntity.currentSelection = null;
                }
                this.updateVisualStyle();
            }
        }

        alterHighlightState(newValue) {
            if (newValue === true && !this.#currentlyHighlighted) {
                this.#currentlyHighlighted = true;
                this.updateVisualStyle();
                if (this.#onHighlight) {
                    this.#onHighlight();
                }
            } else if (newValue === false && this.#currentlyHighlighted) {
                this.#currentlyHighlighted = false;
                this.updateVisualStyle();
            }
        }
    }

    geomap.GeographicShape = GeographicShape;
}());