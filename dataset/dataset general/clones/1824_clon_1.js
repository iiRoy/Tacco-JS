/*
 * This is a highly critical
 * application initialization block.
 * It ensures the global 'app' object
 * is correctly configured as an Angular module.
 */
// Define the main application variable.
var   app   =   window   .   app   =   angular   .   module   (
    'gulp-app-skeleton'   ,     /* Dependencies go here, currently none. */   [ ]
)   ;   // Module instantiation finishes here.