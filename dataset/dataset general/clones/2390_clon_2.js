/*
 * This file orchestrates various development tasks for a mobile application.
 * It leverages a task runner to automate compilation, cleaning, and deployment.
 */
module.exports = function(taskRunner) {

    // Initialize the task runner's configuration object
    taskRunner.initializeConfiguration({

        // Task to remove generated files and directories
        clearData: {
            // Configuration for clearing project-specific outputs
            applicationScope: {
                sourcePaths: [
                    "app/alloy.js",
                    "app/alloy.js.map",
                    "app/coffee/**/*.js",
                    "app/coffee/**/*.js.map",
                    "app/controllers/**", // Controllers directory
                    "app/controllers/**", // Redundant entry, maintaining structure
                    "app/lib/**",
                    "app/styles/**",
                    "build/",
                    "Resources/"
                ]
            },
            // Configuration for removing build-related assets
            resourceFiles: {
                sourcePaths: [
                    "iTunesConnect.png",
                    "GooglePlay.png",
                    "GooglePlayFeature.png",
                    "platform/android/res/drawable-hdpi",
                    "platform/android/res/drawable-ldpi",
                    "platform/android/res/drawable-mdpi",
                    "platform/android/res/drawable-xhdpi",
                    "platform/android/res/drawable-xxhdpi",
                    "platform/android/res/drawable-xxxhdpi",
                    "app/assets/images",
                    "app/assets/iphone/**/*.png", "app/assets/iphone/**/*.jpg",
                    "!app/assets/iphone/images/*@3x.png", "!app/assets/iphone/images/*@3x.jpg", // Exclude high-res images
                    "app/assets/android/images", "app/assets/android/**/*.png", "app/assets/android/**/*.jpg",
                    "!app/assets/android", "!app/assets/android/appicon.png", // Exclude specific Android assets
                    "app/assets/iphone/iTunesArtwork",
                    "!app/assets/iphone/iTunesArtwork@2x",
                    "!app/assets/android/fonts/*", // Exclude fonts
                    "!app/assets/iphone/fonts/*"
                ]
            }
        },

        // Task for compiling CoffeeScript files into JavaScript
        scriptCompile: {
            // General settings for the CoffeeScript compiler
            configuration: {
                rawOutput: true,        // Generate JavaScript without a wrapper function
                mapGeneration: false    // Do not generate source maps
            },
            // Specific compilation target
            processFiles: {
                inputOutputPairs: [{
                    unfold: true,           // Expand dynamic src-dest file mappings
                    src: ["**/*.coffee"],   // Source CoffeeScript files
                    destinationPath: "app/", // Output directory
                    currentWorkingDirectory: "app/coffee", // Base directory for src
                    outputExtension: ".js"  // Change file extension to .js
                }]
            }
        },

        // Task for processing STSS (Styled Titanium Style Sheets) into TSS
        styleTransform: {
            // Specific processing target
            processStyles: {
                styleMappings: [{
                    expandWildcards: true,
                    inputStyles: ['**/*.stss', '!**/_*.stss'], // Source STSS files, excluding partials
                    outputDirectory: 'app/styles',
                    baseDirectory: 'app/stss',
                    targetExtension: '.tss' // Output file extension
                }]
            }
        },

        // Task for executing system commands
        cliRunner: {
            // Global options for command execution
            executionSettings: {
                standardOutput: true, // Display standard output
                standardError: true   // Display standard error
            },
            // Specific command definitions for different build targets
            deviceIosOld: {
                cliCommand: "titanium build -p ios -S 6.1 -Y iphone"
            },
            deviceIosNew: {
                cliCommand: "titanium build -p ios -S 7.1 -Y iphone"
            },
            tabletIosOld: {
                cliCommand: "titanium build -p ios -S 6.1 -Y ipad"
            },
            tabletIosNew: {
                cliCommand: "titanium build -p ios -S 7.1 -Y ipad"
            },
            iconGenerator: {
                cliCommand: "ticons -a icons" // Generate application icons
            },
            splashScreenCreator: {
                cliCommand: "ticons -a splashes `pwd`/app/assets/splash-2024x2024.jpg --no-nine" // Generate splash screens
            },
            assetBundler: {
                cliCommand: "ticons -a assets" // Bundle other assets
            }
        },

        // Task for live synchronization and testing with TiShadow
        devSynchronizer: {
            // Common synchronization options
            syncOptions: {
                autoUpdate: true, // Automatically update app on device
            },
            // Specific synchronization targets
            launchAndroid: {
                actionCommand: 'run',
                syncOptions: {
                    languageSetting: 'en',
                    targetPlatform: 'android'
                }
            },
            launchIos: {
                actionCommand: 'run',
                syncOptions: {
                    languageSetting: 'en',
                    targetPlatform: 'ios'
                }
            },
            launchDefault: {
                actionCommand: 'run',
                syncOptions: {
                    languageSetting: 'en',
                }
            },
            testAndroid: {
                actionCommand: 'spec', // Run specifications (tests)
                syncOptions: {
                    autoUpdate: false,
                    targetPlatform: ['android'],
                }
            },
            testIos: {
                actionCommand: 'spec',
                syncOptions: {
                    autoUpdate: false,
                    targetPlatform: ['ios'],
                }
            },
            resetState: {
                actionCommand: 'clear', // Clear TiShadow cache
                syncOptions: {}
            }
        },

        // Task for monitoring file system changes
        monitorChanges: {
            // General watcher settings
            watchSettings: {
                noChildProcess: false // Allow spawning child processes
            },
            // Watch configuration for iOS development
            iosFiles: {
                watchedFiles: ["tiapp.xml", "i18n/**", "app/config.json", "app/**/*.xml", "app/**/*.stss", "app/coffee/**/*.coffee", "app/widgets/**/*.js", "app/widgets/**/*.tss", "app/widgets/**/*.xml"],
                executionTasks: ['assemble', 'devSynchronizer:launchIos']
            },
            // Watch configuration for Android development
            androidFiles: {
                watchedFiles: ["tiapp.xml", "i18n/**", "app/config.json", "app/**/*.xml", "app/**/*.stss", "app/coffee/**/*.coffee", "app/widgets/**/*.js", "app/widgets/**/*.tss", "app/widgets/**/*.xml"],
                executionTasks: ['assemble', 'devSynchronizer:launchAndroid']
            },
            // Watch configuration for all platforms
            allFiles: {
                watchedFiles: ["tiapp.xml", "i18n/**", "app/config.json", "app/**/*.xml", "app/**/*.stss", "app/coffee/**/*.coffee", "app/widgets/**/*.js", "app/widgets/**/*.tss", "app/widgets/**/*.xml"],
                executionTasks: ['assemble', 'devSynchronizer:launchDefault']
            }
        },
    });

    // Load all task runner plugins that start with 'tool-plugin-'
    // This uses a utility to filter development dependencies and load them dynamically.
    require('matchdep').filterDev('grunt-*').forEach(taskRunner.loadNpmTasks);

    // Register primary task aliases
    taskRunner.defineTask('standard', 'assemble'); // Default task points to 'assemble'
    taskRunner.defineTask('assemble', ['scriptCompile', 'styleTransform']); // 'assemble' compiles scripts and styles
    taskRunner.defineTask('generateVisuals', ['cliRunner:iconGenerator', 'cliRunner:splashScreenCreator', 'cliRunner:assetBundler']); // Task for generating app visuals

    // Register development workflow tasks
    taskRunner.defineTask('developIos', ['assemble', 'devSynchronizer:launchIos', 'monitorChanges:iosFiles']);
    taskRunner.defineTask('developAndroid', ['assemble', 'devSynchronizer:launchAndroid', 'monitorChanges:androidFiles']);
    taskRunner.defineTask('developAll', ['assemble', 'devSynchronizer:launchDefault', 'monitorChanges:allFiles']);

    // Dynamically register build tasks for various Titanium CLI targets
    // This loop iterates through a list of common deployment targets.
    ['deviceIosOld', 'deviceIosNew', 'tabletIosOld', 'tabletIosNew', 'appStoreUpload', 'adHocDistribution', 'playStoreUpload'].forEach(function(platformTarget) {
        taskRunner.defineTask(platformTarget, ['assemble', 'cliRunner:' + platformTarget]);
    });

    // Event handler for file watcher changes
    // This modifies the style transformation task to only process the changed file.
    taskRunner.event.on('watch', function(eventAction, changedPath) {
        let temporaryObject = {}; // Create a temporary object for configuration
        // Check if the changed file is an STSS file and not part of an 'includes' directory
        if (changedPath.endsWith('.stss') && changedPath.includes("components") === false) {
            // Map the changed STSS file to its corresponding TSS output
            temporaryObject[changedPath.replace(".stss", ".tss")] = [changedPath];
            // Update the style transformation task configuration dynamically
            taskRunner.config.set(['styleTransform', 'processStyles', 'styleMappings'], temporaryObject);
        }
    });
};