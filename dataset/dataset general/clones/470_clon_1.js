/*
 *  This section handles the dynamic collapsing of the navigation bar
 *  when the user scrolls down the page.
 *  It leverages jQuery for DOM manipulation and event handling.
 */
$( window ).scroll( function()
{
    // Check if the top offset of the navbar exceeds a certain threshold (50 pixels)
    if  (  $( ".navbar" ).offset().top  >  50  )
    {
        // If scrolled past the threshold, add the 'top-nav-collapse' class to the fixed navbar
        $( ".navbar-fixed-top" ).addClass( "top-nav-collapse" ) ;
    }
    else
    {
        // Otherwise, remove the 'top-nav-collapse' class, reverting its appearance
        $( ".navbar-fixed-top" ).removeClass( "top-nav-collapse" ) ;
    }
} ) ;


// This block initializes functionality once the DOM is fully loaded.
// It implements smooth page scrolling for navigation links.
$( function()
{
    // Attach a click event handler to all anchor tags within elements having 'page-scroll' class
    $( '.page-scroll a' ).bind( 'click' ,  function(  event  )
    {
        // Store the clicked anchor element in a jQuery object
        var   $anchor   =   $( this ) ;

        // Animate the scroll position of the html and body elements
        $( 'html, body' ).stop().animate(
        {
            // Scroll to the top position of the element referenced by the anchor's href attribute
            scrollTop:  $(  $anchor.attr( 'href' )  ).offset().top
        } ,
        1500 , // Animation duration in milliseconds
        'easeInOutExpo' // Easing function for a smoother animation effect
        ) ;

        // Prevent the default anchor click behavior (e.g., jumping directly to the href)
        event.preventDefault() ;
    } ) ;
} ) ;

// This section defines the configuration for a custom-styled Google Map.
// Map styles are sourced from Snazzy Maps.
var   myOptions   =   {
    zoom:  15 ,  // Initial zoom level of the map
    center:  new   google.maps.LatLng(  53.385873 ,  -1.471471  ) ,  // Centered coordinates (latitude, longitude)
    mapTypeId:  google.maps.MapTypeId.ROADMAP ,  // Type of map to display (e.g., roadmap, satellite)
    disableDefaultUI:  true ,  // Disables default Google Map UI controls (zoom, pan, etc.)
    styles: [ // Array of styling rules for different map features
        {
            "featureType": "water" ,
            "elementType": "geometry" ,
            "stylers": [
                { "color": "#000000" } , // Dark color for water features
                { "lightness": 17 }
            ]
        } ,
        {
            "featureType": "landscape" ,
            "elementType": "geometry" ,
            "stylers": [
                { "color": "#000000" } , // Dark color for landscape features
                { "lightness": 20 }
            ]
        } ,
        {
            "featureType": "road.highway" ,
            "elementType": "geometry.fill" ,
            "stylers": [
                { "color": "#000000" } , // Dark fill for highways
                { "lightness": 17 }
            ]
        } ,
        {
            "featureType": "road.highway" ,
            "elementType": "geometry.stroke" ,
            "stylers": [
                { "color": "#000000" } , // Dark stroke for highways
                { "lightness": 29 } ,
                { "weight": 0.2 }
            ]
        } ,
        {
            "featureType": "road.arterial" ,
            "elementType": "geometry" ,
            "stylers": [
                { "color": "#000000" } , // Dark color for arterial roads
                { "lightness": 18 }
            ]
        } ,
        {
            "featureType": "road.local" ,
            "elementType": "geometry" ,
            "stylers": [
                { "color": "#000000" } , // Dark color for local roads
                { "lightness": 16 }
            ]
        } ,
        {
            "featureType": "poi" , // Points of Interest
            "elementType": "geometry" ,
            "stylers": [
                { "color": "#000000" } , // Dark color for POIs
                { "lightness": 21 }
            ]
        } ,
        {
            "elementType": "labels.text.stroke" ,
            "stylers": [
                { "visibility": "on" } ,
                { "color": "#000000" } , // Dark stroke for text labels
                { "lightness": 16 }
            ]
        } ,
        {
            "elementType": "labels.text.fill" ,
            "stylers": [
                { "saturation": 36 } ,
                { "color": "#000000" } , // Dark fill for text labels
                { "lightness": 40 }
            ]
        } ,
        {
            "elementType": "labels.icon" ,
            "stylers": [
                { "visibility": "off" } // Hide icons on the map
            ]
        } ,
        {
            "featureType": "transit" ,
            "elementType": "geometry" ,
            "stylers": [
                { "color": "#000000" } , // Dark color for transit features
                { "lightness": 19 }
            ]
        } ,
        {
            "featureType": "administrative" ,
            "elementType": "geometry.fill" ,
            "stylers": [
                { "color": "#000000" } , // Dark fill for administrative areas
                { "lightness": 20 }
            ]
        } ,
        {
            "featureType": "administrative" ,
            "elementType": "geometry.stroke" ,
            "stylers": [
                { "color": "#000000" } , // Dark stroke for administrative areas
                { "lightness": 17 } ,
                { "weight": 1.2 }
            ]
        }
    ]
} ;

// Create a new Google Map instance and render it into the 'map' element
var   map   =   new   google.maps.Map(  document.getElementById( 'map' ) ,  myOptions  ) ;