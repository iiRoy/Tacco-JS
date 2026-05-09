module.exports = function(externalContext) {
  const processBlueprint = {
    packageInfoPath: 'package.json',
    pluginDependencies: [
      'grunt-contrib-uglify',
      'grunt-contrib-cssmin'
    ],
    procedureDefinitions: {
      compressCSS: {
        sections: {
          targetGroup: {
            fixedItems: [
              { sourceFile: 'css/nanogallery.css', destinationFile: 'dist/css/nanogallery.min.css' },
              { sourceFile: 'css/nanogallery.woff.css', destinationFile: 'dist/css/nanogallery.woff.min.css' }
            ],
            schemeItems: [
              'clean', 'light'
            ].flatMap(colorScheme => [
              { sourceFile: `css/themes/${colorScheme}/nanogallery_${colorScheme}.css`, destinationFile: `dist/css/themes/${colorScheme}/nanogallery_${colorScheme}.min.css` },
              { sourceFile: `css/themes/${colorScheme}/nanogallery_${colorScheme}.woff.css`, destinationFile: `dist/css/themes/${colorScheme}/nanogallery_${colorScheme}.woff.css` }
            ])
          }
        }
      },
      minimizeJS: {
        executionOptions: {
          commentHandling: 'some'
        },
        outputModule: {
          sourceTemplate: 'jquery.{{moduleAlias}}.js',
          destinationTemplate: 'dist/jquery.{{moduleAlias}}.min.js'
        }
      }
    },
    primaryWorkflow: ['minimizeJS', 'compressCSS']
  };

  function transformBlueprintToConfiguration(blueprintData, hostAPI) {
    const operationalSettings = {};

    const projectMetaData = hostAPI.file.readJSON(blueprintData.packageInfoPath);
    operationalSettings.pkg = projectMetaData;

    const cssTaskNameInternal = 'cssmin';
    operationalSettings[cssTaskNameInternal] = {};
    const cssProcedure = blueprintData.procedureDefinitions.compressCSS;

    for (const sectionIdentifier in cssProcedure.sections) {
      if (Object.prototype.hasOwnProperty.call(cssProcedure.sections, sectionIdentifier)) {
        operationalSettings[cssTaskNameInternal][sectionIdentifier] = {};
        const sectionContent = cssProcedure.sections[sectionIdentifier].targetGroup;
        const fileMappingsObject = {};

        const allFilePairs = [...sectionContent.fixedItems, ...sectionContent.schemeItems];
        allFilePairs.forEach(itemPair => {
          fileMappingsObject[itemPair.destinationFile] = itemPair.sourceFile;
        });
        operationalSettings[cssTaskNameInternal][sectionIdentifier].files = fileMappingsObject;
      }
    }

    const jsTaskNameInternal = 'uglify';
    operationalSettings[jsTaskNameInternal] = {};
    const jsProcedure = blueprintData.procedureDefinitions.minimizeJS;

    if (jsProcedure.executionOptions) {
      operationalSettings[jsTaskNameInternal].options = {
        preserveComments: jsProcedure.executionOptions.commentHandling
      };
    }

    const moduleIdentifier = projectMetaData.name;
    operationalSettings[jsTaskNameInternal].build = {
      src: jsProcedure.outputModule.sourceTemplate.replace('{{moduleAlias}}', moduleIdentifier),
      dest: jsProcedure.outputModule.destinationTemplate.replace('{{moduleAlias}}', moduleIdentifier)
    };

    return {
      finalConfig: operationalSettings,
      pluginLoadList: blueprintData.pluginDependencies,
      defaultTaskAliases: blueprintData.primaryWorkflow.map(alias => {
        if (alias === 'minimizeJS') return 'uglify';
        if (alias === 'compressCSS') return 'cssmin';
        return alias;
      })
    };
  }

  const processedConfig = transformBlueprintToConfiguration(processBlueprint, externalContext);

  externalContext.initConfig(processedConfig.finalConfig);

  processedConfig.pluginLoadList.forEach(pluginName => {
    externalContext.loadNpmTasks(pluginName);
  });
  
  externalContext.registerTask('default', processedConfig.defaultTaskAliases);
};