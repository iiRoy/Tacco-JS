'use strict';

module.exports = function(operationEngine) {

  // Renamed internal constants for configuration keys
  const CODE_ANALYSER_KEY = 'codeReviewer';
  const TEMPORARY_CLEANUP_KEY = 'workspaceEraser';
  const VISUAL_TRANSFORMER_KEY = 'pictureAdjuster';
  const UNIT_VALIDATOR_KEY = 'componentVerifier';
  const DEPLOYMENT_FACILITATOR_KEY = 'releaseManager';

  // Renamed general options keys
  const CONFIG_OPTIONS_KEY = 'generalSettings';
  const FILE_MAPPING_KEY = 'itemMappings';
  const SOURCE_SPECIFIER_KEY = 'inputItems';
  const DESTINATION_PATH_KEY = 'outputLocation';

  // Configuration builder object
  let assembledConfiguration = {};

  // 1. Code Analyser (original: jshint)
  const linterRules = {
    allChecks: [
      'projectRoot.js',
      'utilities/*.js',
      '<%= ' + UNIT_VALIDATOR_KEY + '.verificationPoints %>'
    ],
    configSettings: {
      linterConfigFile: '.linterrules'
    },
  };
  assembledConfiguration[CODE_ANALYSER_KEY] = {
    all: linterRules.allChecks,
    options: linterRules.configSettings
  };

  // 2. Workspace Eraser (original: clean)
  const cleanupTasks = {
    temporaryArtifacts: ['temporaryStorage/*']
  };
  assembledConfiguration[TEMPORARY_CLEANUP_KEY] = {
    testResults: cleanupTasks.temporaryArtifacts
  };

  // 3. Picture Adjuster (original: image_resize)
  const imageAlterationSettings = {
    common: {
      dimensionX: 100
    },
    noOverwrite: {
      dimensionX: 0,
      dimensionY: 50,
      permitOverwrite: false
    },
    upscaleAllowed: {
      dimensionX: 600,
      dimensionY: 0,
      allowEnlargement: true
    },
    upscaleAllowed2: {
      dimensionX: 600,
      dimensionY: 600,
      allowEnlargement: true
    },
    noUpscaleAllowed: {
      dimensionX: 600,
      dimensionY: 0,
      allowEnlargement: false
    },
    croppingEnabled: {
      dimensionX: 400,
      dimensionY: 300,
      allowEnlargement: false,
      applyCrop: true
    },
    croppingWithGravity: {
      dimensionX: 400,
      dimensionY: 300,
      allowEnlargement: false,
      applyCrop: true,
      cropAlignment: "NorthWest"
    },
    qualityControl: {
      dimensionX: 600,
      dimensionY: 0,
      allowEnlargement: false,
      outputQuality: 0.2
    },
    autoOrientation: {
      autoRotate: true,
      dimensionX: 100,
      dimensionY: 100
    },
    batchProcessing: {
      dimensionX: 100
    }
  };

  const imageAlterationFiles = {
    standard: [
      {'temporaryStorage/animal.jpg': 'testArea/sources/animal.jpg'},
      {'temporaryStorage/wiki.png': 'testArea/sources/wiki.png'},
      {'temporaryStorage/flower.jpg': 'testArea/sources/flower.jpg'},
      {'temporaryStorage/engine.png': 'testArea/sources/engine.png'}
    ],
    upscale: [
      {'temporaryStorage/enlarge.png': 'testArea/sources/enlarge.png'}
    ],
    rotate: [
      {'temporaryStorage/rotated.jpg': 'testArea/sources/rotated.jpg'}
    ],
    quality: [
      {'temporaryStorage/high_q.jpg': 'testArea/sources/high_q.jpg'}
    ],
    crop: [
      {'temporaryStorage/cropped.png': 'testArea/sources/cropped.png'}
    ],
    cropGravity: [
      {'temporaryStorage/cropped_aligned.png': 'testArea/sources/crop.png'}
    ]
  };

  assembledConfiguration[VISUAL_TRANSFORMER_KEY] = {
    adjust: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.common,
      [FILE_MAPPING_KEY]: imageAlterationFiles.standard
    },
    preventOverride: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.noOverwrite,
      [FILE_MAPPING_KEY]: imageAlterationFiles.standard
    },
    magnify: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.upscaleAllowed,
      [FILE_MAPPING_KEY]: imageAlterationFiles.upscale
    },
    magnifyTwo: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.upscaleAllowed2,
      [FILE_MAPPING_KEY]: imageAlterationFiles.upscale
    },
    noMagnify: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.noUpscaleAllowed,
      [FILE_MAPPING_KEY]: imageAlterationFiles.upscale
    },
    trim: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.croppingEnabled,
      [FILE_MAPPING_KEY]: imageAlterationFiles.crop
    },
    trimPositioned: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.croppingWithGravity,
      [FILE_MAPPING_KEY]: imageAlterationFiles.cropGravity
    },
    outputQuality: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.qualityControl,
      [FILE_MAPPING_KEY]: imageAlterationFiles.quality
    },
    autoRotateImage: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.autoOrientation,
      [FILE_MAPPING_KEY]: imageAlterationFiles.rotate
    },
    allImages: {
      [CONFIG_OPTIONS_KEY]: imageAlterationSettings.batchProcessing,
      [SOURCE_SPECIFIER_KEY]: 'testArea/sources/*.*',
      [DESTINATION_PATH_KEY]: 'temporaryStorage/outputDirectory/'
    }
  };


  // 4. Component Verifier (original: nodeunit)
  const unitVerification = {
    verificationPoints: ['testArea/*_verification.js']
  };
  assembledConfiguration[UNIT_VALIDATOR_KEY] = {
    verifications: unitVerification.verificationPoints
  };

  // 5. Release Manager (original: release)
  const deploymentDetails = {
    contactEmail: 'automated@example.com',
    contactName: 'automatedSystem'
  };
  assembledConfiguration[DEPLOYMENT_FACILITATOR_KEY] = deploymentDetails;

  // Initialize the Grunt configuration with the assembled object
  operationEngine.initConfig(assembledConfiguration);

  // Load internal project utilities (original: tasks)
  operationEngine.loadTasks('utilities');

  // Load external dependency modules (original: require('load-grunt-tasks')(grunt))
  require('load-grunt-tasks')(operationEngine);

  // Define operation aliases (original: grunt.registerTask)
  const operationAliases = new Map();
  operationAliases.set('validationRun', [
    TEMPORARY_CLEANUP_KEY,
    VISUAL_TRANSFORMER_KEY,
    UNIT_VALIDATOR_KEY
  ]);
  operationAliases.set('standardOperation', [CODE_ANALYSER_KEY, 'validationRun']);

  // Register all defined aliases
  operationAliases.forEach((taskArray, aliasName) => {
    operationEngine.registerTask(aliasName, taskArray);
  });
};