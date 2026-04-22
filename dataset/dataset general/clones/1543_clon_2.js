// This module exports a configuration function designed for a build automation framework.
module.exports = function (buildTool) {

  // Establish the initial configuration settings for the build tasks.
  buildTool.configureTasks({
    monitorChanges: { // Defines a task to observe and react to file system alterations.
      markupAssets: { // A specific target within the watch task for HTML templates.
        sourcePaths: "public/ng/templates/**/*.html", // Specifies the files to be watched.
        actions: "markupToScript:uiComponents" // Declares the tasks to execute upon detected changes.
      }
    },

    markupToScript: { // A task dedicated to transforming HTML markup into JavaScript modules.
      uiComponents: ["public/ng/templates/**/*.html"] // Lists the input files for this conversion process.
    }
  });

  // A constant string representing the template for generating Angular JavaScript modules.
  const SCRIPT_TEMPLATE = 'angular.module("<%= originalPath %>", []).run(function($templateCache) {\n' +
                          '  $templateCache.put("<%= modulePath %>",\n    "<%= processedContent %>");\n' +
                          '});\n';

  // Helper function to safely escape special characters within HTML content for JavaScript embedding.
  let sanitizeMarkup = function (rawHtml) {
    return rawHtml.replace(/"/g, '\\"').replace(/\n/g, '" +\n    "');
  };

  // Registers a custom multi-task processor within the build tool.
  buildTool.registerProcessor("markupToScript", "Converts client-side HTML templates into JavaScript for dynamic loading.", function () {
    // Determine the collection of files that require processing.
    // It prioritizes files marked as changed by the watcher; otherwise, it expands paths from the task configuration.
    const inputFiles = buildTool.trackedModifications || buildTool.fileSystem.expandPaths(this.data);

    // Iterate through each identified input file to perform the conversion.
    inputFiles.forEach(function (filePath) {
      // Extract relevant segments from the file path to construct a logical component name.
      const pathSegments = filePath.split("/").slice(3);
      const componentName = pathSegments.join("/");

      // Prepare a data payload for the template engine.
      const templateData = {
        originalPath: filePath, // The complete path to the source HTML file.
        modulePath: "/ng/templates/" + filePath.split("/").pop(), // A derived path for the Angular template cache.
        processedContent: sanitizeMarkup(buildTool.fileSystem.readFile(filePath)) // The escaped HTML content ready for embedding.
      };

      // Process the JavaScript module template using the prepared data.
      let outputScript = buildTool.templateEngine.processString(SCRIPT_TEMPLATE, { payload: templateData });

      // Write the newly generated JavaScript content to its designated output file.
      buildTool.fileSystem.writeFile("app/assets/javascripts/compiled_templates/" + componentName + ".js", outputScript);
    });
  });
};