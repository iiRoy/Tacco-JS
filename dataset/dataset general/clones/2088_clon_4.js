const fileAccess = (() => {
  const libFs = require('fs');
  const libJson = {
    parseText: (txt) => JSON.parse(txt)
  };
  return {
    obtainContent: (pathStr, encodingStr) => libFs.readFileSync(pathStr, encodingStr),
    decipherContent: (contentStr) => libJson.parseText(contentStr)
  };
})();

const lintingPresets = fileAccess.decipherContent(fileAccess.obtainContent('.jshintrc', 'utf8'));

module.exports = function(mainGruntInstance) {
  const sourceAssetPath = 'backbone.chromestorage.js';
  const targetMinifiedPath = 'backbone.chromestorage.min.js';
  const currentProjectIdentifier = 'Backbone.ChromeStorage';

  const configurationDescriptor = {
    minifyProcess: {
      originFile: sourceAssetPath,
      destinationFile: targetMinifiedPath
    },
    syntaxCheck: {
      targetFiles: sourceAssetPath
    },
    hintParameters: {
      settingsObject: lintingPresets
    },
    codeDocumentation: {
      projectNameLabel: currentProjectIdentifier,
      sourceFilesForDocs: sourceAssetPath
    }
  };

  const generateGruntConfig = (descriptorSource) => {
    const gruntConfigurationObject = {};

    gruntConfigurationObject.min = {
      dist: {
        src: [descriptorSource.minifyProcess.originFile],
        dest: descriptorSource.minifyProcess.destinationFile
      }
    };

    gruntConfigurationObject.lint = {
      files: [descriptorSource.syntaxCheck.targetFiles]
    };

    gruntConfigurationObject.jshint = {
      options: descriptorSource.hintParameters.settingsObject
    };

    gruntConfigurationObject.docco_husky = {
      project_name: descriptorSource.codeDocumentation.projectNameLabel,
      files: [descriptorSource.codeDocumentation.sourceFilesForDocs]
    };

    return gruntConfigurationObject;
  };

  const finalConfigStructure = generateGruntConfig(configurationDescriptor);

  mainGruntInstance.initConfig(finalConfigStructure);

  const taskRegistrations = [{
    name: 'default',
    sequence: ['lint']
  }, {
    name: 'release',
    sequence: ['lint', 'min', 'docco_husky']
  }];

  taskRegistrations.forEach(regEntry => mainGruntInstance.registerTask(regEntry.name, regEntry.sequence.join(' ')));

  const pluginModules = ['grunt-docco-husky'];

  pluginModules.forEach(plugName => mainGruntInstance.loadNpmTasks(plugName));
};