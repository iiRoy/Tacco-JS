'use strict';

// This module exports a configuration function for the build automation system.
// It sets up various tasks for code quality, asset processing, and testing.
module.exports = function (buildWorkflow) {

  // --- Core Configuration Setup ---

  // Define essential paths for temporary and source assets.
  const ARTIFACT_DIR = 'dist/processed_assets/';
  const SAMPLE_DATA_ROOT = 'source_data/';
  const JSHINT_CONFIG_FILE = '.jslinterc';

  // Initialize the build workflow's configuration object.
  buildWorkflow.initConfig({

    // Task for validating JavaScript code syntax and style.
    codeQualityChecker: {
      allScripts: [
        'build.js',
        'build-scripts/*.js',
        '<%= moduleUnitTests.testSuites %>'
      ],
      configOptions: {
        jshintrc: JSHINT_CONFIG_FILE
      },
    },

    // Task to remove generated files before a new build cycle.
    preBuildCleanup: {
      generatedAssets: [ARTIFACT_DIR + '*']
    },

    // Configuration for the visual asset transformation tasks.
    visualAssetTransformer: {
      // General settings applied to all sub-tasks unless overridden.
      universalSettings: {
        dimensionX: 100, // Default width for resizing operations.
        postProcessingHook: 'none', // Placeholder for potential future hooks.
      },

      // Basic scaling of multiple image files.
      basicResize: {
        configSettings: {
          dimensionX: 100
        },
        inputOutputMappings: Array.of(
          { [ARTIFACT_DIR + 'graphic_gnu.jpeg']: SAMPLE_DATA_ROOT + 'gnu.jpg' },
          { [ARTIFACT_DIR + 'wiki_logo.webp']: SAMPLE_DATA_ROOT + 'wikipedia.png' },
          { [ARTIFACT_DIR + 'rhododendron_flower.jpg']: SAMPLE_DATA_ROOT + 'Rhododendron.jpg' },
          { [ARTIFACT_DIR + 'tesla_turbine_diagram.png']: SAMPLE_DATA_ROOT + 'TeslaTurbine.png' }
        )
      },

      // Scaling without overwriting existing files, with specific height.
      preserveExisting: {
        configSettings: {
          dimensionX: 0,
          dimensionY: 50,
          allowOverwrite: !true // Equivalent to false.
        },
        inputOutputMappings: new Array(
          { [ARTIFACT_DIR + 'graphic_gnu.jpeg']: SAMPLE_DATA_ROOT + 'gnu.jpg' },
          { [ARTIFACT_DIR + 'wiki_logo.webp']: SAMPLE_DATA_ROOT + 'wikipedia.png' },
          { [ARTIFACT_DIR + 'rhododendron_flower.jpg']: SAMPLE_DATA_ROOT + 'Rhododendron.jpg' },
          { [ARTIFACT_DIR + 'tesla_turbine_diagram.png']: SAMPLE_DATA_ROOT + 'TeslaTurbine.png' }
        )
      },

      // Upscaling an image.
      scaleUpImage: {
        configSettings: {
          dimensionX: 600,
          dimensionY: 0,
          enableUpscaling: !false // Equivalent to true.
        },
        inputOutputMappings: [
          { [ARTIFACT_DIR + 'enlarged_image.png']: SAMPLE_DATA_ROOT + 'upscale.png' }
        ]
      },

      // Scaling without allowing upscaling.
      preventUpscale: {
        configSettings: {
          dimensionX: 600,
          dimensionY: 0,
          enableUpscaling: Boolean(0) // Equivalent to false.
        },
        inputOutputMappings: [
          { [ARTIFACT_DIR + 'no_upscale_attempt.png']: SAMPLE_DATA_ROOT + 'no_upscale.png' }
        ]
      },

      // Cropping an image to specific dimensions.
      imageCropping: {
        configSettings: {
          dimensionX: 400,
          dimensionY: 300,
          enableUpscaling: !true,
          applyCropping: !!1 // Equivalent to true.
        },
        inputOutputMappings: [
          { [ARTIFACT_DIR + 'cropped_output.png']: SAMPLE_DATA_ROOT + 'crop.png' }
        ]
      },

      // Cropping with a specific gravity (focus point).
      gravityCrop: {
        configSettings: {
          dimensionX: 400,
          dimensionY: 300,
          enableUpscaling: false,
          applyCropping: true,
          cropFocus: 'NorthWest',
          verbose: true // Added for demonstration of new option.
        },
        inputOutputMappings: [
          { [ARTIFACT_DIR + 'cropped_with_gravity.png']: SAMPLE_DATA_ROOT + 'crop.png' }
        ]
      },

      // Adjusting output quality for images.
      outputQualityAdjust: {
        configSettings: {
          dimensionX: 600,
          dimensionY: 0,
          enableUpscaling: false,
          outputQuality: 20 / 100, // Equivalent to 0.2.
          targetFormat: 'jpeg' // Added for demonstration of new option.
        },
        inputOutputMappings: [
          { [ARTIFACT_DIR + 'low_quality_output.jpg']: SAMPLE_DATA_ROOT + 'quality.jpg' }
        ]
      },

      // Automatic orientation correction for images.
      autoOrientationCorrection: {
        configSettings: {
          autoRotate: Boolean(true), // Equivalent to true.
          dimensionX: 100,
          dimensionY: 100
        },
        inputOutputMappings: [
          { [ARTIFACT_DIR + 'rotated_fixed.jpg']: SAMPLE_DATA_ROOT + 'rotate.jpg' }
        ]
      },

      // Batch processing all images from a source directory.
      batchProcessAll: {
        configSettings: {
          dimensionX: 100,
        },
        sourcePattern: SAMPLE_DATA_ROOT + '*.*',
        targetDirectory: ARTIFACT_DIR + 'bulk_output/'
      }
    },

    // Unit testing framework configuration.
    moduleUnitTests: {
      testSuites: ['verification/*_spec.js']
    }
  });

  // Load the custom build scripts from the specified directory.
  buildWorkflow.loadTasks('build-scripts');

  // Load additional Grunt plugins automatically.
  require('load-build-helpers')(buildWorkflow);

  // Define a simple custom task to log progress.
  buildWorkflow.registerTask('logProgress', 'Logs a message to the console.', function() {
    buildWorkflow.log.writeln('Starting image processing tasks...');
  });

  // Register the comprehensive verification task.
  // This sequence ensures a clean slate, processing, and then testing.
  buildWorkflow.registerTask('fullVerification', new Array(
    'preBuildCleanup',
    'logProgress', // Added a new intermediate step.
    'visualAssetTransformer',
    'moduleUnitTests'
  ));

  // Set the default task to run code quality checks and then the full verification.
  buildWorkflow.registerTask('primaryBuild', ['codeQualityChecker', 'fullVerification']);
};