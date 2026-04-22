/*
 * This script ensures that jQuery is available for the jsTree plugin.
 * If jQuery is not defined globally, it attempts to use django.jQuery.
 */
if ( typeof  jQuery ===  'undefined' )  {
    jQuery  =  django.jQuery ;
}

// Immediately Invoked Function Expression (IIFE) to encapsulate the code,
// passing jQuery as the '$' alias.
( function ( $ )  {

    // Execute code when the DOM is fully loaded and ready.
    $ ( function ( )  {

        "use strict" ; // Enforce strict mode for cleaner code and fewer errors.

        // Check if the 'filtrate' functionality is active. If not, exit early.
        if  ( ! filtrate.is_active ( ) )   {  return ;  }

        // Define the base path for selecting elements within the filtrate UI.
        var   path    =    'div.filtrate div.content > div.treefilter' ;

        // Iterate over each textarea element found within the defined path.
        // These textareas likely contain JSON data for tree structures.
        $ ( path + ' > textarea' ) . each ( function ( )  {

            // Find the associated tree container for the current textarea.
            var tree = $ ( this ) . parent ( ) . find ( 'form > div.tree' ) ;

            // Initialize jsTree on the identified tree container.
            tree . jstree ( {
                 "themes"   :   {   "theme"   :   "classic" ,   "dots"   :   true ,   "icons"   :   false   } ,  // Configure tree themes.
                 "plugins"  :   [   "themes" ,   "json_data" ,   "ui" ,   "checkbox"   ] ,                   // Enable required jsTree plugins.
                 "json_data" :   {   "data"   :   $ . parseJSON ( $ ( this ) . val ( ) ) ,   } ,             // Provide JSON data parsed from textarea value.
            } ) . bind ( "loaded.jstree" , { 'tree' : tree } , function ( event )  {
                // This callback fires once the jsTree is fully loaded.

                // Find all list items marked as 'is_selected=true' within the loaded tree.
                $ ( this ) . find ( 'li[is_selected=true]' ) . each ( function ( )  {
                    // For each selected item, programmatically check its corresponding checkbox.
                    $ . jstree . _reference ( $ ( event.data.tree ) ) . check_node ( this ) ;
                } ) ;

            } ) ; // End of jstree initialization and loaded.jstree binding.

        } ) ; // End of textarea.each loop.

        // Attach a click event handler to the submit button within the filtrate UI.
        $ ( path + ' input[type=submit]' ) . click ( function ( )  {

            // Get a reference to the parent form of the clicked submit button.
            var   form    =    $ ( this ) . parent ( ) ;

            // Find the tree element within this form.
            var   tree    =    form . find ( '.tree' ) ;

            // Retrieve all checked nodes from the jstree.
            // The 'false' argument means to not include partially checked nodes.
            // The 'true' argument means to return the actual DOM elements.
            var   checked =   $ . jstree . _reference ( $ ( tree ) ) . get_checked ( false , true ) ;

            // Map the checked nodes to their 'obj_id' attribute and join them into a comma-separated string.
            checked   =   $ . map ( checked , function ( n )  {
                // Parent nodes without an "obj_id" attribute will be automatically discarded
                // by returning undefined, which $.map filters out.
                return   $ ( n ) . attr ( 'obj_id' ) ;
            } ) . join ( "," ) ; // Join the array of IDs into a single string.

            // Set the value of the hidden input field with class 'checked' to the collected IDs.
            form . find ( 'input.checked' ) . val ( checked ) ;

        } ) ; // End of submit button click handler.

    } ) ; // End of DOM ready function.

} ) ( jQuery ) ; // Pass jQuery to the IIFE.