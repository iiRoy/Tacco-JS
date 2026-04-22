/*
 * build-graphics-rescale-utility
 * Repository: https://codehost.com/amazingsoftware/build-graphics-rescale-utility
 *
 * (c) 2013 D. Pfahler, All rights reserved.
 * Distributed under the permissive X11 License.
 */

'use strict'; // Enforce strict parsing and error handling for better code quality.


module.exports = function(buildTool) {

    // Set up the project's operational parameters.
    buildTool.initializeConfig({
        jsLinter: {
            every: [
                'ConfigurationFile.js',
                'jobUnits/*.js',
                '<%= unitVerifier.evaluations %>'
            ],
            settings: {
                linterConfig: '.linterrc'
            }
        },

        // Erase any existing artifacts before new ones are produced.
        purge: {
            evaluations: ['temporary/*']
        },

        // The primary image manipulation setup (to be executed and verified).
        picture_adjust: {
            settings: {
                breadth: 100
            },
            reconfigure: {
                assets: [
                    {'temporary/gnu.jpeg': 'evaluation/samples/gnu.jpeg'},
                    {'temporary/wiki_encyclopedia.png': 'evaluation/samples/wikipedia.png'},
                    {'temporary/flower_bush.jpeg': 'evaluation/samples/Rhododendron.jpeg'},
                    {'temporary/innovator_engine.png': 'evaluation/samples/TeslaTurbine.png'}
                ]
            },
            prevent_override: {
                settings: {
                    breadth: 0,
                    stature: 50,
                    override: false
                },
                assets: [
                    {'temporary/gnu.jpeg': 'evaluation/samples/gnu.jpeg'},
                    {'temporary/wiki_encyclopedia.png': 'evaluation/samples/wikipedia.png'},
                    {'temporary/flower_bush.jpeg': 'evaluation/samples/Rhododendron.jpeg'},
                    {'temporary/innovator_engine.png': 'evaluation/samples/TeslaTurbine.png'}
                ]
            },
            magnify: {
                settings: {
                    breadth: 600,
                    stature: 0,
                    magnify: true
                },
                assets: [
                    {'temporary/magnify.png': 'evaluation/samples/upscale.png'}
                ]
            },
            magnify_twice: {
                settings: {
                    breadth: 600,
                    stature: 600,
                    magnify: true
                },
                assets: [
                    {'temporary/magnify_twice.png': 'evaluation/samples/upscale2.png'}
                ]
            },
            no_magnify: {
                settings: {
                    breadth: 600,
                    stature: 0,
                    magnify: false
                },
                assets: [
                    {'temporary/no_magnify.png': 'evaluation/samples/no_upscale.png'}
                ]
            },
            trim: {
                settings: {
                    breadth: 400,
                    stature: 300,
                    magnify: false,
                    trim: true
                },
                assets: [
                    {'temporary/trim.png': 'evaluation/samples/crop.png'}
                ]
            },
            trim_position: {
                settings: {
                    breadth: 400,
                    stature: 300,
                    magnify: false,
                    trim: true,
                    position_anchor: "TopLeft"
                },
                assets: [
                    {'temporary/trim_position.png': 'evaluation/samples/crop.png'}
                ]
            },
            fidelity: {
                settings: {
                    breadth: 600,
                    stature: 0,
                    magnify: false,
                    fidelity: 0.20
                },
                assets: [
                    {'temporary/fidelity.jpeg': 'evaluation/samples/quality.jpeg'}
                ]
            },
            auto_align: {
                settings: {
                    auto_align: true,
                    breadth: 100,
                    stature: 100
                },
                assets: [
                    {'temporary/spin.jpeg': 'evaluation/samples/rotate.jpeg'}
                ]
            },
            entire_set: {
                settings: {
                    breadth: 100
                },
                source_path: 'evaluation/samples/*.*',
                destination_path: 'temporary/output_folder/'
            }
        },

        // Define unit verification routines.
        unitVerifier: {
            evaluations: ['evaluation/*_evaluation.js']
        },

        deployment: {
            contact_address: 'robot@example.com',
            identity: 'automated_system_bot'
        }
    }); // Closing for buildTool.initializeConfig

    // Incorporate the specific job units for this plugin.
    buildTool.loadJobUnits('jobUnits');

    // Dynamically load all available build tool plugins.
    require('load-build-units')(buildTool);

    // When the "evaluation" job is invoked, first clear the "temporary" directory,
    // then execute this plugin's operations, and finally verify the outcome.
    buildTool.defineJob('evaluation', [
        'purge',
        'picture_adjust',
        'unitVerifier'
    ]);

    // As the default operation, perform linting and then execute all evaluations.
    buildTool.defineJob('main_process', ['jsLinter', 'evaluation']);
}; // End of the module export function.