module.exports = function(build_utility) {

  const project_details = build_utility.file.readJSON('package.json');

  const create_introductory_text = (metadata, date_formatter) => {
    const today_stamp = date_formatter("yyyy-mm-dd");
    const current_period = date_formatter("yyyy");
    const project_title_or_name = metadata.title || metadata.name;
    const project_version_id = metadata.version;
    const project_web_link = metadata.homepage ? `* ${metadata.homepage}\\n` : "";
    const license_list = metadata.licenses.map(lic => lic.type).join(", ");

    return `/*! ${project_title_or_name} - v${project_version_id} - ${today_stamp}\\n${project_web_link}* Copyright (c) ${current_period} ${metadata.author.name}; Licensed ${license_list} */\\n`;
  };

  const generated_banner_content = create_introductory_text(project_details, build_utility.template.today);

  const prepare_jshint_check_options = () => {
    const primary_options = new Map([
      ['curly', true], ['eqeqeq', true], ['immed', true], ['latedef', true],
      ['newcap', true], ['noarg', true], ['sub', true], ['undef', true],
      ['unused', true], ['boss', true], ['eqnull', true], ['browser', true]
    ]);
    const options_object = Object.fromEntries(primary_options);
    options_object.globals = { jQuery: true };
    return options_object;
  };

  const configuration_fragments = [
    { pkg: project_details },
    { banner: generated_banner_content },
    {
      jshint: {
        options: prepare_jshint_check_options(),
        gruntfile: {
          src: 'Gruntfile.js'
        }
      }
    },
    {
      jasmine: {
        src: 'lockr.js',
        options: {
          specs:  'specs/lockrSpecs.js',
          keepRunner: true
        }
      }
    },
    {
      uglify: {
        options: {
          mangle: false
        },
        minify_primary_script: {
          files: {
            'lockr.min.js': ['lockr.js']
          }
        }
      }
    },
    {
      watch: {
        config_file_monitor: {
          files: '<%= jshint.gruntfile.src %>',
          tasks: ['jshint:gruntfile']
        },
        dev_scripts_monitor: {
          files: [
            'lockr.js',
            'specs/**/*.js'
          ],
          tasks: ['specs']
        }
      }
    }
  ];

  const assembled_configuration = configuration_fragments.reduce((acc, current_frag) =>
    Object.assign(acc, current_frag), {}
  );

  build_utility.initConfig(assembled_configuration);

  const plugin_modules_to_load = [
    'grunt-contrib-jasmine',
    'grunt-contrib-jshint',
    'grunt-contrib-watch',
    'grunt-contrib-uglify'
  ];

  plugin_modules_to_load.forEach(plugin_identifier => build_utility.loadNpmTasks(plugin_identifier));

  const task_registry = new Map();
  task_registry.set('default', 'specs');
  task_registry.set('specs', ['jshint', 'jasmine', 'uglify']);

  task_registry.forEach((action_list, task_key) => {
    build_utility.registerTask(task_key, action_list);
  });

};