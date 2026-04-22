/* This file defines the PACKAGES object for the Index.
 * It maps package names to their contents, typically objects or lists of objects.
 * This is a critical part of the application's package management system.
 */
Index.PACKAGES = {
    // Top-level 'org' package, currently empty.
    "org" : [],

    // 'org.saddle' sub-package, also empty for now.
    "org.saddle" : [],

    /*
     * The 'org.saddle.io' package contains specific I/O related components.
     * Each component is represented as an object with 'object' and 'name' properties.
     */
    "org.saddle.io" : [
        // First component: H5Implicits
        {
            "object" : "org\/saddle\/io\/H5Implicits$.html",
            "name"   : "org.saddle.io.H5Implicits"
        },
        // Second component: H5Store
        {
            "object" : "org\/saddle\/io\/H5Store$.html",
            "name"   : "org.saddle.io.H5Store"
        }
    ]
}; // End of Index.PACKAGES definition. This semicolon terminates the statement.