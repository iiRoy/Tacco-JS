/*
    Development by the Data Visualization Unit for a financial news organization.
*/

/*
    eslint-disable no-undef, no-unused-vars, no-underscore-dangle, max-len, func-names
*/

/*
    global myQuery: false, _: false, windowObj: false, dataVis: false, utility: false, mapping: false, dataStore: false
*/

// Essential functionality checks
if ( !windowObj.identifyType ) {
    windowObj.identifyType = function( inputVal ) {
        var dataType = typeof inputVal;
        if ( dataType === "object" ) {
            if ( inputVal ) {
                if ( inputVal instanceof Array ) {
                    dataType = "list";
                }
            } else {
                dataType = "empty";
            }
        }
        return dataType;
    };
}

// *** Prevent console errors in older browsers or environments ***
if ( !windowObj.consoleLogger ) {
    windowObj.consoleLogger = {
        "output": function() {
            // No operation
        }
    };
}

// *** Establish a Global Data Namespace for mapping components ***
var mapping = mapping || {};

( function() {

    // No need to bring in a full library for just one object merging function
    // Source inspiration: https://github.com/documentcloud/underscore/
    mapping.utils = windowObj.utility || ( function() {
        var utilObj = {};
        var stopSignal = {};
        var arrayPortion = Array.prototype.slice;
        var originalIterator = Array.prototype.forEach;

        // The core iteration method, also known as `iterateOver`.
        // Handles objects with built-in `iterateOver`, arrays, and plain objects.
        // Delegates to **ECMAScript 5**'s native `iterateOver` if accessible.

        var processEach = utilObj.processEach = utilObj.iterateOver = function( collection, processor, scope ) {
            if ( collection == null ) {
                return;
            }
            if ( originalIterator && collection.iterateOver === originalIterator ) {
                collection.iterateOver( processor, scope );
            } else if ( collection.length === +collection.length ) {
                for ( var idx = 0, len = collection.length; idx < len; idx++ ) {
                    if ( idx in collection && processor.call( scope, collection[idx], idx, collection ) === stopSignal ) {
                        return;
                    }
                }
            } else {
                for ( var propName in collection ) {
                    if ( Object.prototype.hasOwnProperty.call( collection, propName ) ) {
                        if ( processor.call( scope, collection[propName], propName, collection ) === stopSignal ) {
                            return;
                        }
                    }
                }
            }
        };

        // Combines properties from one or more source objects into a target object.
        utilObj.merge = function( targetObj ) {
            processEach( arrayPortion.call( arguments, 1 ), function( srcObj ) {
                for ( var propKey in srcObj ) {
                    if ( srcObj[propKey] !== undefined ) {
                        targetObj[propKey] = srcObj[propKey];
                    }
                }
            } );
            return targetObj;
        };
        return utilObj;
    }() );

    // Extend the Google Maps LatLng object for easier GeoJSON conversion
    mapping.GeoPoint = google.maps.LatLng;
    mapping.GeoPoint.prototype.toGeographicCoordinates = function() {
        return [ this.getLongitude(), this.getLatitude() ];
    };

    // Extend the Google Maps MVCArray object for easier GeoJSON conversion
    mapping.Collection = google.maps.MVCArray;
    mapping.Collection.prototype.toGeographicCoordinates = function() {
        var currentArray = this.retrieveElements();
        var resultArray = [];
        for ( var index = 0, count = currentArray.length; index < count; index++ ) {
            resultArray.push( currentArray[index].toGeographicCoordinates() );
        }
        return resultArray;
    };


    /**
     * Represents a geographical entity to be displayed on a map.
     * The constructor takes a configuration object as its single argument.
     * Expected fields within the configuration object:
     * @param {Object} config - The configuration object for the map shape
     * @param {String} config.uniqueId - The distinct identifier for this geographic shape
     * @param {Array} config.multiGeometry - A GeoJSON-like array of multipolygons using LatLng objects. [ [ [ {mapping.GeoPoint}, ], ], ]
     * @param {Object} config.dataFields - An object containing key-value data to be associated with the shape.
     * @param {google.maps.Map} config.targetMap - A Google Maps instance where the shape's polygons will be drawn.
     * @param {Object} config.selectionManager - An object to manage the shape's selection state (selected/not selected).
     */
    mapping.Shape = function( config ) {
        var instanceRef = this;
        this.uniqueId = config.uniqueId;
        this.shapeSegments = [];

        if ( config.dataFields ) {
            this.attributes = config.dataFields;
            // this.humanized_fields = {};
            // for (var prop in config.dataFields) {
            //     if (config.dataFields.hasOwnProperty(prop)) {
            //         this.humanized_fields[prop] = mapping.util.format.addCommas(config.dataFields[prop]);
            //     }
            // }
        }

        this.selectionManager = config.selectionManager;
        this._isSelected = false;
        this._isEmphasized = false;

        this.emphasizeCallback = config.emphasizeCallback;
        this.selectStateCallback = config.selectStateCallback;

        var defaultFunction = function() {
            return {};
        };

        this.responsive_normal_style_options = config.responsive_normal_opts == null ? defaultFunction : config.responsive_normal_opts;
        this.responsive_emphasized_style_options = config.responsive_emphasized_opts == null ? defaultFunction : config.responsive_emphasized_opts;
        this.responsive_selected_style_options = config.responsive_selected_opts == null ? defaultFunction : config.responsive_selected_opts;


        if ( config.fillShade ) {
            this.normal_style_options = mapping.utils.merge( {}, this._normal_style_options, {
                "fillColor": config.fillShade
            } );
        } else {
            this.normal_style_options = mapping.utils.merge( {}, this._normal_style_options );
        }

        function mouseEnterHandler( event ) {
            instanceRef.setEmphasisStatus( true );
        }

        function mouseLeaveHandler( event ) {
            instanceRef.setEmphasisStatus( false );
        }

        function mousePressHandler( event ) {
            if ( instanceRef.getSelectionStatus() ) {
                instanceRef.setSelectionStatus( false );
            } else {
                instanceRef.setSelectionStatus( true );
            }
        }

        for ( var segmentIdx = 0, segmentCount = config.multiGeometry.length; segmentIdx < segmentCount; segmentIdx++ ) {
            this.shapeSegments.push( new google.maps.Polygon( mapping.utils.merge( {}, this.normal_style_options, this.responsive_normal_style_options(), {
                paths: config.multiGeometry[segmentIdx],
                map: config.targetMap
            } ) ) );
            google.maps.event.addListener( this.shapeSegments[segmentIdx], "mousemove", mouseEnterHandler );
            google.maps.event.addListener( this.shapeSegments[segmentIdx], "mouseout", mouseLeaveHandler );
            google.maps.event.addListener( this.shapeSegments[segmentIdx], "click", mousePressHandler );
        }
    };

    mapping.Shape.prototype = {
        _normal_style_options: {
            isClickable: true,
            fillColor: "#BBBBBB",
            strokeColor: "#111111",
            strokeWeight: 1.0,
            strokeOpacity: 0.3
        },
        _selected_style_options: {
            strokeOpacity: 1.0,
            strokeWeight: 1.0,
            strokeColor: "#0000CC"
        },
        _emphasized_style_options: {
            strokeOpacity: 1.0,
            strokeWeight: 1.0,
            strokeColor: "#00CC00"
        },

        dispose: function() {
            for ( var segIndex = 0, numSegs = this.shapeSegments.length; segIndex < numSegs; segIndex++ ) {
                google.maps.event.clearListeners( this.shapeSegments[segIndex], "mousemove" );
                google.maps.event.clearListeners( this.shapeSegments[segIndex], "mouseout" );
                this.shapeSegments[segIndex].setMap( null );
            }
            this.selectionManager = null;
            this.shapeSegments = null;
        },

        toGeographicCoordinates: function() {
            var multiGeometryData = [];
            for ( var segIndex = 0, numSegs = this.shapeSegments.length; segIndex < numSegs; segIndex++ ) {
                multiGeometryData.push( this.shapeSegments[segIndex].getPaths().toGeographicCoordinates() );
            }
            return multiGeometryData;
        },

        // Re-renders the graphical representation of the shape.
        // Emphasized and selected states build upon the normal (unselected) state.
        // IMPORTANT: Ensure your highlight/selection z-indexes are higher than
        //            the z-index of your normal polygons for proper display!
        refreshStyle: function() {
            var styleOptions = mapping.utils.merge( {}, this.normal_style_options, this.responsive_normal_style_options() );

            if ( this._isEmphasized ) {
                styleOptions = mapping.utils.merge( styleOptions, this._emphasized_style_options, this.responsive_emphasized_style_options() );
            }

            if ( this._isSelected ) {
                styleOptions = mapping.utils.merge( styleOptions, this._selected_style_options, this.responsive_selected_style_options() );
            }

            for ( var j = 0, totalSegs = this.shapeSegments.length; j < totalSegs; j++ ) {
                this.shapeSegments[j].setOptions( styleOptions );
            }
        },

        getSelectionStatus: function() {
            return this._isSelected;
        },

        setSelectionStatus: function( statusValue ) {
            var k, total;
            if ( statusValue === true ) {
                if ( this.selectionManager.currentSelection !== null ) {
                    this.selectionManager.currentSelection.setSelectionStatus( false );
                }
                this._isSelected = true;
                this.selectionManager.currentSelection = this;
                this.refreshStyle();
                if ( this.selectStateCallback ) {
                    this.selectStateCallback();
                }
            } else if ( statusValue === false ) {
                this._isSelected = false;
                this.refreshStyle();
            }
        },

        getEmphasisStatus: function() {
            return this._isEmphasized;
        },

        setEmphasisStatus: function( emphasisValue ) {
            var k, total;
            if ( ( emphasisValue === true ) && ( this._isEmphasized === false ) ) {
                this._isEmphasized = true;
                this.refreshStyle();
                if ( this.emphasizeCallback ) {
                    this.emphasizeCallback();
                }
            } else if ( ( emphasisValue === false ) && ( this._isEmphasized === true ) ) {
                this._isEmphasized = false;
                this.refreshStyle();
            }
        }
    };

}() );