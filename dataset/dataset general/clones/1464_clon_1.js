/* This is a self-executing anonymous function, also known as an Immediately Invoked Function Expression (IIFE).
   It helps to encapsulate the code and prevent variable leakage into the global scope. */
( function ( document , g ) { // 'document' and 'g' (google) are passed as arguments for minification and clarity.

  // Define the main 'Map' object, which encapsulates all map-related logic and state.
  var Map = {

    // Configuration object for the map.
    config: {

      // Default coordinates, initially null. These will be populated from element data attributes.
      coordinates: {
        lat: null , // Latitude value for the map center.
        lng: null   // Longitude value for the map center.
      } ,

      // Google Maps API options. These control the appearance and behavior of the map.
      options: {
        center: null , // The initial center of the map. Will be set after coordinates are parsed.
        zoom: 15 , // The initial zoom level of the map. A higher value means more zoomed in.
        zoomControl: true , // Whether the zoom control should be displayed on the map.
        zoomControlOptions: { // Options for the zoom control's appearance.
          style: g . maps . ZoomControlStyle . SMALL // Use the small style for the zoom control.
        } ,
        disableDoubleClickZoom: false , // Allow double-clicking to zoom the map.
        mapTypeControl: true , // Display the map type control (e.g., Road, Satellite).
        scaleControl: true , // Display the scale control.
        scrollwheel: false , // Disable zooming with the mouse scroll wheel.
        streetViewControl: false , // Hide the Street View 'Pegman' control.
        draggable: true , // Allow the map to be dragged with the mouse.
        overviewMapControl: false , // Do not display the overview map control.
        mapTypeId: g . maps . MapTypeId . ROADMAP , // Set the default map type to 'Roadmap'.
        mapMarker: true , // A custom flag, possibly for internal logic to determine if a marker is needed.
        panControl: false , // Do not display the pan control.

        // Custom styling for the map, defined as an array of style objects.
        styles: [
          { // Style definition for water features.
            featureType: 'water' , // Target water features.
            stylers: [ // Array of styler objects.
              { color: '#badae7' } , // Set water color to a light blue.
              { visibility: 'on' }   // Ensure water features are visible.
            ]
          } ,
          { // Style definition for landscape features.
            featureType: "landscape" , // Target landscape features.
            stylers: [
              { saturation: -150 } , // Desaturate landscape colors significantly.
              { lightness: 15 } , // Adjust lightness slightly.
              { color: '#ececec' } , // Set landscape color to a very light grey.
              { visibility: 'on' }   // Ensure landscape features are visible.
            ]
          } ,
          { // Style definition for all road features.
            featureType: 'road' , // Target all road features.
            stylers: [
              { saturation: -100 } , // Desaturate road colors completely.
              { lightness: 45 }      // Adjust road lightness.
            ]
          } ,
          { // Style definition specifically for highway roads.
            featureType: 'road.highway' , // Target highway roads.
            stylers: [
              { visibility: 'simplified' } // Simplify the appearance of highways.
            ]
          } ,
          { // Style definition for icons on arterial roads.
            featureType: 'road.arterial' , // Target arterial roads.
            elementType: 'labels.icon' , // Specifically target the icons (labels) on these roads.
            stylers: [
              { visibility: 'on' } // Ensure these icons are visible.
            ]
          } ,
          { // Style definition for administrative area text labels.
            featureType: 'administrative' , // Target administrative boundaries.
            elementType: 'labels.text.fill' , // Specifically target the text color of labels.
            stylers: [
              { color: '#444444' } // Set label text color to a dark grey.
            ]
          } ,
          { // Style definition for points of interest (POIs).
            featureType: 'poi' , // Target points of interest.
            stylers: [
              { saturation: -100 } , // Desaturate POI colors completely.
              { lightness: 51 } , // Adjust POI lightness.
              { visibility: 'on' }   // Ensure POI features are visible.
            ]
          }
        ] , // End of the 'styles' array.

      } , // End of the 'options' object.
      iconPath: null // Path to a custom marker icon, if one is specified.
    } , // End of the 'config' object.

    map: null , // This will hold the Google Map object instance once initialized.
    marker: null , // This will hold the Google Map Marker object instance.
    info: null, // This will hold the Google Map InfoWindow object instance.

    /**
     * Initializes the map based on the provided DOM element.
     * Extracts coordinates and icon path from data attributes.
     * @param {HTMLElement} element - The DOM element where the map will be rendered.
     */
    init: function ( element ) {
      // Check for 'dataset' support (modern browsers). IE < 11 does not support element.dataset.
      if ( element . dataset !== undefined ) {
        // If dataset is supported, extract latitude and longitude directly.
        this . config . coordinates = {
          lat: parseFloat ( element . dataset . lat ) , // Parse 'data-lat' attribute to a float.
          lng: parseFloat ( element . dataset . lng )   // Parse 'data-lng' attribute to a float.
        } ;

        // Get the custom icon path from 'data-icon'.
        this . config . iconPath = element . dataset . icon ;

      } else {
        // Fallback for older browsers (e.g., IE < 11) that don't support 'dataset'.
        this . config . coordinates = {
          lat: parseFloat ( element . getAttribute ( 'data-lat' ) ) , // Use getAttribute for compatibility.
          lng: parseFloat ( element . getAttribute ( 'data-lng' ) )   // Use getAttribute for compatibility.
        } ;

        // Get the custom icon path using getAttribute.
        this . config . iconPath = element . getAttribute ( 'data-icon' ) ;
      }

      // Create a Google Maps LatLng object for the map's initial center.
      this . config . options . center = new g . maps . LatLng ( this . config . coordinates . lat , this . config . coordinates . lng ) ;

      // Instantiate a new Google Map, attaching it to the provided DOM 'element'.
      this . map = new g . maps . Map ( element , this . config . options ) ;

      // Call the marker factory to create and place the map marker.
      this . markerFactory ( ) ;
      // Call the info window factory to create and open the info window.
      this . infoFactory ( ) ;

      // Check if Modernizr is available and if the device is a touch device.
      if ( typeof Modernizr !== 'undefined' && Modernizr . touch ) {
        this . map . setOptions ( { draggable: false } ) ; // Disable map dragging on touch devices.
        this . map . setOptions ( { panControl: true } ) ; // Enable pan control on touch devices.
        // Display a specific map link element for touch users.
        document . getElementById ( 'map-link' ) . style . display = 'block' ;
      }

      // Add event listeners to the map for interactivity.
      this . addListeners ( ) ;
    } , // End of the 'init' method.

    /**
     * Adds event listeners, specifically a resize listener to the window.
     */
    addListeners: function ( ) {
      var that = this ; // Store 'this' context for use within the event handler.
      window . onresize = function ( ) { // Attach an event handler for the window's 'resize' event.
        that . redraw ( ) ; // Call the 'redraw' method to adjust the map on resize.
      } ;
    } , // End of the 'addListeners' method.

    /**
     * Creates and places the map marker on the map.
     */
    markerFactory: function ( ) {
      var that = this ; // Store 'this' context.
      this . marker = new g . maps . Marker ( { // Create a new Google Maps Marker instance.
        position: new g . maps . LatLng ( this . config . coordinates . lat , this . config . coordinates . lng ) , // Set marker position.
        map: that . map , // Associate the marker with the current map instance.
        icon: that . config . iconPath // Use the custom icon path if available.
      } ) ;
    } , // End of the 'markerFactory' method.

    /**
     * Creates and opens the info window associated with the marker.
     */
    infoFactory: function ( ) {
      var that = this ; // Store 'this' context.
      // Get the HTML content for the info window from a specific DOM element.
      var content = document . querySelector ( '[data-map-tpl="true"]' ) . innerHTML ;

      this . info = new g . maps . InfoWindow ( { // Create a new Google Maps InfoWindow instance.
        content: content // Set the content of the info window.
      } ) ;
      this . info . open ( that . map , that . marker ) ; // Open the info window on the map, anchored to the marker.

      // Add a click listener to the marker to reopen the info window if it's closed.
      new g . maps . event . addListener ( that . marker , 'click' , function ( ) {
        that . info . open ( that . map , that . marker ) ; // Reopen the info window on marker click.
      } ) ;
    } , // End of the 'infoFactory' method.

    /**
     * Redraws or repositions the map, typically after a resize event.
     */
    redraw: function ( ) {
      this . map . setCenter ( this . marker . getPosition ( ) ) ; // Center the map on the current marker position.
      // Pan the map upwards by the height of the info window's content node.
      this . map . panBy ( 0 , -this . info . k . contentNode . clientHeight ) ;
    } // End of the 'redraw' method.
  } ; // End of the 'Map' object definition.

  // Add an event listener to the document to ensure the DOM is fully loaded before initialization.
  document . addEventListener ( 'DOMContentLoaded' , function ( ) {
    // Check if an element with the 'data-map="true"' attribute exists on the page.
    if ( document . querySelector ( '[data-map="true"]' ) !== null ) {
      // If such an element is found, initialize the Map with that element.
      Map . init ( document . querySelector ( '[data-map="true"]' ) ) ;
    }
  } ) ; // End of the 'DOMContentLoaded' event listener.

} ( document , google ) ) ; // Invoke the IIFE, passing 'document' and 'google' global objects.