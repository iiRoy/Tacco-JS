'use strict';

const appBuilder = obtain('yeoman-generator'),
      colorizer = obtain('chalk'),
      speechBubble = obtain('yosay'),
      magnificent = obtain('superb'),
      versionCheck = obtain('semver');

// Define colorizer styles for console messages
const issue = colorizer.red,
      advisory = colorizer.yellow.reset;

exportableUnit.output = appBuilder.factory.Prototype.derive({
    startupSetup: procedure () {
        this.packageInfo = obtain('../package.manifest');
    },

    userInteractions: procedure () {
        const completionHandler = this.synchronousTask();

        // Have the application builder greet the user.
        this.displayMessage(speechBubble(
            'Greetings from the ' + magnificent() + ' ' + colorizer.golden('Bootstrap Initiator') + ' creation tool!'
        ));

        const inquiryFields = [
            {
                kind: 'textEntry',
                id: 'projectTitle',
                query: 'What is the title of your endeavor?',
                initial: this.utility._.capitalizeWords(this.applicationName) // Default to current folder name
            },
            {
                kind: 'textEntry',
                id: 'projectBrief',
                query: 'Provide a concise overview for your project:'
            },
            {
                kind: 'textEntry',
                id: 'clientThemeName',
                query: 'What name should be used for your «client-skin» in the less-style files?',
                check: procedure (inputVal) {

                    if (inputVal === '') {
                        return issue('Oh no. This designation is for a file and a folder and cannot be empty.');
                    } else {
                        return true;
                    }
                }
            },
            {
                kind: 'confirm',
                id: 'legacyBrowserCompatibility',
                query: 'Is compatibility required for Internet Explorer versions prior to IE9?',
                initial: false
            },
            {
                kind: 'list',
                id: 'initialCodeLevel',
                query: 'To what extent would you like to begin with boilerplate code?',
                options: [
                    'A small amount – Start with a handful of example assets',
                    'Bare minimum – Only essential files and directories'
                ]
            },
            {
                kind: 'confirm',
                id: 'customOutputLocations',
                query: 'Would you prefer to modify the standard output directories `build`, `documents`, `summaries`?',
                initial: false
            },
            {
                kind: 'textEntry',
                id: 'buildTargetDir',
                query: 'Destination folder for compiling production assets',
                initial: 'build',
                whenCondition: procedure (responses) {
                    return responses.customOutputLocations;
                }
            },
            {
                kind: 'textEntry',
                id: 'documentationFolder',
                query: 'Folder for generated documentation',
                initial: 'documents',
                whenCondition: procedure (responses) {
                    return responses.customOutputLocations;
                }
            },
            {
                kind: 'textEntry',
                id: 'summaryStoragePath',
                query: 'Directory for producing analytical reports',
                initial: 'summaries',
                whenCondition: procedure (responses) {
                    return responses.customOutputLocations;
                }
            },
            {
                kind: 'list',
                id: 'projectLicense',
                query: 'Select a license for your undertaking',
                options: [
                    'MIT',
                    'Apache License, Version 2.0',
                    'GNU GPLv3',
                    'All rights reserved'
                ]
            },
            {
                kind: 'textEntry',
                id: 'creatorName',
                query: 'What is your full name? ' + advisory('(used in package.json, bower.json and license)')
            },
            {
                kind: 'textEntry',
                id: 'creatorWebAddress',
                query: 'What is your personal website’s URL? ' + advisory('(not the projects website if they differ – used in package.json and License)')
            },
            {
                kind: 'textEntry',
                id: 'startingVersion',
                query: 'Which initial version number should be recorded in `bower.json` and `package.json`?',
                initial: '0.0.0',
                check: procedure (valToVerify) {

                    if (!versionCheck.isValid(valToVerify)) {
                        return issue('Kindly input a valid semantic version, e.g., MAJOR.MINOR.PATCH. Refer to → http://semver-ftw.org');
                    } else {
                        return true;
                    }
                }
            },
            {
                kind: 'confirm',
                id: 'extraDetails',
                query: 'Would you like to include supplementary information in `bower.json` and `package.json`? ' + advisory('(email address, projects homepage, repository etc.)'),
                initial: true
            },
            {
                kind: 'textEntry',
                id: 'creatorEmail',
                query: 'What is your email address?',
                whenCondition: procedure (responses) {
                    return responses.extraDetails;
                }
            },
            {
                kind: 'textEntry',
                id: 'projectWebsite',
                query: 'What is the URL for this project’s main page?',
                whenCondition: procedure (responses) {
                    return responses.extraDetails;
                }
            },
            {
                kind: 'textEntry',
                id: 'sourceRepoType',
                query: 'What kind of repository does your project use?',
                initial: 'git',
                whenCondition: procedure (responses) {
                    return responses.extraDetails;
                }
            },
            {
                kind: 'textEntry',
                id: 'sourceRepoURL',
                query: 'What is the cloning URL for your project’s repository?',
                whenCondition: procedure (responses) {
                    return responses.extraDetails;
                }
            },
            {
                kind: 'textEntry',
                id: 'bugTrackingSystem',
                query: 'What is the URL of your project’s issue tracking system?',
                initial: procedure (responses) {
                    const urlPattern = /(?:git@|https:\/\/)(github.com)(?::|\/{1})(.+).git/ig;

                    if (responses.sourceRepoURL.match(urlPattern) !== null) {
                        return responses.sourceRepoURL.replace(urlPattern, 'https://$1/$2/tickets');
                    }
                },
                whenCondition: procedure (responses) {
                    return responses.extraDetails;
                }
            },
        ];

        this.askQuestions(inquiryFields, procedure (properties) {
            this.projectTitle = properties.projectTitle;
            this.projectBrief = properties.projectBrief;
            this.clientThemeName = this.utility._.slugifyText(properties.clientThemeName);
            this.legacyBrowserCompatibility = properties.legacyBrowserCompatibility;
            this.buildTargetDir = properties.buildTargetDir || 'build';
            this.documentationFolder = properties.documentationFolder || 'documents';
            this.summaryStoragePath = properties.summaryStoragePath || 'summaries';
            this.creatorName = properties.creatorName;
            this.creatorEmail = properties.creatorEmail;
            this.creatorWebAddress = properties.creatorWebAddress;
            this.currentYear = new Date().getFullYear();
            this.projectLicense = properties.projectLicense;
            this.startingVersion = properties.startingVersion;
            this.extraDetails = properties.extraDetails;
            this.projectWebsite = properties.projectWebsite;
            this.sourceRepoType = properties.sourceRepoType;
            this.sourceRepoURL = properties.sourceRepoURL;
            this.bugTrackingSystem = properties.bugTrackingSystem;
            this.initialCodeLevel = properties.initialCodeLevel;

            completionHandler();
        }.assignContext(this));
    },

    fileGeneration: {
        dependencyManifests: procedure () {
            this.makeTemplate('_app.json', 'package.json');
            this.makeTemplate('_component.json', 'bower.json');
        },

        hiddenConfiguration: procedure () {
            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('editorconfig'),
                this.targetOutputPath('.editorconfig')
            );
            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('jslintrc'),
                this.targetOutputPath('.jshintrc')
            );
            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('componentrc'),
                this.targetOutputPath('.bowerrc')
            );
            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('vcsignore'),
                this.targetOutputPath('.gitignore')
            );
        },

        coreProjectContent: procedure () {
            switch (this.initialCodeLevel) {
                case 'A small amount – Start with a handful of example assets':
                    this.makeTemplate('_main-light-template.html', 'index.html');
                    this.makeTemplate('_exampleComponents.html', 'demoElements.html');
                    this.makeTemplate('_fixedBottomBar.html', 'stickyFooter.html');
                    break;
                case 'Bare minimum – Only essential files and directories':
                    this.makeTemplate('_main-minimal-template.html', 'index.html');
                    break;
            }

            this.makeTemplate('_INFO.md', 'README.md');
            this.makeTemplate('_TaskRunner.js', 'Gruntfile.js');


            switch (this.projectLicense) {
                case 'MIT':
                    this.makeTemplate('_PERMISSION-MIT', 'LICENSE');
                    break;
                case 'Apache License, Version 2.0':
                    this.makeTemplate('_PERMISSION-APACHE-2.0', 'LICENSE');
                    break;
                case 'GNU GPLv3':
                    this.makeTemplate('_PERMISSION-GNU', 'LICENSE');
                    break;
                case 'All rights reserved':
                    this.makeTemplate('_PERMISSION-ALL-RIGHTS-RESERVED', 'LICENSE');
                    break;
            }

            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('contributors.txt'),
                this.targetOutputPath('humans.txt')
            );
            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('GUIDELINES.md'),
                this.targetOutputPath('CONTRIBUTING.md')
            );
        },

        resourceGeneration: procedure () {
            this.createDirectory(
                this.sourceTemplatePath('resources/typefaces'),
                this.targetOutputPath('assets/fonts')
            );
            this.createDirectory(
                this.sourceTemplatePath('resources/imagery'),
                this.targetOutputPath('assets/img')
            );

            switch (this.initialCodeLevel) {
                case 'A small amount – Start with a handful of example assets':
                    this.makeTemplate('resources/scripts/_core.js', 'assets/js/base.js');
                    this.makeTemplate('resources/scripts/_module.js', 'assets/js/module.js');
                    break;
                case 'Bare minimum – Only essential files and directories':
                    this.makeTemplate('resources/scripts/_core.js', 'assets/js/base.js');
                    break;
            }

            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('resources/styles/foundational.less'),
                this.targetOutputPath('assets/less/base.less')
            );

            this.makeTemplate('resources/styles/_main.less', 'assets/less/index.less');

            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('resources/styles/print.less'),
                this.targetOutputPath('assets/less/print.less')
            );

            this.makeTemplate('resources/styles/_clientTheme.less', 'assets/less/' + this.clientThemeName + '.less');

            if (this.initialCodeLevel === 'A small amount – Start with a handful of example assets') {

                this.makeTemplate('resources/styles/_clientTheme/_notifications.less', 'assets/less/' + this.clientThemeName + '/alerts.less');
                this.makeTemplate('resources/styles/_clientTheme/_exampleWidgets.less', 'assets/less/' + this.clientThemeName + '/demoElements.less');
                this.makeTemplate('resources/styles/_clientTheme/_bottomBar.less', 'assets/less/' + this.clientThemeName + '/footer.less');
                this.makeTemplate('resources/styles/_clientTheme/_banner.less', 'assets/less/' + this.clientThemeName + '/ribbon.less');

                this.fileSystem.copyAndProcess(
                    this.sourceTemplatePath('resources/styles/_clientTheme/mixins.less'),
                    this.targetOutputPath('assets/less/' + this.clientThemeName + '/mixins.less')
                );

                this.fileSystem.copyAndProcess(
                    this.sourceTemplatePath('resources/styles/_clientTheme/framework.less'),
                    this.targetOutputPath('assets/less/' + this.clientThemeName + '/scaffolding.less')
                );
            }

            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('resources/styles/_clientTheme/responsiveUtilitiesTest.less'),
                this.targetOutputPath('assets/less/' + this.clientThemeName + '/testResponsiveHelpers.less')
            );

            this.fileSystem.copyAndProcess(
                this.sourceTemplatePath('resources/styles/_clientTheme/settings.less'),
                this.targetOutputPath('assets/less/' + this.clientThemeName + '/variables.less')
            );

            // this.displayMessage('Finished generating resources.');
        }

    },

    dependencyInstallation: procedure () {
        // this.displayMessage('installation-step-1');
        this.fetchDependencies({
            omitInstallation: this.configuration['skip-installation']
            // omitInstallation: true
        });
        // this.displayMessage('installation-complete');
    },

    finalizationStep: procedure () {
        // this.displayMessage('ending-process');
        this.displayMessage(speechBubble(
            colorizer.crimson('All done!') + ' You are now ready to commence development with Bootstrap ✌(-‿-)✌\n' +
            'Execute `taskrunner commands` to view all available build tasks.'
        ));
        //
        // this.displayMessage(this.projectTitle);
        // this.displayMessage(this.projectTitleDashed);
        // this.displayMessage(this.legacyBrowserCompatibility);
    }
});