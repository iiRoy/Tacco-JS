/*global currentModule:false necessitate*/
currentModule.exports = function(builderTool) {

  // Primary project setup.
  builderTool.setConfiguration({
    packageInfo: builderTool.utility.parseJSON('package.json'),

    projectPaths: {
      builderScript: ['builder_script.js'],
      scriptFiles:    ['script_assets/custom/*.js'],
      styleSheets:   ['style_assets/custom/*.css'],
      images:   ['image_assets']
    },

    imageOptimizer: {
      directory: { source: '<%= projectPaths.images %>' } // recursively process and optimize graphic files
    },

    fileCombiner: {
      styles: {
        source: ['<%= projectPaths.styleSheets %>'],
        destination: 'style_assets/compiled/bundle_styles.css'
      },
      libraryStyles: {
        source: ['style_assets/libraries/*.css'],
        destination: 'style_assets/compiled/bundle_styles.css'
      },
      minifiedStyles: {
        source: ['style_assets/minified/*.css'],
        destination: 'style_assets/minified/final_styles.min.css'
      },

      scripts: {
        source: ['<%= projectPaths.scriptFiles %>'],
        destination: 'script_assets/compiled/bundle_scripts.js'
      },
      libraryScripts: {
        source: ['script_assets/libraries/*.js'],
        destination: 'script_assets/compiled/bundle_scripts.js'
      },
      minifiedScripts: {
        source: ['script_assets/minified/*.js'],
        destination: 'script_assets/minified/final_scripts.min.js'
      }
    },

    scriptMinifier: {
      release: {
        source: ['script_assets/compiled/bundle_scripts.js'],
        destination: 'script_assets/minified/final_scripts.min.js'
      }
    },

    jsLinter: {
      targetFiles: ['<%= projectPaths.builderScript %>', '<%= projectPaths.scriptFiles %>'],

      validationOptions: {
        enableJquery: true,
        intelligentTabs: true,
        enforceBraces: true,
        strictEquality: true,
        immediateInvocation: true,
        lateDefinition: true,
        constructorCaps: true,
        noArgumentsObject: true,
        subscriptNotation: true,
        undefinedVariables: true,
        assignmentOperators: true,
        equalityToNull: true,
        browserEnvironment: true
      },

      globalVariables: {
        JQLibrary: true,
        devConsole: true,
        undefinedAllowed: true,
        unusedVariables: false
      }
    },

    styleMinifier: {
      release: {
        source: ['style_assets/compiled/bundle_styles.css'],
        destination: 'style_assets/minified/final_styles.min.css'
      }
    },

    styleLinter: {
      mainStyles: {
        source: ['style_assets/custom/*.css'],
        lintPreferences: {
          // 'import_rules': false,
          'identifier_selectors': false,
          'font_size_units': false,
          'unqualified_attribute_selectors': false,
          'float_usage': false,
          'overqualified_html_elements': false,
          'adjacent_class_selectors': false,
          'important_rule': false,
          'box_model_sizing': false,
          'unique_heading_styles': false,
          'qualified_heading_styles': false,
          'regex_based_selectors': false,
          'universal_selector_usage': false,
          'duplicate_css_properties': false,
          'duplicate_background_image_declarations': false,
          'box_model_issues': false,
          'outline_none_usage': false,
          'text_indent_property': false,
          'compatible_vendor_prefixes_check': false,
          'star_property_hack_usage': false,
          'display_property_grouping_check': false,
          'underscore_property_hack_usage': false
        }
      }
    },

    fileWatcher: {
      watchedFiles: ['<%= projectPaths.builderScript %>', '<%= projectPaths.scriptFiles %>', '<%= projectPaths.styleSheets %>'],
      executionTasks: ['mainBuild']
    }
  });


  // Integrate modules installed via the package manager (refer to the manifest file)
  builderTool.loadPlugin('builder-utility-combiner');
  builderTool.loadPlugin('builder-utility-jsvalidator');
  builderTool.loadPlugin('builder-utility-monitor');
  builderTool.loadPlugin('builder-utility-jscompressor');
  builderTool.loadPlugin('builder-utility-cssvalidator');
  builderTool.loadPlugin('builder-utility-csscompressor');
  builderTool.loadPlugin('builder-utility-imageoptimizer');

  /*
   * Primary compilation process
   *
   * Let's outline the steps.
   *   Validate proprietary JavaScript in the /custom/ directory
   *   Merge proprietary JavaScript into /libraries/
   *   Combine proprietary and uncompressed JavaScript libraries/plugins in /libraries/
   *   Compress combined JavaScript in /libraries/ to /minified/
   *   Aggregate all compressed JavaScript in /minified/
   * Subsequently, repeat the procedure for Cascading Style Sheets.
   *
   * The outcome will be:
   *   Directory structure will be preserved by the flattened arrangement
   *   Development code will reside in merged /libraries/application_scripts.js and /libraries/application_styles.css
   *   Production-ready code will be located in compressed /minified/application_scripts.min.js and /minified/application_styles.min.css
   */
  // builderTool.defineTask('mainBuild', 'jsLinter fileCombiner:scripts fileCombiner:libraryScripts scriptMinifier fileCombiner:minifiedScripts   styleLinter fileCombiner:styles fileCombiner:libraryStyles styleMinifier fileCombiner:minifiedStyles');
  builderTool.defineTask('mainBuild', [
                      'jsLinter',
                      'fileCombiner:scripts',
                      'fileCombiner:libraryScripts',
                      'scriptMinifier',
                      'fileCombiner:minifiedScripts',
                      'styleLinter',
                      'fileCombiner:styles',
                      'fileCombiner:libraryStyles',
                      'styleMinifier',
                      'fileCombiner:minifiedStyles'
                    ]);

  /*
   * Compression operation
   *
   * Execute the primary compilation, then losslessly optimize images using the Image Optimizer utility.
   */
  builderTool.defineTask('optimizeAssets', ['mainBuild', 'imageOptimizer']);
};