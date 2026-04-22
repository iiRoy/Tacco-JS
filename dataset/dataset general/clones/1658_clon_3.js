const getModule = require('yeoman-generator'); // Renamed `yeoman` to `getModule` for a more descriptive import
const consoleStyling = require('chalk'); // Renamed `chalk` to `consoleStyling`
const speechBubble = require('yosay'); // Renamed `yosay` to `speechBubble`
const adjectiveGen = require('superb'); // Renamed `superb` to `adjectiveGen`
const versionValidator = require('semver'); // Renamed `semver` to `versionValidator`

// Custom styling functions for generator output
const styleError = consoleStyling.red.bold; // Renamed `error` to `styleError`, added bold
const styleInfo = consoleStyling.yellow; // Renamed `info` to `styleInfo`

/**
 * Yeoman Generator for initiating new web projects.
 * Handles user input, file templating, and dependency installation.
 */
module.exports = getModule.generators.Base.extend({

	/**
	 * First execution phase: Initialization.
	 * Loads package metadata.
	 */
	initPhase: function () {
		// Ensure package manifest is loaded
		try {
			this.projectManifest = require('../package.json');
			this.outputMessage(`Generator version: ${this.projectManifest.version}`);
		} catch (err) {
			this.outputMessage(styleError('Error loading package.json: ') + err.message);
			this.projectManifest = { name: 'unknown-generator', version: '0.0.0' }; // Fallback
		}
	},

	/**
	 * Custom utility for logging styled messages.
	 * @param {string} msg The message to log.
	 * @param {string} [style='reset'] The chalk style to apply (e.g., 'red', 'yellow').
	 */
	outputMessage: function (msg, style = 'reset') {
		const chosenStyle = consoleStyling[style] || consoleStyling.reset;
		this.log(chosenStyle(msg));
	},

	/**
	 * Second execution phase: User Interaction.
	 * Gathers project configuration through interactive prompts.
	 */
	gatherUserInput: function () {
		const promptComplete = this.async(); // Callback to signal completion of prompting

		// Greet the user with a dynamic message
		const welcomeAdjective = adjectiveGen();
		const welcomeMessage = `Hello there! This wizard will help you kickstart a ${welcomeAdjective} ` +
							   consoleStyling.cyan('Bootstrap-powered project') + `!`;
		this.outputMessage(speechBubble(welcomeMessage));

		// Define the array of questions for the user
		const questionnaire = [
			{
				queryType: 'input',
				queryName: 'projectTitle',
				queryPrompt: 'What will be the primary name for your new application?',
				initialValue: this.util.formatTitle(this.appname || 'my-new-project'), // Default to current folder, formatted
				store: true // Store this answer for later access
			},
			{
				queryType: 'input',
				queryName: 'projectBrief',
				queryPrompt: 'Provide a concise description for your software:'
			},
			{
				queryType: 'input',
				queryName: 'clientThemeIdentifier',
				queryPrompt: 'How should your custom theme be identified in the LESS files (e.g., "my-brand")?',
				inputCheck: function(val) {
					if (!val || val.trim() === '') { // More robust check for empty string
						return styleError('This identifier is crucial for file and directory naming and cannot be left blank.');
					}
					return true;
				}
			},
			{
				queryType: 'confirm',
				queryName: 'legacyBrowserSupport',
				queryPrompt: 'Is support for Internet Explorer versions prior to IE9 a requirement?',
				initialValue: false
			},
			{
				queryType: 'list',
				queryName: 'starterContentLevel',
				queryPrompt: 'Select the amount of boilerplate code you’d like to begin with:',
				choices: [
					'A few examples – Includes basic HTML, CSS, and JS samples',
					'Minimal setup – Provides only the essential file structure'
				]
			},
			{
				queryType: 'confirm',
				queryName: 'overrideOutputPaths',
				queryPrompt: 'Would you like to customize the default output directories (e.g., `build`, `docs`, `reports`)?',
				initialValue: false
			},
			{
				queryType: 'input',
				queryName: 'buildOutputDirectory',
				queryPrompt: 'Specify the target folder for production-ready assets:',
				initialValue: 'build', // Changed from 'dist'
				conditionMet: (userResponses) => userResponses.overrideOutputPaths
			},
			{
				queryType: 'input',
				queryName: 'documentationDirectory',
				queryPrompt: 'Specify the target folder for generated documentation:',
				initialValue: 'docs',
				conditionMet: (userResponses) => userResponses.overrideOutputPaths
			},
			{
				queryType: 'input',
				queryName: 'analysisReportsDirectory',
				queryPrompt: 'Specify the target folder for code analysis reports:',
				initialValue: 'reports',
				conditionMet: (userResponses) => userResponses.overrideOutputPaths
			},
			{
				queryType: 'list',
				queryName: 'projectLicense',
				queryPrompt: 'Which open-source license best suits your project?',
				choices: [
					'MIT License', // Changed wording
					'Apache License, Version 2.0',
					'GNU General Public License v3.0', // Changed wording
					'Proprietary - All rights reserved' // Changed wording
				]
			},
			{
				queryType: 'input',
				queryName: 'contributorName',
				queryPrompt: 'What is your full name? ' + styleInfo('(Used in package.json, bower.json, and license files)')
			},
			{
				queryType: 'input',
				queryName: 'contributorWebUrl',
				queryPrompt: 'What is the URL of your personal website or portfolio? ' + styleInfo('(Not necessarily the project\'s website)')
			},
			{
				queryType: 'input',
				queryName: 'initialAppVersion',
				queryPrompt: 'What should be the starting version for your project (e.g., 0.1.0)?',
				initialValue: '0.1.0', // Changed default
				inputCheck: function(val) {
					if (!versionValidator.valid(val)) {
						return styleError('Please adhere to semantic versioning (MAJOR.MINOR.PATCH). Example: 1.2.3. More details at → http://semver.org'); // Updated URL
					}
					return true;
				}
			},
			{
				queryType: 'confirm',
				queryName: 'extraDetailsRequested',
				queryPrompt: 'Would you like to provide additional details for package.json and bower.json (e.g., email, homepage, repository)?',
				initialValue: true
			},
			{
				queryType: 'input',
				queryName: 'contributorEmail',
				queryPrompt: 'What is your primary email address?',
				conditionMet: (userResponses) => userResponses.extraDetailsRequested
			},
			{
				queryType: 'input',
				queryName: 'appHomepageUrl',
				queryPrompt: 'What is the URL for the project\'s official homepage?',
				conditionMet: (userResponses) => userResponses.extraDetailsRequested
			},
			{
				queryType: 'input',
				queryName: 'repoSystemType',
				queryPrompt: 'What type of version control system does your project use?',
				initialValue: 'git',
				conditionMet: (userResponses) => userResponses.extraDetailsRequested
			},
			{
				queryType: 'input',
				queryName: 'repoCloneUrl',
				queryPrompt: 'Provide the clone URL for your project\'s repository:',
				conditionMet: (userResponses) => userResponses.extraDetailsRequested
			},
			{
				queryType: 'input',
				queryName: 'bugTrackerUrl',
				queryPrompt: 'What is the URL for your project\'s issue tracker?',
				initialValue: function (userResponses) {
					// Attempt to auto-generate GitHub issue tracker URL
					const gitHubRegex = /(?:git@|https:\/\/)(github.com)(?::|\/)([^/]+\/[^/]+?)(?=\.git|\/|$)/i; // Refined regex
					const match = userResponses.repoCloneUrl ? userResponses.repoCloneUrl.match(gitHubRegex) : null;

					if (match && match[1] && match[2]) {
						return `https://${match[1]}/${match[2]}/issues`;
					}
					return ''; // Return empty string if no match
				},
				conditionMet: (userResponses) => userResponses.extraDetailsRequested
			}
		];

		// Process the collected user input
		this.prompt(questionnaire, (collectedData) => {
			// Assign all collected data to the generator instance for later use
			Object.assign(this, {
				projectTitle: collectedData.projectTitle,
				projectBrief: collectedData.projectBrief,
				clientThemeIdentifier: this.util.createSlug(collectedData.clientThemeIdentifier), // Slugify the identifier
				legacyBrowserSupport: collectedData.legacyBrowserSupport,
				buildOutputDirectory: collectedData.buildOutputDirectory || 'build', // Ensure default if customPaths was false
				documentationDirectory: collectedData.documentationDirectory || 'docs',
				analysisReportsDirectory: collectedData.analysisReportsDirectory || 'reports',
				contributorName: collectedData.contributorName,
				contributorEmail: collectedData.contributorEmail,
				contributorWebUrl: collectedData.contributorWebUrl,
				currentYear: new Date().getFullYear(), // Store current year
				projectLicense: collectedData.projectLicense,
				initialAppVersion: collectedData.initialAppVersion,
				extraDetailsRequested: collectedData.extraDetailsRequested,
				appHomepageUrl: collectedData.appHomepageUrl,
				repoSystemType: collectedData.repoSystemType,
				repoCloneUrl: collectedData.repoCloneUrl,
				bugTrackerUrl: collectedData.bugTrackerUrl,
				starterContentLevel: collectedData.starterContentLevel
			});

			promptComplete(); // Signal that prompts are finished
		}.bind(this));
	},

	/**
	 * Third execution phase: File Generation.
	 * Creates all project files based on user input.
	 */
	fileGeneration: {
		/**
		 * Helper function to simplify template copying.
		 * @param {string} src The source template file path.
		 * @param {string} dest The destination file path.
		 */
		_copyTemplate: function (src, dest) {
			this.processTemplate(this.sourceTemplatePath(src), this.targetOutputPath(dest));
		},

		/**
		 * Helper function to simplify direct file copying with templating.
		 * @param {string} src The source file path.
		 * @param {string} dest The destination file path.
		 */
		_copyFileWithTpl: function (src, dest) {
			this.fileSystem.copyAndRender(this.sourceTemplatePath(src), this.targetOutputPath(dest), this);
		},

		/**
		 * Generates configuration files for package managers.
		 */
		dependencyConfigFiles: function () {
			this._copyTemplate('_package.json', 'package.json');
			this._copyTemplate('_bower.json', 'bower.json');
		},

		/**
		 * Generates hidden configuration files (dotfiles).
		 */
		hiddenConfigurationFiles: function () {
			this._copyFileWithTpl('editorconfig', '.editorconfig');
			this._copyFileWithTpl('jshintrc', '.jshintrc');
			this._copyFileWithTpl('bowerrc', '.bowerrc');
			this._copyFileWithTpl('gitignore', '.gitignore');
		},

		/**
		 * Generates core project files and documentation.
		 */
		coreProjectTemplates: function () {
			// Handle different boilerplate levels for index file
			if (this.starterContentLevel === 'A few examples – Includes basic HTML, CSS, and JS samples') {
				this._copyTemplate('_index-little-boilerplate.html', 'index.html');
				this._copyTemplate('_demoElements.html', 'demo-elements.html'); // Renamed
				this._copyTemplate('_stickyFooter.html', 'sticky-footer.html'); // Renamed
			} else if (this.starterContentLevel === 'Minimal setup – Provides only the essential file structure') {
				this._copyTemplate('_index-no-boilerplate.html', 'index.html');
			}

			this._copyTemplate('_README.md', 'README.md');
			this._copyTemplate('_Gruntfile.js', 'Gruntfile.js');

			// Determine and copy the appropriate license file
			if (this.projectLicense === 'MIT License') {
				this._copyTemplate('_LICENSE-MIT', 'LICENSE');
			} else if (this.projectLicense === 'Apache License, Version 2.0') {
				this._copyTemplate('_LICENSE-APACHE-2.0', 'LICENSE');
			} else if (this.projectLicense === 'GNU General Public License v3.0') {
				this._copyTemplate('_LICENSE-GNU', 'LICENSE');
			} else if (this.projectLicense === 'Proprietary - All rights reserved') {
				this._copyTemplate('_LICENSE-ALL-RIGHTS-RESERVED', 'LICENSE');
			}

			this._copyFileWithTpl('humans.txt', 'humans.txt');
			this._copyFileWithTpl('CONTRIBUTING.md', 'CONTRIBUTING.md');
		},

		/**
		 * Handles copying and templating of static assets (fonts, images, scripts, styles).
		 */
		staticResources: function () {
			this.copyDirectoryStructure(
				this.sourceTemplatePath('assets/fonts'),
				this.targetOutputPath('assets/fonts')
			);
			this.copyDirectoryStructure(
				this.sourceTemplatePath('assets/img'),
				this.targetOutputPath('assets/img')
			);

			// JavaScript files based on boilerplate level
			this._copyTemplate('assets/js/_base.js', 'assets/js/base-script.js'); // Renamed file
			if (this.starterContentLevel === 'A few examples – Includes basic HTML, CSS, and JS samples') {
				this._copyTemplate('assets/js/_module.js', 'assets/js/app-module.js'); // Renamed file
			}

			// LESS/CSS files
			this._copyFileWithTpl('assets/less/base.less', 'assets/less/base.less');
			this._copyTemplate('assets/less/_index.less', 'assets/less/main-styles.less'); // Renamed file
			this._copyFileWithTpl('assets/less/print.less', 'assets/less/print.less');

			// Ensure client theme identifier is valid before using
			if (!this.clientThemeIdentifier) {
				this.outputMessage(styleError('Client theme identifier is missing. Skipping theme-specific LESS files.'), 'red');
				return;
			}

			const themePath = `assets/less/${this.clientThemeIdentifier}`;
			this._copyTemplate('assets/less/_customerName.less', `${themePath}/theme-main.less`); // Renamed file structure

			if (this.starterContentLevel === 'A few examples – Includes basic HTML, CSS, and JS samples') {
				this._copyTemplate('assets/less/_customerName/_alerts.less', `${themePath}/_alerts.less`);
				this._copyTemplate('assets/less/_customerName/_demoElements.less', `${themePath}/_demo-elements.less`); // Renamed
				this._copyTemplate('assets/less/_customerName/_footer.less', `${themePath}/_footer.less`);
				this._copyTemplate('assets/less/_customerName/_ribbon.less', `${themePath}/_ribbon.less`);

				this._copyFileWithTpl(
					'assets/less/_customerName/mixins.less',
					`${themePath}/_mixins.less`
				);

				this._copyFileWithTpl(
					'assets/less/_customerName/scaffolding.less',
					`${themePath}/_scaffolding.less`
				);
			}

			this._copyFileWithTpl(
				'assets/less/_customerName/testResponsiveHelpers.less',
				`${themePath}/_responsive-helpers.less` // Renamed
			);

			this._copyFileWithTpl(
				'assets/less/_customerName/variables.less',
				`${themePath}/_variables.less`
			);

			this.outputMessage('All static resources have been processed.', 'green');
		}
	},

	/**
	 * Fourth execution phase: Dependency Installation.
	 * Installs project dependencies using npm and bower.
	 */
	dependencyInstallation: function () {
		this.outputMessage('Initiating dependency installation...', 'cyan');
		this.installProjectDependencies({
			skipDependencyInstall: this.options.skipDependencyInstall || false // Use renamed option, ensure boolean
		});
	},

	/**
	 * Final execution phase: Completion.
	 * Displays a summary message to the user.
	 */
	completionSummary: function () {
		this.outputMessage(speechBubble(
			consoleStyling.green('Success!') + ' Your project setup is complete! ✨\n' +
			'To view available tasks, run `grunt tasks` in your terminal.'
		));
	}
});