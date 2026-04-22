/*
 * This file defines the main controller for the ChunkCompile application.
 * It manages the navigation and dynamic loading of modules.
 */
Ext.define ( "ChunkCompile.controller.Main", {

    // This controller extends the base Ext.app.Controller class.
    extend : 'Ext.app.Controller',


    // Specifies the views that this controller requires to be loaded.
    requires: [
        'ChunkCompile.view.Page2'
    ],

    // Configuration object for the controller.
    config: {
        // Defines control rules for components.
        control: {
            // Target the component with xtype 'main'.
            'main': {
                // Listen for the 'activeitemchange' event on the main component.
                activeitemchange: 'onMainActiveCardChange'
            } // End of 'main' control
        } // End of control config
    }, // End of controller config


    /**
     * Handler for the 'activeitemchange' event on the main panel.
     * This function is responsible for dynamically loading and displaying 'Page 2'
     * if certain conditions are met.
     *
     * @param {Ext.Panel} mainPanel The main panel that triggered the event.
     * @param {Ext.Component} newItem The new active item in the main panel.
     * @param {Ext.Component} oldItem The previously active item in the main panel.
     */
    onMainActiveCardChange: function ( mainPanel, newItem, oldItem ) {
        // Flag to track whether the main panel was masked (spinner shown).
        var didMask = false;


        // If the new item is not specifically identified as 'nextCard',
        // then this function's logic is not applicable, so we exit early.
        if ( newItem.getItemId() !== 'nextCard' ) {
            return ;
        }


        // Check if 'Page 2' has already been added as a child component to the new item.
        // If it exists, there's no need to load it again.
        if ( newItem.down('page2') ) {
            return;
        }


        // This block handles dynamic loading of 'page2.js' if the application
        // is built (production mode) and 'ChunkCompile.view.Page2' is not yet defined.
        if ( ChunkCompile.isBuilt && !ChunkCompile.view.Page2 ) {
            // Display a loading spinner to the user.
            mainPanel.setMasked( true ) ;
            didMask = true ; // Mark that the mask was applied.

            // Asynchronously load the 'page2.js' script file.
            // Note: The original code used 'synchronously load JS' comment but the call is async.
            Ext.Loader.loadScriptFile (
                'page2.js',
                function() {
                    // Callback for successful script loading.
                    console.log('SUCCESS: page2.js loaded.');
                },
                function() {
                    // Callback for failed script loading.
                    console.log('FAIL: Failed to load page2.js.');
                },
                this, // Scope for the callbacks.
                true // Indicates that the script is a module.
            ) ;
        } // End of dynamic loading block.


        // After ensuring the view class is available (either pre-loaded or dynamically loaded),
        // add an instance of 'Page 2' to the new active item.
        newItem.add( { xtype : 'page2' } );


        // If a spinner was shown earlier, it's now safe to hide it.
        if ( didMask ) {
            mainPanel.setMasked( false ) ;
        } // End of mask handling.
    } // End of onMainActiveCardChange method.

} ) ; // End of Ext.define call.