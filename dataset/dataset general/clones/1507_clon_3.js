module.exports = function(toolkit) {

    // This section defines the various configurations for our build processes.
    // It's like setting up all the tools before starting the work.
    toolkit.initConfig({

        // Retrieve package information from package.json
        // This helps us dynamically use project name, version, etc.
        pkgInfo: (function() {
            const packageInfoPath = "package.json";
            if (!toolkit.file.exists(packageInfoPath)) {
                toolkit.log.warn('Warning: ' + packageInfoPath + ' not found. Some configurations might be incomplete.');
                return { name: 'unknown-project', version: '0.0.0' };
            }
            return toolkit.file.readJSON(packageInfoPath);
        })(),

        // Project name, extracted for convenience
        projectName: "<%= pkgInfo.name %>",

        // Configuration for JavaScript linting using JSHint
        // This helps maintain code quality and catch potential errors.
        jsLinter: {
            // General options for the linter
            options: {
                bitwise: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: "nofunc",
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true, // Assuming browser environment
                globals: {
                    jQuery:   true,
                    $:        true,
                    window:   true,
                    document: true
                }
            },
            // Target files for linting
            allSources: {
                src: ["source/**/*.js", "!source/vendor/*.js"] // Lint all JS files except those in vendor
            }
        },

        // Configuration for JavaScript minification using UglifyJS
        // This reduces file size for faster loading in production.
        minifier: {
            productionMinification: {
                files: {
                    "output/<%= pkgInfo.name %>.min.js": ["source/primary-script.js"]
                }
            }
        },

        // Configuration for watching files and triggering tasks on changes
        // Useful for development to automate repetitive build steps.
        fileMonitor: {
            options: {
                liveReload: false, // Disabling live reload for now
                interval: 1000,    // Check every second
                debounceDelay: 500 // Wait 500ms after last change before running tasks
            },
            sourceScripts: {
                files: ["source/**/*.js", "Gruntfile.js"], // Watch JS files and Gruntfile itself
                tasks: ["jsLinter:allSources", "minifier:productionMinification", "distributeFullScript", "logBuildComplete"],
                options: {
                    spawn: true // Run tasks in a separate process
                }
            }
        }

    });

    // Load all Grunt tasks from 'node_modules' that start with 'grunt-'
    // This automates the process of loading external plugins.
    require("load-grunt-tasks")(toolkit);

    // --- Custom Tasks Definitions ---

    // Task to clean up the output directory
    toolkit.registerTask("cleanOutput", "Removes the build output directory.", function() {
        const outputDirectory = "output/";
        if (toolkit.file.exists(outputDirectory)) {
            toolkit.file.delete(outputDirectory, { force: true });
            toolkit.log.ok('Directory "' + outputDirectory + '" cleaned successfully.');
        } else {
            toolkit.log.writeln('Directory "' + outputDirectory + '" does not exist. No cleanup needed.');
        }
    });

    // Task to copy the unminified primary script to the output directory
    toolkit.registerTask("distributeFullScript", "Copies the main unminified JavaScript file to the output.", function() {
        const sourcePath = "source/primary-script.js";
        const destinationPath = "output/<%= pkgInfo.name %>.js";

        if (!toolkit.file.exists(sourcePath)) {
            toolkit.log.error('Source file "' + sourcePath + '" not found. Cannot copy.');
            return false; // Indicate failure
        }

        toolkit.file.copy(sourcePath, destinationPath);
        toolkit.log.ok('Copied "' + sourcePath + '" to "' + destinationPath + '".');
    });

    // A simple task to log that the build process is complete
    toolkit.registerTask("logBuildComplete", "Logs a message indicating build completion.", function() {
        toolkit.log.writeln("---------------------------------------");
        toolkit.log.ok("Build process finished for " + toolkit.config.get('projectName') + "!");
        toolkit.log.writeln("---------------------------------------");
    });

    // --- Register main build sequences ---

    // The primary task for a complete build
    // This sequence cleans, lints, minifies, copies, and logs completion.
    toolkit.registerTask("fullBuild", [
        "cleanOutput",
        "jsLinter:allSources",
        "minifier:productionMinification",
        "distributeFullScript",
        "logBuildComplete"
    ]);

    // The default task, which will run the full build
    // This is what happens when you just type 'grunt' in the terminal.
    toolkit.registerTask("default", ["fullBuild"]);

    // A development-focused task that watches for changes
    toolkit.registerTask("develop", ["fullBuild", "fileMonitor"]);

};