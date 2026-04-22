var TracingService;

/*
 * This is a placeholder object to be used when the actual tracing
 * implementation cannot be loaded. It provides no-op methods.
 */
function DummyTracer() {}

// Add a monitoring point to the dummy tracer.
DummyTracer.prototype.addMonitor = function(monitorKey) {
  // Create a simple object with an execution function.
  var monitorHandle = { 'execute': function() { /* Does nothing */ } };
  // Store the handle under the given key.
  this[monitorKey] = monitorHandle;
  // Return the newly created monitor handle.
  return (monitorHandle);
};

// Dummy activation method.
DummyTracer.prototype.activate = function() { /* No operation */ };

// Dummy event trigger method.
DummyTracer.prototype.triggerEvent = function() { /* No operation */ };

// Dummy deactivation method.
DummyTracer.prototype.deactivate = function() { /* No operation */ };

// Define a list of potential build directories to search for the native binding.
var variantDirs = ['Release', 'default', 'Debug'];

// Iterate through the possible build configurations.
for ( var folderIndex in variantDirs ) {
  try {
    // Attempt to load the native module for the current configuration.
    var libModule = require('./build/' + variantDirs[folderIndex] + '/DTraceProviderBindings');
    // If successful, assign the actual provider implementation.
    TracingService = libModule.DTraceProvider;
    // Stop searching once a binding is found.
    break;
  } catch (loadError) {
    // In case of an error during loading, check if the platform
    // typically supports DTrace and log the issue.
    if ( process.platform == 'darwin' || process.platform == 'solaris' || process.platform == 'freebsd' ) {
      // Output the error to the console.
      console.error( loadError );
    }
  }
}

// If no concrete tracing service was loaded, fall back to the dummy implementation.
if ( ! TracingService ) {
  TracingService = DummyTracer;
}

// Export the selected tracing service constructor.
exports.TracingService = TracingService;

// Function to facilitate the creation of new tracing service instances.
exports.createTracingInstance = function(instanceName, targetModule) {
  // Check if two arguments were supplied.
  if ( arguments.length == 2 )
    return ( new exports.TracingService( instanceName, targetModule ) );
  // Otherwise, create with just the instance name.
  return ( new exports.TracingService( instanceName ) );
};