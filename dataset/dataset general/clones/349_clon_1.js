/**
 * This file defines the OpenLayers.Control.Cross class.
 *
 * Class: OpenLayers.Control.Cross
 *
 * The Cross control renders a visually distinct cross in the very center of the map viewport.
 *
 * It inherits foundational properties and methods from:
 *  - The base <OpenLayers.Control> class.
 *
 * @author Some Developer
 * @version 1.0.0
 */
OpenLayers.Control.Cross = OpenLayers.Class(
    OpenLayers.Control,
    {

        /**
         * Property: EVENT_TYPES
         * {Array(String)} An array of event types supported by this control.
         * The 'crossClick' event is triggered specifically when the cross element is clicked by the user's mouse.
         */
        EVENT_TYPES: ["crossClick"],

        /**
         * Property: size
         * {OpenLayers.Size} Represents the desired dimensions (width and height) for the image
         * or visual element that constitutes the cross.
         */
        size: null,

        /**
         * Property: element
         * {DOMElement} This property holds a reference to the actual DOM element
         * used for displaying the cross within the map's control div.
         */
        element: null,

        /**
         * Constructor: OpenLayers.Control.Cross
         * Initializes and draws a cross control in the central region of the map.
         *
         * Parameters:
         * options - {Object} An optional configuration object. Its properties will be used
         *     to extend and customize the control's default behavior and appearance.
         */
        initialize: function( options ) {
            // Concatenate events specific to this Cross control with those inherited from the base control class.
            // This ensures all relevant events are available for triggering and listening.
            this.EVENT_TYPES = OpenLayers.Control.Cross.prototype.EVENT_TYPES.concat(
                OpenLayers.Control.prototype.EVENT_TYPES
            );

            // Ensure options object exists to prevent errors.
            if ( ! options ) {
                options = {};
            }

            // If a size is not explicitly provided in options, set a default size for the cross.
            if ( ! options.size ) {
                options.size = new OpenLayers.Size(48, 48);
            }

            // Call the superclass's initialize method, passing along the (potentially modified) options.
            OpenLayers.Control.prototype.initialize.apply(this, [options]);
        },

        /**
         * Method: draw
         * Renders the control's DOM elements onto the map.
         * This method is responsible for creating and positioning the cross.
         *
         * Returns:
         * {DOMElement} The main DOM element of this control, typically a div.
         */
        draw: function() {

            // Calculate the central position for the cross element within the map's div.
            // This ensures the cross appears in the visual center.
            var position = new OpenLayers.Pixel(
                ( this.map.div.offsetWidth - this.size.w ) / 2,
                ( this.map.div.offsetHeight - this.size.h ) / 2
            );

            // Call the base control's draw method to handle generic control drawing and positioning.
            OpenLayers.Control.prototype.draw.apply(this, [position]);

            // Create a new div element to serve as the location label for the cross.
            this.element = OpenLayers.Util.createDiv( null );
            // Add a specific CSS class for styling the cross text.
            OpenLayers.Element.addClass( this.element, "olControlCrossText" );

            // Compute the geographical coordinates (LonLat) corresponding to the cross's center.
            var lonlat = this.computeLonLat();
            // Update the inner HTML of the element to display the computed longitude and latitude.
            this.element.innerHTML = lonlat.lon + " / " + lonlat.lat;

            // Append the created location label element to the control's main div.
            this.div.appendChild( this.element );

            // Attach a click event listener to the control's div.
            // When clicked, the onClick method will be invoked in the context of this control.
            OpenLayers.Event.observe( this.div, 'click', OpenLayers.Function.bind( this.onClick, this ) );
            // Register an event listener for the map's "move" event.
            // This ensures the cross's displayed coordinates are updated whenever the map moves.
            this.map.events.register( "move", this, this.onMove );

            // Return the control's main DOM element.
            return this.div;
        },

        /**
         * Method: onMove
         * Callback function executed when the map's 'move' event is triggered.
         * This method is responsible for updating the displayed location text
         * to reflect the new geographical center after the map has moved.
         *
         * Parameters:
         * event - {Event} The map move event object.
         */
        onMove: function( event ) {
            // Re-compute the current geographical coordinates at the cross's position.
            var lonlat = this.computeLonLat();
            // Update the inner HTML of the cross element to show the new coordinates.
            this.element.innerHTML = lonlat.lon + " / " + lonlat.lat;
        },

        /**
         * Method: onClick
         * Callback function executed when the cross control is clicked by the user.
         * This method fires a 'crossClick' event, providing the geographical coordinates
         * of the clicked point.
         *
         * Parameters:
         * event - {Event} The DOM click event object.
         */
        onClick: function( event ) {
            // Determine the geographical coordinates at the center of the cross.
            var lonlat = this.computeLonLat();
            // Trigger the custom 'crossClick' event, passing the computed lonlat as data.
            this.events.triggerEvent( "crossClick", {
                lonlat: lonlat
            } );
        },

        /**
         * Method: computeLonLat
         * Calculates the geographical longitude and latitude corresponding to the
         * precise center of the cross control on the map.
         *
         * Returns:
         * {<OpenLayers.LonLat>} An object representing the longitude and latitude
         *     at the center of the cross.
         */
        computeLonLat: function() {
            // Create a clone of the control's current pixel position.
            var pixel = this.position.clone();
            // Adjust the pixel coordinates to point to the exact center of the cross element.
            pixel.x += this.size.w / 2;
            pixel.y += this.size.h / 2;
            // Convert the adjusted pixel coordinates to geographical LonLat using the map's utility method.
            return this.map.getLonLatFromPixel( pixel );
        },

        /**
         * Property: CLASS_NAME
         * {String} The name of this class, used for debugging and identification.
         */
        CLASS_NAME: "OpenLayers.Control.Cross"
    }
);