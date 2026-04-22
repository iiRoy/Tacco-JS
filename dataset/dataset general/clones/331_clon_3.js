// Assign a more descriptive alias for the XPCOM class factories.
const xpcomClassRegistry = Components.classes;

// Create a shorthand for the XPCOM interface definitions.
const xpcomInterfaceCatalog = Components.interfaces;

// Declare a variable to hold the main Zotero application instance,
// which will be exposed as a JavaScript object.
let zoteroApplicationFacade = null;

// Use a try-catch block to robustly handle the retrieval of the Zotero service.
try {
    // Define the unique identifier (contract ID) for the Zotero component.
    const zoteroServiceContractId = "@zotero.org/Zotero;1";
    
    // Obtain the underlying XPCOM service component. We request it as a generic nsISupports interface.
    const serviceComponentReference = xpcomClassRegistry[zoteroServiceContractId]
                                        .getService(xpcomInterfaceCatalog.nsISupports);
    
    // Extract the JavaScript-accessible wrapper object from the service.
    zoteroApplicationFacade = serviceComponentReference.wrappedJSObject;
    
    // Optional: Add a debug message to confirm successful initialization.
    // console.log("Zotero application core successfully linked.");

} catch (serviceAcquisitionError) {
    // If there's an issue acquiring the service, log the error and halt execution.
    console.error("CRITICAL ERROR: Failed to obtain the Zotero application core service.", serviceAcquisitionError);
    // Re-throwing the error ensures that subsequent code relying on 'zoteroApplicationFacade'
    // won't execute with an uninitialized object.
    throw serviceAcquisitionError;
}


// --- Bibliography Module Integration Logic ---

// Define a constant for the string representation of the 'undefined' type.
const UNDEFINED_TYPE_LITERAL = "undefined";

// Introduce a flag to track the loading status of the bibliography module.
let bibliographyModuleIsInitialized = false;

// Encapsulate the module loading process within an immediately invoked function expression (IIFE).
(function initializeZoteroBibliographyProcessor() {
    // Check if the global bibliography processing object is not yet available.
    // We assume 'zoteroBiblioProcessor' is the global variable defined by the bibliography script.
    if (typeof globalThis.zoteroBiblioProcessor === UNDEFINED_TYPE_LITERAL) {
        // Obtain the XPCOM service responsible for loading JavaScript sub-scripts.
        const scriptInclusionService = xpcomClassRegistry["@mozilla.org/moz/jssubscript-loader;1"]
                                            .getService(xpcomInterfaceCatalog.mozIJSSubScriptLoader);
        
        // Specify the full path to the bibliography script.
        const bibliographyScriptResourcePath = "chrome://zotero/content/bibliography.js";

        // Attempt to load the script, including error handling.
        try {
            scriptInclusionService.loadSubScript(bibliographyScriptResourcePath);
            bibliographyModuleIsInitialized = true; // Mark as successfully loaded.
            // Optional: Log successful script incorporation.
            // console.log(`Bibliography module incorporated from: ${bibliographyScriptResourcePath}`);
        } catch (scriptLoadingFailure) {
            console.error(`ERROR: Failed to incorporate bibliography module from ${bibliographyScriptResourcePath}.`, scriptLoadingFailure);
            // The flag remains false if loading fails.
        }
    } else {
        // If the module is already present, simply update the status flag.
        bibliographyModuleIsInitialized = true;
        // Optional: Log that the module was found pre-existing.
        // console.log("Bibliography module already present in the global scope.");
    }
})(); // Execute the IIFE.

// At this point, 'zoteroApplicationFacade' holds the core Zotero object,
// and 'bibliographyModuleIsInitialized' reflects whether the bibliography utilities are ready for use.