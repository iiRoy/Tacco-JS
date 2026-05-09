// This file defines the Dialog and Guides classes.
// It's part of a bootstrapping process for a design tool.

var Dialog ; // Declare the Dialog variable in the global scope.

// The Dialog class is defined using an Immediately Invoked Function Expression (IIFE).
Dialog = ( function ( ) {

    // The constructor function for the Dialog class.
    function Dialog ( ) {
        // When a new Dialog instance is created, it immediately initializes the Guides.
        new Guides ( ) ;
    } // End of Dialog constructor.

    // Return the Dialog constructor function to be assigned to the Dialog variable.
    return Dialog ;

} ) ( ) ; // Execute the IIFE to define Dialog.

// Declare the Guides variable in the global scope.
var Guides ;

// The Guides class is also defined using an IIFE to encapsulate its scope.
Guides = ( function ( ) {

    // The constructor function for the Guides class.
    function Guides ( ) {
        // Call the method to ensure a document is active or created.
        this . createDocument ( ) ;

        // Suspend Photoshop's history panel for the 'Bootstrapping' operation.
        // The second argument is a JavaScript string that will be evaluated to call this.setup().
        app . activeDocument . suspendHistory ( "Bootstrapping" , "this.setup()" ) ;
    } // End of Guides constructor.


    // Prototype method to set up guides and layers based on application settings.
    Guides . prototype . setup = function ( ) {
        // Create the horizontal and vertical guides.
        this . createGuides ( settings . guides ) ;

        // Create the necessary layers and return the result of that operation.
        return this . createLayers ( settings . layers ) ;
    } ; // End of setup method.


    // Prototype method to create a new document if none are open, or reference the active one.
    Guides . prototype . createDocument = function ( ) {
        // Check if there are any open documents in the application.
        if ( ! app . documents . length ) {
            // If no documents are open, create a new one with predefined settings.
            // Parameters: width, height, resolution, name (empty string), color mode.
            app . documents . add ( settings . width , settings . height , 72 , "" , NewDocumentMode . RGB ) ;
        }

        // Store a reference to the currently active document in the 'doc' property.
        return this . doc = app . activeDocument ;
    } ; // End of createDocument method.


    // Prototype method to add guides to the document.
    Guides . prototype . createGuides = function ( guides ) {
        var pos , _i , _j , _len , _len1 , _ref , _ref1 , _results ; // Declare local variables for loop iteration and references.

        // Iterate through the horizontal guide positions.
        _ref = guides . horizontal ;
        for ( _i = 0 , _len = _ref . length ; _i < _len ; _i ++ ) {
            pos = _ref [ _i ] ;
            // Add a horizontal guide to the document, converting position to pixels and rounding.
            this . doc . guides . add ( Direction . HORIZONTAL , UnitValue ( "" + ( Math . round ( pos ) ) + " pixels" ) ) ;
        } // End of horizontal guides loop.

        // Prepare to iterate through the vertical guide positions.
        _ref1 = guides . vertical ;
        _results = [ ] ; // Initialize an array to store results of vertical guide creation.
        for ( _j = 0 , _len1 = _ref1 . length ; _j < _len1 ; _j ++ ) {
            pos = _ref1 [ _j ] ;
            // Add a vertical guide and push the result into the _results array.
            _results . push ( this . doc . guides . add ( Direction . VERTICAL , UnitValue ( "" + ( Math . round ( pos ) ) + " pixels" ) ) ) ;
        } // End of vertical guides loop.

        return _results ; // Return the collection of created vertical guides.
    } ; // End of createGuides method.


    // Prototype method to create layers and layer sets recursively.
    Guides . prototype . createLayers = function ( layers , parent ) {
        var layer , obj , set , _i , _len , _ref , _results ; // Declare local variables for layer objects and iteration.

        // If no parent container is provided, default to the document itself.
        if ( ! parent ) {
            parent = this . doc ;
        }

        // Iterate through the layers array in reverse order.
        _ref = layers . reverse ( ) ;
        _results = [ ] ; // Initialize an array to collect results of layer creation.
        for ( _i = 0 , _len = _ref . length ; _i < _len ; _i ++ ) {
            obj = _ref [ _i ] ;
            // Check if the current object represents a layer set (i.e., it has nested layers).
            if ( obj . layers != null ) {
                // Create a new layer set within the parent.
                set = parent . layerSets . add ( ) ;
                set . name = obj . name ; // Assign the name to the new layer set.
                // Recursively call createLayers for the nested layers within this new set.
                _results . push ( this . createLayers ( obj . layers , set ) ) ;
            } else {
                // If it's not a layer set, it's an art layer.
                layer = parent . artLayers . add ( ) ; // Create a new art layer.
                _results . push ( layer . name = obj . name ) ; // Assign the name to the new art layer.
            }
        } // End of layers iteration loop.

        return _results ; // Return the collection of created layers/layer sets.
    } ; // End of createLayers method.

    // Return the Guides constructor function to be assigned to the Guides variable.
    return Guides ;

} ) ( ) ; // Execute the IIFE to define Guides.


// Declare a variable to hold the instance of Dialog.
var dialog ;

// Create a new instance of the Dialog class, initiating the bootstrapping process.
dialog = new Dialog ( ) ;