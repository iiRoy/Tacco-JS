/*
 * This is a core manifest file.
 * It's responsible for bundling various JavaScript assets into a single application.js file.
 *
 * All files listed below (using the '= require' directive) will be included in the final compiled output.
 *
 * You can reference files from the following standard directories:
 * - current directory (where this manifest resides)
 * - lib/assets/javascripts
 * - vendor/assets/javascripts
 *
 * It's generally not recommended to write application-specific code directly within this manifest.
 * If you do, ensure it appears after all the 'require' directives.
 *
 * Important Note: The first blank line encountered after the initial comments and before any '= require'
 * directives signifies the end of the manifest processing section.
 * Any subsequent blank lines should only appear AFTER all the '= require' directives.
 */


// Core library dependencies:


    //= require jquery


    //= require jquery_ujs


    //= require jquery.clippy


    //= require bootstrap

// Include all JavaScript files from the current directory and its subdirectories:


    //= require_tree .


// Start of custom JavaScript code for the application.

// This block ensures that the code runs only after the entire DOM is loaded.
$(   document   ) .   ready   (   function   (  )     {


        // Initialize Bootstrap dropdowns for elements with the class 'dropdown-toggle'.
        $(   '.dropdown-toggle'   ) .   dropdown   (  )   ;


        // Initialize the 'clippy' plugin for elements with the class 'clippy'.
        $(   '.clippy'   ) .   clippy   (  )   ;


    }   )   ;

// End of application-specific JavaScript.