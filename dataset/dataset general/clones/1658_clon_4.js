'use strict';

const g_factory = require('yeoman-generator');
const color_util = require('chalk');
const speak_bubble = require('yosay');
const adjective_source = require('superb');
const version_checker = require('semver');

const issue_notifier_red = color_util.red;
const status_notifier_yellow = color_util.yellow.reset;

const string_formatter = {
    title_case: (text_val) => {
        if (!text_val) return '';
        return text_val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    },
    to_slug: (text_val) => {
        if (!text_val) return '';
        return text_val.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }
};

const preference_inquiries = new Map([
    ['project_identifier', {
        inquiry_type: 'input',
        field_name: 'project_identifier',
        query_text: 'What’s the designation for this creation?',
        default_value: (generator_instance) => string_formatter.title_case(generator_instance.appname)
    }],
    ['project_summary', {
        inquiry_type: 'input',
        field_name: 'project_summary',
        query_text: 'A concise description of this creation:'
    }],
    ['client_theme_name', {
        inquiry_type: 'input',
        field_name: 'client_theme_name',
        query_text: 'What name for your »client-style« in the less-files?',
        validation_rule: (user_input) => {
            if (user_input === '') {
                return issue_notifier_red('Alert. This names a file and folder and cannot be empty.');
            }
            return true;
        }
    }],
    ['legacy_browser_compatibility', {
        inquiry_type: 'confirm',
        field_name: 'legacy_browser_compatibility',
        query_text: 'Need to support web browsers older than IE9?',
        default_value: false
    }],
    ['starter_code_level', {
        inquiry_type: 'list',
        field_name: 'starter_code_level',
        query_text: 'How much initial code do you prefer?',
        possible_choices: [
            'Moderate boilerplate – Start with some example files',
            'Minimal boilerplate - Only essential files and folders'
        ]
    }],
    ['custom_output_locations', {
        inquiry_type: 'confirm',
        field_name: 'custom_output_locations',
        query_text: 'Modify standard output directories `dist`, `docs`, `reports`?',
        default_value: false
    }],
    ['distribution_folder', {
        inquiry_type: 'input',
        field_name: 'distribution_folder',
        query_text: 'Target folder for compiled production assets',
        default_value: 'dist',
        condition_check: (answers) => answers.custom_output_locations
    }],
    ['documentation_folder', {
        inquiry_type: 'input',
        field_name: 'documentation_folder',
        query_text: 'Target folder for documentation generation',
        default_value: 'docs',
        condition_check: (answers) => answers.custom_output_locations
    }],
    ['reporting_folder', {
        inquiry_type: 'input',
        field_name: 'reporting_folder',
        query_text: 'Target folder for report generation',
        default_value: 'reports',
        condition_check: (answers) => answers.custom_output_locations
    }],
    ['project_license_type', {
        inquiry_type: 'list',
        field_name: 'project_license_type',
        query_text: 'Select a license for this creation',
        possible_choices: [
            'MIT',
            'Apache License, Version 2.0',
            'GNU GPLv3',
            'All rights reserved'
        ]
    }],
    ['creator_name', {
        inquiry_type: 'input',
        field_name: 'creator_name',
        query_text: 'What is your full name? ' + status_notifier_yellow('(used in manifest, bower, and license files)')
    }],
    ['creator_web_address', {
        inquiry_type: 'input',
        field_name: 'creator_web_address',
        query_text: 'What is your personal website URL? ' + status_notifier_yellow('(not the project website if distinct – used in manifest and License)')
    }],
    ['initial_release_version', {
        inquiry_type: 'input',
        field_name: 'initial_release_version',
        query_text: 'What initial edition number for bower.json and package.json?',
        default_value: '0.0.0',
        validation_rule: (user_input) => {
            if (!version_checker.valid(user_input)) {
                return issue_notifier_red('Please input a valid semver string, e.g., MAJOR.MINOR.PATCH. Consult → http://semver-ftw.org');
            }
            return true;
        }
    }],
    ['extra_meta_details', {
        inquiry_type: 'confirm',
        field_name: 'extra_meta_details',
        query_text: 'Add supplementary data to bower.json and package.json? ' + status_notifier_yellow('(email, project homepage, repository, etc.)'),
        default_value: true
    }],
    ['creator_email', {
        inquiry_type: 'input',
        field_name: 'creator_email',
        query_text: 'What is your electronic mail address?',
        condition_check: (answers) => answers.extra_meta_details
    }],
    ['project_web_page', {
        inquiry_type: 'input',
        field_name: 'project_web_page',
        query_text: 'What is the URL for this creation\'s home page?',
        condition_check: (answers) => answers.extra_meta_details
    }],
    ['repository_system_type', {
        inquiry_type: 'input',
        field_name: 'repository_system_type',
        query_text: 'What is the version control system type?',
        default_value: 'git',
        condition_check: (answers) => answers.extra_meta_details
    }],
    ['repository_clone_url', {
        inquiry_type: 'input',
        field_name: 'repository_clone_url',
        query_text: 'What is the clone URL for this creation\'s repository?',
        condition_check: (answers) => answers.extra_meta_details
    }],
    ['bug_tracking_url', {
        inquiry_type: 'input',
        field_name: 'bug_tracking_url',
        query_text: 'What is the URL for this creation\'s issue tracker?',
        default_value_func: (answers) => {
            const pattern = /(?:git@|https:\/\/)(github.com)(?::|\/{1})(.+).git/ig;
            const match_result = answers.repository_clone_url.match(pattern);
            if (match_result !== null) {
                return answers.repository_clone_url.replace(pattern, 'https://$1/$2/issues');
            }
            return undefined;
        },
        condition_check: (answers) => answers.extra_meta_details
    }]
]);

