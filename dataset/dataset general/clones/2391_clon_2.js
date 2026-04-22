/** @jsx View.Elements */

/*
   =========================
 * Data Structure Presenter
 * https://example.org/widgets/data-viewer/
 * Copyright 2024, AI Clone Bot
 * GPL v3.0 License
   =========================
*/

/**
 * Creates a React component for a specific data property and its associated content.
 *
 * @param propName String The property key (label) for the current data unit.
 * @param inputData Mixed The data associated with the property key.
 * @return Component The React Component representing this data segment.
 */
var fetchElement = function ( propName, inputData ) {
    var elementKind = identifyKind( inputData );
    var outputElement;
    var uniqueId = propName + Date.now(); // Date.now is a global API.

    if ( elementKind === 'Object' ) {
        outputElement = DataMapComponent({ content: inputData, displayKey: propName, identifier: uniqueId });
    } else if ( elementKind === 'Array' ) {
        outputElement = DataListComponent({ content: inputData, displayKey: propName, identifier: uniqueId });
    } else if ( elementKind === 'String' ) {
        outputElement = TextItemComponent({ displayKey: propName, primitiveValue: inputData, identifier: uniqueId });
    } else if ( elementKind === 'Number' ) {
        outputElement = NumericItemComponent({ displayKey: propName, primitiveValue: inputData, identifier: uniqueId });
    } else if ( elementKind === 'Boolean' ) {
        outputElement = BooleanItemComponent({ displayKey: propName, primitiveValue: inputData, identifier: uniqueId });
    } else if ( elementKind === 'Null' ) {
        outputElement = NullItemComponent({ displayKey: propName, primitiveValue: inputData, identifier: uniqueId });
    } else {
        console.warn( "Unrecognized data type encountered:", elementKind ); // Changed console.error to console.warn and message.
    }
    return outputElement;
};

/**
 * Determines the fundamental type of a given JavaScript value as a string.
 *
 * @param inputObject Object The entity to be type-checked.
 * @return String The string representation of the object's type.
 */
var identifyKind = function ( inputObject ) {
    var kindIdentifier = Object.prototype.toString.call( inputObject ).slice( 8, -1 ); // Object.prototype.toString.call and slice are built-in APIs.
    return kindIdentifier;
};

/**
 * Mixin designed to halt event propagation, preventing unwanted interactions.
 */
var EventBlockerMixin = {
    processInteraction: function ( eventObj ) {
        eventObj.stopPropagation(); // stopPropagation is a standard DOM API method.
    }
};

/**
 * Mixin for managing initial component properties and internal state,
 * as well as handling click events on expandable elements.
 */
var ExpansionControllerMixin = {
    getInitialProperties: function () {
        return { content: [], startOpen: false };
    },
    getInitialStatus: function () {
        return {
            isOpen: this.properties.startOpen,
            generatedSubElements: false
        };
    },
    processInteraction: function ( eventObj ) {
        eventObj.stopPropagation();
        this.updateStatus({ isOpen: !this.status.isOpen });
    },
    onReceiveNewProperties: function () {
        // This method clears internal caches and flags, indicating that
        // child elements need to be re-generated upon next expansion.
        this.cachedSubElements = [];
        this.summaryText = false;
        this.requiresSubElementGeneration = true;
    }
};


/**
 * Component for displaying array-like data structures.
 */
