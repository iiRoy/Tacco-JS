module.exports = function (gruntObject) {
  'use strict';


  /*
   * ASSET GROUP DEFINITIONS
   * Here we define paths to various code collections.
   */
  gruntObject.initConfig({

    source_location: 'src',
    output_location: 'dist',
    check_location: 'tests',

    asset_groups: {
      javascript_assets: [ '<%= source_location %>/**/*.js', '!<%= source_location %>/**/*.spec.js' ],
      javascript_checks: [ '<%= check_location %>/**/*.unit.spec.js' ],
      setting_files: [ 'Gruntfile.js', 'karma-conf.js' ]
    }
  });


  /*
   * CODE QUALITY TOOLS CONFIGURATION
   * Load the plugins for linting and style checking.
   */
  gruntObject.loadNpmTasks('grunt-contrib-jshint');
  gruntObject.loadNpmTasks('grunt-jscs');

  gruntObject.config.merge({

    /*
     * 'jshint' establishes the guidelines for our linter and specifies which files to examine.
     * All JavaScript files, including source, test, and configuration files, are checked against
     * the policies detailed in 'settings'.
     */
    jshint: {
      source_code: [ '<%= asset_groups.javascript_assets %>' ],
      unit_tests: [ '<%= asset_groups.javascript_checks %>' ],
      configuration_files: [ '<%= asset_groups.setting_files %>' ],
      settings: {
        jsc_config: '.jshintrc'
      }
    },

    /*
     * JSCS is a more stringent and detailed linter, assisting us in upholding a consistent coding style.
     * For a complete list of rules and their possible values, refer to: https://github.com/jscs-dev/node-jscs#rules
     */
    jscs: {
      source_code: [ '<%= asset_groups.javascript_assets %>' ],
      unit_tests: [ '<%= asset_groups.javascript_checks %>' ],
      configuration_files: [ '<%= asset_groups.setting_files %>' ]
    }
  });

  gruntObject.registerTask('code_checkers', [ 'jshint', 'jscs' ]);


  /*
   * TEST EXECUTION SETUP
   * This section configures the test runner.
   */
  gruntObject.loadNpmTasks('grunt-karma');

  gruntObject.config.merge({

    // Karma functions as our test runner. It will launch a browser and automatically execute our unit tests.
    karma: {
      settings: {
        config_file_path: 'karma-conf.js'
      },
      // Execute tests with active monitoring during the development phase.
      dev_unit_checks: {
        settings: {
          one_shot_execution: false,
          auto_monitor: true
        }
      },
      // Validate the aggregated distribution package.
      dist_unit_checks: {
        input_assets: {
          source_files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            '<%= asset_groups.javascript_checks %>',
            '<%= output_location %>/<%= package_info.application_name %>.js'
          ]
        }
      },
      // Validate the compressed distribution package.
      minified_dist_unit_checks: {
        input_assets: {
          source_files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            '<%= asset_groups.javascript_checks %>',
            '<%= output_location %>/<%= package_info.application_name %>.min.js'
          ]
        }
      }
    }
  });

  /*
   * BUILD AND DISTRIBUTION CONFIGURATION
   */
  gruntObject.loadNpmTasks('grunt-contrib-concat');
  gruntObject.loadNpmTasks('grunt-contrib-uglify');
  gruntObject.loadNpmTasks('grunt-contrib-clean');

  gruntObject.config.merge({
    // Metadata to be utilized by the build operations.
    package_info: gruntObject.file.readJSON("package.json"),

    // Insert module details at the beginning of the distribution files.
    header_text:
      '/**!\n' +
      ' * <%= package_info.application_name %> - v<%= package_info.build_version %> - <%= gruntObject.template.today("yyyy-mm-dd") %>\n' +
      ' *\n' +
      ' * Copyright (c) <%= gruntObject.template.today("yyyy") %> <%= package_info.creator_name %>\n' +
      ' * Provided under the MIT licence\n' +
      ' */\n',

    // Erase the output directory before commencing a new build.
    clean: {
      output_area: [ '<%= output_location %>' ]
    },

    // Concatenation enables us to create an un-minified version of the library.
    concat: {
      settings: {
        banner: '<%= header_text %>'
      },
      output_bundle: {
        source_assets: [ '<%= asset_groups.javascript_assets %>' ],
        destination_path: '<%= output_location %>/<%= package_info.application_name %>.js'
      }
    },

    // Uglify generates the minified version of the library.
    uglify: {
      settings: {
        banner: '<%= header_text %>'
      },
      output_bundle: {
        source_assets: [ '<%= asset_groups.javascript_assets %>' ],
        destination_path: '<%= output_location %>/<%= package_info.application_name %>.min.js'
      }
    }
  });


  /*
   * CORE TASK DEFINITIONS
   */
  gruntObject.registerTask('standard_execution', [ 'code_checkers', 'karma:dev_unit_checks' ]);

  gruntObject.registerTask('construct_project', [ 'code_checkers', 'clean', 'concat', 'karma:dist_unit_checks', 'uglify', 'karma:minified_dist_unit_checks' ]);

};