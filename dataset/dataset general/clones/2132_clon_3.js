module.exports = (buildKit) => {
	'use strict';

	// Main project configuration block
	buildKit.configureProject({
		// Load project metadata from package.json
		projectMeta: JSON.parse(buildKit.file.read('package.json')),

		// Define a standard header for generated files
		outputHeader: `/*! ${buildKit.config.projectMeta.name} - Build Date: ${buildKit.template.today('yyyy-mm-dd HH:MM:ss')} */\n`,

		// Task to combine various files
		assetBundler: {
			// Combine foundational CSS with application styles
			styleSheets: {
				files: {
					'dist/app.min.css': [
						'source/styles/base-reset.css',
						'source/styles/primary.css'
					]
				}
			},
			// Assemble documentation fragments into a single markdown file
			documentation: {
				files: {
					'build/docs/main_doc.md': [
						'source/content/docs_header.md',
						'build/temp/latest_entry.md'
					]
				}
			}
		},

		// Task for removing temporary build artifacts
		artifactCleaner: {
			// Remove all temporary markdown files
			ephemeralDocs: ['build/temp/*.temp.md', 'build/temp/*.md']
		},

		// HTML markup validation
		markupValidator: {
			options: {
				reset: true, // Reset parser state for each file
				reportUnused: true, // Report unused attributes
				doctype: 'HTML5' // Enforce HTML5 doctype
			},
			targets: {
				source: ['public/index.html']
			}
		},

		// SCSS pre-processing
		scssCompiler: {
			production: {
				options: {
					style: 'expanded',
					sourceMap: false
				},
				files: {
					'source/styles/primary.css': 'source/styles/primary.scss'
				}
			}
		},

		// Add vendor prefixes to CSS rules
		browserPrefixer: {
			auto: {
				options: {
					cascade: false // Don't re-indent prefixes
				},
				src: 'source/styles/primary.css'
			}
		},

		// Minify CSS files
		minifyStyles: {
			main: {
				options: {
					report: 'gzip' // Show gzipped size
				},
				files: {
					'dist/app.min.css': ['dist/app.min.css']
				}
			}
		},

		// JavaScript code quality analysis
		scriptLinter: {
			options: {
				curly: true, // Require curly braces for all control statements
				eqeqeq: true, // Enforce === and !==
				immed: true, // Require immediate invocation of function expressions
				newcap: true, // Require capitalization of constructors
				noarg: true, // Disallow use of arguments.caller or arguments.callee
				sub: true, // Suppress warnings about using [] for property access
				undef: true, // Warn about undeclared variables
				unused: 'vars', // Warn about unused variables
				boss: true, // Suppress warnings about assignments inside conditionals
				eqnull: true, // Suppress warnings about == null
				browser: true, // Assume a browser environment
				globals: { // Define global variables
					jQuery: true,
					Markdown: true,
					console: true // Allow console.log etc.
				}
			},
			sourceFiles: 'source/scripts/app.js'
		},

		// Minify JavaScript files
		minifyScripts: {
			options: {
				header: '<%= outputHeader %>', // Add the defined header
				mangle: {
					reserved: ['jQuery'] // Prevent mangling of jQuery
				}
			},
			production: {
				files: {
					'dist/app.min.js': ['source/scripts/app.js']
				}
			}
		},

		// Process markdown content for RSS feed generation
		contentProcessor: {
			rssFeed: {
				files: {
					'feeds/rss_feed.xml': ['build/temp/latest_entry.md']
				},
				options: {
					template: 'templates/rss_layout.xml', // Base XML template
					templateContext: {
						generationTimestamp: (new Date()).toISOString(), // ISO 8601 timestamp
						feedVersion: buildKit.config.projectMeta.version // Include project version
					},
					// Pre-processing hook for markdown source
					preProcessContent: function (inputSrc) {
						// Replace Twitter mentions and image paths
						const twitterPattern = /\[@(\\?)(\w+)\]\(\)/g;
						const imagePathPattern = /\/assets\/images\//g;

						return inputSrc
								.replace(twitterPattern, '[@$1$2](https://twitter.com/$2)')
								.replace(imagePathPattern, 'https://my-website.org/assets/images/');
					},
					// Post-processing hook for generated HTML
					postProcessContent: function (processedHtml) {
						const itemTemplate = buildKit.file.read('templates/rss_item_snippet.xml');
						const itemDelimiter = '<h2>'; // Split by H2 tags for individual items

						// Ensure there are items to process
						if (!processedHtml.includes(itemDelimiter)) {
							buildKit.log.warn('No H2 tags found for RSS item splitting.');
							return '';
						}

						return processedHtml.split(itemDelimiter)
							.slice(1) // Skip content before the first H2
							.map(function (itemPart) {
								const titleMatch = itemPart.match(/(.+?)<\/h2>/);
								const itemTitle = titleMatch ? titleMatch[1].trim() : 'Untitled Post';
								const uniqueId = `https://my-website.org/posts/#${encodeURIComponent(itemTitle.replace(/[\s,]/g, '_'))}`;

								// Process template for each RSS item
								return buildKit.template.process(itemTemplate, {
									data: {
										entryTitle: itemTitle,
										entryId: uniqueId,
										entryContent: itemPart // Include the rest of the HTML
									}
								});
							}).join('');
					},
					markupOptions: {
						gfm: true, // GitHub Flavored Markdown
						pedantic: false // Don't be pedantic
					}
				}
			}
		},

		// Local development server setup
		localWebServer: {
			dev: {
				options: {
					port: 9000, // Default server port
					hostname: 'localhost', // Accessible from local machine only
					base: 'public', // Root directory for serving files
					open: true // Open browser automatically
				}
			}
		},

		// File change monitor for live reloading
		fileChangeMonitor: {
			options: {
				liveReloading: true // Enable live browser reloading
			},
			styles: {
				files: ['source/styles/**/*.scss'],
				tasks: ['rebuildStyles']
			},
			scripts: {
				files: ['source/scripts/**/*.js'],
				tasks: ['rebuildScripts']
			},
			content: {
				files: ['source/content/**/*.md', 'source/content/main/*.md'],
				tasks: ['rebuildContent']
			},
			html: {
				files: ['public/index.html'],
				tasks: ['validateMarkup']
			},
			// New: Watch for changes in package.json to update project metadata
			meta: {
				files: ['package.json'],
				tasks: ['log:Project metadata updated.'] // Custom log task
			}
		}
	});

	// Load all Grunt plugins defined in package.json
	buildKit.loadPlugins();

	// Define custom build tasks
	buildKit.defineTask('rebuildStyles', ['scssCompiler', 'browserPrefixer', 'minifyStyles', 'assetBundler:styleSheets']);
	buildKit.defineTask('rebuildScripts', ['scriptLinter', 'minifyScripts']);
	buildKit.defineTask('rebuildContent', ['mergeContent', 'assetBundler:documentation', 'artifactCleaner:ephemeralDocs']);
	buildKit.defineTask('validateMarkup', ['markupValidator']);

	// A dummy task for logging messages, could be expanded for more complex logging
	buildKit.defineTask('log', function (message) {
		buildKit.log.ok(message);
	});

	// Main daily build process
	buildKit.defineTask('fullBuild', [
		'rebuildStyles',
		'rebuildScripts',
		'mergeContent', // Assume 'mergeContent' is another custom task or a plugin
		'validateMarkup',
		'assetBundler:documentation',
		'contentProcessor:rssFeed',
		'artifactCleaner:ephemeralDocs'
	]);

	// Task to start the development environment
	buildKit.defineTask('startDevServer', ['localWebServer', 'fileChangeMonitor']);

	// Default task runs a full build
	buildKit.defineTask('default', ['fullBuild']);

	// Load any custom tasks defined in the 'tasks' directory
	buildKit.loadCustomModules('tasks');

};