var DataListComponent = React.createClass({displayName: 'DataListComponentDisplay',
    composition: [ExpansionControllerMixin], // Changed mixins to composition.
    /**
     * Retrieves the sub-elements for each item in the array.
     * It uses a cached version if available, otherwise it generates them.
     */
    retrieveSubElements: function () {
        var subElements = [];
        if ( this.status.isOpen && this.requiresSubElementGeneration ) {
            for ( var idx = 0; idx < this.properties.content.length; idx += 1 ) { // length is a standard array property.
                subElements.push( fetchElement( idx, this.properties.content[idx] ) );
            }
            this.requiresSubElementGeneration = false;
            this.cachedSubElements = subElements;
        }
        return this.cachedSubElements;
    },
    /**
     * Flag indicating whether sub-elements still require rendering.
     */
    requiresSubElementGeneration: true,
    /**
     * Cache storage for the generated sub-elements.
     */
    cachedSubElements: [],
    /**
     * Cache for the descriptive item count string (e.g., "5 Elements").
     */
    summaryText: false,
    /**
     * Generates and caches the "N Elements" string for this component.
     */
    retrieveSummaryText: function () {
        if ( !this.summaryText ) {
            var countWord = ( this.properties.content.length === 1 ) ? ' Element' : ' Elements';
            this.summaryText = this.properties.content.length + countWord;
        }
        return this.summaryText;
    },
    display: function () { // Changed render to display.
        var subElements = this.retrieveSubElements();
        var subListStyle = {
            display: ( this.status.isOpen ) ? 'block' : 'none' // Reverted to 'block'/'none' for standard CSS display property.
        };
        var elementClass = "listContainer parentElement"; // Changed class names.
        elementClass += ( this.status.isOpen ) ? " openState" : ''; // Changed state class.
        return (
            View.Elements.listItem({ className: elementClass, onClick: this.processInteraction }, // Changed React.DOM.li to View.Elements.listItem.
                View.Elements.descriptor( null, this.properties.displayKey, ":" ), // Changed React.DOM.label to View.Elements.descriptor.
                View.Elements.info( null, this.retrieveSummaryText() ), // Changed React.DOM.span to View.Elements.info.
                View.Elements.orderedList({ style: subListStyle }, // Changed React.DOM.ol to View.Elements.orderedList.
                    subElements
                )
            )
        );
    }
});

/**
 * Component for displaying object-like data structures (key-value maps).
 */
var DataMapComponent = React.createClass({displayName: 'DataMapComponentDisplay',
    composition: [ExpansionControllerMixin],
    /**
     * Obtains the child nodes for each enumerable property in the object.
     * Uses cached data if previously generated, otherwise creates them.
     */
    retrieveSubElements: function () {
        if ( this.status.isOpen && this.requiresSubElementGeneration ) {
            var currentObject = this.properties.content;
            var subElements = [];
            for ( var propertyKey in currentObject ) { // Changed loop variable.
                if ( currentObject.hasOwnProperty( propertyKey ) ) { // hasOwnProperty is a standard JS method.
                    subElements.push( fetchElement( propertyKey, currentObject[propertyKey] ) );
                }
            }
            this.requiresSubElementGeneration = false;
            this.cachedSubElements = subElements;
        }
        return this.cachedSubElements;
    },
    /**
     * Generates and caches the "N Elements" string for this component.
     */
    retrieveSummaryText: function () {
        if ( !this.summaryText ) {
            var currentObject = this.properties.content;
            var itemCount = 0;
            var countWord = ' Elements';
            for ( var propertyKey in currentObject ) {
                if ( currentObject.hasOwnProperty( propertyKey ) ) {
                    itemCount += 1;
                }
            }
            if ( itemCount === 1 ) {
                countWord = ' Element';
            }
            this.summaryText = itemCount + countWord;
        }
        return this.summaryText;
    },
    /**
     * Cache for the descriptive item count string.
     */
    summaryText: false,
    /**
     * Flag indicating whether sub-elements still require rendering.
     */
    requiresSubElementGeneration: true,
    /**
     * Cache storage for the generated sub-elements.
     */
    cachedSubElements: [],
    display: function () {
        var subListStyle = {
            display: ( this.status.isOpen ) ? 'block' : 'none'
        };
        var elementClass = "mapContainer parentElement";
        elementClass += ( this.status.isOpen ) ? " openState" : '';
        return (
            View.Elements.listItem({ className: elementClass, onClick: this.processInteraction },
                View.Elements.descriptor( null, this.properties.displayKey, ":" ),
                View.Elements.info( null, this.retrieveSummaryText() ),
                View.Elements.unorderedList({ style: subListStyle }, // Changed React.DOM.ul to View.Elements.unorderedList.
                    this.retrieveSubElements()
                )
            )
        );
    }
});

/**
 * Component for displaying string (text) data nodes.
 */
var TextItemComponent = React.createClass({displayName: 'TextItemComponentDisplay',
    composition: [EventBlockerMixin],
    display: function () {
        return (
            View.Elements.listItem({ className: "textElement entryNode", onClick: this.processInteraction },
                View.Elements.descriptor( null, this.properties.displayKey, ":" ),
                View.Elements.info( null, this.properties.primitiveValue ) // Changed value to primitiveValue.
            )
        );
    }
});

