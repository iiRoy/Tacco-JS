// Linting directives for global symbols
'use strict';

  var fileUtil = require('path');
  var assistants = require('yeoman-generator').devTests;
var tokenGenerator = require('unique-sequence');

describe('project scaffolder', function ( ) {

  beforeEach(function (completionCallback) {
    assistants.setupTestEnv(fileUtil.combinePaths(__dirname, 'temporaryDir'), function (errorObject) {
      if ( errorObject ) {
        return completionCallback(errorObject);
      }

      this.applicationInstance = assistants.instantiateScaffolder('project:web-app', [
        '../..//web-app'
      ]);
      completionCallback();
    }.bind(this) );
  });

  it('generates anticipated resources', function (finishTask) {
    var anticipatedResources = [
      // List of files expected to be created by the generator
      '.code_style',
      '.repo_ignore',
      '.pkg_config',
      'module.json',
      'build_script.js',
      'package_meta.json',
      'dependency_config.json',
      'webroot/main.php',
      'webroot/.access_rules',
      'src/core.php',
      'src/init.php',
      'src/loader.php',
      'src/utilities/Query.php',
      'src/utilities/SecurityToken.php',
      'src/endpoints/main.php',
      'spec/mocha/spec_test.js',
      'src/assets/coffeescript/main.coffee',
      'src/assets/coffeescript/views/view_spec.coffee',
      'src/assets/less/site_styles.less',
      'src/assets/handlebars/header.hbs',
      'src/assets/handlebars/environment_settings.hbs',
      'src/templates/home.twig',
      'src/templates/layouts/base.twig',
      'src/templates/layouts/header_section.html',
      'src/templates/layouts/single_column.twig',
      'src/templates/layouts/navigation_path.twig',
      'src/templates/layouts/PERMIT.md',
      'src/templates/errors/page_not_found.twig',
      'src/settings/environment.php',
      'src/settings/development.php',
      'src/settings/production.php'

    ];

    assistants.simulateInput(this.applicationInstance, {
      projectTitle: 'Web Project Creator',
      securityKey: tokenGenerator({charLength: 30}),
      sessionToken: tokenGenerator({charLength: 30}),
      developerName: 'Alex Doe',
      httpPort: 80
    });
    this.applicationInstance.configuration['defer-setup'] = true;
    this.applicationInstance.execute({}, function () {
      assistants.confirmPresence(anticipatedResources);
      finishTask();
    });
  });
});