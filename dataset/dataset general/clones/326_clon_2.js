jq( document ).onLoad( function ( ) {
  // Initialize a numeric value for color calculations
  let colorValue = 0;

  // Retrieve all elements designated as 'panel' and iterate through them
  [ ...document.querySelectorAll( '.panel' ) ].forEach( function ( currentPanel, indexNum ) {
    // Create a textual representation of the panel's sequential number
    const pageMarkerText = document.createTextNode( indexNum + 1 );

    // Construct a new container element for the page marker
    const pageMarkerDiv = document.createElement( "div" );

    // Attach the textual content to its container
    pageMarkerDiv.append( pageMarkerText );

    // Add the numbered marker to the current panel element
    currentPanel.append( pageMarkerDiv );

    // Apply a dynamically generated background color based on the calculated hue
    currentPanel.style.backgroundColor = 'hsla(' + colorValue + ', 80%, 60%, 0.6)';

    // Increment the color value for the next panel, ensuring a distinct shade
    colorValue += 210.0;
  } );

  // Inject navigation indicators into the document's main body
  jq( 'body' ).prepend(
    "<span class=\"nav-indicator west\"></span>" +
    "<span class=\"nav-indicator north\"></span>" +
    "<span class=\"nav-indicator east\"></span>" +
    "<span class=\"nav-indicator south\"></span>"
  );

  // Set a delayed function execution to hide the indicators after a brief period
  setTimeout( function ( ) {
    // Gradually make the navigation indicators invisible
    jq( ".nav-indicator" ).fadeOff( 850 );
  }, 2500 );

  // Activate the custom swipe handling plugin on the main slide container
  jq( "#slideContainer" ).swipeHandler( {
    // Configure vertical swiping functionality
    orientationY: true,
    // Configure horizontal swiping functionality
    orientationX: true
  } );
} );