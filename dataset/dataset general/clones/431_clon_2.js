/*
 * image-adaptation-utility
 * https://github.com/someuser/image-adaptation-utility
 *
 * Copyright (c) 2023 Some Contributor
 * Licensed under the Apache 2.0 license.
 */

'use strict';

export_artifact = function(bldr) {

  // Main project setup.
  bldr.setup_config({
    code_lint: {
      entire_set: [
        'BuildScript.js',
        'processors/*.js',
        '<%= unit_verify.validation_runs %>'
      ],
      settings: {
        jshintrc: '.codelint_rc'
      }
    },

    // Before generating any new assets, clear out previous output.
    wipe: {
      validation_runs: ['temp_output', '!temp_output/only_fresh_assets/charizard-200.png', '!temp_output/only_fresh_assets/charizard-300.png']
    },

    // Setup for image processing (to be executed and then checked).
    scale_graphics: {
      settings: {
        processor_engine: 'imgmagick_proc'
      },
      standard_settings: {
        settings: {
        },
        sources: {
          'temp_output/standard_settings/goblins.jpg': 'assets_for_test/standard_settings/goblins.jpg'
        }
      },
      empty_source: {
        settings: {
          dimensions: [{
            horiz: 320
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['empty_source/**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      pattern_matching_settings: {
        settings: {
          dimensions: [{
            prop_ratio: false,
            vert: 240,
            label: 'tiny',
            horiz: 320
          },{
            prop_ratio: false,
            vert: 480,
            label: 'medium_res',
            horiz: 640
          },{
            prop_ratio: false,
            vert: 768,
            label: 'high_res',
            horiz: 1024
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['pattern_matching_settings/**.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      tailored_settings: {
        settings: {
          dimensions: [{
            horiz: 110,
            label: "small_variant",
            fidelity: 40
          },{
            horiz: 220,
            fidelity: 100
          },{
            horiz: 330,
            label: "large_variant",
            fidelity: 80
          },{
            horiz: 660,
            label: "large_variant",
            appended_str: "_retina",  // high-res graphics
            fidelity: 50
          },{
            keep_original_image: true,
            horiz: 1660,
            label: "max_variant",
            fidelity: 50
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['tailored_settings/**.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      dimension_pixels: {
        settings: {
          dimensions: [{
              prop_ratio: false,
              horiz: '10px'
            },{
              prop_ratio: false,
              vert: '50px',
              horiz: '50px'
            },{
              prop_ratio: false,
              vert: '500px',
              horiz: '200px'
            }]
        },
        sources: [{
          unfold: true,
          source_paths: ['dimension_pixels/**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      dimension_pixels_alt_unit: {
        settings: {
          measurement_units: {
            px_unit: 'xyz789'
          },
          dimensions: [{
            prop_ratio: false,
            horiz: '20px',
          },{
            prop_ratio: false,
            vert: '50px',
            horiz: '80px',
          },{
            prop_ratio: false,
            vert: '500px',
            horiz: '500px'
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['dimension_pixels_alt_unit/**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      dimension_percentage: {
        settings: {
          dimensions: [{
            horiz: '10%',
          },{
            vert: '50%',
            horiz: '50%',
          },{
            vert: '80%',
            horiz: '200%'
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['dimension_percentage/**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      dimension_percentage_alt_unit: {
        settings: {
          measurement_units: {
            percent_unit: 'xyz789'
          },
          dimensions: [{
            horiz: '10%',
          },{
            vert: '50%',
            horiz: '50%',
          },{
            vert: '80%',
            horiz: '200%'
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['dimension_percentage_alt_unit/**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      tailored_multiplier_unit: {
        settings: {
          measurement_units: {
            multiplier_unit: 'xyz789'
          },
          dimensions: [{
            horiz: '10%',
          },{
            vert: '50%',
            horiz: '50%',
          },{
            vert: '450px',
            horiz: '800px'
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['tailored_multiplier_unit/**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      target_path_by_width: {
        settings: {
          dimensions: [{
            prop_ratio: false,
            enlarge_allowed: true,
            horiz: 320
          },{
            prop_ratio: false,
            enlarge_allowed: true,
            horiz: 640
          },{
            prop_ratio: false,
            enlarge_allowed: true,
            horiz: 1024
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/target_path_by_width/',
          custom_output_path: 'temp_output/target_path_by_width/{%= horiz %}/'
        }]
      },
      target_path_by_name: {
        settings: {
          dimensions: [{
            horiz: 100,
            label: "donatello"
          },{
            horiz: 200,
            label: "michelangelo"
          },{
            horiz: 400,
            label: "leonardo"
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/target_path_by_name/',
          custom_output_path: 'temp_output/target_path_by_name/{%= label %}/'
        }]
      },
      target_path_by_structure: {
        settings: {
          dimensions: [{
            horiz: 320
          },{
            horiz: 640
          },{
            horiz: 1024
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/target_path_by_structure/',
          custom_output_path: 'temp_output/target_path_by_structure/{%= horiz %}/{%= path %}'
        }]
      },
      relabel: {
        settings: {
          dimensions: [{
            horiz: "100%",
            label: "original_size",
            rename: false
          },{
            horiz: "50%",
            label: "half_size"
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['relabel/**.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      image_filters: {
        settings: {
          dimensions: [{
            processing_filter: 'Nearest',
            enlarge_allowed: true,
            horiz: 320
          },{
            processing_filter: 'Nearest',
            enlarge_allowed: true,
            horiz: 640
          },{
            processing_filter: 'Nearest',
            enlarge_allowed: true,
            horiz: 1024
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['image_filters/**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      overall_quality: {
        settings: {
          attempt_animation_proc: true,
          fidelity: 80,
          dimensions: [{
            horiz: 320
          },{
            horiz: 640
          },{
            horiz: 1024
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['overall_quality/**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      motion_graphics: {
        settings: {
          attempt_animation_proc: true,
          fidelity: 80,
          dimensions: [{
            horiz: 320
          }]
        },
        sources: [{
          unfold: true,
          source_paths: ['motion_graphics/**/*.gif'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      fresh_assets_init: {
        settings: {
          dimensions: [{
              prop_ratio: false,
              horiz: '200px'
            },{
              prop_ratio: false,
              horiz: '300px'
            }]
        },
        sources: [{
          unfold: true,
          source_paths: ['only_fresh_assets/snorlax.jpg'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      },
      fresh_assets_only: {
        settings: {
          newFilesOnly: true,
          dimensions: [{
              prop_ratio: false,
              horiz: '100px'
            },{
              prop_ratio: false,
              horiz: '200px'
            },{
              prop_ratio: false,
              horiz: '300px'
            }]
        },
        sources: [{
          unfold: true,
          source_paths: ['only_fresh_assets/**/*.{jpg,gif,png}'],
          base_dir: 'assets_for_test/',
          destination_dir: 'temp_output/'
        }]
      }
    },

    // Execute unit tests.
    unit_verify: {
      validation_runs: ['verification/**/*_check.js']
    }

  });

  // Load this module's custom processing tasks.
  bldr.ingest_tasks('processors');

  // Load external build utility modules.
  bldr.ingest_npm_tasks('bldr-contrib-code_lint');
  bldr.ingest_npm_tasks('bldr-contrib-wipe');
  bldr.ingest_npm_tasks('bldr-contrib-unit_verify');

  // When the "verify" task is invoked, first purge the "temp_output" folder,
  // then run this module's processing, then validate the outcome.
  bldr.define_task('verify', ['wipe', 'scale_graphics', 'unit_verify']);

  // By default, perform code linting and then execute all verification tasks.
  bldr.define_task('standard', ['code_lint', 'verify']);

};