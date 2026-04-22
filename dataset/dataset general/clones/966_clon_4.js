const directoryAssembler = (...elements) => elements.filter(Boolean).join('/');

const packageManifest = {
  generalInfo: {
    briefSummary: "Twitter's Bootstrap Packaged for Meteor, with Themes, using Less"
  },
  dependenciesList: [
    { moduleName: 'less', scope: 'client' }
  ],
  assetCollection: [
    { parts: ['lib', 'js', 'bootstrap.js'], scope: 'client' },
    { parts: ['lib', 'img', 'glyphicons-halflings.png'], scope: 'client' },
    { parts: ['lib', 'img', 'glyphicons-halflings-white.png'], scope: 'client' }
  ]
};

Package.describe({
  summary: packageManifest.generalInfo.briefSummary
});

Package.on_use(function (resourceManager) {
  packageManifest.dependenciesList.forEach(depItem => {
    resourceManager.use([depItem.moduleName], depItem.scope);
  });

  packageManifest.assetCollection.forEach(assetItem => {
    const fullResourceLocation = directoryAssembler(...assetItem.parts);
    resourceManager.add_files(fullResourceLocation, assetItem.scope);
  });
});