const prepare_yeoman_inquiries = (generator_context, inquiry_map) => {
    const prepared_inquiries = [];
    for (const [key_name, config_obj] of inquiry_map.entries()) {
        const yeoman_prompt = {
            type: config_obj.inquiry_type,
            name: config_obj.field_name,
            message: config_obj.query_text
        };
        if (config_obj.default_value !== undefined) {
            yeoman_prompt.default = typeof config_obj.default_value === 'function' ? config_obj.default_value(generator_context) : config_obj.default_value;
        }
        if (config_obj.default_value_func !== undefined) {
            yeoman_prompt.default = (answers) => config_obj.default_value_func(answers);
        }
        if (config_obj.validation_rule) {
            yeoman_prompt.validate = config_obj.validation_rule;
        }
        if (config_obj.condition_check) {
            yeoman_prompt.when = config_obj.condition_check;
        }
        if (config_obj.possible_choices) {
            yeoman_prompt.choices = config_obj.possible_choices;
        }
        prepared_inquiries.push(yeoman_prompt);
    }
    return prepared_inquiries;
};

const FILE_OP = {
    TEMPLATE: 'template',
    COPY_TPL: 'copy_with_template',
    DIRECTORY: 'replicate_directory'
};

const artifact_generation_plan = {
    package_manager_files: [
        { type: FILE_OP.TEMPLATE, src: '_package.json', dest: 'package.json' },
        { type: FILE_OP.TEMPLATE, src: '_bower.json', dest: 'bower.json' }
    ],
    configuration_dot_files: [
        { type: FILE_OP.COPY_TPL, src: 'editorconfig', dest: '.editorconfig' },
        { type: FILE_OP.COPY_TPL, src: 'jshintrc', dest: '.jshintrc' },
        { type: FILE_OP.COPY_TPL, src: 'bowerrc', dest: '.bowerrc' },
        { type: FILE_OP.COPY_TPL, src: 'gitignore', dest: '.gitignore' }
    ],
    main_project_content: (answers) => {
        const files = [
            { type: FILE_OP.TEMPLATE, src: '_README.md', dest: 'README.md' },
            { type: FILE_OP.TEMPLATE, src: '_Gruntfile.js', dest: 'Gruntfile.js' },
            {
                type: FILE_OP.TEMPLATE,
                src_map: {
                    'MIT': '_LICENSE-MIT',
                    'Apache License, Version 2.0': '_LICENSE-APACHE-2.0',
                    'GNU GPLv3': '_LICENSE-GNU',
                    'All rights reserved': '_LICENSE-ALL-RIGHTS-RESERVED'
                },
                src_selector: answers.project_license_type,
                dest: 'LICENSE'
            },
            { type: FILE_OP.COPY_TPL, src: 'humans.txt', dest: 'humans.txt' },
            { type: FILE_OP.COPY_TPL, src: 'CONTRIBUTING.md', dest: 'CONTRIBUTING.md' }
        ];

        const html_boilerplate_map = {
            'Moderate boilerplate – Start with some example files': [
                { type: FILE_OP.TEMPLATE, src: '_index-little-boilerplate.html', dest: 'index.html' },
                { type: FILE_OP.TEMPLATE, src: '_demoElements.html', dest: 'demoElements.html' },
                { type: FILE_OP.TEMPLATE, src: '_stickyFooter.html', dest: 'stickyFooter.html' }
            ],
            'Minimal boilerplate - Only essential files and folders': [
                { type: FILE_OP.TEMPLATE, src: '_index-no-boilerplate.html', dest: 'index.html' }
            ]
        };
        const selected_html_files = html_boilerplate_map[answers.starter_code_level] || [];
        return files.concat(selected_html_files);
    },
    asset_resources: (answers) => {
        const asset_files = [
            { type: FILE_OP.DIRECTORY, src: 'assets/fonts', dest: 'assets/fonts' },
            { type: FILE_OP.DIRECTORY, src: 'assets/img', dest: 'assets/img' },
            { type: FILE_OP.COPY_TPL, src: 'assets/less/base.less', dest: 'assets/less/base.less' },
            { type: FILE_OP.TEMPLATE, src: 'assets/less/_index.less', dest: 'assets/less/index.less' },
            { type: FILE_OP.COPY_TPL, src: 'assets/less/print.less', dest: 'assets/less/print.less' },
            { type: FILE_OP.TEMPLATE, src: 'assets/less/_customerName.less', dest: `assets/less/${answers.client_theme_name}.less` },
            { type: FILE_OP.COPY_TPL, src: 'assets/less/_customerName/testResponsiveHelpers.less', dest: `assets/less/${answers.client_theme_name}/testResponsiveHelpers.less` },
            { type: FILE_OP.COPY_TPL, src: 'assets/less/_customerName/variables.less', dest: `assets/less/${answers.client_theme_name}/variables.less` }
        ];

        const js_boilerplate_map = {
            'Moderate boilerplate – Start with some example files': [
                { type: FILE_OP.TEMPLATE, src: 'assets/js/_base.js', dest: 'assets/js/base.js' },
                { type: FILE_OP.TEMPLATE, src: 'assets/js/_module.js', dest: 'assets/js/module.js' }
            ],
            'Minimal boilerplate - Only essential files and folders': [
                { type: FILE_OP.TEMPLATE, src: 'assets/js/_base.js', dest: 'assets/js/base.js' }
            ]
        };
        const selected_js_files = js_boilerplate_map[answers.starter_code_level] || [];
        asset_files.push(...selected_js_files);

        if (answers.starter_code_level === 'Moderate boilerplate – Start with some example files') {
            asset_files.push(
                { type: FILE_OP.TEMPLATE, src: 'assets/less/_customerName/_alerts.less', dest: `assets/less/${answers.client_theme_name}/alerts.less` },
                { type: FILE_OP.TEMPLATE, src: 'assets/less/_customerName/_demoElements.less', dest: `assets/less/${answers.client_theme_name}/demoElements.less` },
                { type: FILE_OP.TEMPLATE, src: 'assets/less/_customerName/_footer.less', dest: `assets/less/${answers.client_theme_name}/footer.less` },
                { type: FILE_OP.TEMPLATE, src: 'assets/less/_customerName/_ribbon.less', dest: `assets/less/${answers.client_theme_name}/ribbon.less` },
                { type: FILE_OP.COPY_TPL, src: 'assets/less/_customerName/mixins.less', dest: `assets/less/${answers.client_theme_name}/mixins.less` },
                { type: FILE_OP.COPY_TPL, src: 'assets/less/_customerName/scaffolding.less', dest: `assets/less/${answers.client_theme_name}/scaffolding.less` }
            );
        }
        return asset_files;
    }
};

