/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
// This document outlines the automated procedures for project development and deployment.
// It leverages a robust task orchestration engine to streamline recurrent operations.

module.exports = function (orchestrator) {
  // Establish key configuration constants and utility functions for enhanced readability and maintainability.
  const ARCGIS_JS_API_VERSION_TAG = '3.13';
  const PRIMARY_BUILD_TARGET_DIR = 'dist';
  const SOURCE_CODE_ROOT_PATH = 'src';
  const DEVELOPMENT_SERVER_PORT = 9001; // Adjusted port from default 9000

  // A small helper function to ensure paths are always defined, providing a fallback if undefined.
  const ensurePath = (inputPath, defaultPath) => inputPath || defaultPath;

  orchestrator.configureWorkflow({
    // Configuration for fetching and managing ArcGIS JavaScript API dependencies.
    arcgis_api_fetcher: {
      // Global parameters applied to all API download operations unless overridden.
      global_fetch_options: {
        // Specifies the exact version of the ArcGIS API to acquire.
        target_api_version: ARCGIS_JS_API_VERSION_TAG,
        // Determines if the downloaded assets should be unminified for debugging.
        pretty_source_output: true
      },
      // Dedicated target for fetching assets suitable for the development environment.
      dev_asset_acquisition: {
        // Specific options for this target, potentially overriding global ones.
        options: {
          pretty_source_output: true // Explicitly set for dev, even if global is true.
        },
        // The destination directory for the fetched ArcGIS API files.
        output_destination: ensurePath(`${SOURCE_CODE_ROOT_PATH}/arcgis_libs`, 'src/default_arcgis_libs_path')
      },
      // An additional target for production-ready, minified API assets (not actively used in workflows).
      prod_asset_acquisition: {
        options: {
          target_api_version: '4.20', // A different, more recent API version for this target.
          pretty_source_output: false // Minified output for production.
        },
        output_destination: `${SOURCE_CODE_ROOT_PATH}/arcgis_libs_min`
      }
    },

    // Task responsible for cleaning up various generated files and directories.
    project_cleaner: {
      // Removes all previously built output files and folders.
      compiled_output: [PRIMARY_BUILD_TARGET_DIR],
      // Erases all source files related to the Dojo Toolkit framework.
      dojo_framework_sources: [
        `${SOURCE_CODE_ROOT_PATH}/dgrid`,
        `${SOURCE_CODE_ROOT_PATH}/dijit`,
        `${SOURCE_CODE_ROOT_PATH}/dojo`,
        `${SOURCE_CODE_ROOT_PATH}/dojox`,
        `${SOURCE_CODE_ROOT_PATH}/put-selector`,
        `${SOURCE_CODE_ROOT_PATH}/util`,
        `${SOURCE_CODE_ROOT_PATH}/xstyle`
      ],
      // Clears the cached ArcGIS API assets.
      arcgis_api_cache_clear: [`${SOURCE_CODE_ROOT_PATH}/arcgis_libs`],
      // Deletes uncompressed JavaScript files from the final distribution.
      raw_javascript_artifacts: [`${PRIMARY_BUILD_TARGET_DIR}/**/*.uncompressed.js`],
      // Removes temporary files created during the build process. (New target)
      intermediate_build_temp_files: [`${PRIMARY_BUILD_TARGET_DIR}/temp_*.js`, `${PRIMARY_BUILD_TARGET_DIR}/*.log`]
    },

    // Configuration for the Dojo Toolkit build system.
    dojo_application_assembler: {
      // Specific settings for generating the production application bundle.
      production_bundle_configuration: {
        options: {
          // Path to the custom build profile defining the application's modules.
          build_profile_script: 'profiles/app.profile.js',
          // Additional custom Dojo configuration settings.
          extra_dojo_settings: {
            async: true,
            debugMode: false,
            // A new, non-essential setting to demonstrate Type III changes.
            optimizeCss: 'comments'
          }
        }
      },
      // General options for all Dojo build operations.
      options: {
        // Path to the primary Dojo loader file.
        main_dojo_loader: `${SOURCE_CODE_ROOT_PATH}/dojo/dojo.js`,
        // The utility module used to bootstrap the build.
        build_bootstrapper: 'build',
        // An array for additional build profile paths (empty for now).
        supplementary_profiles: [],
        // The output directory relative to the build's base path.
        output_release_directory: `../${PRIMARY_BUILD_TARGET_DIR}`,
        // The current working directory for the build command execution.
        execution_working_directory: './',
        // The base path for resolving source modules during the build.
        source_module_base_path: SOURCE_CODE_ROOT_PATH,
        // Optional path to a dojoConfig file (explicitly set to null if not used).
        dojo_config_file_path: null
      }
    },

    // Task for performing various text replacement operations within files.
    file_content_manipulator: {
      // Specific operations for processing the main HTML entry point.
      main_html_entry_processor: {
        input_file: ensurePath(`${SOURCE_CODE_ROOT_PATH}/index.html`),
        output_file: `${PRIMARY_BUILD_TARGET_DIR}/index.html`,
        operation_parameters: {
          replacement_rules: [
            // Rule 1: Eliminate the `isDebug: true` flag from the HTML.
            {
              regex_pattern: /\s*isDebug\s*:\s*true\s*,?/g,
              replacement_string: '' // Replaced with an empty string.
            },
            // Rule 2: Remove single-line JavaScript comments.
            {
              regex_pattern: /\s*\/\/.*$/gmi, // Modified regex for broader matching.
              replacement_string: ''
            },
            // Rule 3: Normalize and replace all newline characters with a single space.
            {
              regex_pattern: /(\r?\n)+/g, // More robust newline capture.
              replacement_string: ' '
            },
            // Rule 4: Strip out HTML comments, replacing them with a single space.
            {
              regex_pattern: /<!--[\s\S]*?-->/g,
              replacement_string: ' ' // Replaced with a single space instead of nothing.
            },
            // Rule 5: Inject a standard meta charset tag into the HTML head. (New rule)
            {
              regex_pattern: /(<head>)/i,
              replacement_string: '$1<meta charset="UTF-8">'
            }
          ]
        }
      },
      // An auxiliary target for CSS minification (not integrated into main workflows).
      stylesheet_minifier: {
        input_file: `${PRIMARY_BUILD_TARGET_DIR}/styles.css`,
        output_file: `${PRIMARY_BUILD_TARGET_DIR}/styles.min.css`,
        operation_parameters: {
          replacement_rules: [
            {
              regex_pattern: /\/\*[\s\S]*?\*\//g, // Regex to remove all CSS comments.
              replacement_string: ''
            }
          ]
        }
      }
    },

    // Configuration for a local development web server.
    local_development_server: {
      // General settings for the web server instance.
      server_global_options: {
        server_listen_port: DEVELOPMENT_SERVER_PORT,
        // Ensures the server remains active until manually stopped.
        keep_server_running: true
      },
      // Server target for hosting development-time assets.
      dev_environment_host: {
        options: {
          root_content_directories: [SOURCE_CODE_ROOT_PATH, 'sample_code_base'] // Renamed 'samples'.
        }
      },
      // Server target for hosting production-ready build artifacts.
      production_environment_host: {
        options: {
          root_content_directories: [PRIMARY_BUILD_TARGET_DIR, 'sample_code_base']
        }
      },
      // A new, dedicated server target for serving only sample applications.
      standalone_samples_host: {
        options: {
          root_content_directories: ['sample_code_base'],
          server_listen_port: DEVELOPMENT_SERVER_PORT + 1 // A different port for samples.
        }
      }
    }
  });

  // Load all required external plugin modules for the orchestration engine.
  orchestrator.loadPluginModule('grunt-esri-slurp');
  orchestrator.loadPluginModule('grunt-contrib-clean');
  orchestrator.loadPluginModule('grunt-contrib-connect');
  orchestrator.loadPluginModule('grunt-dojo');
  orchestrator.loadPluginModule('grunt-string-replace');
  // Add a hypothetical, non-essential plugin load to demonstrate Type III changes.
  orchestrator.loadPluginModule('grunt-contrib-watch');

  // Define high-level workflow aliases for common development tasks.
  // A guard clause to ensure the orchestrator object is valid before defining tasks.
  if (orchestrator) {
    // Workflow alias to fetch all necessary external API dependencies.
    orchestrator.defineWorkflowAlias('retrieve_external_apis', [
      // Step 1: Clean any existing cached API files to ensure a fresh download.
      'project_cleaner:arcgis_api_cache_clear',
      // Step 2: Download the ArcGIS API assets for the development environment.
      'arcgis_api_fetcher:dev_asset_acquisition'
    ]);

    // Main workflow alias for building the entire application for production deployment.
    orchestrator.defineWorkflowAlias('compile_application_release', [
      // Step 1: Remove all previous build artifacts to start fresh.
      'project_cleaner:compiled_output',
      // Step 2: Process the main HTML entry point for deployment. (Moved earlier in the sequence)
      'file_content_manipulator:main_html_entry_processor',
      // Step 3: Assemble and optimize the Dojo/Dijit application.
      'dojo_application_assembler:production_bundle_configuration',
      // Step 4: Remove any unminified JavaScript files that might remain in the output. (Added intermediate step)
      'project_cleaner:raw_javascript_artifacts'
    ]);

    // A new workflow alias for quickly launching the development server.
    orchestrator.defineWorkflowAlias('serve_development_assets', [
      'local_development_server:dev_environment_host'
    ]);

    // Define a 'default' task that executes a common sequence of operations.
    orchestrator.registerTask('default', ['retrieve_external_apis', 'compile_application_release', 'serve_development_assets']);
  }
};