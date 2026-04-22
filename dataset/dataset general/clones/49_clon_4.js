class ConfigurationHandler {
    constructor(buildAPI) {
        this.api = buildAPI;
        this.settings = {};
        this.pluginLoadOrder = [];
        this.taskDefinitions = [];
        this.taskAliases = [];
        this.setupProcess();
    }

    setupProcess() {
        this.establishBaseParameters();
        this.organizeSourceFiles();
        this.configureBuildSteps();
        this.defineAutomationFlows();
    }

    establishBaseParameters() {
        this.settings.output_directory = 'assembly';
        const projectDetails = this.api.file.readJSON("package.json");
        this.settings.project_info = projectDetails;
        this.settings.boilerplate_text = `/*!\n * ${projectDetails.title || projectDetails.name} - v${projectDetails.version} - ${this.api.template.today("yyyy-mm-dd")}\n * ${projectDetails.homepage}\n *\n * Copyright (c) ${this.api.template.today("yyyy")} ${projectDetails.author}\n * Licensed ${projectDetails.licenses.type} <${projectDetails.licenses.url}>\n */\n`;
        this.settings.metadata = {
            caption: this.settings.boilerplate_text
        };
    }

    organizeSourceFiles() {
        this.settings.application_assets = {
            script_files: [ 'source/*.js', '!source/*.spec.js' ],
            html_templates: [ 'source/*.html' ],
            css_source: 'source/main.less',
            test_scripts: [ 'source/*.spec.js' ]
        };
        this.settings.external_libraries = {
            script_dependencies: [
                'thirdparty/jquery/jquery.min.js',
                'thirdparty/angular-unstable/angular.min.js',
                'thirdparty/hamsterjs/hamster.js',
                'thirdparty/angular-mousewheel/mousewheel.js',
                'thirdparty/google-code-prettify/src/prettify.js'
            ]
        };
    }

    configureBuildSteps() {
        this.settings.purge_targets = [ `<%= output_directory %>` ];

        this.settings.asset_transfer = {
            fonts: {
                files: [
                    {
                        expand: true,
                        src: [ 'thirdparty/font-awesome/build/assets/font-awesome/font/*' ],
                        dest: `<%= output_directory %>/font`,
                        flatten: true
                    }
                ]
            }
        };

        this.settings.code_concatenation = {
            application: {
                options: { banner: `<%= metadata.caption %>` },
                src: [ 'module.prefix', `<%= application_assets.script_files %>`, 'module.suffix' ],
                dest: `<%= output_directory %>/<%= project_info.name %>.js`
            },
            vendor: {
                src: [ `<%= external_libraries.script_dependencies %>` ],
                dest: `<%= output_directory %>/libs.js`
            }
        };

        this.settings.angular_dependency_injection_prep = {
            application: {
                src: [ `<%= output_directory %>/<%= project_info.name %>.js` ],
                dest: `<%= output_directory %>/<%= project_info.name %>.annotated.js`
            }
        };

        this.settings.script_minification = {
            options: {
                banner: `<%= metadata.caption %>`
            },
            application: {
                files: {
                    [`<%= output_directory %>/<%= project_info.name %>.min.js`]: [ `<%= output_directory %>/<%= project_info.name %>.annotated.js` ]
                }
            }
        };

        this.settings.stylesheet_compilation = {
            options: {
                compile: true,
                compress: false,
                noUnderscores: false,
                noIDs: false,
                zeroUnits: false
            },
            main_style: {
                src: [ `<%= application_assets.css_source %>` ],
                dest: `<%= output_directory %>/<%= project_info.name %>.css`
            },
            demonstration_style: {
                src: [ `<%= application_assets.css_source %>`, 'source/demo.less' ],
                dest: `<%= output_directory %>/<%= project_info.name %>-demo.css`
            }
        };

        this.settings.linting_checks = {
            source_code: [
                'Gruntfile.js',
                '<%= application_assets.script_files %>',
                '<%= application_assets.test_scripts %>'
            ],
            test_code: [
                '<%= application_assets.test_scripts %>'
            ],
            config_script: [
                'Gruntfile.js'
            ],
            options: {
                curly: true,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true
            },
            globals: {}
        };

        this.settings.unit_testing = {
            options: {
                configFile: 'karma/karma-unit.js'
            },
            background_mode: {
                background: true
            },
            single_pass_mode: {
                singleRun: true
            }
        };

        this.settings.file_watcher = {
            options: {
                livereload: true
            },
            config_change: {
                files: 'Gruntfile.js',
                tasks: [ 'linting_checks:config_script' ],
                options: {
                    livereload: false
                }
            },
            source_change: {
                files: [
                    '<%= application_assets.script_files %>'
                ],
                tasks: [ 'linting_checks:source_code', /*'unit_testing:background_mode:run',*/ 'code_concatenation:application', 'angular_dependency_injection_prep:application', 'script_minification:application' ]
            },
            html_change: {
                files: [ '<%= application_assets.html_templates %>' ],
                tasks: [ 'html_templating_processor' ]
            },
            style_change: {
                files: [ 'source/**/*.less' ],
                tasks: [ 'stylesheet_compilation' ]
            },
            test_change: {
                files: [
                    '<%= application_assets.test_scripts %>'
                ],
                tasks: [ 'linting_checks:test_code', 'unit_testing:background_mode:run' ],
                options: {
                    livereload: false
                }
            }
        };
    }

    defineAutomationFlows() {
        this.pluginLoadOrder = [
            'grunt-contrib-clean',
            'grunt-contrib-copy',
            'grunt-contrib-jshint',
            'grunt-contrib-concat',
            'grunt-contrib-watch',
            'grunt-contrib-uglify',
            'grunt-karma',
            'grunt-ngmin',
            'grunt-recess'
        ];

        this.taskAliases.push({ original: 'watch', replacement: 'file_watcher' });

        this.taskDefinitions.push({ name: 'monitor_build', steps: [ 'complete_build', /*'unit_testing:background_mode',*/ 'file_watcher' ] });
        this.taskDefinitions.push({ name: 'start_default', steps: [ 'complete_build' ] });
        this.taskDefinitions.push({ name: 'complete_build', steps: ['purge_targets', 'linting_checks', /*'unit_testing:single_pass_mode',*/ 'asset_transfer', 'code_concatenation', 'angular_dependency_injection_prep:application', 'script_minification', 'stylesheet_compilation', 'html_templating_processor'] });
        this.taskDefinitions.push({ name: 'fast_build', steps: ['purge_targets', 'linting_checks', 'test_execution', 'code_concatenation', 'stylesheet_compilation', 'html_templating_processor'] });

        this.taskDefinitions.push({
            name: 'html_templating_processor',
            description: 'Process HTML documents',
            action: function() {
                const destinationPath = this.api.config.get('output_directory');
                this.api.file.copy('source/index.html', `${destinationPath}/index.html`, { process: this.api.template.process });
                this.api.file.copy('source/sample1.html', `${destinationPath}/sample1.html`, { process: this.api.template.process });
            }.bind(this)
        });
    }

    execute() {
        this.pluginLoadOrder.forEach(plugin => this.api.loadNpmTasks(plugin));
        this.api.initConfig(this.settings);
        this.taskAliases.forEach(alias => this.api.renameTask(alias.original, alias.replacement));
        this.taskDefinitions.forEach(task => {
            if (task.action) {
                this.api.registerTask(task.name, task.description, task.action);
            } else {
                this.api.registerTask(task.name, task.steps);
            }
        });
    }
}

module.exports = (gruntHost) => {
    const builder = new ConfigurationHandler(gruntHost);
    builder.execute();
};