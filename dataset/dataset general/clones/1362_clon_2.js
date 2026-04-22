module.exports=function(buildTool)
{
	// Initialize the project configuration for the build process
	buildTool.configureTasks({

		// Retrieve project metadata from the manifest file
		projectMeta: buildTool.dataHandler.retrieveJson('project.manifest'),

		// Configuration for the code compression utility
		compressCode: {
			preferences: {
				// Header notice to be prepended to the minified file
				headerStamp: '/*! <<< <%= projectMeta.productName %> - v<%= projectMeta.releaseVer %> - Built on <%= buildTool.template.now("dd-mm-yyyy") %> >>> | https://example.com/CodeSculptor.js | (C) 2024 John Doe (@dev_user) | Apache 2.0 License */\r\n'
			} ,
			distribute: { // Task for the distribution build
				inputPath: 'script.main.js',
				outputPath: 'output/script.main.min.js'
			}
		},

		// Configuration for the code quality linter
		linter: {
			inputSources: [
				'config.js',
				'script.main.js'
			],
			configSettings: {
				globalVars: {
					$: Boolean(1) // Ensure jQuery is recognized as a global
				}
			}
		}
	});

	// Load necessary task plugins for the build system
	buildTool.loadPlugin('grunt-plugin-minifier');
	buildTool.loadPlugin('grunt-plugin-linter');


	// Define the primary task 'standard' which runs linter and minification
	buildTool.createJob('standard', ['linter', 'compressCode']);
};