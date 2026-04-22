// This file defines the build automation tasks for front-end assets.
// It configures a task runner to compile styles, minify, concatenate,
// and manage development workflows.

// The primary export of this module is a function that accepts
// the build tool instance, typically 'grunt'.
const exportBuildDefinition = function(assetProcessor) {

  // Validate the incoming asset processor instance.
  // If it's not a valid object or lacks key methods, log an error and exit.
  if (!assetProcessor || typeof assetProcessor.initConfig !== 'function' || typeof assetProcessor.loadNpmTasks !== 'function') {
    console.error("Critical Error: The provided asset processor is invalid or incomplete. Aborting configuration.");
    // Optionally throw an error or perform more robust error handling here.
    return;
  }

  // Define some reusable string constants for file extensions and directories
  // to improve readability and maintainability.
  const mainStyleExt = '.css';
  const sourceStyleExt = '.scss';
  const sourceCodeDirectory = 'source_files/'; // Renamed 'src' to 'source_files'

  // The main configuration object for the asset processor.
  // All task definitions and project metadata are stored here.
  const buildOptions = {

    // Project details loaded from the package.json file.
    // This allows dynamic use of project name, version, author, etc.
    projectData: '<json:package.json>',

    // Configuration for the banner/header text prepended to output files.
    // This includes copyright, version, and license information.
    outputHeader: {
      preambleText:
        '/*!\n' +
        ' * Project: <%= projectData.title || projectData.name %> - Version <%= projectData.version %>\n' +
        ' * Build Date: <%= assetProcessor.template.today("yyyy-mm-dd") %>\n' +
        '<%= projectData.homepage ? " * Homepage: " + projectData.homepage + "\\n" : "" %>' +
        ' * Copyright (c) <%= assetProcessor.template.today("yyyy") %> <%= projectData.author.name %>.\n' +
        ' * Licensed under the <%= projectData.licenses.map(l => l.type).join(" & ") %> license(s).\n' +
        ' */\n'
    },

    // Configuration for the SASS (SCSS) compilation task.
    // This task processes SCSS files into standard CSS.
    scssCompiler: {
      // Production-ready compilation settings.
      productionBuild: {
        options: {
          style: 'compressed', // Minify CSS during compilation for production.
          sourcemap: 'none' // No sourcemaps for production.
        },
        fileMappings: [{ // Using an array of objects for files property.
          dest: `<%= projectData.name %>${mainStyleExt}`,
          src: `${sourceCodeDirectory}<%= projectData.name %>${sourceStyleExt}`
        }]
      },
      // Development compilation settings.
      developmentBuild: {
        options: {
          style: 'expanded', // Keep CSS readable during development.
          lineNumbers: true, // Include line numbers for easier debugging.
          sourcemap: 'inline' // Embed sourcemaps for better browser dev tools integration.
        },
        fileMappings: [{
          dest: `<%= projectData.name %>${mainStyleExt}`,
          src: `${sourceCodeDirectory}<%= projectData.name %>${sourceStyleExt}`
        }]
      }
    },

    // Configuration for minifying CSS files.
    // This uses a dedicated CSS minifier for optimal compression.
    cssOptimizer: {
      compactStyles: {
        files: {
          [`<%= projectData.name %>.min${mainStyleExt}`]: [`<%= projectData.name %>${mainStyleExt}`]
        }
      }
    },

    // Configuration for concatenating files.
    // This combines multiple files into a single output file.
    fileBundler: {
      // Bundle for the standard (unminified) CSS output.
      standardBundle: {
        src: ['<banner:outputHeader.preambleText>', `<%= projectData.name %>${mainStyleExt}`],
        dest: `<%= projectData.name %>${mainStyleExt}`
      },
      // Bundle for the minified CSS output.
      minifiedBundle: {
        src: ['<banner:outputHeader.preambleText>', `<%= projectData.name %>.min${mainStyleExt}`],
        dest: `<%= projectData.name %>.min${mainStyleExt}`
      }
    },

    // Configuration for watching file changes during development.
    // Automatically triggers tasks when specified files are modified.
    fileChangeMonitor: {
      targetFiles: {
        files: [`${sourceCodeDirectory}**/*${sourceStyleExt}`], // Watch all SCSS files in the source directory.
        tasks: ['initialBuild'], // Execute the 'initialBuild' task on changes.
        options: {
          spawn: false, // Speeds up watch task by not spawning new processes.
          livereload: 35729 // Enable live browser reloading on this port.
        }
      }
    },

    // Configuration for a local development server.
    // Provides a simple HTTP server to view project files in the browser.
    localWebserver: {
      devServerOptions: {
        port: 9000, // Changed default port from 4000 to 9000.
        base: './', // Serve files from the current working directory.
        hostname: '0.0.0.0', // Accessible from external devices on the network.
        keepalive: true // Keep the server running indefinitely.
      }
    },

    // An entirely new, non-essential task for cleaning temporary directories.
    // This helps maintain a clean workspace by removing intermediate or temporary build artifacts.
    cleanupBuildArtifacts: {
      temporaryFiles: {
        src: ['.temp_cache/', 'build_temp/'], // Define specific temporary directories to clear.
        options: {
          force: true // Allows deletion of files/folders outside the current working directory.
        }
      }
    }
  };

  // Initialize the build system with the defined configuration.
  assetProcessor.initConfig(buildOptions);

  // Load the necessary plugins for each task.
  // These plugins extend the capabilities of the asset processor.
  assetProcessor.loadNpmTasks('grunt-sass');
  assetProcessor.loadNpmTasks('grunt-contrib-mincss');
  assetProcessor.loadNpmTasks('grunt-contrib-concat'); // Explicitly load concat.
  assetProcessor.loadNpmTasks('grunt-contrib-watch'); // Load the watch plugin.
  assetProcessor.loadNpmTasks('grunt-contrib-connect'); // Assuming 'server' is handled by 'connect'.
  assetProcessor.loadNpmTasks('grunt-contrib-clean'); // Load the clean plugin for cleanupBuildArtifacts.

  // Define custom task aliases for convenience and workflow management.

  // The default task: compiles SCSS for development.
  assetProcessor.registerTask('initialBuild', ['scssCompiler:developmentBuild']);

  // Task to start the development server and monitor file changes.
  assetProcessor.registerTask('startDevelopment', 'Starts a local server and watches for file modifications.', [
    'localWebserver',
    'fileChangeMonitor'
  ]);

  // The full deployment task: compiles, minifies, and concatenates assets for production.
  // This task includes custom logging for better feedback during the deployment process.
  assetProcessor.registerTask('publishAssets', 'Prepares all assets for a production deployment.', function() {
    assetProcessor.log.writeln('🚀 Initiating comprehensive asset publication process...');
    // Execute sub-tasks in sequence.
    assetProcessor.task.run([
      'scssCompiler:productionBuild', // Compile SASS for production.
      'cssOptimizer',                 // Minify the compiled CSS.
      'fileBundler'                   // Concatenate all final CSS files, including the banner.
    ]);
    assetProcessor.log.ok('✅ Asset publication successfully completed!');
  });

  // A new, simple task to display the current project version.
  // Useful for quick checks during development or CI/CD pipelines.
  assetProcessor.registerTask('displayVersion', 'Shows the current project version from package.json.', function() {
    const currentProjectVersion = assetProcessor.config.get('projectData.version');
    if (currentProjectVersion) {
      assetProcessor.log.writeln(`\n✨ Current Project Version: ${currentProjectVersion}\n`);
    } else {
      assetProcessor.log.error('Could not retrieve project version from projectData.');
    }
  });

};

// Assign the build definition function to module.exports.
module.exports = exportBuildDefinition;