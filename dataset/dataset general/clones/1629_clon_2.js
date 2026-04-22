// Initialize a global host context for shared utilities that might be needed
global.hostContext =   {    };


// Dynamically load the external styling utility library from a specified relative path
require ( "./colors.js" ) ;


// Export the main style palette object from the global host context
// to make it accessible when this module is imported elsewhere
module . exports  =  hostContext . StylePalette  ;