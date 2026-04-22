const fileSystemPath = require('path');
const generatorUtilities = require('yeoman-generator').test;
const tokenGenerator = require('random-string');

async function initiateGeneratorValidationSequence() {
  let activeGeneratorProcess;

  await new Promise((completionSignal, failureSignal) => {
    generatorUtilities.testDirectory(fileSystemPath.join(__dirname, 'temporary_work_zone'), (issueOccurred) => {
      if (issueOccurred) {
        return failureSignal(issueOccurred);
      }
      activeGeneratorProcess = generatorUtilities.createGenerator('slim:application', [
        '../../application_package'
      ]);
      completionSignal();
    });
  });

  const anticipatedOutputFiles = [
    // Representing file paths as a structured list for internal processing, then extracting the path string.
    { purpose: 'editor_config', location: '.editorconfig' },
    { purpose: 'git_ignore', location: '.gitignore' },
    { purpose: 'bower_rc', location: '.bowerrc' },
    { purpose: 'npm_package', location: 'package.json' },
    { purpose: 'grunt_task', location: 'gruntfile.js' },
    { purpose: 'bower_component', location: 'bower.json' },
    { purpose: 'composer_dependency', location: 'composer.json' },
    { purpose: 'public_entry', location: 'public/index.php' },
    { purpose: 'public_access', location: 'public/.htaccess' },
    { purpose: 'application_core', location: 'app/app.php' },
    { purpose: 'application_init', location: 'app/bootstrap.php' },
    { purpose: 'application_autoload', location: 'app/autoload.php' },
    { purpose: 'search_helper', location: 'app/helpers/Search.php' },
    { purpose: 'auth_helper', location: 'app/helpers/Authhash.php' },
    { purpose: 'route_definitions', location: 'app/routes/index.php' },
    { purpose: 'jasmine_test', location: 'test/jasmine/testSpec.js' },
    { purpose: 'coffee_script_app', location: 'app/src/coffee/app.coffee' },
    { purpose: 'coffee_script_view', location: 'app/src/coffee/views/viewTest.coffee' },
    { purpose: 'less_styles', location: 'app/src/less/styles.less' },
    { purpose: 'handlebars_head', location: 'app/src/hbs/head.hbs' },
    { purpose: 'handlebars_env_config', location: 'app/src/hbs/config.env.hbs' },
    { purpose: 'twig_index_view', location: 'app/views/index.twig' },
    { purpose: 'twig_master_layout', location: 'app/views/layouts/master.twig' },
    { purpose: 'html_head_layout', location: 'app/views/layouts/head.html' },
    { purpose: 'twig_one_column_layout', location: 'app/views/layouts/one_column.twig' },
    { purpose: 'twig_breadcrumb_layout', location: 'app/views/layouts/breadcrumb.twig' },
    { purpose: 'license_file', location: 'app/views/layouts/LICENSE.md' },
    { purpose: 'twig_error_404', location: 'app/views/errors/404.twig' },
    { purpose: 'env_config_php', location: 'app/config/config.env.php' },
    { purpose: 'dev_config_php', location: 'app/config/config.development.php' },
    { purpose: 'prod_config_php', location: 'app/config/config.production.php' }
  ].map(fileEntry => fileEntry.location); // Extract the actual file paths for assertion

  const simulatedInputParameters = new Map();
  simulatedInputParameters.set('siteName', 'Project Composer');
  simulatedInputParameters.set('authHashSecret', tokenGenerator({ length: 35 }));
  simulatedInputParameters.set('sessionCookieSecret', tokenGenerator({ length: 35 }));
  simulatedInputParameters.set('author', 'Alexandria Vance');
  simulatedInputParameters.set('serverPort', 9000);

  const processedInputData = Object.fromEntries(simulatedInputParameters);

  generatorUtilities.mockPrompt(activeGeneratorProcess, processedInputData);
  activeGeneratorProcess.options['prevent-package-install'] = true;

  await new Promise((completionSignal, failureSignal) => {
    activeGeneratorProcess.run({}, (generationProblem) => {
      if (generationProblem) {
        return failureSignal(generationProblem);
      }
      generatorUtilities.assertFile(anticipatedOutputFiles);
      completionSignal();
    });
  });

  console.log("Generator validation completed without errors.");
}

initiateGeneratorValidationSequence().catch(errorEncountered => {
  console.error("Generator validation failed unexpectedly:", errorEncountered);
  process.exit(1);
});