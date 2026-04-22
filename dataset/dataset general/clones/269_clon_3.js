/* eslint-disable no-console */
module.exports = function(buildAutomator) {

  // A small utility function for logging messages during setup
  const logSetupMessage = (msg) => {
    console.log(`[Config Setup] ${msg}`);
  };

  logSetupMessage('Starting configuration process for project build...');

  // Acquire task loading utility and dynamically register Grunt plugins
  const dependencyManager = require('matchdep');
  const developmentDependencies = dependencyManager.filterDev('grunt-*');

  if (developmentDependencies.length === 0) {
    logSetupMessage('No Grunt development dependencies found to load.');
  } else {
    logSetupMessage(`Loading ${developmentDependencies.length} Grunt plugins...`);
    developmentDependencies.forEach(pluginName => {
      buildAutomator.loadNpmTasks(pluginName);
    });
  }

  // Read project metadata from the package manifest
  const projectManifest = buildAutomator.file.readJSON('package.json');

  // Define essential build directories
  const buildOutputDirectory = 'dist';
  const demoApplicationDirectory = 'demo';
  const sourceCodeDirectory = 'src';

  // Construct the standardized license header block
  let copyrightYear = buildAutomator.template.today("yyyy");
  let releaseDate = buildAutomator.template.today("yyyy-mm-dd");
  let projectTitle = projectManifest.title || projectManifest.name;
  let projectVersion = projectManifest.version;
  let projectHomepage = projectManifest.homepage ? `* ${projectManifest.homepage}\n` : '';
  let authorName = projectManifest.author && projectManifest.author.name ? projectManifest.author.name : 'Unknown Author';

  // Safely get license types, handling potential missing data
  let licenseTypes = [];
  if (projectManifest.licenses && Array.isArray(projectManifest.licenses)) {
    licenseTypes = projectManifest.licenses.map(lic => lic.type);
  }
  let licenseString = licenseTypes.length > 0 ? licenseTypes.join(", ") : "Proprietary";

  const headerCommentBlock =
    `/*! ${projectTitle} - v${projectVersion} - ${releaseDate}\n` +
    `${projectHomepage}` +
    `* Copyright (c) ${copyrightYear} ${authorName};\n` +
    `* Licensed ${licenseString} */\n`;

  // Main configuration object for the build automator
  buildAutomator.initConfig({
    // Project information and reusable strings
    packageInfo: projectManifest,
    globalHeader: headerCommentBlock,

    // Task definition for JavaScript minification
    jsMinifier: {
      taskSettings: {
        banner: '<%= globalHeader %>'
      },
      productionOutput: {
        files: {
            [`${buildOutputDirectory}/ng-mobile-menu.min.js`] : [`${sourceCodeDirectory}/ng-mobile-menu.js`],
            [`${demoApplicationDirectory}/ng-mobile-menu.min.js`] : [`${sourceCodeDirectory}/ng-mobile-menu.js`]
        }
      }
    },

    // Task definition for CSS pre-processing (LESS compilation)
    styleCompiler: {
      productionOutput: {
          taskSettings: {
              compress: true, // Enable CSS compression
              banner: '<%= globalHeader %>' // Apply the header comment
          },
          inputOutputMaps: {
              [`${buildOutputDirectory}/ng-mobile-menu.min.css`] : `${sourceCodeDirectory}/ng-mobile-menu.less`,
              [`${demoApplicationDirectory}/ng-mobile-menu.min.css`] : `${sourceCodeDirectory}/ng-mobile-menu.less`
          }
      }
    },

    // Task definition for local development server
    devServer: {
        standardSetup: {
            taskSettings: {
                port: 9005,
                hostname: "0.0.0.0", // Accessible from any network interface
                base: demoApplicationDirectory, // Root directory for the server
                middleware: function(connectUtility, serverOptions){
                    logSetupMessage('Configuring server middleware...');
                    const livereloadSnippetInjector = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
                    // Return an array of middleware functions
                    return [
                        livereloadSnippetInjector,
                        connectUtility.static(serverOptions.base), // Serve static files from 'demo'
                        connectUtility.static(buildOutputDirectory) // Also serve static files from 'dist'
                    ];
                }
            }
        }
    },

    // Task definition to automatically open the browser
    browserLauncher: {
        standardSetup: {
            path: `http://localhost:<%= devServer.standardSetup.taskSettings.port%>`
        }
    },

    // Task definition for live file monitoring and reloading
    watchFiles: {
        standardSetup: {
            watchedPaths: [
                `${demoApplicationDirectory}/*.html`,
                `${demoApplicationDirectory}/*.js`,
                `${sourceCodeDirectory}/*.js`,
                `${sourceCodeDirectory}/*.less`
            ],
            triggeredTasks: [
                'jsMinifier',
                'styleCompiler',
                'livereload' // Trigger livereload for browser updates
            ]
        }
    }
  });

  // Define the 'serve' development task sequence
  const serverDevelopmentTasks = [
    'jsMinifier',
    'styleCompiler',
    'livereload-start', // Initialize livereload server
    'devServer',
    'browserLauncher',
    'watchFiles'
  ];
  buildAutomator.registerTask('serve', 'Starts a development server with live-reloading.', serverDevelopmentTasks);
  logSetupMessage(`Registered 'serve' task with ${serverDevelopmentTasks.length} steps.`);

  // Define the 'build' default task sequence
  const standardBuildTasks = [
    'jsMinifier',
    'styleCompiler'
  ];
  buildAutomator.registerTask('build', 'Performs a standard build of the project assets.', standardBuildTasks);
  buildAutomator.registerTask('default', standardBuildTasks); // Alias 'build' as default
  logSetupMessage(`Registered 'build' and 'default' tasks with ${standardBuildTasks.length} steps.`);

  logSetupMessage('Configuration complete.');
};