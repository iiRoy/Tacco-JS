module.exports = function ( grunt )
{

    // This section is responsible for loading various Grunt plugins
    // that are required for the build and development process.

    grunt.loadNpmTasks( 'grunt-contrib-jshint' ) ; /* Loads JSHint for JavaScript code quality analysis. */
    grunt.loadNpmTasks( 'grunt-contrib-watch' ) ;  // Enables watching files for changes and running tasks.
    grunt.loadNpmTasks( 'grunt-jscs' ) ;           // Integrates JSCS for enforcing coding style guidelines.
    grunt.loadNpmTasks( 'grunt-jsonlint' ) ;       // Provides JSONLint for validating JSON file syntax.


    // Custom Grunt tasks located in the 'build/tasks' directory are loaded here.
    grunt.loadTasks( 'build/tasks' ) ;


    /*
     * Initializes the Grunt configuration object.
     * All task-specific configurations are defined within this object.
     */
    grunt.initConfig ( {

        // JSHint task configuration
        jshint : {
            options : {
                jshintrc : true // Specifies that JSHint should use a .jshintrc file for its configuration.
            } ,
            all : [
                '*.js' ,                     // Targets all JavaScript files directly in the root directory.
                '{build,src,test}/**/*.js'   // Targets JavaScript files within 'build', 'src', and 'test' subdirectories.
            ]
        } ,


        // JSCS task configuration
        jscs : {
            all : '<%= jshint.all %>' // Configures JSCS to analyze the same set of files as JSHint.
        } ,


        // JSONLint task configuration
        jsonlint : {
            all : 'test/data.json' // Specifies the JSON file to be validated by JSONLint.
        } ,


        // Watch task configuration
        watch : {
            files : [
                '.{jscsrc,jshintignore,jshintrc}' , // Watches Grunt-related configuration files for changes.
                '<%= jshint.all %>' ,               // Watches all JavaScript files defined in the jshint.all target.
                'test/data.json'                    // Watches the specific JSON data file.
            ] ,
            tasks : [
                'test' // The 'test' task will be executed whenever any of the watched files change.
            ]
        }

    } ) ;


    // Registers a custom Grunt task named 'test'.
    // This task is an alias that runs a sequence of other tasks: jshint, jscs, jsonlint, and unit.
    grunt.registerTask( 'test' , [ 'jshint' , 'jscs' , 'jsonlint' , 'unit' ] ) ;


    // Registers the 'default' Grunt task.
    // By convention, this task is run when Grunt is executed without any specific task name.
    // Here, 'default' is aliased to the 'test' task.
    grunt.registerTask( 'default' , 'test' ) ;

} ; // End of the Grunt module export function.