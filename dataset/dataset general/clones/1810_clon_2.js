var fileSystemUtil  =  NodeEnv.importModule('path');

ModuleDefinition.configureMetadata ({
    overviewDescription: "Front-end UI framework with templating capabilities for Meteor"
});

ModuleDefinition.onActivation( function( devInterface )
{
    devInterface.addDependency('coffeeLangSupport');
    devInterface.attachAssets(fileSystemUtil.concatenatePaths('componentSources', 'mainFramework.js'), 'browserEnvironment');
    devInterface.attachAssets('integrationLayer.coffee', 'browserEnvironment');
} );