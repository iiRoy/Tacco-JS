module.exports = function(g_obj) {

  // Configuration assembler for the code analysis module
  const constructCodeScanConfig = (sourceGlobPatterns, configResourcePath) => ({
    all: sourceGlobPatterns,
    options: {
      jshintrc: configResourcePath
    }
  });

  // Configuration assembler for the temporary artifact removal module
  const deviseCleanupStrategy = (foldersToPurge, safeguardedItems) => ({
    evaluation: foldersToPurge.concat(safeguardedItems.map(p => '!' + p))
  });

  // Configuration assembler for the validation suite module
  const establishValidationPaths = (testFilePatterns) => ({
    test_validation: testFilePatterns
  });

  // --- Image Transformation Module Configuration Builders ---

  // Fundamental parameters for image processing
  const coreImageHandlerParams = {
    engine: 'im'
  };

  // Generates a single dimension specification for image resizing
  const produceSizeEntry = (specParameters) => {
    const entryData = {};
    if (specParameters.dim_w) entryData.width = specParameters.dim_w;
    if (specParameters.dim_h) entryData.height = specParameters.dim_h;
    if (specParameters.descriptive_id) entryData.name = specParameters.descriptive_id;
    if (specParameters.quality_level) entryData.quality = specParameters.quality_level;
    if (specParameters.keep_ratio !== undefined) entryData.aspectRatio = specParameters.keep_ratio;
    if (specParameters.filename_suffix) entryData.suffix = specParameters.filename_suffix;
    if (specParameters.avoid_scaling_up) entryData.createNoScaledImage = specParameters.avoid_scaling_up;
    if (specParameters.allow_upscaling) entryData.upscale = specParameters.allow_upscaling;
    if (specParameters.resampling_filter) entryData.filter = specParameters.resampling_filter;
    if (specParameters.do_not_rename) entryData.rename = specParameters.do_not_rename;
    return entryData;
  };

  // Generates a file-set definition for the image transformation module
  const defineInputOutputMapping = (inputSources, sourceDirectory, outputDirectory, enableExpansion, customOutputTemplate) => {
    const mapping = {};
    if (enableExpansion) mapping.expand = true;
    mapping.src = inputSources;
    mapping.cwd = sourceDirectory;
    mapping.dest = outputDirectory;
    if (customOutputTemplate) mapping.custom_dest = customOutputTemplate;
    return mapping;
  };

  // Data structure holding all image processing task definitions
  const processingInstructions = [
    {
      task_id: 'default_processing',
      task_options: {},
      file_map_array: [{ src: ['minions.jpg'], cwd: 'test/assets/default_options/', dest: 'tmp/default_options/' }]
    },
    {
      task_id: 'no_input_files',
      task_options: {
        sizes: [produceSizeEntry({ dim_w: 320 })]
      },
      file_map_array: [{ expand: true, src: ['no_files/**/*.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'wildcard_input',
      task_options: {
        sizes: [
          produceSizeEntry({ keep_ratio: false, dim_h: 240, descriptive_id: 'small', dim_w: 320 }),
          produceSizeEntry({ keep_ratio: false, dim_h: 480, descriptive_id: 'medium', dim_w: 640 }),
          produceSizeEntry({ keep_ratio: false, dim_h: 768, descriptive_id: 'large', dim_w: 1024 })
        ]
      },
      file_map_array: [{ expand: true, src: ['file_wildcard_options/**.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'specific_tuning',
      task_options: {
        sizes: [
          produceSizeEntry({ dim_w: 110, descriptive_id: "small", quality_level: 40 }),
          produceSizeEntry({ dim_w: 220, quality_level: 100 }),
          produceSizeEntry({ dim_w: 330, descriptive_id: "large", quality_level: 80 }),
          produceSizeEntry({ dim_w: 660, descriptive_id: "large", filename_suffix: "_x2", quality_level: 50 }),
          produceSizeEntry({ avoid_scaling_up: true, dim_w: 1660, descriptive_id: "largest", quality_level: 50 })
        ]
      },
      file_map_array: [{ expand: true, src: ['custom_options/**.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'pixel_dimensions',
      task_options: {
        sizes: [
          produceSizeEntry({ keep_ratio: false, dim_w: '10px' }),
          produceSizeEntry({ keep_ratio: false, dim_h: '50px', dim_w: '50px' }),
          produceSizeEntry({ keep_ratio: false, dim_h: '500px', dim_w: '200px' })
        ]
      },
      file_map_array: [{ expand: true, src: ['pixel_sizes/**/*.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'custom_pixel_unit',
      task_options: {
        units: { pixel: 'abc123' },
        sizes: [
          produceSizeEntry({ keep_ratio: false, dim_w: '20px' }),
          produceSizeEntry({ keep_ratio: false, dim_h: '50px', dim_w: '80px' }),
          produceSizeEntry({ keep_ratio: false, dim_h: '500px', dim_w: '500px' })
        ]
      },
      file_map_array: [{ expand: true, src: ['pixel_sizes_custom_unit/**/*.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'percentage_dimensions',
      task_options: {
        sizes: [
          produceSizeEntry({ dim_w: '10%' }),
          produceSizeEntry({ dim_h: '50%', dim_w: '50%' }),
          produceSizeEntry({ dim_h: '80%', dim_w: '200%' })
        ]
      },
      file_map_array: [{ expand: true, src: ['percentage_sizes/**/*.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'custom_percentage_unit',
      task_options: {
        units: { percentage: 'abc123' },
        sizes: [
          produceSizeEntry({ dim_w: '10%' }),
          produceSizeEntry({ dim_h: '50%', dim_w: '50%' }),
          produceSizeEntry({ dim_h: '80%', dim_w: '200%' })
        ]
      },
      file_map_array: [{ expand: true, src: ['percentage_sizes_custom_unit/**/*.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'custom_factor_unit',
      task_options: {
        units: { multiply: 'abc123' },
        sizes: [
          produceSizeEntry({ dim_w: '10%' }),
          produceSizeEntry({ dim_h: '50%', dim_w: '50%' }),
          produceSizeEntry({ dim_h: '450px', dim_w: '800px' })
        ]
      },
      file_map_array: [{ expand: true, src: ['custom_multiply_unit/**/*.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'custom_output_by_width',
      task_options: {
        sizes: [
          produceSizeEntry({ keep_ratio: false, allow_upscaling: true, dim_w: 320 }),
          produceSizeEntry({ keep_ratio: false, allow_upscaling: true, dim_w: 640 }),
          produceSizeEntry({ keep_ratio: false, allow_upscaling: true, dim_w: 1024 })
        ]
      },
      file_map_array: [{ expand: true, src: ['**/*.{jpg,gif,png}'], cwd: 'test/assets/custom_dest_width/', customOutputTemplate: 'tmp/custom_dest_width/{%= width %}/' }]
    },
    {
      task_id: 'custom_output_by_name',
      task_options: {
        sizes: [
          produceSizeEntry({ dim_w: 100, descriptive_id: "leo" }),
          produceSizeEntry({ dim_w: 200, descriptive_id: "donnie" }),
          produceSizeEntry({ dim_w: 400, descriptive_id: "raph" })
        ]
      },
      file_map_array: [{ expand: true, src: ['**/*.{jpg,gif,png}'], cwd: 'test/assets/custom_dest_name/', customOutputTemplate: 'tmp/custom_dest_name/{%= name %}/' }]
    },
    {
      task_id: 'custom_output_by_path',
      task_options: {
        sizes: [
          produceSizeEntry({ dim_w: 320 }),
          produceSizeEntry({ dim_w: 640 }),
          produceSizeEntry({ dim_w: 1024 })
        ]
      },
      file_map_array: [{ expand: true, src: ['**/*.{jpg,gif,png}'], cwd: 'test/assets/custom_dest_path/', customOutputTemplate: 'tmp/custom_dest_path/{%= width %}/{%= path %}' }]
    },
    {
      task_id: 'output_naming_control',
      task_options: {
        sizes: [
          produceSizeEntry({ dim_w: "100%", descriptive_id: "unchanged", do_not_rename: false }),
          produceSizeEntry({ dim_w: "50%", descriptive_id: "half" })
        ]
      },
      file_map_array: [{ expand: true, src: ['rename/**.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'filter_application',
      task_options: {
        sizes: [
          produceSizeEntry({ resampling_filter: 'Point', allow_upscaling: true, dim_w: 320 }),
          produceSizeEntry({ resampling_filter: 'Point', allow_upscaling: true, dim_w: 640 }),
          produceSizeEntry({ resampling_filter: 'Point', allow_upscaling: true, dim_w: 1024 })
        ]
      },
      file_map_array: [{ expand: true, src: ['filters/**/*.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'global_quality_setting',
      task_options: {
        tryAnimated: true,
        quality: 80,
        sizes: [
          produceSizeEntry({ dim_w: 320 }),
          produceSizeEntry({ dim_w: 640 }),
          produceSizeEntry({ dim_w: 1024 })
        ]
      },
      file_map_array: [{ expand: true, src: ['global_quality/**/*.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'animated_asset_handling',
      task_options: {
        tryAnimated: true,
        quality: 80,
        sizes: [
          produceSizeEntry({ dim_w: 320 })
        ]
      },
      file_map_array: [{ expand: true, src: ['animated/**/*.gif'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'new_files_setup',
      task_options: {
        sizes: [
          produceSizeEntry({ keep_ratio: false, dim_w: '200px' }),
          produceSizeEntry({ keep_ratio: false, dim_w: '300px' })
        ]
      },
      file_map_array: [{ expand: true, src: ['new_files_only/gummi-bears.jpg'], cwd: 'test/assets/', dest: 'tmp/' }]
    },
    {
      task_id: 'process_only_new',
      task_options: {
        newFilesOnly: true,
        sizes: [
          produceSizeEntry({ keep_ratio: false, dim_w: '100px' }),
          produceSizeEntry({ keep_ratio: false, dim_w: '200px' }),
          produceSizeEntry({ keep_ratio: false, dim_w: '300px' })
        ]
      },
      file_map_array: [{ expand: true, src: ['new_files_only/**/*.{jpg,gif,png}'], cwd: 'test/assets/', dest: 'tmp/' }]
    }
  ];

  // Constructs the entire image transformation module's configuration
  const assembleImageProcessorConfig = (instructions) => {
    const moduleConfig = {};
    instructions.forEach(instruction => {
      moduleConfig[instruction.task_id] = {
        options: { ...coreImageHandlerParams, ...instruction.task_options },
        files: instruction.file_map_array.map(fm => defineInputOutputMapping(fm.src, fm.cwd, fm.dest, fm.expand, fm.customOutputTemplate))
      };
    });
    return moduleConfig;
  };

  // The complete project configuration object
  const fullProjectSettings = {
    jshint: constructCodeScanConfig(
      ['Gruntfile.js', 'tasks/*.js', '<%= nodeunit.test_validation %>'],
      '.jshintrc'
    ),
    clean: deviseCleanupStrategy(
      ['tmp'],
      ['tmp/new_files_only/magikarp-200.png', 'tmp/new_files_only/magikarp-300.png']
    ),
    responsive_images: assembleImageProcessorConfig(processingInstructions),
    nodeunit: establishValidationPaths(['test/**/*_test.js'])
  };

  // Initialize the Grunt configuration with the constructed settings
  g_obj.initConfig(fullProjectSettings);

  // Load internal task definitions
  g_obj.loadTasks('tasks');

  // Load external Grunt add-ons
  g_obj.loadNpmTasks('grunt-contrib-jshint');
  g_obj.loadNpmTasks('grunt-contrib-clean');
  g_obj.loadNpmTasks('grunt-contrib-nodeunit');

  // Register compound workflows
  g_obj.registerTask('execute_validation', ['clean', 'responsive_images', 'nodeunit']);
  g_obj.registerTask('standard_workflow', ['jshint', 'execute_validation']);

};