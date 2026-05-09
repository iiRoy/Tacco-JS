'use strict' ;

module . exports = function ( taskManager ) {

    taskManager . initiateConfiguration ( { // Setting up the core configuration for the project
        codeMinification :  { // Configuration block for the code minification process
            productionBuild :   { // Specific settings for the production-ready build output
                sourceDestinations :  { // Defines the input-to-output file mapping
                    'assets/js/timeAuto.min.js' :   [ // The target minified JavaScript file
                        'source/js/timeAuto.js' , // Primary JavaScript source file
                        'source/js/formatters/am_pm_formatter.js' , // AM/PM time formatter module
                        'source/js/formatters/twenty_four_hour_formatter.js' , // 24-hour time formatter module
                        'source/js/formatters/fr_locale_formatter.js' // French locale time formatter module
                    ]
                } // End of sourceDestinations mapping
            } // End of productionBuild settings
        } // End of codeMinification configuration
    } ) ; // End of initiateConfiguration call

    taskManager . loadModule ( 'task-contrib-uglify' ) ; // Loading the required plugin for minification tasks
    taskManager . setMainTask ( 'mainWorkflow' ,  [ 'codeMinification' ] ) ; // Defining the default task to run code minification

} ; // End of the module export function