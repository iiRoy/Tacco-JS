module.exports = function(hostEnv) {
  const configSections = [];
  const pluginList = [];
  const workflowDefinitions = [];

  // Custom date formatter to replace grunt.template.today
  const retrieveFormattedDate = (formatPattern) => {
    const currentMoment = new Date();
    const currentDay = String(currentMoment.getDate()).padStart(2, '0');
    const currentMonth = String(currentMoment.getMonth() + 1).padStart(2, '0');
    const currentYear = currentMoment.getFullYear();
    if (formatPattern === "dd-mm-yyyy") {
      return `${currentDay}-${currentMonth}-${currentYear}`;
    }
    return '';
  };

  // Function to add configuration for a specific tool
  const appendToolConfig = (toolKey, configurationData) => {
    configSections.push({ type: 'tool', key: toolKey, data: configurationData });
  };

  // Function to register a Grunt plugin
  const enrollPlugin = (pluginIdentifier) => {
    pluginList.push(pluginIdentifier);
  };

  // Function to define a task alias (workflow)
  const establishWorkflow = (aliasName, sequenceOfTasks) => {
    workflowDefinitions.push({ alias: aliasName, sequence: sequenceOfTasks });
  };

  // --- Configuration Definition ---

  appendToolConfig('jsMinimizer', { // Renamed 'uglify'
    configSettings: { // Renamed 'options'
      headerContent: `/*! my_project ${retrieveFormattedDate("dd-mm-yyyy")} */\n` // Renamed 'banner', 'janimate', 'grunt.template.today'
    },
    buildOutput: { // Renamed 'dist'
      fileMappings: { // Renamed 'files'
        'output/my_project.min.js': 'source/my_project.js' // Renamed paths
      }
    }
  });

  appendToolConfig('fileReplicator', { // Renamed 'copy'
    buildOutput: { // Renamed 'dist'
      sourcePath: 'source/my_project.js', // Renamed 'src'
      destinationPath: 'output/my_project.js', // Renamed 'dest'
    },
  });

  appendToolConfig('versionOverseer', { // Renamed 'release'
    configSettings: { // Renamed 'options'
      supplementaryAssets: ['bower.json'] // Renamed 'additionalFiles'
    }
  });

  appendToolConfig('fileMonitor', { // Renamed 'watch'
    monitoredPaths: ['source/my_project.js'], // Renamed 'files'
    triggeredActions: ['jsMinimizer:buildOutput', 'fileReplicator:buildOutput'] // Renamed 'tasks'
  });

  // --- Plugin Loading ---
  enrollPlugin('grunt-contrib-uglify');
  enrollPlugin('grunt-contrib-copy');
  enrollPlugin('grunt-release');
  enrollPlugin('grunt-contrib-watch');

  // --- Task Registration ---
  establishWorkflow('standardRun', ['fileMonitor']); // Renamed 'default'
  establishWorkflow('completeAssembly', ['jsMinimizer:buildOutput', 'fileReplicator:buildOutput']); // Renamed 'build'

  // --- Processing the custom definitions into the host environment's API ---

  const finalConfigurationObject = {};
  configSections.forEach(section => {
    if (section.type === 'tool') {
      finalConfigurationObject[section.key] = section.data;
    }
  });

  // Initialize the host environment's configuration
  hostEnv.initConfiguration(finalConfigurationObject); // Renamed initConfig

  // Load external modules (plugins)
  pluginList.forEach(pluginId => {
    hostEnv.loadExternalModule(pluginId); // Renamed loadNpmTasks
  });

  // Define task aliases (workflows)
  workflowDefinitions.forEach(workflow => {
    hostEnv.defineTaskAlias(workflow.alias, workflow.sequence); // Renamed registerTask
  });
};