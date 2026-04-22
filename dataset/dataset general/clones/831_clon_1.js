module.exports = function (grunt)
{

  // This function is a helper to create a renaming callback for Grunt file operations.
  // It ensures that the destination file receives the specified 'name'.
  function rename(name)
  {
    return function (dest, src)
    {
      // The new file name will be the destination path combined with the provided name.
      return dest + name;
    }; // End of inner anonymous function.
  } // End of rename function definition.


  // This utility function prepares the configuration object for a Grunt file copy task.
  // It handles path manipulation, renaming, and expansion logic.
  function copyFile(from,   to,  as,  expand)
  {
    // Extract the current working directory from the 'from' path.
    var cwd = from.substring(0, from.lastIndexOf('/') + 1);

    // Isolate the actual file name from the 'from' path.
    from = from.substring(from.lastIndexOf('/') + 1);

    // If the 'to' path ends with a slash, it's a directory, so append the file name.
    if (to[to.length - 1] === '/')
    {
      to += from;
    }

    // If an 'as' (alias) name is not provided, derive it from the 'to' path.
    if (!as)
    {
      as = to.substring(to.lastIndexOf('/') + 1);
    }

    // Ensure that if 'to' is intended as a directory, it ends with a slash.
    if (to[to.length - 1] !== '/')
    {
      to = to.substring(0, to.lastIndexOf('/') + 1);
    }

    // Construct the file configuration object for the Grunt task.
    var result = {
      files: [
        {
          expand: !!expand, // Convert 'expand' to a boolean.
          cwd: cwd, // The current working directory for the source file.
          src: [from], // An array containing the source file.
          dest: to, // The destination path for the file.
          rename: rename(as) // Use the custom rename function.
        }
      ]
    };

    return result; // Return the fully configured result object.
  } // End of copyFile function.


  // Initialize Grunt configuration for all project tasks.
  grunt.initConfig(
    {
      less: { // Configuration for the LESS CSS preprocessor task.
        kendo: { // A specific target for LESS compilation, likely related to Kendo UI.
          options: {
            // The original comment here was about paths, which is now removed for variety.
            // This option disables YUI compression for faster compilation during development.
            yuicompress: false
          }, // End of options for the kendo target.
          files: { // Defines the source and destination files for LESS compilation.
            "font-awesome-kendo-icons.css": "font-awesome-kendo-icons.less" // Compiles LESS to CSS.
          } // End of files configuration.
        } // End of kendo target.
      }, // End of less task.

      watch: { // Configuration for the file watcher task.
        scripts: { // A specific target for watching script-related files.
          files: ['*.less'], // Defines which files to watch for changes (all .less files).
          tasks: ['fa-parse', 'less'], // Tasks to execute when watched files change.
          options: {
            spawn: false, // Improves performance by not spawning new processes for each task.
          }, // End of options for the scripts target.
        }, // End of scripts target.
      }, // End of watch task.
    }
  ); // End of grunt.initConfig call.


  // Load the 'grunt-contrib-less' plugin, which provides LESS compilation capabilities.
  grunt.loadNpmTasks('grunt-contrib-less');

  // Load the 'grunt-contrib-watch' plugin, enabling file system watching.
  grunt.loadNpmTasks('grunt-contrib-watch');


  // Register a custom Grunt task named 'fa-parse'.
  // This task parses Font Awesome icons and converts them into LESS variables.
  grunt.registerTask('fa-parse', 'parse font-awesome icons and migrate them to local variables less.', function()
  {
    // Read the YAML file containing Font Awesome icon definitions.
    var container = grunt.file.readYAML('bower_components/font-awesome/src/icons.yml'),
        content = ''; // Initialize an empty string to build the LESS content.

    // Iterate over each icon definition found in the YAML file.
    grunt.util._.each(container.icons, function(icon)
    {
      // Append a new LESS variable definition for the current icon.
      content += '@' + icon.id + ': "\\' + icon.unicode + '";\n';
    });

    // Write the accumulated LESS content to a new file named 'icons.less'.
    grunt.file.write('icons.less', content);

  }); // End of 'fa-parse' task registration.


  // Register the 'default' Grunt task.
  // This task will execute 'fa-parse' followed by 'less'.
  grunt.registerTask('default', ['fa-parse', 'less']);

  // Register the 'deploy' Grunt task as an alias for the 'default' task.
  // This means running 'grunt deploy' will execute the same tasks as 'grunt default'.
  grunt.registerTask('deploy', ['default']);

}; // End of module.exports function.