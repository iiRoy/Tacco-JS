var Visualizers = Visualizers || { } ; // Ensure Visualizers object exists, otherwise create it.

Visualizers.Hexagons = _.extend(
 { // Start of the Hexagons object definition.

    hexs : [ ] , // An array to store references to the individual hexagon DOM elements. This starts empty.

    numOfHexs : 15 , // Defines the total number of hexagons that will be rendered on the screen.

    hexDefaultTransformStr : 'rotate(0deg)' , // The initial CSS transform string applied to each hexagon.

    currentOverlay : '' , // A string variable to keep track of which overlay ('color' or 'gradient') is currently active.

    fps : 70 , // Frames per second setting, although its direct usage isn't explicitly shown in these methods.

    init : function ( ) // The initialization method for the Hexagons visualizer.
    {
        this.setupElements( ) ; // Call the method to create and configure all necessary DOM elements.
        this.setShading( ) ; // Apply initial shading styles to the hexagons.
        this.setColors( ) ; // Set the initial colors for the overlays.

        // Set up an interval to periodically update the overlay colors every 10 seconds (10000 milliseconds).
        // The _.bind ensures 'this' context is correctly maintained for setColors.
        this.ColorTimer = setInterval( _.bind( this.setColors , this ) , 10000 ) ;
    } , // End of the init function.


    setupElements : function ( ) // Method responsible for constructing the visualizer's DOM structure.
    {
        // Create the main container elements for hexagons and overlays.
        var hexContainer = document.createElement( 'div' ) , // Container for all hexagon wrappers.
            overlayContainer = document.createElement( 'div' ) , // Parent for both color and gradient overlays.
            colorOverlay = document.createElement( 'div' ) , // The solid color overlay element.
            gradientOverlay = document.createElement( 'div' ) ; // The gradient color overlay element.


        hexContainer.id = 'hex-container' ; // Assign an ID to the hexagon container.
        overlayContainer.id = 'overlay-container' ; // Assign an ID to the overlay container.
        colorOverlay.id = 'color-overlay' ; // Assign an ID to the solid color overlay.
        gradientOverlay.id = 'gradient-overlay' ; // Assign an ID to the gradient overlay.

        colorOverlay.className = 'overlay' ; // Add 'overlay' class to the color overlay.
        gradientOverlay.className = 'overlay' ; // Add 'overlay' class to the gradient overlay.


        overlayContainer.appendChild( gradientOverlay ) ; // Append the gradient overlay to its parent.
        overlayContainer.appendChild( colorOverlay ) ; // Append the solid color overlay to its parent.


        this.visualizer.appendChild( overlayContainer ) ; // Add the entire overlay system to the main visualizer.
        this.visualizer.appendChild( hexContainer ) ; // Add the hexagon container to the main visualizer.


        // Loop to create and append each individual hexagon.
        for ( var i = 0 ; i < this.numOfHexs ; i ++ )
        {
            var hexWrapper = document.createElement( 'div' ) , // A wrapper div for each hexagon, used for scaling.
                hex = document.createElement( 'div' ) ; // The actual hexagon shape element.


            hexWrapper.appendChild( hex ) ; // Place the hexagon inside its wrapper.
            // Apply the default transform string to the hexagon, using a browser-specific prefix.
            hex.style[ prefix.css + 'transform' ] = this.hexDefaultTransformStr ;


            hexWrapper.className += ' hex-wrapper' ; // Add the 'hex-wrapper' class.
            hex.className += ' hex' ; // Add the 'hex' class to the actual hexagon.


            hexContainer.appendChild( hexWrapper ) ; // Append the wrapper (containing the hex) to the main hex container.
        } // End of the hexagon creation loop.


        // Store references to the created DOM elements on the 'this' object for later access.
        this.hexContainer = hexContainer ; // Reference to the main container for hexagons.
        this.overlayContainer = overlayContainer ; // Reference to the container holding both overlays.
        this.colorOverlay = colorOverlay ; // Reference to the solid color overlay element.
        this.gradientOverlay = gradientOverlay ; // Reference to the gradient overlay element.


        // Populate the 'hexs' array with all elements having the class 'hex'.
        this.hexs = document.getElementsByClassName( 'hex' ) ; // Get all hexagon elements.
    } , // End of the setupElements method.


    setShading : function ( ) // Method to apply shading and border styles to the hexagons.
    {
        var color = 'rgba(255,255,255,0.08)' ; // Define the semi-transparent white color for shading.


        for ( var j = 0 ; j < this.numOfHexs ; j ++ )
        {
            // Construct CSS rules for the :before and :after pseudo-elements of each hexagon.
            // These rules create the top and bottom triangular parts of the hexagon with a border color.
            var beforeStr = '#hex' + j + ':before { border-bottom-color : ' + color + '}' ; // CSS rule for the top triangle.
            var afterStr = '#hex' + j + ':after { border-top-color : ' + color + '}' ; // CSS rule for the bottom triangle.


            this.hexs[ j ].id = 'hex' + j ; // Assign a unique ID to each hexagon element.
            this.hexs[ j ].style[ 'background-color' ] = color ; // Set the background color of the main hexagon body.
            // Insert the generated CSS rules into the first stylesheet found on the page.
            document.styleSheets[ 0 ].insertRule( beforeStr , 0 ) ; // Insert the :before rule at index 0.
            document.styleSheets[ 0 ].insertRule( afterStr , 0 ) ; // Insert the :after rule at index 0.

        } // End of the shading loop.
    } , // End of the setShading method.


    setColors : function ( ) // Method to dynamically change the background of the overlays.
    {
        // todo: Add cross-browser support for opacity and gradients
        // This comment indicates a future improvement area.

        // Generate a random linear gradient string, including the browser prefix.
        var gradientStr = prefix.css + "linear-gradient(-30deg, " + randomColor( ) + " 0%," + randomColor( ) + " 50%," + randomColor( ) + " 100%)" ;

        // Check the current state of the overlay.
        if ( this.currentOverlay === 'gradient' ) // If a gradient is currently displayed.
        {
            this.colorOverlay.style[ 'background' ] = randomColor( ) ; // Set a new random solid color.
            this.colorOverlay.style.opacity = 1 ; // Make the solid color overlay fully opaque.
            this.gradientOverlay.style.opacity = 0 ; // Hide the gradient overlay.
            this.currentOverlay = 'color' ; // Update the state to 'color'.
        }
        else if ( this.currentOverlay === 'color' ) // If a solid color is currently displayed.
        {
            this.gradientOverlay.style[ 'background' ] = gradientStr ; // Set a new random gradient.
            this.colorOverlay.style.opacity = 0 ; // Hide the solid color overlay.
            this.gradientOverlay.style.opacity = 1 ; // Make the gradient overlay fully opaque.
            this.currentOverlay = 'gradient' ; // Update the state to 'gradient'.
        }
        else // If no overlay type is set (initial state).
        {
            this.colorOverlay.style.opacity = 0 ; // Ensure the solid color overlay is hidden.
            this.gradientOverlay.style[ 'background' ] = gradientStr ; // Set the initial gradient background.
            this.currentOverlay = 'gradient' ; // Set the initial state to 'gradient'.
        }

    } , // End of the setColors method.


    onSpectrum : function ( spectrum ) // Callback method to handle incoming audio spectrum data.
    {
        // Process the raw spectrum data into 'numOfHexs' average samples.
        var sampleAvgs = sampleArray( spectrum , this.numOfHexs ) ;


        // Iterate through each hexagon to update its visual state based on spectrum averages.
        for ( var i = 0 ; i < this.numOfHexs ; i ++ )
        {
            // Apply a CSS transform to scale each hexagon's parent wrapper.
            // The scale factor is derived from the spectrum average, ensuring a minimum scale of 1.
            this.hexs[ i ].parentNode.style[ prefix.css + 'transform' ] = this.hexDefaultTransformStr + ' scale(' + ( sampleAvgs[ i ] * 100 + 1 ) + ')' ;
        } // End of the spectrum processing loop.
    } , // End of the onSpectrum method.


    onDestroy : function ( ) // Cleanup method called when the visualizer is being removed or destroyed.
    {
        clearInterval( this.ColorTimer ) ; // Clear the interval timer to prevent memory leaks and stop color updates.
    } // End of the onDestroy method.

} , Visualizers.Base ) ; // Extend this object with properties and methods from Visualizers.Base.