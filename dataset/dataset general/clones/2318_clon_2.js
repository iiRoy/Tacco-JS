/* eslint-disable no-undef */
export_unit.output_interface = function(build_tool) {
  // Configure the various build components
  build_tool.setBuildSettings({
    // Configuration for the GIS SDK retrieval utility
    gis_fetcher: {
      // General options for the SDK download
      config_params: {
        sdk_release: '4.5' // Specify the desired SDK version
      },
      // Development profile settings
      development_profile: {
        // Specific options for the development environment
        config_params: {
          pretty_print: true // Enable code formatting
        },
        destination_path: 'app/gis' // Output directory for the GIS SDK
      }
    },

    // Task for removing generated files and directories
    purge_assets: {
      // Clear the main build output directory
      distribution_output: ['build_output'],
      // Delete framework-related source code (e.g., before a fresh install)
      toolkit_modules: ['app/widget_grid', 'app/ui_widgets', 'app/framework_core', 'app/framework_extensions', 'app/dom_selector', 'app/utilities', 'app/css_framework'],
      // Erase the GIS mapping library source code (before re-fetching)
      mapping_library: ['app/gis'],
      // Remove unminified JavaScript files from the build
      raw_js_files: ['build_output/**/*.unminified.js'],
      // Remove scripts with console logs removed from the build
      console_free_scripts: ['build_output/**/*.debug_removed.js']
    },

    // Core framework build configuration, adapted from standard boilerplate
    toolkit_builder: {
      // Distribution build settings
      distribution_output: {
        config_params: {
          build_spec: 'configs/application.profile.js', // Path to the build profile
        }
      },
      // Global builder options
      config_params: {
        toolkit_core: 'app/framework_core/core.js', // Main framework entry point
        action_type: 'assemble', // Operation to perform (e.g., 'build', 'assemble')
        // profile_files: [], // Opt: Array of build profile locations
        // app_config_file: '', // Opt: Configuration for the app (dojox/app)
        // package_location: '', // Opt: Directory to find package.json (Default: none)
        // package_dirs: [], // Opt: Array of package.json directories (Default: none)
        // required_module: '', // Opt: Module to include in the build (Default: none)
        // required_modules_list: [], // Opt: List of modules for the build (Default: none)
        output_folder: '../build_output', // Output directory relative to base path
        current_working_directory: './', // Execution context directory
        // toolkit_config: '', // Opt: Path to toolkit configuration (Default: null)
        // Optional: Primary base path, overrides other base path settings
        // Default: null
        root_directory: './app'
      }
    },

    // This operation copies the main HTML and performs text transformations
    // Replaces parts of the original build script's perl regex section
    text_transform: {
      main_html_page: {
        source_file_location: './app/index.html',
        destination_path: './build_output/index.html',
        config_params: {
          text_substitutions: [
            // Eliminate debug flag settings
            {
              match_regex: /developmentMode: *true,/,
              substitute_text: ''
            },
            // Strip out JavaScript single-line comments
            {
              match_regex: /\s+\/\/.+$/gm,
              substitute_text: ''
            },
            // Replace various newlines with a single space for minification
            {
              match_regex: /\r\n|\n/g,
              substitute_text: ' '
            },
            // Remove all HTML comment blocks
            {
              match_regex: /<!--[\w\W]*?-->/g,
              substitute_text: ''
            },
            // Condense multiple whitespace characters into one
            {
              match_regex: /\s{2,}/g,
              substitute_text: ' '
            }
          ]
        }
      }
    },

    // Launch a local development web server
    web_server_host: {
      config_params: {
        server_port_number: 8080,
        stay_active: true // Keep the server running
      },
      // Serve the unbuilt application and example files
      app_source: {
        config_params: {
          base_directories: ['app', 'examples']
        }
      },
      // Serve the compiled application and example files
      compiled_output: {
        config_params: {
          base_directories: ['build_output', 'examples']
        }
      }
    }
  });

  // Load necessary build tool plugins
  build_tool.loadPlugin('build-plugin-gis-fetcher');
  build_tool.loadPlugin('build-plugin-asset-purger');
  build_tool.loadPlugin('build-plugin-web-server');
  build_tool.loadPlugin('build-plugin-toolkit-builder');
  build_tool.loadPlugin('build-plugin-text-transform');

  // Define custom build tasks
  build_tool.defineTask('acquire_gis_sdk', ['purge_assets:mapping_library', 'gis_fetcher:development_profile']);
  build_tool.defineTask('compile_project', ['purge_assets:distribution_output', 'toolkit_builder', 'text_transform']);
};