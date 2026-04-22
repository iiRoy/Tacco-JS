/*
    This is a Type I clone of the original source code.
    Only whitespace and comments have been altered.
    All functional elements, identifiers, and logic remain precisely as in the original.

    Original License Information (unchanged):
    Copyright 2010 Spearhead Development, L.L.C. <http://www.spearheaddev.com/>

    This file is part of Accentuate.us.

    Accentuate.us is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Accentuate.us is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Accentuate.us. If not, see <http://www.gnu.org/licenses/>.
*/


// Ensure the global Charlifter object exists, creating it if it doesn't.
if ( "undefined" == typeof ( Charlifter ) )
{
    var Charlifter = {}; /* Initialize Charlifter namespace */
}
; // End of Charlifter namespace initialization check.


// Define the Charlifter.Toolbar module.
Charlifter.Toolbar = function ( ) {

    // Internal variables for the toolbar state.
    let btn = null ; // Reference to the toolbar button DOM element.
    let on  = false ; // Flag to track if live accentuation is currently active.


    // Return the public API for the toolbar module.
    return {

        // Method to initialize the toolbar button.
        init : function ( ) {

            // Get the button element by its ID.
            btn = window.document.getElementById ( "accentuateus-live-button" ) ;

            // Initially disable the live accentuation.
            this.disable ( ) ;
        } ,


        // Method to enable live accentuation.
        enable : function ( ) {

            try {
                // Call the core lifter function to turn on live accentuation.
                Charlifter.Lifter.liveOn ( ) ;
            }
            catch ( e ) {
                // If an error occurs, display an alert.
                alert ( e ) ;
            }

            // Update the internal state.
            on = true ;

            // Set button attributes for the "enabled" state.
            btn.setAttribute ( "label" , "Disable" ) ;
            btn.setAttribute ( "tooltiptext" , "Accentuate.us: Click to disable live accentuation" ) ;
            btn.setAttribute ( "oncommand" , "Charlifter.Toolbar.disable();" ) ;
        } ,


        // Method to disable live accentuation.
        disable : function ( ) {

            // Call the core lifter function to turn off live accentuation.
            Charlifter.Lifter.liveOff ( ) ;

            // Update the internal state.
            on = false ;

            // Set button attributes for the "disabled" state.
            btn.setAttribute ( "label" , "Enable" ) ;
            btn.setAttribute ( "tooltiptext" , "Accentuate.us: Click to enable live accentuation" ) ;
            btn.setAttribute ( "oncommand" , "Charlifter.Toolbar.enable();" ) ;
        } ,


        // Method to toggle live accentuation on and off.
        toggle : function ( ) {

            // Check the current state of live accentuation.
            if ( on == true ) {
                // If it's on, disable it.
                this.disable ( ) ;
            }
            else {
                // If it's off, enable it.
                this.enable ( ) ;
            }
        }
    }
} ( ) ; // Immediately invoke the function to create the Toolbar object.


// Add an event listener to initialize the toolbar once the window has loaded.
window.addEventListener ( "load" , function ( ) {
    // Initialize the Charlifter toolbar.
    Charlifter.Toolbar.init ( ) ;
} , false ) ; // Use false for event bubbling phase (default).