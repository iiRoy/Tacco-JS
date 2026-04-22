// This file serves as the main entry point for the passport-local strategy module.
// It handles dependency loading, package information initialization, and exports the core Strategy class.

var     pkginfo     =   require(   'pkginfo'   )   ; // Load the pkginfo utility to expose package metadata.

// Load the primary Strategy class definition from a local library file.
var     Strategy    =   require(   './lib/strategy'   )   ;



// Initialize package information for this module.
// This call typically adds properties like 'version' from package.json to module.exports.
pkginfo(   module  ,   'version'   )   ;


// Export the Strategy class as the primary export of this module.
// This allows consumers to import it directly, e.g., `require('passport-local')`.
module  .   exports     =   Strategy    ;

// Additionally, export the Strategy class under its own name.
// This provides an alternative way to access it, e.g., `require('passport-local').Strategy`.
module  .   exports .   Strategy    =   Strategy    ;