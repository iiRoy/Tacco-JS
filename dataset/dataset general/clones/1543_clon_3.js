module.exports = function(gRunner) {

  // Configure various automated development tasks for the project.
  gRunner.configureTasks({
    // Monitor file changes and trigger specific actions.
    monitorFiles: {
      markupAssets: {
        // Define patterns for files to watch.
        sourcePatterns: "public/ng/templates/**/*.html",
        // Specify tasks to execute when changes are detected.
        actions: ["markupToScript:componentViews"]
      }
    },

    // Configuration for the HTML-to-JavaScript compilation task.
    markupToScript: {
      // Define a collection of HTML component views to process.
      componentViews: {
        // Source files for this compilation.
        src: ["public/ng/templates/**/*.html"],
        // The base directory from which relative paths for cache keys are derived.
        basePath: "public/ng/templates/",
        // The destination directory for the generated JavaScript files.
        targetDir: "app/assets/javascripts/compiled_views/"
      }
    }
  });

  // A constant string representing the Angular module template structure.
  // This template generates an Angular module that registers HTML content
  // with Angular's $templateCache service.
  const ANGULAR_MODULE_TEMPLATE = `
angular.module("<%= moduleId %>", []).run(["$templateCache", function(templateCacheService) {
  // Caching template for future use.
  templateCacheService.put("<%= cacheId %>",
    "<%= cleanContent %>");
}]);
`;

  /**
   * Cleans and escapes raw HTML content for safe embedding within a JavaScript string.
   * This involves escaping double quotes and formatting newlines.
   *
   * @param {string} rawHtmlData - The original HTML content.
   * @returns {string} The escaped and formatted content.
   */
  const sanitizeHtmlString = function(rawHtmlData) {
    if (typeof rawHtmlData !== 'string' || rawHtmlData.length === 0) {
      gRunner.log.warn('Attempted to sanitize non-string or empty HTML content.');
      return '';
    }
    // Escape double quotes and reformat newlines for JS string concatenation.
    return rawHtmlData.trim()
                      .replace(/"/g, '\\"')
                      .replace(/\n/g, '" +\n    "');
  };

  /**
   * Derives the template cache key and module identifier from a given file path
   * and a specified base path.
   *
   * @param {string} filePath - The full path to the HTML file.
   * @param {string} baseDir - The base directory to remove from the file path.
   * @returns {{cacheKey: string, moduleIdentifier: string}} An object containing the derived keys.
   */
  const extractTemplateKeys = function(filePath, baseDir) {
    // Ensure baseDir ends with a slash for consistent path manipulation.
    const normalizedBaseDir = baseDir.endsWith('/') ? baseDir : baseDir + '/';

    if (!filePath.startsWith(normalizedBaseDir)) {
      gRunner.log.warn(`File path "${filePath}" does not start with base directory "${normalizedBaseDir}".
        Cache key and module ID might be incorrect.`);
    }

    // Remove the base directory to get the relative path.
    const relativePath = filePath.substring(normalizedBaseDir.length);

    // The cache key is typically the relative path.
    const cacheKey = '/ng/templates/' + relativePath;

    // The module identifier can be the relative path with slashes replaced by dots,
    // or just the filename without extension. For this clone, let's use the relative path
    // with file extension removed.
    const moduleIdentifier = relativePath.replace(/\.html$/, '');

    return { cacheKey: cacheKey, moduleIdentifier: moduleIdentifier };
  };


  // Register a multi-task named "markupToScript" with a description.
  gRunner.registerMultiTask("markupToScript", "Compiles HTML templates into Angular JavaScript modules for $templateCache.", function() {

    // Retrieve task-specific options, providing defaults if not specified.
    const taskOptions = this.options({
      basePath: "public/ng/templates/",
      targetDir: "app/assets/javascripts/compiled_views/"
    });

    const outputDirectory = taskOptions.targetDir;
    const projectBasePath = taskOptions.basePath;

    // Determine the set of input files. Prioritize files from Grunt's internal
    // watch event (if available), otherwise expand from the task's `src` property.
    const inputFiles = gRunner.eventWatchFiles || gRunner.fileSystem.glob(this.data.src);

    if (!inputFiles || inputFiles.length === 0) {
      gRunner.log.warn("No HTML template files found to process for markupToScript task.");
      return false; // Indicate that no files were processed.
    }

    gRunner.log.verbose(`Processing ${inputFiles.length} HTML template(s).`);

    // Iterate over each identified HTML file.
    inputFiles.forEach(function(currentAssetPath) {
      try {
        // Read the raw HTML content from the file system.
        const rawHtmlContent = gRunner.fileSystem.readText(currentAssetPath);

        if (!rawHtmlContent) {
          gRunner.log.warn(`Skipping empty or unreadable file: ${currentAssetPath}`);
          return; // Continue to the next file.
        }

        // Generate the cache key and module ID based on the file path and base directory.
        const { cacheKey, moduleIdentifier } = extractTemplateKeys(currentAssetPath, projectBasePath);

        // Sanitize the HTML content for embedding into a JavaScript string.
        const cleanedHtmlContent = sanitizeHtmlString(rawHtmlContent);

        // Prepare the context object for the template engine.
        const templateRenderContext = {
          moduleId: moduleIdentifier,
          cacheId: cacheKey,
          cleanContent: cleanedHtmlContent
        };

        // Process the Angular module template with the prepared context.
        const generatedJsModule = gRunner.templatingEngine.render(ANGULAR_MODULE_TEMPLATE, { data: templateRenderContext });

        // Construct the output file path.
        const outputJsFilePath = outputDirectory + moduleIdentifier + ".js";

        // Write the generated JavaScript module to the specified output file.
        gRunner.fileSystem.write(outputJsFilePath, generatedJsModule);

        gRunner.log.ok(`Successfully compiled "${currentAssetPath}" to "${outputJsFilePath}"`);

      } catch (processingError) {
        gRunner.log.error(`Error processing file "${currentAssetPath}": ${processingError.message}`);
        // Optionally, fail the task if a single file error should halt the process.
        // gRunner.fail.warn(processingError);
      }
    });

    gRunner.log.writeln("markupToScript task completed.");
  });
};