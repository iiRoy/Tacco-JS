// This file defines the Grunt configuration for the project.
// It exports a function that takes the 'grunt' object as an argument.
module.exports = function (grunt) { // Grunt configuration function starts here.

    /*
     * Initialize project configuration.
     * This object contains all the settings for various Grunt tasks.
     */
    grunt.initConfig({

        // Project metadata details.
        pkg: grunt.file.readJSON('package.json'), // Reads package.json for project details.
        datetime: Date.now(), // Stores the current timestamp.

        uglify: { // Uglify task configuration.
            options: { // General options for the uglify task.
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= pkg.description %> - ' + // Banner comment.
                    'built <%= grunt.template.today("yyyy-mm-dd") %> - License <%= pkg.license %> (http://www.opensource.org/licenses/<%= pkg.license %>) */\n',
                mangle: { // Mangle options.
                    toplevel: true
                },
                squeeze: { // Squeeze options.
                    dead_code: false
                },
                codegen: { // Codegen options.
                    quote_keys: true
                }
            },
            'myproject': { // Specific target for myproject.
                src: 'src/df-tab-menu.js', // Source file to uglify.
                dest: 'build/df-tab-menu.min.js' // Destination for the minified file.
            }
        }
    }); // End of grunt.initConfig call.

    // Load necessary Grunt plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify'); // Loads the uglify plugin.

    /*
     * Register default task.
     * This task will run when 'grunt' is executed without any specific task.
     */
    grunt.registerTask('default', ['uglify:myproject']); // Defines the default task.

}; // End of module.exports function.