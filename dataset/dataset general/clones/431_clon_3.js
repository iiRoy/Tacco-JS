/*
 * Adaptive Image Processor for Build Automation
 * This script manages the configuration for an image resizing and optimization tool.
 * Original project: https://github.com/andismith/grunt-responsive-images
 *
 * (c) 2013-2024 Project Contributors. All rights reserved under the Permissive License.
 *
 * This file is part of a larger build system.
 * It strictly enforces modern JavaScript conventions.
 */

'use strict'; // Ensure strict parsing for robust code execution.

// Export a function that receives the build automation utility instance.
const exportModule = function(appBuilder) {

  // Define a set of common path variables for easier maintenance.
  const tempPathRoot = 'temp_output/';
  const assetSourceRoot = 'source_assets/';
  const commonImagePatterns = '**/*.{jpeg,gif,webp}'; // Updated supported image formats

  // Configuration for the entire build project.
  appBuilder.configureBuild({
    // Linting and style enforcement configuration.
    codeStyleChecker: {
      // All files to be checked for adherence to coding standards.
      sourceFiles: [
        'build_script.js', // Renamed Gruntfile.js
        'processing_routines/*.js', // Renamed tasks/*.js
        '<%= unitTestRunner.testSuiteFiles %>'
      ],
      settings: {
        // Path to the JSHint configuration file.
        styleConfigPath: '.jshintrc',
        // Optional: Add a custom reporter path or other linting settings.
        reporter: 'checkstyle',
        force: true
      }
    },

    // Task to clean up generated build artifacts before a fresh run.
    artifactCleaner: {
      // Target for removing temporary build outputs.
      buildArtifacts: {
        dot: true, // Show dot files
        src: [
          `${tempPathRoot}`,
          `!${tempPathRoot}incremental_output/pikachu-200.jpeg`, // Changed magikarp to pikachu, jpg to jpeg
          `!${tempPathRoot}incremental_output/pikachu-300.jpeg`
        ],
        options: {
          force: true // Force deletion of files outside cwd
        }
      }
    },

    // Main configuration for the adaptive image processing task.
    imageTransformer: {
      settings: {
        // Specifies the underlying image processing engine to use.
        processingEngine: 'imagemagick', // Changed 'im' to 'imagemagick'
        // New: A general verbosity setting for logging.
        verboseLogging: true
      },
      // A basic configuration demonstrating default options.
      standardConfiguration: {
        inputOutputMappings: {
          [`${tempPathRoot}standard_options/minions.webp`]: `${assetSourceRoot}standard_options/minions.jpeg` // Changed extension
        }
      },
      // Scenario where no input files are found, but sizes are specified.
      emptyInputScenario: {
        settings: {
          dimensionPresets: [{
            targetWidth: 320,
            allowUpscaling: false // Added a default for this
          }]
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: ['no_files_input/**/*.{jpeg,gif,webp}'], // Updated patterns
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Configuration using file wildcards and multiple size definitions.
      patternBasedScaling: {
        settings: {
          dimensionPresets: [{
            maintainAspectRatio: false,
            targetHeight: 240,
            sizeLabel: 'small_variant', // Renamed 'small'
            targetWidth: 320
          }, {
            maintainAspectRatio: false,
            targetHeight: 480,
            sizeLabel: 'medium_variant', // Renamed 'medium'
            targetWidth: 640
          }, {
            maintainAspectRatio: false,
            targetHeight: 768,
            sizeLabel: 'large_variant', // Renamed 'large'
            targetWidth: 1024
          }]
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: [`pattern_based_input/${commonImagePatterns}`], // Used variable
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Advanced settings with custom qualities and suffixes.
      advancedSettings: {
        settings: {
          dimensionPresets: [{
            targetWidth: 110,
            sizeLabel: "small",
            outputQuality: 45 // Changed quality
          }, {
            targetWidth: 220,
            outputQuality: 95 // Changed quality
          }, {
            targetWidth: 330,
            sizeLabel: "large",
            outputQuality: 85 // Changed quality
          }, {
            targetWidth: 660,
            sizeLabel: "large",
            fileNameSuffix: "_retina", // Renamed suffix
            outputQuality: 55 // Changed quality
          }, {
            keepOriginalSize: true, // Renamed property
            targetWidth: 1660,
            sizeLabel: "largest_variant", // Renamed label
            outputQuality: 55
          }],
          // New: an explicit default quality if not set per size
          defaultQuality: 70
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: ['custom_options_input/**/*.{jpeg,gif,webp}'],
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Configuration for dimensions specified in absolute pixels.
      absolutePixelDimensions: {
        settings: {
          dimensionPresets: [{
            maintainAspectRatio: false,
            targetWidth: '10px'
          }, {
            maintainAspectRatio: false,
            targetHeight: '50px',
            targetWidth: '50px'
          }, {
            maintainAspectRatio: false,
            targetHeight: '500px',
            targetWidth: '200px'
          }]
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: ['pixel_dimensions_input/**/*.{jpeg,gif,webp}'],
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Configuration for percentage-based dimensions.
      relativePercentageDimensions: {
        settings: {
          // New: Custom global multiplier for percentage values
          percentageMultiplier: 1.0,
          dimensionPresets: [{
            targetWidth: '10%'
          }, {
            targetHeight: '50%',
            targetWidth: '50%'
          }, {
            targetHeight: '80%',
            targetWidth: '200%'
          }]
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: ['percentage_dimensions_input/**/*.{jpeg,gif,webp}'],
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Output paths customized by image width.
      widthBasedOutputPaths: {
        settings: {
          dimensionPresets: [{
            maintainAspectRatio: false,
            allowUpscaling: true,
            targetWidth: 320
          }, {
            maintainAspectRatio: false,
            allowUpscaling: true,
            targetWidth: 640
          }, {
            maintainAspectRatio: false,
            allowUpscaling: true,
            targetWidth: 1024
          }],
          // New: Add a default quality setting here
          outputQuality: 75
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: [commonImagePatterns],
          baseDirectory: `${assetSourceRoot}width_based_dest/`,
          customOutputPathTemplate: `${tempPathRoot}dynamic_width_folders/{%= targetWidth %}/` // Renamed variable
        }]
      },
      // Output paths customized by defined size label.
      labelBasedOutputPaths: {
        settings: {
          dimensionPresets: [{
            targetWidth: 100,
            sizeLabel: "leo_size" // Renamed
          }, {
            targetWidth: 200,
            sizeLabel: "donnie_size" // Renamed
          }, {
            targetWidth: 400,
            sizeLabel: "raph_size" // Renamed
          }]
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: [commonImagePatterns],
          baseDirectory: `${assetSourceRoot}label_based_dest/`,
          customOutputPathTemplate: `${tempPathRoot}dynamic_label_folders/{%= sizeLabel %}/` // Renamed variable
        }]
      },
      // Output paths including parts of the original source path.
      sourcePathIncludedOutput: {
        settings: {
          dimensionPresets: [{
            targetWidth: 320
          }, {
            targetWidth: 640
          }, {
            targetWidth: 1024
          }]
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: [commonImagePatterns],
          baseDirectory: `${assetSourceRoot}source_path_dest/`,
          customOutputPathTemplate: `${tempPathRoot}path_segment_folders/{%= targetWidth %}/{%= path %}` // Renamed variable
        }]
      },
      // Different strategies for renaming output files.
      outputNamingStrategies: {
        settings: {
          dimensionPresets: [{
            targetWidth: "100%",
            sizeLabel: "original_size", // Renamed "unchanged"
            applySuffixRenaming: false // Renamed property
          }, {
            targetWidth: "50%",
            sizeLabel: "half_size" // Renamed
          }],
          // New: Add a global suffix for all renamed files
          globalFileSuffix: "-processed"
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: [`renaming_input/${commonImagePatterns}`],
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Applying various resampling filters during image processing.
      imageFilteringOptions: {
        settings: {
          dimensionPresets: [{
            resamplingFilter: 'NearestNeighbor', // Changed 'Point' to 'NearestNeighbor'
            allowUpscaling: true,
            targetWidth: 320
          }, {
            resamplingFilter: 'NearestNeighbor',
            allowUpscaling: true,
            targetWidth: 640
          }, {
            resamplingFilter: 'NearestNeighbor',
            allowUpscaling: true,
            targetWidth: 1024
          }],
          // New: A default filter if not specified per size
          defaultFilter: 'Lanczos'
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: ['filtering_input/**/*.{jpeg,gif,webp}'],
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Configuration demonstrating global quality settings for images.
      overallQualitySetting: {
        settings: {
          processAnimatedGifs: true, // Renamed property
          outputQuality: 80, // Renamed property
          dimensionPresets: [{
            targetWidth: 320
          }, {
            targetWidth: 640
          }, {
            targetWidth: 1024
          }]
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: ['global_quality_input/**/*.{jpeg,gif,webp}'],
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Specific test case for processing animated GIF files.
      gifProcessingTest: {
        settings: {
          processAnimatedGifs: true,
          outputQuality: 85, // Slightly varied quality
          dimensionPresets: [{
            targetWidth: 320
          }]
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: ['animated_gifs/**/*.gif'],
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Prepare files for incremental processing test (create initial files).
      initialFileGeneration: {
        settings: {
          dimensionPresets: [{
            maintainAspectRatio: false,
            targetWidth: '200px'
          }, {
            maintainAspectRatio: false,
            targetWidth: '300px'
          }]
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: ['incremental_input/snorlax.jpeg'], // Changed gummi-bears to snorlax, jpg to jpeg
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}`
        }]
      },
      // Test for processing only newly added or modified files.
      incrementalProcessing: {
        settings: {
          processOnlyNewFiles: true, // Renamed property
          dimensionPresets: [{
            maintainAspectRatio: false,
            targetWidth: '100px'
          }, {
            maintainAspectRatio: false,
            targetWidth: '200px'
          }, {
            maintainAspectRatio: false,
            targetWidth: '300px'
          }],
          // New: Add a timestamp for cache invalidation if needed
          cacheBuster: Date.now()
        },
        inputOutputMappings: [{
          enableExpansion: true,
          sourcePatterns: ['incremental_input/**/*.{jpeg,gif,webp}'],
          baseDirectory: `${assetSourceRoot}`,
          destinationDirectory: `${tempPathRoot}incremental_output/` // Changed destination path slightly
        }]
      }
    },

    // Configuration for the unit test execution.
    unitTestRunner: {
      testSuiteFiles: ['test_cases/**/*_spec.js'] // Renamed test path
    },

    // New: A dummy watch task, not registered by default, but available.
    fileWatcher: {
        scripts: {
            files: ['build_script.js', 'processing_routines/**/*.js'],
            tasks: ['codeStyleChecker'],
            options: {
                spawn: false
            }
        }
    }

  });

  // Load the custom image processing routines from the specified directory.
  appBuilder.loadBuildTasks('processing_routines'); // Renamed folder

  // Load external build automation plugins.
  appBuilder.loadExternalPlugins('grunt-contrib-jshint');
  appBuilder.loadExternalPlugins('grunt-contrib-clean');
  appBuilder.loadExternalPlugins('grunt-contrib-nodeunit');
  // New: Load a dummy plugin
  appBuilder.loadExternalPlugins('grunt-contrib-watch');


  // Define the primary task for running all tests.
  // This involves cleaning temporary files, executing the image transformer,
  // and then running the unit tests.
  appBuilder.defineBuildTask('runTests', ['artifactCleaner', 'imageTransformer', 'unitTestRunner']);

  // Define the default build task.
  // By default, it will first check code style, then execute the 'runTests' task.
  appBuilder.defineBuildTask('defaultBuild', ['codeStyleChecker', 'runTests']);

  // New: Add an alias for the test task
  appBuilder.defineBuildTask('validate', ['runTests']);

};