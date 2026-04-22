module.exports = function(buildManager) {
    // Core project paths and global settings
    const baseAppDir = 'app/';
    const outputBuildDir = 'build/';
    const resourceOutputDir = 'Resources/';
    const platformAndroidPath = 'platform/android/res/';

    // Configuration for various build and development tasks
    buildManager.initConfig({
        // Task for cleaning up generated files and directories
        cleanupOperations: {
            // Remove compiled code, maps, and temporary build artifacts
            compiledArtifacts: {
                src: [
                    `${baseAppDir}alloy.js`,
                    `${baseAppDir}alloy.js.map`,
                    `${baseAppDir}coffee/**/*.js`,
                    `${baseAppDir}coffee/**/*.js.map`,
                    `${baseAppDir}controllers/**`,
                    `${baseAppDir}lib/**`,
                    `${baseAppDir}styles/**`,
                    outputBuildDir,
                    resourceOutputDir
                ]
            },
            // Remove generated platform-specific assets and icons
            generatedResources: {
                src: [
                    "iTunesConnect.png",
                    "GooglePlay.png",
                    "GooglePlayFeature.png",
                    `${platformAndroidPath}drawable-hdpi`,
                    `${platformAndroidPath}drawable-ldpi`,
                    `${platformAndroidPath}drawable-mdpi`,
                    `${platformAndroidPath}drawable-xhdpi`,
                    `${platformAndroidPath}drawable-xxhdpi`,
                    `${platformAndroidPath}drawable-xxxhdpi`,
                    `${baseAppDir}assets/images`, // General images dir
                    `${baseAppDir}assets/iphone/**/*.png`,
                    `${baseAppDir}assets/iphone/**/*.jpg`,
                    `!${baseAppDir}assets/iphone/images/*@3x.png`, // Exclude high-res iOS images
                    `${baseAppDir}assets/android/images`,
                    `${baseAppDir}assets/android/**/*.png`,
                    `${baseAppDir}assets/android/**/*.jpg`,
                    `!${baseAppDir}assets/android/appicon.png`, // Keep specific Android icon
                    `${baseAppDir}assets/iphone/iTunesArtwork`,
                    `!${baseAppDir}assets/iphone/iTunesArtwork@2x`
                ]
            }
        },

        // CoffeeScript compilation task
        coffeeScriptCompiler: {
            compilationSettings: {
                bare: true, // Output plain JS, no wrapper function
                sourceMap: false // Do not generate source maps for production
            },
            processSources: {
                files: [{
                    expand: true,
                    src: ["**/*.coffee"], // All .coffee files
                    dest: baseAppDir, // Output to app/ directory
                    cwd: `${baseAppDir}coffee`, // Source directory
                    ext: ".js" // Change extension to .js
                }]
            }
        },

        // STSS (Stylus-like CSS preprocessor for Titanium) compilation
        stssProcessor: {
            styleTranspilation: {
                files: [{
                    expand: true,
                    src: ['**/*.stss', '!**/_*.stss'], // Exclude partials (files starting with _)
                    dest: `${baseAppDir}styles`, // Output to app/styles
                    cwd: `${baseAppDir}stss`, // Source directory for STSS
                    ext: '.tss' // Output as Titanium Style Sheets
                }]
            }
        },

        // Execute shell commands for various build steps
        commandExecutor: {
            globalShellSettings: {
                stdout: true, // Display standard output
                stderr: true // Display standard error
            },
            buildIosSim6: {
                command: `titanium build -p ios -S 6.1 -Y iphone`
            },
            buildIosSim7: {
                command: `titanium build -p ios -S 7.1 -Y iphone`
            },
            buildIpadSim6: {
                command: `titanium build -p ios -S 6.1 -Y ipad`
            },
            buildIpadSim7: {
                command: `titanium build -p ios -S 7.1 -Y ipad`
            },
            generateIcons: {
                command: `ticons -a icons`
            },
            generateSplashes: {
                command: `ticons -a splashes "${process.cwd()}/${baseAppDir}assets/splash-2024x2024.jpg" --no-nine` // Ensure path is absolute
            },
            processAssets: {
                command: `ticons -a assets`
            },
            // New: a dummy task for demonstration
            deployToStaging: {
                command: `echo "Deploying to staging environment..." && cp -r ${outputBuildDir} /tmp/staging_build`
            }
        },

        // Titanium Shadow tasks for rapid development and testing
        tishadowRunner: {
            tishadowDefaults: {
                update: true, // Automatically update the app on device/simulator
            },
            startAndroidApp: {
                command: 'run',
                options: {
                    locale: 'en',
                    platform: 'android'
                }
            },
            startIosApp: {
                command: 'run',
                options: {
                    locale: 'en',
                    platform: 'ios'
                }
            },
            runOnAnyPlatform: {
                command: 'run',
                options: {
                    locale: 'en',
                }
            },
            runAndroidSpecs: {
                command: 'spec',
                options: {
                    update: false, // Don't update during spec run
                    platform: ['android'],
                }
            },
            runIosSpecs: {
                command: 'spec',
                options: {
                    update: false,
                    platform: ['ios'],
                }
            },
            clearTishadowCache: {
                command: 'clear',
                options: {}
            }
        },

        // Watch files for changes and re-run tasks
        fileChangeWatcher: {
            watchConfiguration: {
                nospawn: false // Run tasks in the same process
            },
            monitorIosChanges: {
                files: [
                    "tiapp.xml",
                    "i18n/**",
                    `${baseAppDir}config.json`,
                    `${baseAppDir}/**/*.xml`,
                    `${baseAppDir}/**/*.stss`,
                    `${baseAppDir}coffee/**/*.coffee`,
                    `${baseAppDir}widgets/**/*.js`,
                    `${baseAppDir}widgets/**/*.tss`,
                    `${baseAppDir}widgets/**/*.xml`
                ],
                tasks: ['compileProject', 'tishadowRunner:startIosApp']
            },
            monitorAndroidChanges: {
                files: [
                    "tiapp.xml",
                    "i18n/**",
                    `${baseAppDir}config.json`,
                    `${baseAppDir}/**/*.xml`,
                    `${baseAppDir}/**/*.stss`,
                    `${baseAppDir}coffee/**/*.coffee`,
                    `${baseAppDir}widgets/**/*.js`,
                    `${baseAppDir}widgets/**/*.tss`,
                    `${baseAppDir}widgets/**/*.xml`
                ],
                tasks: ['compileProject', 'tishadowRunner:startAndroidApp']
            },
            monitorAllPlatformChanges: {
                files: [
                    "tiapp.xml",
                    "i18n/**",
                    `${baseAppDir}config.json`,
                    `${baseAppDir}/**/*.xml`,
                    `${baseAppDir}/**/*.stss`,
                    `${baseAppDir}coffee/**/*.coffee`,
                    `${baseAppDir}widgets/**/*.js`,
                    `${baseAppDir}widgets/**/*.tss`,
                    `${baseAppDir}widgets/**/*.xml`
                ],
                tasks: ['compileProject', 'tishadowRunner:runOnAnyPlatform']
            }
        },
    });

    // Load all Grunt plugins automatically based on package.json
    require('matchdep').filterDev('grunt-*').forEach(buildManager.loadNpmTasks);

    // Define custom task aliases
    buildManager.registerTask('default', ['compileProject']);
    buildManager.registerTask('compileProject', ['coffeeScriptCompiler', 'stssProcessor']);
    buildManager.registerTask('iconAssets', ['commandExecutor:generateIcons', 'commandExecutor:generateSplashes', 'commandExecutor:processAssets']);

    // Development watch tasks for different platforms
    buildManager.registerTask('dev_ios', ['compileProject', 'tishadowRunner:startIosApp', 'fileChangeWatcher:monitorIosChanges']);
    buildManager.registerTask('dev_android', ['compileProject', 'tishadowRunner:startAndroidApp', 'fileChangeWatcher:monitorAndroidChanges']);
    buildManager.registerTask('dev_cross_platform', ['compileProject', 'tishadowRunner:runOnAnyPlatform', 'fileChangeWatcher:monitorAllPlatformChanges']);

    // Titanium CLI build tasks (renamed and slightly reordered)
    const titaniumBuildTargets = ['ipad7', 'ipad6', 'iphone7', 'iphone6', 'playstore', 'adhoc'];
    titaniumBuildTargets.forEach(function(targetId) {
        let shellTargetName = '';
        // Map original target names to new shell task names
        switch (targetId) {
            case 'iphone6': shellTargetName = 'buildIosSim6'; break;
            case 'iphone7': shellTargetName = 'buildIosSim7'; break;
            case 'ipad6': shellTargetName = 'buildIpadSim6'; break;
            case 'ipad7': shellTargetName = 'buildIpadSim7'; break;
            case 'playstore': shellTargetName = 'deployToStaging'; break; // Using a dummy deploy task
            case 'adhoc': shellTargetName = 'deployToStaging'; break; // Using a dummy deploy task
            default: shellTargetName = 'deployToStaging'; // Fallback
        }
        buildManager.registerTask(targetId, ['compileProject', `commandExecutor:${shellTargetName}`]);
    });

    // Add a new alias for cleanup
    buildManager.registerTask('deep_clean', ['cleanupOperations:compiledArtifacts', 'cleanupOperations:generatedResources']);

    // Event listener for watch tasks to optimize STSS compilation
    buildManager.event.on('watch', function(triggeredAction, changedFilePath) {
        // A small log to see what's happening during watch
        console.log(`Watch triggered: ${triggeredAction} on ${changedFilePath}`);

        // If a .stss file changes and it's not an "include" partial
        if (changedFilePath.endsWith('.stss') && !changedFilePath.includes("includes")) {
            const targetTssPath = changedFilePath.replace(".stss", ".tss");
            const compilationMap = {};
            compilationMap[targetTssPath] = [changedFilePath];
            // Dynamically update the STSS configuration to only compile the changed file
            buildManager.config.set(['stssProcessor', 'styleTranspilation', 'files'], compilationMap);
            console.log(`Optimized STSS compilation for: ${changedFilePath}`);
        }
    });
};