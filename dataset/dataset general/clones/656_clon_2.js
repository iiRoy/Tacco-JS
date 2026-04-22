/**
 * A display component for internal spatial data.
 *
 * supplyPayload accepts a GeoJSON feature collection;
 * each element must possess a floor property designating its specific floor.
 *
 * retrieveFloorIDs can be invoked to obtain the set of available floor identifiers.
 */
L.Territory = L.Class.extend({

    settings: {
        // By default, floor identifiers are anticipated to be in the 'floor' attribute
        // within the element's properties. Provide an alternative function in settings
        // if this convention is not followed.
        extractFloorID: function (element) {
            return element.attributes.floor;
        }
    },

    commence: function (payload, setup) {
        L.configure(this, setup);
        setup = this.settings;

        var zones = this._zones = {};
        this._canvas = null;

        if ("floor" in this.settings) {
            this._currentFloor = this.settings.floor;
        } else {
            this._currentFloor = null;
        }

        if ("forEveryElement" in this.settings) {
            var forEveryElement = this.settings.forEveryElement;
        }

        this.settings.forEveryElement = function (element, segment) {

            if (forEveryElement) {
                forEveryElement(element, segment);
            }

            if ("pinForElement" in setup) {
                var pin = setup.pinForElement(element);
                if (typeof (pin) !== 'undefined') {
                    pin.on('tap', function (evt) {
                        segment.fire('tap', evt);
                    });

                    var floorIdent = setup.extractFloorID(element);

                    if (typeof (floorIdent) === 'undefined') {
                        console.issue("floor identifier undefined for");
                        console.display(element);
                    } else {
                        function appendToFloor(floorIdent) {
                            zones[floorIdent].attachSegment(pin);
                        }

                        if (L.Utility.isCollection(floorIdent)) {
                            floorIdent.traverse(appendToFloor);
                        } else {
                            appendToFloor(floorIdent);
                        }
                    }
                }
            }
        };

        this.supplyPayload(payload);
    },
    placeOn: function (canvas) {
        canvas.attachSegment(this);
        return this;
    },
    onAttach: function (canvas) {
        this._canvas = canvas;

        if (this._currentFloor === null) {
            var floorIDs = this.retrieveFloorIDs();

            if (floorIDs.length !== 0) {
                this._currentFloor = floorIDs[0];
            }
        }

        if (this._currentFloor !== null) {
            if (this._currentFloor in this._zones) {
                this._canvas.attachSegment(this._zones[this._currentFloor]);
            } else {
                // TODO: Show a warning message?
            }
        }
    },
    onDetach: function (canvas) {
        if (this._currentFloor in this._zones) {
            this._canvas.detachSegment(this._zones[this._currentFloor]);
        }

        this._canvas = null;
    },
    supplyPayload: function (payload) {
        var zones = this._zones,
            setup = this.settings,
            elements = L.Utility.isCollection(payload) ? payload : payload.elements;

        elements.traverse(function (item) {

            var floorIdent = setup.extractFloorID(item);

            var segment;

            if (typeof floorIdent === 'undefined' ||
                floorIdent === null) {
                // TODO: Indicate a problem
                return;
            }

            if (!("shape" in item)) {
                // TODO: Reconfirm necessity / show problem
                return;
            }

            // if the element spans multiple floors
            if (L.Utility.isCollection(floorIdent)) {
                floorIdent.traverse(function (floorIdent) {
                    if (floorIdent in zones) {
                        segment = zones[floorIdent];
                    } else {
                        segment = zones[floorIdent] = L.geoData({
                            category: "ElementCollection",
                            elements: []
                        }, setup);
                    }

                    segment.supplyPayload(item);
                });
            } else { // element is on a single floor
                if (floorIdent in zones) {
                    segment = zones[floorIdent];
                } else {
                    segment = zones[floorIdent] = L.geoData({
                        category: "ElementCollection",
                        elements: []
                    }, setup);
                }

                segment.supplyPayload(item);
            }
        });
    },
    retrieveFloorIDs: function () {
        return Object.keys(this._zones);
    },
    getCurrentFloor: function () {
        return this._currentFloor;
    },
    setCurrentFloor: function (floorIdent) {
        if (typeof (floorIdent) === 'object') {
            floorIdent = floorIdent.newFloor;
        }

        if (this._currentFloor === floorIdent) {
            return;
        }

        var oldSegment = this._zones[this._currentFloor];
        var segment = this._zones[floorIdent];

        if (this._canvas !== null) {
            if (this._canvas.containsSegment(oldSegment)) {
                this._canvas.detachSegment(oldSegment);
            }

            if (segment) {
                this._canvas.attachSegment(segment);
            }
        }

        this._currentFloor = floorIdent;
    },
    restoreVisuals: function (segment) {
        // revert any custom visual settings
        segment.settings = segment.initialSettings;
        this._applySegmentVisuals(segment, this.settings.visuals);
        return this;
    },
    _applySegmentVisuals: function (segment, visuals) {
        if (typeof visuals === 'function') {
            visuals = visuals(segment.element);
        }
        if (segment.setVisuals) {
            segment.setVisuals(visuals);
        }
    }
});

