module.exports = function(buildAutomationEngine) {

  // This block defines a series of constants to enhance readability and
  // maintainability of file paths and key identifiers used throughout the
  // build configuration. These constants centralize common strings.
  const MAIN_SOURCE_DIR = 'src';
  const BUILD_OUTPUT_DIR = 'build';
  const PRIMARY_SCRIPT_BASENAME = 'df-tab-menu';
  const UTIL_SCRIPT_BASENAME = 'helper-module';
  const PROJECT_MANIFEST_FILE = 'package.json';
  const UGLIFY_PLUGIN_ID = 'grunt-contrib-uglify';

  // --- Type III: Add a preliminary log message to signal the start of the configuration process. ---
  buildAutomationEngine.log.writeln('>>> Initiating comprehensive build configuration setup...');
  buildAutomationEngine.log.writeln('>>> Loading project metadata and defining processing tasks.');

  // --- Type II: Rename 'grunt.initConfig' to 'buildAutomationEngine.configureBuildTasks'. ---
  // This function is responsible for setting up all the tasks and their associated
  // options that the build automation engine will execute.
  buildAutomationEngine.configureBuildTasks({
    // --- Type II: Rename 'pkg' to 'projectDetails'. ---
    // Retrieves essential project information from the package.json file.
    // This data is crucial for dynamic content generation, such as banners.
    projectDetails: buildAutomationEngine.file.readJSON(PROJECT_MANIFEST_FILE),

    // --- Type II: Rename 'datetime' to 'configLoadTimestamp'. ---
    // --- Type III: Change data type/representation from a raw number to a formatted string. ---
    // Records the exact date and time when this configuration was processed.
    configLoadTimestamp: buildAutomationEngine.template.today("yyyy-mm-dd HH:MM:ss"),

    // --- Type II: Rename 'uglify' task configuration key to 'javascriptMinification'. ---
    // This section configures the JavaScript minification task, which is
    // responsible for compressing and optimizing JavaScript files.
    javascriptMinification: {
      // --- Type II: Rename 'options' to 'commonMinificationOptions'. ---
      // These are the global settings that apply to all JavaScript minification
      // targets unless explicitly overridden by a specific target.
      commonMinificationOptions: {
        // --- Type II: Rename 'banner' to 'outputFilePreamble'. ---
        // --- Type III: Rewrite the banner construction using an IIFE and string interpolation. ---
        // This dynamically generates a header comment for each minified file,
        // including project details, version, description, and license information.
        outputFilePreamble: (() => {
          const manifestData = buildAutomationEngine.config.get('projectDetails');
          if (!manifestData) {
            buildAutomationEngine.log.error('CRITICAL: Project metadata not found for banner generation!');
            return '/*! Error: Missing project details. */\n'; // Fallback banner
          }
          const currentBuildDate = buildAutomationEngine.template.today("yyyy-mm-dd");
          const licenseLink = `http://www.opensource.org/licenses/${manifestData.license}`;

          // Construct the banner using an array of strings for better readability
          const headerLines = [
            '/*!',
            ` * Project: ${manifestData.name} v${manifestData.version}`,
            ` * Description: ${manifestData.description || 'No description provided.'}`,
            ` * Built On: ${currentBuildDate}`,
            ` * License: ${manifestData.license} (${licenseLink})`,
            ' */\n'
          ];
          return headerLines.join('\n'); // Join with newlines to form the complete banner
        })(), // Immediately-Invoked Function Expression to produce the banner string

        // --- Type II: Rename 'mangle' to 'symbolRenamingOptions'. ---
        // Configuration for obfuscating variable and function names.
        symbolRenamingOptions: {
          toplevel: true // Apply renaming to top-level scopes
        },
        // --- Type II: Rename 'squeeze' to 'codeShrinkingOptimizations'. ---
        // Settings for advanced code optimizations like dead code removal.
        codeShrinkingOptimizations: {
          dead_code: false // Preserve dead code for specific debugging or integration scenarios
        },
        // --- Type II: Rename 'codegen' to 'generatedCodePreferences'. ---
        // Specifies preferences for the output format of the minified code.
        generatedCodePreferences: {
          quote_keys: true // Ensure object keys are quoted in the output
        }
      },
      // --- Type II: Rename 'myproject' target to 'mainApplicationBundle'. ---
      // Defines the specific input and output files for the primary application script.
      mainApplicationBundle: {
        // --- Type III: Use constants for constructing source and destination paths. ---
        src: `${MAIN_SOURCE_DIR}/${PRIMARY_SCRIPT_BASENAME}.js`,
        dest: `${BUILD_OUTPUT_DIR}/${PRIMARY_SCRIPT_BASENAME}.min.js`
      },
      // --- Type III: Add a new, non-essential target for additional scripts. ---
      // Configuration for a secondary JavaScript bundle, demonstrating task extensibility.
      utilityModuleBundle: {
          src: `${MAIN_SOURCE_DIR}/utils/${UTIL_SCRIPT_BASENAME}.js`,
          dest: `${BUILD_OUTPUT_DIR}/utils/${UTIL_SCRIPT_BASENAME}.min.js`,
          options: {
              // Override global options for this specific target: disable top-level mangling.
              symbolRenamingOptions: {
                  toplevel: false
              }
          }
      }
    },
    // --- Type III: Add a new, simple task configuration for cleaning build artifacts. ---
    // Defines a task to clean up previously generated files, ensuring a fresh build.
    cleanBuildDirectory: {
        // Target to remove all JavaScript files from the build output directory.
        allJavascriptFiles: [`${BUILD_OUTPUT_DIR}/**/*.js`]
    }
  });

  // --- Type II: Rename 'grunt.loadNpmTasks' to 'buildAutomationEngine.loadExternalPlugin'. ---
  // Loads the required external plugin that provides the JavaScript minification capabilities.
  buildAutomationEngine.loadExternalPlugin(UGLIFY_PLUGIN_ID);

  // --- Type III: Add a new custom task for performing pre-build validations or logging. ---
  // This task is designed to run before the main build process to ensure conditions are met.
  buildAutomationEngine.registerTask('validate-build-environment', 'Performs essential checks before starting the build.', function() {
      // Example validation: Check if the main source directory exists.
      if (!buildAutomationEngine.file.exists(MAIN_SOURCE_DIR)) {
          buildAutomationEngine.warn(`Warning: The main source directory '${MAIN_SOURCE_DIR}' does not exist. Build may fail.`);
          return false; // Indicate a warning, but not a fatal error by default
      }
      buildAutomationEngine.log.ok('Environment validation successful: Main source directory confirmed.');
      // Further checks could be added here (e.g., dependency checks, linting pre-checks)
  });

  // --- Type II: Rename 'grunt.registerTask' to 'buildAutomationEngine.defineDefaultWorkflow'. ---
  // Defines the default sequence of tasks that will be executed when the build
  // automation engine is run without specifying a particular task.
  buildAutomationEngine.defineDefaultWorkflow('default', [
    // --- Type III: Integrate the new validation task into the default workflow. ---
    'validate-build-environment', // First, ensure the environment is ready.
    // --- Type III: Include the new clean task to ensure a fresh build. ---
    'cleanBuildDirectory:allJavascriptFiles', // Clean previous build artifacts.
    // --- Type II: Update task name based on new configuration keys. ---
    'javascriptMinification:mainApplicationBundle', // Minify the primary application script.
    // --- Type III: Include the newly added utility module minification as part of the default. ---
    'javascriptMinification:utilityModuleBundle' // Also minify the utility script.
  ]);

  // --- Type III: Add a final log message to confirm the completion of configuration. ---
  buildAutomationEngine.log.writeln('>>> Build automation configuration successfully finalized.');
};