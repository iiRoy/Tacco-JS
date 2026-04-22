sap.ui.jsview ( "sapui5tutorial1.App" , {


    // This section defines the view's controller configuration.
    /*
     * Specifies the Controller associated with this specific View.
     * If no controller is needed, or if the method returns 'null',
     * then this View operates without a dedicated controller instance.
     * @memberOf sapui5tutorial1.App
     */
    getControllerName : function ( ) { // Function to retrieve the controller name.

        return "sapui5tutorial1.App" ;
    } ,


    // This method is invoked once the controller has been initialized.
    /*
     * This function serves as the primary location for constructing the user interface.
     * The controller object is passed as an argument, enabling immediate attachment
     * of event handlers to UI elements during construction.
     * @memberOf sapui5tutorial1.App
     */
    createContent : function ( oController ) { // Main UI construction method.

        this . setDisplayBlock ( true ) ;

        // Returns the root UI element for this view.
        return new sap . m . App ( "navContainer" ) ;
    }

} ) ;