const export_module = g_factory.generators.Base.extend({
    init_setup: function () {
        this.package_data = require('../package.json');
    },

    gather_user_preferences: function () {
        const completion_callback_getter = this.async();

        this.log(speak_bubble(
            'Welcome to the ' + adjective_source() + ' ' + color_util.yellow('Bootstrap Kickstart') + ' creation utility!'
        ));

        const processed_inquiries = prepare_yeoman_inquiries(this, preference_inquiries);

        this.prompt(processed_inquiries, (user_responses) => {
            this.project_identifier = user_responses.project_identifier;
            this.project_summary = user_responses.project_summary;
            this.client_theme_name = string_formatter.to_slug(user_responses.client_theme_name);
            this.legacy_browser_compatibility = user_responses.legacy_browser_compatibility;
            this.distribution_folder = user_responses.distribution_folder || 'dist';
            this.documentation_folder = user_responses.documentation_folder || 'docs';
            this.reporting_folder = user_responses.reporting_folder || 'reports';
            this.creator_name = user_responses.creator_name;
            this.creator_email = user_responses.creator_email;
            this.creator_web_address = user_responses.creator_web_address;
            this.current_year = new Date().getFullYear();
            this.project_license_type = user_responses.project_license_type;
            this.initial_release_version = user_responses.initial_release_version;
            this.extra_meta_details = user_responses.extra_meta_details;
            this.project_web_page = user_responses.project_web_page;
            this.repository_system_type = user_responses.repository_system_type;
            this.repository_clone_url = user_responses.repository_clone_url;
            this.bug_tracking_url = user_responses.bug_tracking_url;
            this.starter_code_level = user_responses.starter_code_level;

            completion_callback_getter();
        }).bind(this);
    },

    compose_project_artifacts: {
        package_manager_files_writer: function () {
            artifact_generation_plan.package_manager_files.forEach(op => {
                this.template(op.src, op.dest);
            });
        },

        configuration_dot_files_writer: function () {
            artifact_generation_plan.configuration_dot_files.forEach(op => {
                this.fs.copyTpl(
                    this.templatePath(op.src),
                    this.destinationPath(op.dest)
                );
            });
        },

        main_project_content_writer: function () {
            const operations = artifact_generation_plan.main_project_content(this);
            operations.forEach(op => {
                if (op.src_selector) {
                    const selected_src = op.src_map[op.src_selector];
                    if (selected_src) {
                        this.template(selected_src, op.dest);
                    }
                } else {
                    this.template(op.src, op.dest);
                }
            });
        },

        asset_resources_writer: function () {
            const operations = artifact_generation_plan.asset_resources(this);
            operations.forEach(op => {
                switch (op.type) {
                    case FILE_OP.TEMPLATE:
                        this.template(op.src, op.dest);
                        break;
                    case FILE_OP.COPY_TPL:
                        this.fs.copyTpl(
                            this.templatePath(op.src),
                            this.destinationPath(op.dest)
                        );
                        break;
                    case FILE_OP.DIRECTORY:
                        this.directory(
                            this.templatePath(op.src),
                            this.destinationPath(op.dest)
                        );
                        break;
                }
            });
        }
    },

    install_external_modules: function () {
        this.installDependencies({
            skipInstall: this.options['skip-install']
        });
    },

    finalize_process: function () {
        this.log(speak_bubble(
            issue_notifier_red('Completion!') + ' You are ready to start with Bootstrap ✌(-‿-)✌\n' +
            'Execute `grunt tasks` to view available Grunt operations.'
        ));
    }
});