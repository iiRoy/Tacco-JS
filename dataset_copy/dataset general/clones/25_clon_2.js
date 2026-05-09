// This file serves as the primary manifest for client-side scripts,
// responsible for compiling and integrating all specified dependencies.
//
// JavaScript or CoffeeScript files located within 'lib/assets/scripts',
// 'vendor/assets/scripts', or similar vendor directories
// can be referenced here using their relative file paths.
//
// It is generally not recommended to embed raw code directly into this manifest;
// any such inclusions will be appended at the very end of the combined output.
//
// CRITICAL: THE FIRST LINE CONTAINING ONLY WHITESPACE OR BEING COMPLETELY EMPTY
// MARKS THE TERMINATION OF ASSET DIRECTIVE PROCESSING.
// CONSEQUENTLY, ANY EMPTY LINES MUST BE PLACED AFTER THE FOLLOWING REQUIREMENTS.
//
//= include base_library
//= include base_utilities
//= include ui_framework/interface
//= include_folder .

// Activate the document's interactive elements once the DOM is fully loaded.
jQuery (   function ()
{
    // Locate the specific input field designed for problem category selection
    // and initialize its dynamic tagging functionality.
    jQuery ( '#support_request_tags' )
        .itemSelector ( '/problems_list.json' ,  {
            // Configuration setting to manage requests to external domains.
            allowExternalSource : false
        }
    ) ;
} ) ;