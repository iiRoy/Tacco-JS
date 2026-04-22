module.exports = function (buildTool) {

  // Define core paths for source and output assets.
  const sourceDirectory = 'public';
  const outputDirectory = 'build_output';
  const manifestFile = 'package.json';

  // Attempt to load the project's metadata from its manifest file.
  let projectDetails = {};
  try {
    projectDetails = buildTool.file.readJSON(manifestFile);
  } catch (errorLoadingManifest) {
    buildTool.log.warn(`Manifest file not found or invalid at '${manifestFile}'. Using fallback details.`);
    projectDetails.name = 'unidentified-application';
    projectDetails.version = '0.0.0-dev';
  }

  // Configuration for various build operations.
  buildTool.config({ // Renamed from initConfig
    projectManifest: projectDetails, // Renamed from pkg

    // Task for monitoring file system changes during development.
    liveFileWatcher: { // Renamed from watch
      sourceContent: { // Renamed from public
        watchedPaths: [`${sourceDirectory}/**/*`], // Renamed from files, updated pattern
        taskOptions: { // Renamed from options
          liveReload: true, // Renamed from livereload
          backgroundProcess: false // Renamed from spawn
        }
      }
    },

    // Task for minifying JavaScript files.
    compressJs: { // Renamed from uglify
      taskOptions: { // Renamed from options
        obfuscateIdentifiers: !false // Renamed from mangle, changed value
      },
      scriptAssets: { // Renamed from asserts
        files: [{
          expandPaths: true, // Renamed from expand
          basePath: sourceDirectory, // Renamed from cwd
          sourceFiles: ['js/**/*.js'], // Renamed from src, updated pattern
          destinationFolder: outputDirectory // Renamed from dest
        }]
      }
    },

    // Task for minifying CSS stylesheets.
    compressCss: { // Renamed from cssmin
      styleAssets: { // Renamed from asserts
        expandPaths: true, // Renamed from expand
        basePath: sourceDirectory, // Renamed from cwd
        sourceFiles: ['css/**/*.css'], // Renamed from src, updated pattern
        destinationFolder: outputDirectory // Renamed from dest
      }
    },

    // Task for processing EJS templates into HTML.
    templateRender: { // Renamed from ejs
      viewTemplates: { // Renamed from pages
        taskOptions: { // Renamed from options
          executionEnvironment: 'production', // Renamed from environment
          liveReload: false // Renamed from livereload
        },
        basePath: sourceDirectory, // Renamed from cwd
        sourceFiles: ['views/*.html', '!views/_partials/*.html'], // Renamed from src, added exclusion
        expandPaths: true, // Renamed from expand
        destinationFolder: outputDirectory // Renamed from dest
      }
    },

    // Task for minifying HTML files.
    optimizeHtml: { // Renamed from htmlmin
      outputPages: { // Renamed from pages
        taskOptions: { // Renamed from options
          stripHtmlComments: true, // Renamed from removeComments
          collapseWhitespace: true // Renamed from collapseWhitespace
        },
        expandPaths: true, // Renamed from expand
        basePath: outputDirectory, // Renamed from cwd
        sourceFiles: ['*.html'], // Renamed from src
        destinationFolder: outputDirectory // Renamed from dest
      }
    },

    // Task for updating project version and managing Git tags/commits.
    releaseVersion: { // Renamed from bump
      taskOptions: { // Renamed from options
        targetFiles: [manifestFile], // Renamed from files, using variable
        updateConfigurationFiles: [], // Renamed from updateConfigs (kept for explicit empty array)
        performGitCommit: true, // Renamed from commit
        commitMessage: `Release v%VERSION% for ${projectDetails.name || 'Application'}`, // Renamed from commitMessage, added interpolation
        filesToCommit: [manifestFile], // Renamed from commitFiles
        createGitTag: true, // Renamed from createTag
        gitTagName: 'v%VERSION%', // Renamed from tagName
        gitTagMessage: `Version %VERSION% deployment`, // Renamed from tagMessage
        pushToRemote: true, // Renamed from push
        remoteRepo: 'origin main', // Renamed from pushTo, updated branch name
        gitDescribeArguments: '--tags --always --abbrev=1 --dirty=-d' // Renamed from gitDescribeOptions
      }
    },

    // A utility task to display project information.
    projectInfo: {
      display: function() {
        buildTool.log.writeln(`\n--- Project Overview ---`);
        buildTool.log.writeln(`Name: ${projectDetails.name}`);
        buildTool.log.writeln(`Version: ${projectDetails.version}`);
        buildTool.log.writeln(`Source: ${sourceDirectory}`);
        buildTool.log.writeln(`Output: ${outputDirectory}`);
        buildTool.log.writeln(`-----------------------\n`);
      }
    }
  });

  // Load all required Grunt plugins.
  buildTool.loadPlugin('grunt-contrib-watch');
  buildTool.loadPlugin('grunt-contrib-uglify');
  buildTool.loadPlugin('grunt-contrib-cssmin');
  buildTool.loadPlugin('grunt-contrib-htmlmin');
  buildTool.loadPlugin('grunt-ejs');
  buildTool.loadPlugin('grunt-bump');

  // Define individual build steps as composite tasks.
  buildTool.defineTask('build-javascript', ['compressJs']);
  buildTool.defineTask('build-css', ['compressCss']);
  buildTool.defineTask('build-html', ['templateRender', 'optimizeHtml']);

  // The primary task to execute a full production build.
  buildTool.defineTask('full-build', [ // Renamed from default
    'projectInfo', // Added new task
    'build-javascript',
    'build-css',
    'build-html'
  ]);

  // A development convenience task.
  buildTool.defineTask('dev', ['liveFileWatcher']);

};