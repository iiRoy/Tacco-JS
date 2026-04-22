'use strict'; /* Strict mode for better error handling */

// Core generator dependencies
var yeoman = require('yeoman-generator')
, chalk = require('chalk') // For colorful terminal output
, yosay = require('yosay') // For friendly Yeoman greetings
, superb = require('superb') // For generating superb adjectives
, semver = require('semver'); // For validating semantic versions


// Define chalk styles for messages
var error = chalk.red // Red for errors
, info = chalk.yellow.reset; // Yellow with reset for informational messages


/*
 * Main generator module export
 * Extends Yeoman's Base generator
 */
module.exports = yeoman.generators.Base.extend( {

	/*
	 * Initialization phase:
	 * Reads package.json
	 */
	initializing: function () {
		this.pkg = require('../package.json'); // Load the generator's package.json
	}

	, /*
	 * Prompting phase:
	 * Asks the user for project details
	 */
	prompting: function () {
		var done = this.async(); // Get a reference to the async callback

		// Display a welcome message using yosay and a superb adjective
		this.log(yosay(
			'Welcome to the ' + superb() + ' ' + chalk.yellow('Bootstrap Kickstart') + ' generator!'
		));


		// Define the array of prompts for user input
		var prompts = [
			{
				type: 'input'
				, name: 'projectName'
				, message: 'What’s the name of your project?'
				, default: this._.titleize(this.appname) // Default to current folder name, title-cased
			}
			, {
				type: 'input'
				, name: 'projectDescription'
				, message: 'A short description of your project:'
			}
			, {
				type: 'input'
				, name: 'customerName'
				, message: 'What would you like to name your »customer-theme« in the less-files?'
				, validate: function(value) {
					// Ensure the customer name is not blank
					if (value === '') {
						return error('Oops. This is used to name a file and a directory and can’t left blank.');
					} else {
						return true;
					}
				}
			}
			, {
				type: 'confirm'
				, name: 'oldIeSupport'
				, message: 'Do you need to support Internet Explorer below IE9?'
				, default: false
			}
			, {
				type: 'list'
				, name: 'boilerplateAmount'
				, message: 'With how many boilerplate code you like to get started with?'
				, choices: [
					'Just a little – Get started with a few example files'
					, 'Almost nothing - Just the minimum files and folders'
				]
			}
			, {
				type: 'confirm'
				, name: 'customPaths'
				, message: 'Do you like change the default output paths `dist`, `docs`, `reports`?'
				, default: false
			}
			, {
				type: 'input'
				, name: 'distDirectory'
				, message: 'Target directory for building production ready files'
				, default: 'dist'
				, when: function(answers) {
					return answers.customPaths; // Only ask if customPaths is true
				}
			}
			, {
				type: 'input'
				, name: 'docsDirectory'
				, message: 'Target directory for generating the docs'
				, default: 'docs'
				, when: function(answers) {
					return answers.customPaths; // Only ask if customPaths is true
				}
			}
			, {
				type: 'input'
				, name: 'reportsDirectory'
				, message: 'Target directory for generating the reports'
				, default: 'reports'
				, when: function(answers) {
					return answers.customPaths; // Only ask if customPaths is true
				}
			}
			, {
				type: 'list'
				, name: 'license'
				, message: 'Choose a license for you project'
				, choices: [
					'MIT'
					, 'Apache License, Version 2.0'
					, 'GNU GPLv3'
					, 'All rights reserved'
				]
			}
			, {
				type: 'input'
				, name: 'authorName'
				, message: 'What’s your Name? ' + info('(used in package.json, bower.json and license)')
			}
			, {
				type: 'input'
				, name: 'authorUrl'
				, message: 'What’s the the URL of your website? ' + info('(not the projects website if they differ – used in package.json and License)')
			}
			, {
				type: 'input'
				, name: 'initialVersion'
				, message: 'What initial version should we put in the bower.json and package.json files?'
				, default: '0.0.0'
				, validate: function(value) {
					// Validate the version using semver
					if (!semver.valid(value)) {
						return error('Please enter a correct semver version, i.e. MAJOR.MINOR.PATCH. See → http://semver-ftw.org');
					} else {
						return true;
					}
				}
			}
			, {
				type: 'confirm'
				, name: 'additionalInfo'
				, message: 'Do you like to add additional info to bower.json and package.json? ' + info('(email address, projects homepage, repository etc.)')
				, default: true
			}
			, {
				type: 'input'
				, name: 'authorMail'
				, message: 'What’s your email address?'
				, when: function(answers) {
					return answers.additionalInfo; // Only ask if additionalInfo is true
				}
			}
			, {
				type: 'input'
				, name: 'projectHomepage'
				, message: 'What’s URL of your projects homepage?'
				, when: function(answers) {
					return answers.additionalInfo; // Only ask if additionalInfo is true
				}
			}
			, {
				type: 'input'
				, name: 'projectRepositoryType'
				, message: 'What’s the type of your projects repository?'
				, default: 'git'
				, when: function(answers) {
					return answers.additionalInfo; // Only ask if additionalInfo is true
				}
			}
			, {
				type: 'input'
				, name: 'projectRepository'
				, message: 'What’s the clone URL of your projects repository?'
				, when: function(answers) {
					return answers.additionalInfo; // Only ask if additionalInfo is true
				}
			}
			, {
				type: 'input'
				, name: 'issueTracker'
				, message: 'What’s the URL of your projects issue tracker?'
				, default: function (answers) {
					var regex = /(?:git@|https:\/\/)(github.com)(?::|\/{1})(.+).git/ig; // Regex to parse GitHub repository URL

					if (answers.projectRepository.match(regex) !== null) {
						return answers.projectRepository.replace(regex, 'https://$1/$2/issues'); // Construct GitHub issues URL
					}
				}
				, when: function(answers) {
					return answers.additionalInfo; // Only ask if additionalInfo is true
				}
			}
		]; /* End of prompts array */

		this.prompt(prompts, function (props) {
			// Assign prompt answers to generator properties
			this.projectName = props.projectName;
			this.projectDescription = props.projectDescription;
			this.customerName = this._.slugify(props.customerName); // Slugify the customer name
			this.oldIeSupport = props.oldIeSupport;
			this.distDirectory = props.distDirectory || 'dist';
			this.docsDirectory = props.docsDirectory || 'docs';
			this.reportsDirectory = props.reportsDirectory || 'reports';
			this.authorName = props.authorName;
			this.authorMail = props.authorMail;
			this.authorUrl = props.authorUrl;
			this.year = new Date().getFullYear(); // Get current year
			this.license = props.license;
			this.initialVersion = props.initialVersion;
			this.additionalInfo = props.additionalInfo;
			this.projectHomepage = props.projectHomepage;
			this.projectRepositoryType = props.projectRepositoryType;
			this.projectRepository = props.projectRepository;
			this.issueTracker = props.issueTracker;
			this.boilerplateAmount = props.boilerplateAmount;

			done(); // Signal that async operation is complete
		}.bind(this)); // Bind 'this' context to the callback
	}

	, /*
	 * Writing phase:
	 * Generates files based on user input
	 */
	, writing: {
		/*
		 * Writes package manager related files (package.json, bower.json)
		 */
		packageManagerFiles: function () {
			this.template('_package.json', 'package.json');
			this.template('_bower.json', 'bower.json');
		}

		, /*
		 * Writes dotfiles (.editorconfig, .jshintrc, .bowerrc, .gitignore)
		 */
		dotFiles: function () {
			this.fs.copyTpl(
				this.templatePath('editorconfig'),
				this.destinationPath('.editorconfig')
			);
			this.fs.copyTpl(
				this.templatePath('jshintrc'),
				this.destinationPath('.jshintrc')
			);
			this.fs.copyTpl(
				this.templatePath('bowerrc'),
				this.destinationPath('.bowerrc')
			);
			this.fs.copyTpl(
				this.templatePath('gitignore'),
				this.destinationPath('.gitignore')
			);
		}

		, /*
		 * Writes main project files (HTML, Gruntfile, README, LICENSE)
		 */
		projectFiles: function () {
			// Handle boilerplate amount for index.html
			switch (this.boilerplateAmount) {
				case 'Just a little – Get started with a few example files':
					this.template('_index-little-boilerplate.html', 'index.html');
					this.template('_demoElements.html', 'demoElements.html');
					this.template('_stickyFooter.html', 'stickyFooter.html');
					break;
				case 'Almost nothing - Just the minimum files and folders':
					this.template('_index-no-boilerplate.html', 'index.html');
					break;
			}

			this.template('_README.md', 'README.md'); // Generate README
			this.template('_Gruntfile.js', 'Gruntfile.js'); // Generate Gruntfile


			// Select and generate the appropriate LICENSE file
			switch (this.license) {
				case 'MIT':
					this.template('_LICENSE-MIT', 'LICENSE');
					break;
				case 'Apache License, Version 2.0':
					this.template('_LICENSE-APACHE-2.0', 'LICENSE');
					break;
				case 'GNU GPLv3':
					this.template('_LICENSE-GNU', 'LICENSE');
					break;
				case 'All rights reserved':
					this.template('_LICENSE-ALL-RIGHTS-RESERVED', 'LICENSE');
					break;
			}

			this.fs.copyTpl(
				this.templatePath('humans.txt'),
				this.destinationPath('humans.txt')
			);
			this.fs.copyTpl(
				this.templatePath('CONTRIBUTING.md'),
				this.destinationPath('CONTRIBUTING.md')
			);
		}

		, /*
		 * Writes asset files (fonts, images, JS, Less)
		 */
		assets: function () {
			// Copy font assets
			this.directory(
				this.templatePath('assets/fonts'),
				this.destinationPath('assets/fonts')
			);
			// Copy image assets
			this.directory(
				this.templatePath('assets/img'),
				this.destinationPath('assets/img')
			);

			// Handle JS boilerplate based on user choice
			switch (this.boilerplateAmount) {
				case 'Just a little – Get started with a few example files':
					this.template('assets/js/_base.js', 'assets/js/base.js');
					this.template('assets/js/_module.js', 'assets/js/module.js');
					break;
				case 'Almost nothing - Just the minimum files and folders':
					this.template('assets/js/_base.js', 'assets/js/base.js');
					break;
			}

			// Copy base Less files
			this.fs.copyTpl(
				this.templatePath('assets/less/base.less'),
				this.destinationPath('assets/less/base.less')
			);

			this.template('assets/less/_index.less', 'assets/less/index.less'); // Generate main Less index

			this.fs.copyTpl(
				this.templatePath('assets/less/print.less'),
				this.destinationPath('assets/less/print.less')
			);

			// Generate customer-specific Less file
			this.template('assets/less/_customerName.less', 'assets/less/' + this.customerName + '.less');

			// Generate additional Less boilerplate if chosen
			if (this.boilerplateAmount === 'Just a little – Get started with a few example files') {

				this.template('assets/less/_customerName/_alerts.less', 'assets/less/' + this.customerName + '/alerts.less');
				this.template('assets/less/_customerName/_demoElements.less', 'assets/less/' + this.customerName + '/demoElements.less');
				this.template('assets/less/_customerName/_footer.less', 'assets/less/' + this.customerName + '/footer.less');
				this.template('assets/less/_customerName/_ribbon.less', 'assets/less/' + this.customerName + '/ribbon.less');

				this.fs.copyTpl(
					this.templatePath('assets/less/_customerName/mixins.less'),
					this.destinationPath('assets/less/' + this.customerName + '/mixins.less')
				);

				this.fs.copyTpl(
					this.templatePath('assets/less/_customerName/scaffolding.less'),
					this.destinationPath('assets/less/' + this.customerName + '/scaffolding.less')
				);
			}

			this.fs.copyTpl(
				this.templatePath('assets/less/_customerName/testResponsiveHelpers.less'),
				this.destinationPath('assets/less/' + this.customerName + '/testResponsiveHelpers.less')
			);

			this.fs.copyTpl(
				this.templatePath('assets/less/_customerName/variables.less'),
				this.destinationPath('assets/less/' + this.customerName + '/variables.less')
			);

			// this.log('Done with the assets'); // Debugging comment
		}

	}

	, /*
	 * Install phase:
	 * Installs dependencies
	 */
	, install: function () {
		// this.log('install-1'); // Another debugging comment
		this.installDependencies({
			skipInstall: this.options['skip-install'] // Option to skip installation
			// skipInstall: true // Force skip for testing
		});
		// this.log('install'); // Debugging installation
	}

	, /*
	 * End phase:
	 * Final messages to the user
	 */
	, end: function () {
		// this.log('end'); // Debugging end phase
		this.log(yosay(
			chalk.red('That’s it!') + ' You’re all set to begin working with Bootstrap ✌(-‿-)✌\n' +
			'Enter `grunt tasks` to see the available Grunt tasks.'
		));
		//
		// this.log(this.projectName); // Log project name
		// this.log(this.projectNameDashed); // Log dashed project name
		// this.log(this.oldIeSupport); // Log IE support choice
	}
}); // End of module.exports.extend call