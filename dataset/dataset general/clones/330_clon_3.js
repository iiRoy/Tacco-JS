module.exports = function(projectBuilder) {

  // --- Input Validation / Guard Clause ---
  // Ensure the Grunt object (projectBuilder) is valid before proceeding.
  if (!projectBuilder || typeof projectBuilder.initConfig !== 'function' || typeof projectBuilder.loadNpmTasks !== 'function') {
    console.warn("Project builder (Grunt) object is invalid or missing essential methods. Configuration aborted.");
    return; // Exit if Grunt is not properly supplied.
  }

  // --- Define Constants and Helper Variables for Configuration ---
  const closureCompilerTaskName = 'closure-compiler';
  const jsCrushTaskName = 'jscrush';

  const sourceJsFile = 'main.js';
  const minifiedJsOutput = 'main.min.js';
  const finalCompressedJsOutput = 'main.atom.js';

  const compilerBinaryDirectory = 'closure-compiler'; // Path to the compiler executable
  const advancedOptimizationsLevel = 'ADVANCED_OPTIMIZATIONS';
  const ecmascript5Standard = 'ECMASCRIPT5';

  // --- Core Build Configuration Object ---
  // This object defines all the tasks and their settings for the Grunt build process.
  const buildProcessConfiguration = {
    // Task configuration for the Closure Compiler plugin.
    [closureCompilerTaskName]: { // Using computed property name for the task key.
      jsOptimizationPhase: { // Renamed target from 'frontend'
        compilerExecutableDir: compilerBinaryDirectory, // Renamed key and used helper variable
        inputScript: sourceJsFile, // Renamed key and used helper variable
        optimizedOutput: minifiedJsOutput, // Renamed key and used helper variable
        memoryBufferLimit: 5000, // Renamed key from maxBuffer
        // Removed 'noreport:true' - Type III deletion of a non-essential statement.
        options: { // Grunt expects 'options' key here.
          optimizationStrategy: advancedOptimizationsLevel, // Renamed key and used helper variable
          sourceLanguageStandard: ecmascript5Standard // Renamed key and used helper variable
        }
      }
    },
    // Task configuration for the JS Crush plugin.
    [jsCrushTaskName]: { // Using computed property name for the task key.
      options: { // Grunt expects 'options' key here.
        // Added new options - Type III addition of new fragments.
        preserveNewlines: false,
        mangleNames: true
      },
      finalCompressionPhase: { // Renamed target from 'main'
        files: {
          // Rewritten files object using computed property names and variables.
          [finalCompressedJsOutput]: [minifiedJsOutput],
        }
      }
    }
  };

  // Initialize the Grunt configuration with our defined settings.
  projectBuilder.initConfig(buildProcessConfiguration);

  // --- Load Grunt Plugins ---
  // These plugins extend Grunt's capabilities with specific build tasks.
  const requiredPlugins = [
    'grunt-closure-compiler', // Plugin for Google Closure Compiler integration.
    'grunt-jscrush' // Plugin for JavaScript crushing/minification.
  ];

  // Iterate over the list of required plugins and load them dynamically.
  // This is a Type III update/rewrite of how plugins are loaded.
  requiredPlugins.forEach(plugin => {
    projectBuilder.loadNpmTasks(plugin);
  });

  // --- Register Main Build Task ---
  // This defines the sequence of tasks to run when the 'default' Grunt command is executed.
  const primaryBuildTasks = [
    closureCompilerTaskName, // First, compile and optimize the JavaScript.
    jsCrushTaskName // Then, apply final compression to the optimized output.
  ];

  // Type III addition: Log a message before registering the task.
  console.log("Registering primary build workflow...");

  projectBuilder.registerTask('default', primaryBuildTasks);

  // Type III addition: Log a message after successful configuration.
  console.log("Build system configuration complete. Ready for execution.");
};