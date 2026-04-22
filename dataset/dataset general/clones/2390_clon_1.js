/*
 * This is a Gruntfile.js configuration.
 * It defines various tasks for project automation.
 */
module.exports = function ( grunt ) {

    // Initialize Grunt configuration
    grunt.initConfig ( {
        // Task for cleaning project files and assets
        clean: {
            project: { // Project-related files
                src: [
                    "app/alloy.js", // Compiled Alloy file
                    "app/alloy.js.map", // Source map for Alloy
                    "app/coffee/**/*.js", // Compiled CoffeeScript files
                    "app/coffee/**/*.js.map", // Source maps for CoffeeScript
                    "app/controllers/**", // Controller files
                    "app/controllers/**", // Duplicate entry, kept as is per Type I definition
                    "app/lib/**", // Library files
                    "app/styles/**", // Stylesheets
                    "build/", // Build directory
                    "Resources/" // Resources directory
                ]
            }
            ,
            assets: { // Assets to clean up
                src: [
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
                    "app/assets/iphone/**/*.png",
                    "app/assets/iphone/**/*.jpg",
                    // Exclude high-res images for iOS
                    "!app/assets/iphone/images/*@3x.png",
                    "!app/assets/iphone/images/*@3x.jpg",
                    "app/assets/android/images",
                    "app/assets/android/**/*.png",
                    "app/assets/android/**/*.jpg",
                    // Exclude specific Android assets
                    "!app/assets/android",
                    "!app/assets/android/appicon.png",
                    "app/assets/iphone/iTunesArtwork",
                    "!app/assets/iphone/iTunesArtwork@2x",
                    "!app/assets/android/fonts/*",
                    "!app/assets/iphone/fonts/*"
                ] // End of assets src array
            } // End of assets configuration
        }, // End of clean task

        // CoffeeScript compilation task
        coffee: {
            options: { // CoffeeScript compiler options
                bare: true, // Compile without a top-level function wrapper
                sourceMap: false // Do not generate source maps
            },
            compile: { // Compilation target
                files: [ {
                    expand: true, // Enable dynamic expansion
                    src: [ "**/*.coffee" ], // Source CoffeeScript files
                    dest: "app/", // Destination directory for compiled JS
                    cwd: "app/coffee", // Current working directory for src
                    ext: ".js" // Extension for compiled files
                } ]
            }
        }, // End of coffee task

        // STSS (Titanium Style Sheet) compilation task
        stss: {
            compile: { // Compilation target
                files: [ {
                    expand: true, // Enable dynamic expansion
                    src: [ '**/*.stss', '!**/_*.stss' ], // Source STSS files, exclude partials
                    dest: 'app/styles', // Destination directory for compiled TSS
                    cwd: 'app/stss', // Current working directory for src
                    ext: '.tss' // Extension for compiled files
                } ]
            }
        }, // End of stss task

        // Shell command execution task
        shell: {
            options: { // Global options for shell tasks
                stdout: true, // Output stdout to console
                stderr: true // Output stderr to console
            },
            iphone6: {
                command: "titanium build -p ios -S 6.1 -Y iphone" // Build for iPhone 6.1
            },
            iphone7: {
                command: "titanium build -p ios -S 7.1 -Y iphone" // Build for iPhone 7.1
            },
            ipad6: {
                command: "titanium build -p ios -S 6.1 -Y ipad" // Build for iPad 6.1
            },
            ipad7: {
                command: "titanium build -p ios -S 7.1 -Y ipad" // Build for iPad 7.1
            },
            icons: {
                command: "ticons -a icons" // Generate app icons
            },
            splashes: {
                command: "ticons -a splashes `pwd`/app/assets/splash-2024x2024.jpg --no-nine" // Generate splash screens
            },
            assets: {
                command: "ticons -a assets" // Generate other assets
            }
        }, // End of shell task

        // TiShadow live-reload and testing task
        tishadow: {
            options: {
                update: true, // Enable update functionality
            },
            run_android: {
                command: 'run', // Run command for TiShadow
                options: {
                    locale: 'en', // Set locale to English
                    platform: 'android' // Target Android platform
                }
            },
            run_ios: {
                command: 'run', // Run command for TiShadow
                options: {
                    locale: 'en', // Set locale to English
                    platform: 'ios' // Target iOS platform
                }
            },
            run: {
                command: 'run', // Generic run command
                options: {
                    locale: 'en', // Set locale to English
                }
            },
            spec_android: {
                command: 'spec', // Run specs command
                options: {
                    update: false, // Do not update for specs
                    platform: [ 'android' ], // Target Android for specs
                }
            },
            spec_ios: {
                command: 'spec', // Run specs command
                options: {
                    update: false, // Do not update for specs
                    platform: [ 'ios' ], // Target iOS for specs
                }
            },
            clear: {
                command: 'clear', // Clear TiShadow cache
                options: {} // No specific options needed
            }
        }, // End of tishadow task

        // Watch files for changes and run tasks
        watch: {
            options: {
                nospawn: false // Do not spawn tasks in a child process
            },
            ios: {
                files: [ // Files to watch for iOS development
                    "tiapp.xml",
                    "i18n/**",
                    "app/config.json",
                    "app/**/*.xml",
                    "app/**/*.stss",
                    "app/coffee/**/*.coffee",
                    "app/widgets/**/*.js",
                    "app/widgets/**/*.tss",
                    "app/widgets/**/*.xml"
                ],
                tasks: [ 'build', 'tishadow:run_ios' ] // Tasks to run on change
            },
            android: {
                files: [ // Files to watch for Android development
                    "tiapp.xml",
                    "i18n/**",
                    "app/config.json",
                    "app/**/*.xml",
                    "app/**/*.stss",
                    "app/coffee/**/*.coffee",
                    "app/widgets/**/*.js",
                    "app/widgets/**/*.tss",
                    "app/widgets/**/*.xml"
                ],
                tasks: [ 'build', 'tishadow:run_android' ] // Tasks to run on change
            },
            all: {
                files: [ // Files to watch for generic development
                    "tiapp.xml",
                    "i18n/**",
                    "app/config.json",
                    "app/**/*.xml",
                    "app/**/*.stss",
                    "app/coffee/**/*.coffee",
                    "app/widgets/**/*.js",
                    "app/widgets/**/*.tss",
                    "app/widgets/**/*.xml"
                ],
                tasks: [ 'build', 'tishadow:run' ] // Tasks to run on change
            }
        } // End of watch task
    } ); // End of grunt.initConfig call

    // Load all Grunt plugins that start with 'grunt-'
    require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

    /* --- Grunt Task Registrations --- */

    // Register 'default' task as an alias for 'build'
    grunt.registerTask( 'default', 'build' );

    // Register 'build' task to compile CoffeeScript and STSS
    grunt.registerTask( 'build', [ 'coffee', 'stss' ] );

    // Register 'ticons' task to run icon and splash screen generation
    grunt.registerTask( 'ticons', [ 'shell:icons', 'shell:splashes', 'shell:assets' ] );

    // Development tasks for specific platforms
    grunt.registerTask( 'dev_ios', [ 'build', 'tishadow:run_ios', 'watch:ios' ] );
    grunt.registerTask( 'dev_android', [ 'build', 'tishadow:run_android', 'watch:android' ] );
    grunt.registerTask( 'dev_all', [ 'build', 'tishadow:run', 'watch:all' ] );

    // Dynamically register Titanium CLI build tasks
    // Iterates through a list of targets (iphone6, iphone7, etc.)
    [ 'iphone6', 'iphone7', 'ipad6', 'ipad7', 'appstore', 'adhoc', 'playstore' ].forEach( function ( target ) {
        // Each target will run 'build' then the corresponding shell command
        grunt.registerTask( target, [ 'build', 'shell:' + target ] );
    } );

    // Event handler for 'watch' changes
    // This allows re-compiling only the changed STSS file
    grunt.event.on( 'watch', function ( action, filepath ) {
        var o = {}; // Temporary object to hold file mapping
        // Check if the changed file is an STSS file and not an 'includes' file
        if ( filepath.match( /.stss$/ ) && filepath.indexOf( "includes" ) === -1 ) {
            // Map the compiled TSS file to the changed STSS source file
            o[ filepath.replace( ".stss", ".tss" ) ] = [ filepath ];
            // Update the 'stss.compile.files' configuration for the single file
            grunt.config.set( [ 'stss', 'compile', 'files' ], o );
        }
    } );

}; // End of module.exports function