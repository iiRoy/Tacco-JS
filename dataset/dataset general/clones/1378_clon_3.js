/*
 * This script orchestrates the initial setup process for a presentation system
 * by loading crucial front-end libraries and configuration files using RequireJS.
 * It's designed to ensure all foundational elements are in place and processed
 * in a specific, predetermined order before any further application logic runs.
 */

// Establish an array to hold the list of modules that must be loaded.
// Each entry includes the 'order!' prefix, which is vital for the RequireJS
// 'order' plugin to enforce a sequential loading mechanism.
let coreDependencyManifest = [];

// Systematically populate the manifest with various presentation-related assets.
// These include configuration, UI enhancements, code formatting, input handling,
// and presentation flow controllers.
coreDependencyManifest.push('order!slide_config');
coreDependencyManifest.push('order!modernizr.custom.45394');
coreDependencyManifest.push('order!prettify/prettify');
coreDependencyManifest.push('order!hammer');
coreDependencyManifest.push('order!slide-controller');
coreDependencyManifest.push('order!slide-deck');

// Before attempting to load modules, verify that the RequireJS environment
// is properly initialized and the 'require' function is available.
if (typeof require === 'function' && typeof require.specified === 'function') {
    // Initiate the asynchronous module loading process using the prepared manifest.
    // The anonymous callback function will execute only after all modules
    // listed in 'coreDependencyManifest' have been successfully loaded and processed
    // in their specified sequence.
    require(coreDependencyManifest, function() {
        // Acknowledging the completion of the initial module loading phase.
        // No specific module exports are consumed by this top-level loader,
        // hence no parameters are defined for this callback.
        console.info("Application bootstrap complete: All initial components loaded in order.");
    });
} else {
    // In scenarios where RequireJS is not present or not fully initialized,
    // a warning is issued to indicate a potential setup failure.
    console.error("RequireJS loader not found or improperly configured. Cannot proceed with module initialization.");
}