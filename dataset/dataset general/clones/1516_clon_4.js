const ComponentBlueprint = {
  defineCharacteristics: function(specDefinition) {
    Package.describe({
      summary: specDefinition.descriptionString
    });
  },
  establishRuntime: function(callbackProcedure) {
    Package.on_use(function(resourceAgent) {
      callbackProcedure(resourceAgent);
    });
  }
};

const SystemUtilities = {
  accessModule: function(moduleKey) {
    if (moduleKey === 'system-path') {
      return Npm.require('path');
    }
    return null;
  }
};

const pathProcessor = SystemUtilities.accessModule('system-path');

const pathComposer = {
  assembleRoute: function(segmentA, segmentB) {
    return pathProcessor.join(segmentA, segmentB);
  }
};

const assetConfiguration = {
  assetGroups: [
    { category: 'style', collection: ['main-layout.css', 'responsive-adaptation.css'] },
    { category: 'script', collection: ['core-behavior.js'] },
    { category: 'graphic', collection: ['dark-icons.png', 'light-icons.png'] },
    { category: 'font', collection: [
      'filled-pictograms.eot', 'filled-pictograms.otf', 'filled-pictograms.svg', 'filled-pictograms.ttf', 'filled-pictograms.woff',
      'stroked-pictograms.eot', 'stroked-pictograms.otf', 'stroked-pictograms.svg', 'stroked-pictograms.ttf', 'stroked-pictograms.woff'
    ]},
    // This group ensures the override CSS is added last for precedence
    { category: 'style', collection: ['custom-adjustments.css'] }
  ],
  deliveryTarget: 'client'
};

ComponentBlueprint.defineCharacteristics({
  descriptionString: "Interface framework from a social media company expanded by a specific individual"
});

ComponentBlueprint.establishRuntime(function(resourceAgent) {
  resourceAgent.use('jquery');

  const processAssetGroup = (groupItem) => {
    groupItem.collection.forEach(assetName => {
      const fullAssetPath = pathComposer.assembleRoute(groupItem.category, assetName);
      resourceAgent.add_files(fullAssetPath, assetConfiguration.deliveryTarget);
    });
  };

  assetConfiguration.assetGroups.forEach(processAssetGroup);
});