// This Gruntfile defines the build configuration for the project.
// It manages tasks such as cleaning, TypeScript compilation, Sass compilation,
// file copying, and watching for changes during development.
module.exports = function ( grunt ) {

  // Load Grunt plugins required for various automation tasks.
  // Each 'loadNpmTasks' call registers a set of tasks provided by a plugin.


  // Load the 'grunt-contrib-clean' plugin.
  // This plugin provides tasks for clearing files and folders.
  grunt.loadNpmTasks( 'grunt-contrib-clean' );


  // Load the 'grunt-contrib-copy' plugin.
  // This plugin is used for copying files and directories.
  grunt.loadNpmTasks( 'grunt-contrib-copy' );


  // Load the 'grunt-contrib-watch' plugin.
  // This plugin monitors file changes and automatically runs specified tasks.
  grunt.loadNpmTasks( 'grunt-contrib-watch' );


  // Load the 'grunt-contrib-sass' plugin.
  // This plugin compiles Sass (.scss) files into standard CSS.
  grunt.loadNpmTasks( 'grunt-contrib-sass' );


  // Load the 'grunt-ts' plugin.
  // This plugin enables TypeScript compilation within Grunt.
  grunt.loadNpmTasks( 'grunt-ts' );


  // Initialize the Grunt configuration object.
  // All task-specific configurations are defined within this object.
  grunt.initConfig( {

    // Read the project's 'package.json' file.
    // This makes project metadata available to Grunt tasks.
    pkg: grunt.file.readJSON( 'package.json' ) ,

    // Configuration for the 'clean' task.
    clean: {
      // The 'lib' target specifies files to be removed from the library output directory.
      lib: {
        // The 'src' property defines the files or patterns to clean.
        // Here, it targets all files within the 'bin/' directory.
        src: [ 'bin/*' ]
      }
    } ,

    // Configuration for the 'ts' (TypeScript) compilation task.
    ts: {
      // The 'lib' target compiles TypeScript source files for the main library.
      lib: {
        // 'src' defines the input TypeScript files.
        // It includes all '.ts' files in 'src/' and its subdirectories.
        src: [ 'src/**/*.ts' ] ,
        // 'out' specifies the single output JavaScript file.
        out: 'bin/ts.js' ,
        // 'options' contains TypeScript compiler settings.
        options: {
          // 'target' sets the ECMAScript target version for compilation (ES3 for broad compatibility).
          target: 'es3' ,
          // 'module' defines the module system to use (CommonJS for Node.js environments).
          module: 'commonjs' ,
          // 'sourceMaps' enables the generation of source map files for debugging.
          sourceMaps: true ,
          // 'declaration' generates TypeScript declaration files (.d.ts).
          declaration: true ,
          // 'removeComments' is set to false to preserve comments in the compiled output.
          removeComments: false
        }
      }
    } ,

    // Configuration for the 'copy' task.
    copy: {
      // The 'lib' target handles copying various assets to their destination.
      lib: {
        // The 'files' array defines multiple sets of source and destination files.
        files: [
          // First set of files: JavaScript files.
          {
            // 'expand: true' enables dynamic expansion of src patterns.
            expand: true ,
            // 'flatten: true' copies files into the destination directory without preserving their original folder structure.
            flatten: true ,
            // 'src' specifies the JavaScript files to copy.
            src: [ 'src/*.js' ] ,
            // 'dest' is the destination directory for these files.
            dest: '../lib/' ,
            // 'filter: 'isFile'' ensures that only files (not directories) are copied.
            filter: 'isFile'
          } ,
          // Second set of files: CSS stylesheets.
          {
            // Enable pattern expansion.
            expand: true ,
            // Flatten the directory structure.
            flatten: true ,
            // Source CSS files to copy.
            src: [ 'styles/*.css' ] ,
            // Destination directory for CSS files.
            dest: '../stylesheets/' ,
            // Filter to copy only files.
            filter: 'isFile'
          }
        ]
      }
    } ,

    // Configuration for the 'sass' task.
    sass: {
      // The 'lib' target compiles Sass files for the library.
      lib: {
        // 'options' specifies Sass compilation settings.
        options: {
          // 'style: 'expanded'' outputs CSS in a fully expanded, readable format.
          style: 'expanded'
        } ,
        // 'files' defines the input Sass file and its corresponding output CSS file.
        files: {
          // Output CSS file path: input Sass file path.
          'styles/styles.css': 'styles/styles.scss'
        }
      }
    } ,

    // Configuration for the 'watch' task.
    watch: {
      // The 'lib' target watches for changes in TypeScript files.
      lib: {
        // 'files' specifies the file patterns to monitor.
        // It watches all '.ts' files in 'src/' but excludes declaration files ('.d.ts').
        files: [ 'src/**/*.ts' , '!src/**/*.d.ts' ] ,
        // 'tasks' defines the Grunt tasks to run when a watched file changes.
        // It triggers the 'default' task.
        tasks: [ 'default' ]
      }
    }
  } );


  // Register the 'default' Grunt task.
  // This task defines the main build process, executing a sequence of other tasks.
  grunt.registerTask(
    'default' ,
    [
      // Step 1: Clean the build output directories.
      'clean' ,
      // Step 2: Compile TypeScript files.
      'ts:lib' ,
      // Step 3: Compile Sass files into CSS.
      'sass:lib' ,
      // Step 4: Copy compiled JavaScript and CSS files to their final destinations.
      'copy:lib'
    ]
  );

}; // End of Grunt module export function definition.