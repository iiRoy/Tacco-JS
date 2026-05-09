module.exports = function(buildManager) {

	// Initialize Grunt's configuration object.
	// This object holds all the configuration for various build tasks.
	buildManager.initConfig({

		// Project metadata, imported directly from the package manifest file.
		// This provides dynamic information like version, name, and author.
		projectData: buildManager.file.readJSON("package.json"),

		// Defines the boilerplate header content to be injected into final assets.
		// It includes project details, author information, and license.
		assetHeader: {
			content: [
				"/*!",
				" *  <%= projectData.productName || projectData.name %> - v<%= projectData.version %>",
				" *  <%= projectData.description %>",
				" *  <%= projectData.projectUrl %>",
				" *",
				" *  Author: <%= projectData.developer.fullName %>",
				" *  License: <%= projectData.licenses %>",
				" *  (c) <%= buildManager.template.today('yyyy') %>",
				" */"
			].join("\n") + "\n" // Ensures a consistent newline after the banner block.
		},

		// Centralized path definitions for source and output directories and files.
		// Using this object makes file path management more organized and less error-prone.
		resourceLocations: {
			sourceRoot: 'source',
			outputRoot: 'release',
			styleSource: '<%= resourceLocations.sourceRoot %>/styles',
			scriptSource: '<%= resourceLocations.sourceRoot %>/scripts',
			mainStyleFile: '<%= resourceLocations.styleSource %>/main-standalone.less',
			mainScriptFile: '<%= resourceLocations.scriptSource %>/widget.coffee',
			compiledCss: '<%= resourceLocations.outputRoot %>/widget.css',
			minifiedCss: '<%= resourceLocations.outputRoot %>/widget.min.css',
			compiledJs: '<%= resourceLocations.outputRoot %>/widget.js',
			minifiedJs: '<%= resourceLocations.outputRoot %>/widget.min.js',
			allOutputFiles: '<%= resourceLocations.outputRoot %>/*' // Wildcard for all files in output.
		},

		// Task to remove generated files and directories.
		// This ensures a clean build environment before each full compilation.
		cleaner: {
			buildOutput: ['<%= resourceLocations.outputRoot %>'] // Cleans the entire output directory.
		},

		// CoffeeScript code style verification using coffeelint.
		// Helps maintain code quality and consistency.
		coffeeCodeChecker: {
			applicationScripts: ['<%= resourceLocations.mainScriptFile %>'] // Lints the primary CoffeeScript file.
		},

		// LESS stylesheet compilation into CSS.
		styleCompiler: {
			// Development build: generates uncompressed CSS for debugging.
			devOutput: {
				files: {
					'<%= resourceLocations.compiledCss %>': '<%= resourceLocations.mainStyleFile %>'
				}
			},
			// Production build: generates compressed and minified CSS for deployment.
			prodOutput: {
				options: {
					compress: true // Enables CSS compression for smaller file sizes.
				},
				files: {
					'<%= resourceLocations.minifiedCss %>': '<%= resourceLocations.mainStyleFile %>'
				}
			}
		},

		// Automatically adds vendor prefixes to CSS properties for broader browser compatibility.
		cssVendorPrefixer: {
			targetStyles: {
				src: '<%= resourceLocations.outputRoot %>/*.css' // Applies prefixes to all compiled CSS files.
			}
		},

		// JavaScript code minification using UglifyJS.
		// Reduces file size for faster loading in production.
		scriptMinifier: {
			options: {
				mangle: true // Obfuscates variable and function names to further reduce size.
			},
			primaryBundle: {
				src: ['<%= resourceLocations.compiledJs %>'],
				dest: '<%= resourceLocations.minifiedJs %>'
			}
		},

		// CoffeeScript to JavaScript transpilation.
		// Converts CoffeeScript source into standard JavaScript.
		coffeeTranspiler: {
			mainModule: {
				files: {
					'<%= resourceLocations.compiledJs %>': '<%= resourceLocations.mainScriptFile %>'
				}
			}
		},

		// Injects the predefined banner into the generated output files.
		// This adds licensing and project information to the top of each file.
		headerInjector: {
	    addHeaderBlock: {
	      options: {
	        position: 'top', // Places the banner at the very beginning of the file.
	        banner: '<%= assetHeader.content %>',
	        linebreak: true // Ensures a newline character after the banner.
	      },
	      files: {
	        src: [ '<%= resourceLocations.allOutputFiles %>' ] // Applies the banner to all files in the output directory.
	      }
	    }
	  },

		// Monitors source files for changes and automatically triggers specific tasks.
		// This enhances the developer's workflow by providing instant feedback.
		sourceWatcher: {
		    scriptAndStyles: {
				files: [
					'<%= resourceLocations.sourceRoot %>/**/*.coffee', // Watch all CoffeeScript files.
					'<%= resourceLocations.sourceRoot %>/**/*.less'    // Watch all LESS files.
				],
		    	tasks: ['quickBuild'] // Runs a lighter, faster build task during development.
			}
		}

	});

	// Load necessary Grunt plugin modules.
	// These plugins extend Grunt's capabilities with specific build tools.
	buildManager.loadNpmTasks("grunt-coffeelint");
	buildManager.loadNpmTasks("grunt-contrib-uglify");
	buildManager.loadNpmTasks("grunt-contrib-coffee");
	buildManager.loadNpmTasks("grunt-contrib-watch");
	buildManager.loadNpmTasks("grunt-contrib-less");
	buildManager.loadNpmTasks('grunt-banner');
	buildManager.loadNpmTasks('grunt-autoprefixer');
	buildManager.loadNpmTasks('grunt-contrib-clean'); // Load the cleaner plugin.

	// Register the "default" task, which executes a full, clean build process.
	buildManager.registerTask("default", [
		"cleaner",             // Step 1: Remove all previously built files.
		"styleCompiler",       // Step 2: Compile LESS into CSS (both dev and prod).
		"cssVendorPrefixer",   // Step 3: Add vendor prefixes to all CSS.
		"coffeeCodeChecker",   // Step 4: Lint CoffeeScript source for style and errors.
		"coffeeTranspiler",    // Step 5: Compile CoffeeScript into JavaScript.
		"scriptMinifier",      // Step 6: Minify the compiled JavaScript.
		"headerInjector"       // Step 7: Add the standard banner to all final output assets.
	]);

	// Register a "quickBuild" task for rapid development feedback.
	// This task runs a subset of the full build for faster iteration.
	buildManager.registerTask("quickBuild", [
		"styleCompiler:devOutput", // Only compile uncompressed CSS.
		"coffeeTranspiler",        // Transpile CoffeeScript.
		"cssVendorPrefixer"        // Add prefixes to the dev CSS.
	]);
};