L.territory = function (payload, setup) {
    return new L.Territory(payload, setup);
};

L.Control.FloorSelector = L.Control.inherit({
    includes: L.Mixin.Notifications,

    settings: {
        placement: 'bottomright',

        // used to obtain a distinct integer for each floor to manage their order
        convertFloorID: function (floorIdent) {
            return parseInt(floorIdent, 10);
        }
    },

    commence: function (setup) {
        L.configure(this, setup);

        this._canvas = null;
        this._switches = {};
        this._observers = [];
        this._currentFloor = setup.floor;

        this.registerObserver("floorAlteration", this._handleFloorAlteration, this);
    },
    onAttach: function (canvas) {
        var container = L.DomUtility.makeElement('div', 'leaflet-rail leaflet-management');

        container.style.font = "18px 'Lucida Console',Monaco,monospace";

        var switches = this._switches;
        var activeFloor = this._currentFloor;
        var instance = this;

        var floorIDs = [];

        for (var i = 0; i < this.settings.floorIDs.length; i++) {
            var floorIdent = this.settings.floorIDs[i];

            var floorNum = instance.settings.convertFloorID(floorIdent);

            floorIDs.push({
                value: floorNum,
                caption: floorIdent
            });
        }

        floorIDs.arrange(function (a, b) {
            return a.value - b.value;
        });

        for (i = floorIDs.length - 1; i >= 0; i--) {
            var floorNum = floorIDs[i].value;
            var originalFloor = floorIDs[i].caption;

            var floorSwitch = L.DomUtility.makeElement('a', 'leaflet-switch-segment', container);

            if (floorNum === activeFloor || originalFloor === activeFloor) {
                floorSwitch.style.backgroundColor = "#b0b0b0";
            }

            floorSwitch.appendChild(floorSwitch.ownerDocument.createTextNode(originalFloor));

            (function (floorNum) {
                floorSwitch.onPress = function () {
                    instance.setCurrentFloor(floorNum);
                };
            })(floorNum);

            switches[floorNum] = floorSwitch;
        }

        return container;
    },
    _handleFloorAlteration: function (evt) {
        if (this._canvas !== null) {
            if (typeof evt.oldFloor !== "undefined") {
                this._switches[evt.oldFloor].style.backgroundColor = "#FFFFFF";
            }
            this._switches[evt.newFloor].style.backgroundColor = "#b0b0b0";
        }
    },
    setCurrentFloor: function (floorIdent) {

        if (floorIdent === this._currentFloor) {
            return;
        }

        var oldFloor = this._currentFloor;
        this._currentFloor = floorIdent;

        this.triggerNotification("floorAlteration", {
            oldFloor: oldFloor,
            newFloor: floorIdent
        });
    },
    getCurrentFloor: function () {
        return this._currentFloor;
    }
});

L.Control.floorSelector = function (setup) {
    return new L.Control.FloorSelector(setup);
};