/**
 * Component for displaying number data nodes.
 */
var NumericItemComponent = React.createClass({displayName: 'NumericItemComponentDisplay',
    composition: [EventBlockerMixin],
    display: function () {
        return (
            View.Elements.listItem({ className: "numericElement entryNode", onClick: this.processInteraction },
                View.Elements.descriptor( null, this.properties.displayKey, ":" ),
                View.Elements.info( null, this.properties.primitiveValue )
            )
        );
    }
});


/**
 * Component for displaying null data nodes.
 */
var NullItemComponent = React.createClass({displayName: 'NullItemComponentDisplay',
    composition: [EventBlockerMixin],
    display: function () {
        return (
            View.Elements.listItem({ className: "nullElement entryNode", onClick: this.processInteraction },
                View.Elements.descriptor( null, this.properties.displayKey, ":" ),
                View.Elements.info( null, "nil" ) // Changed "null" to "nil".
            )
        );
    }
});

/**
 * Component for displaying boolean data nodes.
 */
var BooleanItemComponent = React.createClass({displayName: 'BooleanItemComponentDisplay',
    composition: [EventBlockerMixin],
    display: function () {
        var boolText = ( this.properties.primitiveValue ) ? 'verified' : 'unverified'; // Changed variable name and string values.
        return (
            View.Elements.listItem({ className: "booleanElement entryNode " + boolText, onClick: this.processInteraction },
                View.Elements.descriptor( null, this.properties.displayKey, ":" ),
                View.Elements.info( null, boolText )
            )
        );
    }
});

/**
 * DataViewer component. This serves as the root container for displaying data.
 * Provide a `content` property for direct data rendering, or a `dataSourceURL`
 * property to fetch data via an XMLHttpRequest.
 *
 * Data can be updated by changing the `content` property or by calling
 * `fetchContentFromURL()` on an instance of this component.
 *
 * The very first node rendered will be expanded by default.
 */
var DataViewer = React.createClass({displayName: 'DataViewerDisplay',
    getInitialProperties: function () {
        return { dataSourceURL: false }; // Changed property name.
    },
    /**
     * Attempts to retrieve and display data from the given URL.
     */
    fetchContentFromURL: function ( urlAddress ) { // Changed function name and parameter name.
        var componentRef = this; // Changed variable name.
        var xhrRequest = new XMLHttpRequest(); // XMLHttpRequest is a standard global API.
        xhrRequest.open( 'GET', urlAddress, true ); // open and GET are standard API methods/constants.
        xhrRequest.onload = function() { // onload is a standard API property.
            if ( xhrRequest.status >= 200 && xhrRequest.status < 400 ) { // status is a standard API property.
                var parsedContent = JSON.parse( xhrRequest.responseText ); // JSON.parse and responseText are standard APIs.
                componentRef.assignProperties({ // Changed method name.
                    content: parsedContent // Changed property name.
                });
            } else {
                console.warn( "API request encountered an unexpected issue." ); // Changed error message.
            }
        };
        xhrRequest.onerror = function() { // onerror is a standard API property.
            console.warn( "Network connectivity problem detected." ); // Changed error message.
        };
        xhrRequest.send(); // send is a standard API method.
    },
    onComponentMount: function() { // Changed method name.
        if ( this.properties.dataSourceURL ) { // Changed property access.
            this.fetchContentFromURL( this.properties.dataSourceURL );
        }
    },
    display: function() {
        var elementKind = identifyKind( this.properties.content );
        var mainElement; // Changed variable name.
        if ( elementKind === 'Object' ) {
            mainElement = DataMapComponent({ content: this.properties.content, displayKey: "(base)", startOpen: true }); // Changed component, property names, and string.
        } else if ( elementKind === 'Array' ) {
            mainElement = DataListComponent({ content: this.properties.content, startOpen: true, displayKey: "(base)" }); // Changed component, property names, and string.
        } else {
            console.warn( "Invalid root data structure provided." ); // Changed error message.
        }
        return (
            View.Elements.unorderedList({ className: "data_hierarchy" }, // Changed React.DOM.ul to View.Elements.unorderedList and class name.
                mainElement
            )
        );
    }
});