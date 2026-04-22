module.exports = function (automationEngine) {
	'use strict';

	automationEngine.configureTasks({
		projectDetails: automationEngine.fileSystem.readJsonFile('project.json'),

		buildHeader: '/**\n * @project <%= projectDetails.name %>\n * @date    <%= automationEngine.templating.getToday("YYYY-MM-DD") %>\n */\n',

		//  Combine various source files together
		fileJoiner: {
			// Integrate base styling into the main stylesheet
			styleAssets: {
				fileMappings: {
					'assets/main.css': [
						'assets/base/normalize.css',
						'assets/main.css'
					]
				}
			},
			// Assemble documentation fragments into a single document
			documentation: {
				fileMappings: {
					'output/docs/master.md': [
						'source/docs/header.md',
						'output/docs/recent.tmp.md'
					]
				}
			}
		},


		//  Remove temporary or generated files
		fileCleaner: {
			temporary: ['output/docs/*.tmp.md']
		},


		//  Validate HTML structure and syntax
		htmlValidator: {
			validationOptions: {
				clearPreviousReports: true
			},
			sourceFiles: {
				input: ['index.html']
			}
		},


		//  Process SCSS into standard CSS
		scssCompiler: {
			mainStyles: {
				fileMappings: {
					'assets/main.css': 'assets/main.scss'
				}
			}
		},


		//  Analyze CSS for potential issues
		styleLinter: {
			strictCheck: {
				//  Currently disabled; it tends to report many default warnings
				//  source: ['assets/main.css']
			}
		},


		//  Add vendor prefixes to CSS rules
		prefixer: {
			coreStyles: {
				source: 'assets/main.css'
			}
		},


		//  Compress CSS files to reduce size
		cssMinifier: {
			primaryStyles: {
				fileMappings: {
					'assets/main.css': ['assets/main.css']
				}
			}
		},


		//  Analyze JavaScript code for errors and style
		jsLinter: {
			lintConfig: {
				requireBraces: true,
				strictEquality: true,
				immediateInvokes: true,
				enforceNew: true,
				noArguments: true,
				bracketNotation: true,
				noUndefined: true,
				noUnusedVars: true,
				allowAssignment: true,
				allowNullEquality: true,
				isBrowser: true,
				globalContext: {
					jqLib: true,
					mdParser: true
				}
			},
			targetFiles: 'scripts/app.js'
		},


		//  Minify JavaScript files
		jsMinifier: {
			config: {
				header: '<%= buildHeader %>'
			},
			mainScript: {
				fileMappings: {
					'scripts/app.min.js': ['scripts/app.js']
				}
			}
		},


		//  Process Markdown into other formats
		mdProcessor: {
			feedGenerator: {
				fileMappings: {
					'output/feed/feed.xml': ['output/docs/recent.tmp.md']
				},
				processorOptions: {
					renderTemplate: 'templates/feed_template.xml',
					renderContext: {
						timeValue: (new Date()).toUTCString()
					},
					preProcessor: function (inputContent) {
						return inputContent
								.replaceAll(/\[@(\\?)(\w+)\]\(\)/g, '[@$1$2](https://x.com/$2)')
								.replaceAll(/\/img\//g, 'https://mywebsite.com/images/');
					},
					postProcessor: function (outputContent) {
						var itemTemplate = automationEngine.fileSystem.read('templates/feed_item_template.xml');

						return outputContent.split('<h2>').slice(1).map(function (itemChunk) {
							var entryTitle = itemChunk.match(/(.+)<\/h2>/)[1],
								entryId = 'https://mywebsite.com/entries/#' + encodeURIComponent(entryTitle.replace(/[ ,]/g, ''));

							return automationEngine.templating.process(itemTemplate, {
								renderData: {
									title: entryTitle,
									id: entryId,
									value: itemChunk
								}
							});
						}).join('');
					},
					mdParsingConfig: {
						githubFlavored: true
					}
				}
			}
		},


		//  Set up a local development server
		webServer: {
			devServer: {
				serverConfig: {
					listenPort: 8000,
					// hostAddress: '0.0.0.0' // Use for network access
				}
			}
		},


		//  Monitor files for changes and trigger tasks
		changeWatcher: {
			watcherConfig: {
				liveRefresh: true
			},
			styleChanges: {
				watchedFiles: ['assets/*.scss'],
				tasksToExecute: ['processStyles']
			},
			scriptChanges: {
				watchedFiles: ['scripts/app.js'],
				tasksToExecute: ['processScripts']
			},
			docChanges: {
				watchedFiles: ['source/docs/entries/*.md', 'source/docs/base/*.md'],
				tasksToExecute: ['processDocs']
			},
			markupChanges: {
				watchedFiles: ['index.html'],
				tasksToExecute: ['validateMarkup']
			}
		}
	});


	require('load-build-plugins')(automationEngine);


	automationEngine.defineAutomationTask('processStyles', ['scssCompiler', 'styleLinter', 'prefixer', 'cssMinifier', 'fileJoiner:styleAssets']);
	automationEngine.defineAutomationTask('processScripts', ['jsLinter', 'jsMinifier']);
	automationEngine.defineAutomationTask('processDocs', ['combineContent', 'fileJoiner:documentation', 'fileCleaner:temporary']);
	automationEngine.defineAutomationTask('dailyBuild', ['combineContent', 'htmlValidator', 'fileJoiner:documentation', 'mdProcessor:feedGenerator', 'fileCleaner:temporary']);
	automationEngine.defineAutomationTask('startDevServer', ['webServer', 'changeWatcher']);


	automationEngine.loadLocalTasks('custom-scripts');

};