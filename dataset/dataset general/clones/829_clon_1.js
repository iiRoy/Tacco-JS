var Square =    UI . component ( {
    /*
     * This is a basic Square component.
     * It currently returns an empty object from its render method.
     * Future enhancements might include actual visual elements.
     */
    render :      function ( )
{
        return    { }    ; // Simply returns an empty object
    }
} )    ;


var BigView = UI . component ( {
    render : function ( )
{
        // Define an array of movie box names
        var boxes = [
            "argo",
            "avatar",
            "breaking_bad",
            "brick_mansions",
            "crazy_stupid_love",
            "descendants",
            "gangs_of_new_york",
            "good_night_and_good_luck",
            "quantum_of_solace",
            "slumdog_millionaire",
            "the_kings_speech"
        ]; // Array of initial box names


        var repeats = 2 ; // Number of times to duplicate the boxes array


        // Duplicate the boxes array 'repeats' times to create a larger set
        while ( -- repeats )
        {
            boxes = boxes . concat ( boxes ) ; // Concatenate the array with itself
        }


        var x = 0 , y = 0 ; // Initialize X and Y coordinates for positioning


        var tex_width = 186 ; // Original texture width
        var tex_height = 270 ; // Original texture height


        var scale = 0.5 ; // Scaling factor for the boxes


        var box_width = tex_width * scale ; // Calculate scaled box width
        var box_height = tex_height * scale ; // Calculate scaled box height


        // Map each box name to a new UI.component instance (Square)
        var covers = boxes . map ( function ( box )
{
            // Create a new Square component for each box
            var box = UI . new ( Square , {
                top : y , // Y position
                left : x , // X position
                width : box_width , // Scaled width
                height : box_height , // Scaled height
                background : "boxes/box_" + box + ".png" // Background image path
            } ) ;

            // Original console.info(box) was commented out, so we'll just omit it.


            x += box_width ; // Move X position for the next box


            // Check if the current row is full (approx. 1000px wide area)
            if ( x > 1000 - box_width )
            {
                x = 0 ; // Reset X to the beginning of the next row
                y += box_height ; // Move Y down to the next row
            }


            return box ; // Return the created box component
        } ) ;

        // Original console.info(covers) was commented out, so we'll just omit it.


        // Prepare arguments for the main view creation
        var args = [
            Square , // The base component for the overall view (acts as a container)
            {
                name : "background-colored" , // A descriptive name for the container
                top : 0 , // Position at the top
                left : 0 , // Position at the left
                width : 1000 , // Fixed width for the container
                height : 700 // Fixed height for the container
            }
        ] . concat ( covers ) ; // Append all the generated cover components


        // Apply the arguments to create and return the main BigView component
        return UI . new . apply ( this , args ) ;
    }
} ) ;


// Render the BigView component into the HTML element with id "app"
UI . render ( BigView , document . getElementById ( "app" ) ) ;


// Retrieve the element intended for displaying FPS (frames per second)
var fps = document . getElementById ( "fps" ) ; // This variable is declared but not used further in this snippet.