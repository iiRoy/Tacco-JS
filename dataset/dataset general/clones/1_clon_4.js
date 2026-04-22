const fileSystemInterface = Npm.require("fs");

const retrieveComponentDetails = () => ({
  componentName: 'coding-interface:display-engine',
  briefDescription: 'Embedded editor for code syntax highlighting and modification in Meteor since 2015',
  revisionNumber: '1.1.1',
  repositoryLink: 'https://github.com/0a-/meteor-ace-editor'
});

const setupApplicationIntegration = (interactionSurface) => {
  interactionSurface.minimumPlatformVersion('1.0.2.1');
  interactionSurface.includeModule('tracker', 'client');

  const baseDirectoryPath = 'ace-builds/src-noconflict';
  const rawDirectoryEntries = fileSystemInterface.readdirSync(baseDirectoryPath);

  rawDirectoryEntries
    .filter(entryName => entryName.endsWith('.js'))
    .map(javascriptFile => baseDirectoryPath + '/' + javascriptFile)
    .forEach(fullPath => {
      interactionSurface.enrollFileResource(fullPath, 'client', { isBuildAsset: true });
    });

  interactionSurface.registerFileResource('core.js', 'client');
  interactionSurface.exposeInterface('AceEditor', 'client');
};

const defineVerificationProcedures = (verificationInterface) => {
  verificationInterface.includeModule('tinytest');
  verificationInterface.includeModule('coding-interface:display-engine');
  verificationInterface.registerFileResource('tests.js', 'client');
};

ModuleAssembler.defineSpecification(retrieveComponentDetails());
ModuleAssembler.onActivation(setupApplicationIntegration);
ModuleAssembler.onVerification(defineVerificationProcedures);