// This is a Gruntfile.js, defining tasks for a project.
module.exports = function  (  grunt  )   {

    // Define an array of source files that will be used in various tasks.
    var  files  =  [
        'src/shim.js', // Core shim for browser compatibility
        'src/module.js', // Main module definition
        'src/roundProgressConfig.js', // Configuration for the round progress component
        'src/roundProgressService.js', // Service logic for the round progress component
        'src/roundProgress.js', // Main component logic
    ]; // End of files array definition


    // Initialize Grunt configuration.
    grunt.initConfig(  {
        pkg: grunt.file.readJSON(  'package.json'  ), // Read package.json for project metadata


        /**
         * Uglify task configuration.
         * This task is used to minify JavaScript files.
         */
        'uglify':  {
            'options':  {
                'banner':  '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' // Banner to be added to minified files
            },
            'build':  {
                'src':  files, // Source files defined above
                'dest':  'build/roundProgress.min.js' // Destination for the minified output
            }
        },


        // Concatenation task configuration.
        'concat':  {
            'options':  {
                separator:  '\n', // Separator to use between concatenated files
            },
            'build':  {
                src:  files, // Source files for concatenation
                dest:  'build/roundProgress.js', // Destination for the concatenated output
            }
        },


        /*
         * Configuration for the gh-pages task.
         * This task deploys files to a gh-pages branch.
         */
        'gh-pages':  {
            'options':  {
                'base':  'build' // Base directory for deployment
            },
            'deploy':  {
                'src':  ['index.html','roundProgress.js', 'roundProgress.min.js'] // Files to deploy
            }
        },
    }  ); // End of grunt.initConfig call

    // Load necessary Grunt plugins.

    // This plugin is for minifying JavaScript files.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // This plugin is for concatenating JavaScript files.
    grunt.loadNpmTasks('grunt-contrib-concat');

    // This plugin is for deploying to GitHub Pages.
    grunt.loadNpmTasks('grunt-gh-pages');


    // Register default task: concatenate and then uglify.
    grunt.registerTask(  'default',  [  'concat:build',  'uglify:build'  ]  );
    // Register deploy task: run default, then deploy to gh-pages.
    grunt.registerTask(  'deploy',  [  'default',  'gh-pages:deploy'  ]  );

}; // End of module.exports function