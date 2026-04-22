// This file contains JavaScript code for managing a Google Map and its markers.
// It's part of an example application for displaying geographical points.

/* Global variable declarations start here.
   These variables are accessible throughout the script. */
var map;                                       // The main Google Map object instance.
var idInfoBoxAberto;                           // Stores the ID of the currently open InfoBox.
var infoBox = [ ];                             // An array to hold InfoBox instances.
var markers = [];                              // An array to hold Google Map Marker instances.
/* Global variable declarations end here. */



function initialize ( ) {
    // This function initializes the Google Map.

	// Define the initial geographical coordinates for the map center.
	var latlng = new google.maps.LatLng ( -18.8800397, -47.05878999999999 ) ;

    /*
     * Configure map options.
     * This object specifies properties like zoom level, center, and map type.
     */
    var options = {
        zoom          :           5 ,
		center        :           latlng ,
        mapTypeId     :           google.maps.MapTypeId.ROADMAP     // Set map type to 'ROADMAP'.
    } ;

    // Create a new Google Map instance and associate it with the 'mapa' HTML element.
    map = new google.maps.Map ( document.getElementById ( "mapa" ) , options ) ;

} // End of initialize() function.


// Call the initialization function to set up the map when the script loads.
initialize ( ) ;



function abrirInfoBox ( id, marker ) {

	// Check if there's an InfoBox currently open.
	if  (  typeof (  idInfoBoxAberto  )  ==  'number'  &&  typeof (  infoBox [ idInfoBoxAberto ]  )  ==  'object'  )
	{
		// If an InfoBox is open, close it before opening a new one.
		infoBox [ idInfoBoxAberto ] . close ( ) ;
	}

	// Open the InfoBox corresponding to the given ID.
	infoBox [ id ] . open ( map, marker ) ;

	// Update the variable that keeps track of the currently open InfoBox.
	idInfoBoxAberto = id ;

} // End of abrirInfoBox() function.



function carregarPontos ( ) {
	/* This function is responsible for loading geographical points from a JSON file,
	   creating markers for them, and adding them to the map. */


	$.getJSON ( 'js/pontos.json' , function ( pontos ) {

		// Create a LatLngBounds object to automatically adjust the map zoom and center.
		var latlngbounds = new google.maps.LatLngBounds ( ) ;


		// Iterate over each point retrieved from the JSON data.
		$.each ( pontos , function ( index, ponto ) {

			// Create a new Google Maps Marker for the current point.
			var marker = new google.maps.Marker ( {
				position  :  new google.maps.LatLng ( ponto.Latitude, ponto.Longitude ) ,
				title     :  "Meu ponto personalizado! :-D" , // Custom title for the marker.
				icon      :  'img/marcador.png'            // Path to a custom marker icon.
			} ) ;


			// Define options for the InfoBox associated with this marker.
			var myOptions = {
				content      :  "<p>" + ponto.Descricao + "</p>" , // HTML content for the InfoBox.
				pixelOffset  :  new google.maps.Size ( -150 , 0 )  // Offset the InfoBox position.
        	} ;

			// Create a new InfoBox instance for the current point and store it in the array.
			infoBox [ ponto.Id ]  =  new InfoBox ( myOptions ) ;

			// Associate the marker with its InfoBox.
			infoBox [ ponto.Id ] . marker  =  marker ;


			// Add a click listener to the marker.
			// When the marker is clicked, it will open its corresponding InfoBox.
			infoBox [ ponto.Id ] . listener = google.maps.event.addListener ( marker , 'click' , function ( e ) {
				abrirInfoBox ( ponto.Id , marker ) ;
			} ) ;

			// Add the newly created marker to the global markers array.
			markers.push ( marker ) ;

			// Extend the LatLngBounds to include the position of the current marker.
			latlngbounds.extend ( marker.position ) ;

		} ) ; // End of $.each loop.


		// Create a MarkerClusterer to group nearby markers for better performance and visualization.
		var markerCluster = new MarkerClusterer ( map , markers ) ;

		// Adjust the map viewport to fit all markers within the calculated bounds.
		map.fitBounds ( latlngbounds ) ;

	} ) ; // End of $.getJSON callback.

} // End of carregarPontos() function.


// Call the function to load points and display them on the map.
carregarPontos ( ) ;