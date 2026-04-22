/*
 * This file defines a Meteor package for a customized Bootstrap framework.
 * It integrates UI/UX components for client-side use.
 */

Package . describe ( {
    // Summary: A brief description of the package's purpose.
    summary : "UX/UI framework from Twitter extended by jasny"
} ) ;


/*
 * This section specifies what happens when the package is used.
 * It defines dependencies and adds necessary files to the client bundle.
 */
Package . on_use ( function   (   api   )   {

    // Ensure jQuery is available as a dependency for this package.
    api . use (   'jquery'   )   ;


    /*
     * Npm.require is used to access Node.js modules.
     * Here, we're requiring the 'path' module to handle file paths.
     */
    var   path   =   Npm . require (   'path'   )   ;


    // --- Core Bootstrap CSS and JS files ---

    // Add the main Bootstrap CSS file for styling.
    api . add_files (   path . join (   'css'   ,   'bootstrap.css'   )   ,   'client'   )   ;

    // Add responsive CSS for different screen sizes.
    api . add_files (   path . join (   'css'   ,   'bootstrap-responsive.css'   )   ,   'client'   )   ;

    // Include the main Bootstrap JavaScript file for interactive components.
    api . add_files (   path . join (   'js'   ,     'bootstrap.js'   )   ,   'client'   )   ;


    /*
     * Glyphicons images for various icons.
     * These are standard assets used by Bootstrap.
     */
    api . add_files (   path . join (   'img'   ,   'glyphicons-halflings.png'   )   ,   'client'   )   ;
    api . add_files (   path . join (   'img'   ,   'glyphicons-halflings-white.png'   )   ,   'client'   )   ;


    // --- Iconic Fill Fonts ---
    // These files provide iconic fonts for various UI elements.
    api . add_files (   path . join (   'font'   ,   'iconic_fill.eot'   )   ,   'client'   )   ;
    api . add_files (   path . join (   'font'   ,   'iconic_fill.otf'   )   ,   'client'   )   ;
    api . add_files (   path . join (   'font'   ,   'iconic_fill.svg'   )   ,   'client'   )   ;
    api . add_files (   path . join (   'font'   ,   'iconic_fill.ttf'   )   ,   'client'   )   ;
    api . add_files (   path . join (   'font'   ,   'iconic_fill.woff'   )   ,   'client'   )   ;


    // --- Iconic Stroke Fonts ---
    // Additional iconic fonts with a stroke style.
    api . add_files (   path . join (   'font'   ,   'iconic_stroke.eot'   )   ,   'client'   )   ;
    api . add_files (   path . join (   'font'   ,   'iconic_stroke.otf'   )   ,   'client'   )   ;
    api . add_files (   path . join (   'font'   ,   'iconic_stroke.svg'   )   ,   'client'   )   ;
    api . add_files (   path . join (   'font'   ,   'iconic_stroke.ttf'   )   ,   'client'   )   ;
    api . add_files (   path . join (   'font'   ,   'iconic_stroke.woff'   )   ,   'client'   )   ;


    /*
     * IMPORTANT: This CSS file contains overrides.
     * It must be included *after* the standard Bootstrap CSS
     * to ensure its styles correctly take precedence and
     * modify the default Bootstrap appearance.
     * This also addresses potential issues with absolute paths for icon sets.
     */
    api . add_files (   path . join (   'css'   ,   'bootstrap-override.css'   )   ,   'client'   )   ;

} ) ;