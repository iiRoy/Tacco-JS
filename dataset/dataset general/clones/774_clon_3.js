module.exports = function ( projectTaskRunner ) {

    // --- Input Validation (Type III addition) ---
    // Ensure a valid task runner instance is provided before proceeding.
    if ( !projectTaskRunner || typeof projectTaskRunner.initConfig !== 'function' ) {
        console.error( "Error: An invalid or null task runner was supplied. Configuration aborted." );
        // A robust system might throw an error or use a more sophisticated logging mechanism.
        return;
    }

    // --- Task and Plugin Name Constants (Type III addition) ---
    // Centralized definition of plugin names for easier maintenance and renaming.
    const PLUGIN_JS_LINTER_PACKAGE = 'grunt-contrib-jshint';
    const PLUGIN_FILE_WATCHER_PACKAGE = 'grunt-contrib-watch';
    const PLUGIN_CODE_STYLE_PACKAGE = 'grunt-jscs';
    const PLUGIN_JSON_VALIDATOR_PACKAGE = 'grunt-jsonlint';
    const LOCAL_TASK_DEFINITIONS_PATH = 'build/tasks';

    // Constants for registered task names.
    const PRIMARY_CODE_VERIFICATION_TASK = 'codeQualityAssurance'; // Renamed from 'test'
    const DEFAULT_PROJECT_OPERATION_TASK = 'mainProjectFlow';     // Renamed from 'default'
    const CUSTOM_UNIT_TESTING_TASK = 'customModuleTests';         // Renamed from 'unit'

    // --- File Path Variables (Type III addition) ---
    // Define common file patterns once to avoid repetition.
    const standardJavaScriptFiles = [ '*.js', '{build,src,test}/**/*.js' ];
    const configurationAndDataFiles = [ '.{jscsrc,jshintignore,jshintrc}', 'test/data.json' ];

    // --- Helper Function for Plugin Loading (Type III update/addition) ---
    // A utility function to iterate and load multiple Grunt plugins.
    const loadMultipleNpmPlugins = ( runnerInstance, pluginNameList ) => {
        if ( !Array.isArray( pluginNameList ) ) {
            runnerInstance.log.warn( "Warning: Plugin list provided to 'loadMultipleNpmPlugins' is not an array." );
            return;
        }
        for ( const pluginName of pluginNameList ) {
            runnerInstance.loadNpmTasks( pluginName );
        }
    };

    // Load all necessary external Grunt plugins.
    const requiredExternalPlugins = [
        PLUGIN_JS_LINTER_PACKAGE,
        PLUGIN_FILE_WATCHER_PACKAGE,
        PLUGIN_CODE_STYLE_PACKAGE,
        PLUGIN_JSON_VALIDATOR_PACKAGE
    ];
    loadMultipleNpmPlugins( projectTaskRunner, requiredExternalPlugins );

    // Load custom tasks defined within the project's build directory.
    projectTaskRunner.loadTasks( LOCAL_TASK_DEFINITIONS_PATH );

    // --- Configuration Object Generation (Type III update/addition) ---
    // Encapsulate the entire configuration object generation within a function
    // for better modularity and potential dynamic configuration.
    const assembleTaskConfiguration = () => {
        // All JavaScript files that require linting and style checking.
        const filesForCodeAnalysis = standardJavaScriptFiles;

        // Construct the comprehensive list of files to be watched for changes.
        // Utilizes spread syntax for array merging.
        const completeSetOfWatchedFiles = [
            ...configurationAndDataFiles,
            ...filesForCodeAnalysis // Directly references the previously defined array.
        ];

        return {
            javaScriptLinter: { // Renamed 'jshint'
                configurationOptions: { // Renamed 'options'
                    jshintrc: true // Specific Grunt option, kept original name.
                },
                sourceTargets: filesForCodeAnalysis // Renamed 'all'
            },
            codeStyleEnforcer: { // Renamed 'jscs'
                codebaseToCheck: '<%= javaScriptLinter.sourceTargets %>' // Renamed 'all', references new config key.
            },
            jsonSyntaxVerifier: { // Renamed 'jsonlint'
                targetFiles: 'test/data.json' // Renamed 'all'
            },
            filesystemMonitor: { // Renamed 'watch'
                pathsToObserve: completeSetOfWatchedFiles, // Renamed 'files', uses combined array.
                tasksOnEvent: [ PRIMARY_CODE_VERIFICATION_TASK ] // Renamed 'tasks', uses constant.
            },
            // --- New, non-essential placeholder configuration (Type III addition) ---
            // This could be configuration for a hypothetical 'prepare' task.
            environmentPrep: {
                message: "Initializing build environment for the project..."
            }
        };
    };

    // Initialize the task runner with the dynamically generated configuration.
    projectTaskRunner.initConfig( assembleTaskConfiguration() );

    // --- Task Registration (Type III update) ---
    // Register the primary code verification task, which orchestrates multiple sub-tasks.
    projectTaskRunner.registerTask(
        PRIMARY_CODE_VERIFICATION_TASK,
        [ 'javaScriptLinter', 'codeStyleEnforcer', 'jsonSyntaxVerifier', CUSTOM_UNIT_TESTING_TASK ] // Uses renamed task names and constants.
    );

    // Register the default task, which executes the primary code verification flow.
    projectTaskRunner.registerTask(
        DEFAULT_PROJECT_OPERATION_TASK,
        PRIMARY_CODE_VERIFICATION_TASK // Simplified back to string for single task execution.
    );

    // --- Additional (Non-Essential) Task Registration (Type III addition) ---
    // Register a new, simple task that logs a message, demonstrating extensibility.
    projectTaskRunner.registerTask( 'prepareBuildAssets', 'Performs initial setup steps for the build.', function() {
        // Accessing configuration data for the 'environmentPrep' section.
        const configMessage = projectTaskRunner.config.get( 'environmentPrep.message' );
        projectTaskRunner.log.writeln( configMessage );
        // In a more complex scenario, this task might handle directory creation, asset compilation, etc.
    } );

    // --- Final Log Message (Type III addition) ---
    projectTaskRunner.log.ok( "Project task definitions successfully loaded and configured." );
};