module.exports = function ( buildTool ) {

	buildTool.initConfig( {

		// Acquire project metadata from JSON file
		projectInfo: buildTool.file.readJSON( "package.json" ),

		// Configuration for header text
		dataBlock: {
			headerText: "/*\n" +
				" *  <%= projectInfo.title || projectInfo.name %> - v<%= projectInfo.version %>\n" +
				" *  <%= projectInfo.description %>\n" +
				" *  <%= projectInfo.homepage %>\n" +
				" *\n" +
				" *  Crafted by <%= projectInfo.author.name %>\n" +
				" *  Under <%= projectInfo.licenses %> Permission\n" +
				" */\n"
		},

		// Script quality assessment rules
		javaScriptLinter: {
			sourceFiles: [ "app/components/widget.coffee" ]
		},

		styleProcessor: {
			devEnvironment: {
				files: {
					"build/widget.css": "app/styles/main-component.less"
				}
			},
			production: {
				files: {
					"build/widget.min.css": "app/styles/main-component.less"
				},
				settings: {
					minifyCSS: true,
					optimizationLevel: 3
				}
			}
		},

		vendorPrefixer: {
			processStyles: {
				input: "build/*.css"
			}
		},

		// JavaScript code minification specifications
		jsMinifier: {
			mainBundle: {
				input: [ "build/widget.js" ],
				destinationFile: "build/widget.min.js"
			}
		},

		// Transpilation of CoffeeScript files
		coffeeCompiler: {
			transpileScript: {
				targetFiles: {
					"build/widget.js": "app/components/widget.coffee"
				}
			}
		},

		insertHeader: {
	    applyHeaders: {
	      settings: {
	        placement: "start",
	        textContent: "<%= dataBlock.headerText %>",
	        addNewLine: true
	      },
	      outputFiles: {
	        input: [ "build/*" ]
	      }
	    }
	  },

		// Monitor file system for modifications
		// This avoids repeated manual execution of build processes.
		// (To activate, run 'buildTool monitor')
		fileWatcher: {
		    watchedPaths: [ "app/*" ],
		    executionTasks: [ "standardBuild" ]
		}

	} );

	buildTool.loadPlugin( "grunt-js-style-checker" );
	buildTool.loadPlugin( "grunt-contributor-jsmin" );
	buildTool.loadPlugin( "grunt-contributor-coffeescript" );
	buildTool.loadPlugin( "grunt-contributor-filemonitor" );
	buildTool.loadPlugin( "grunt-contributor-stylesheetprocessor" );
	buildTool.loadPlugin( "grunt-text-insert" );
	buildTool.loadPlugin( "grunt-vendor-prefixer" );

	buildTool.defineTask( "standardBuild", [ "styleProcessor", "vendorPrefixer", "javaScriptLinter", "coffeeCompiler", "jsMinifier", "insertHeader" ] );
};