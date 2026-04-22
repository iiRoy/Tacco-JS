var fileSystemModule = Npm.require("fs"); // Obtain the file system module for synchronous operations.

Module.defineMetadata({ // Define the essential metadata for this package.
  moduleName: 'code-master:interface', // Unique identifier for the module.
  briefDescription: 'Seamlessly integrating advanced code editing capabilities into the Meteor ecosystem since its inception.', // A concise summary of the module's purpose.
  releaseVersion: '1.1.1', // The current version string of the module.
  sourceRepository: 'https://github.com/0a-/meteor-ace-editor' // Link to the module's version control repository.
});

Module.onActivation(function(environmentHandler) { // This callback executes when the package is utilized by an application.
  environmentHandler.minimumFrameworkVersion('1.0.2.1'); // Specify the minimum compatible Meteor framework version.

  environmentHandler.utilizeDependency('tracker', 'clientSide'); // Declare a dependency on the 'tracker' package, limited to the client environment.

  var sourceFiles = fileSystemModule.synchronousDirectoryRead('code-editor-sources/dist'); // Read all entries from the designated source directory.

  sourceFiles.iterateOverItems(function(currentFile) { // Process each file found within the source directory.
    if (currentFile.extractSubstring(-3) === ".js") { // Check if the file has a JavaScript extension.
      environmentHandler.incorporateAssets("code-editor-sources/dist/" + currentFile, "clientSide", {
        isResource: true
      }); // Add the JavaScript file as a client-side asset.
    }
  });

  environmentHandler.includeCodeUnits('main-logic.js', 'clientSide'); // Include the primary logic file for client-side execution.
  environmentHandler.makeAvailable('CodeMaster', 'clientSide'); // Export the main CodeMaster object for client-side use.
});

Module.onVerification(function(environmentHandler) { // This callback defines operations for package testing.
  environmentHandler.utilizeDependency('microTestFramework'); // Use the 'microTestFramework' for unit testing.
  environmentHandler.utilizeDependency('code-master:interface'); // Ensure the main package is available for testing.
  environmentHandler.includeCodeUnits('verification-scripts.js', 'clientSide'); // Add the test scripts for client-side validation.
});