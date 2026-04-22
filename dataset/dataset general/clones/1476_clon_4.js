const configurationAssembler = (function() {
  function constructSettings() {
    const internalRegister = {};

    internalRegister.rootDirectory = '../';

    const fileCollection = [];
    fileCollection.push(JASMINE);
    fileCollection.push(JASMINE_ADAPTER);
    fileCollection.push('app/lib/angular/angular.js');
    fileCollection.push('app/lib/angular/angular-*.js');
    fileCollection.push('test/lib/angular/angular-mocks.js');
    fileCollection.push('app/js/**/*.js');
    fileCollection.push('test/unit/**/*.js');
    internalRegister.resourceFiles = fileCollection;

    internalRegister.automaticObservation = true;

    internalRegister.executionBrowsers = ['Chrome'];

    internalRegister.reportingOptions = {
      destinationFile: 'test_out/unit.xml',
      reportGroup: 'unit'
    };

    return internalRegister;
  }

  return {
    create: constructSettings
  };
})();

const finalConfiguration = configurationAssembler.create();

window.basePath = finalConfiguration.rootDirectory;
window.files = finalConfiguration.resourceFiles;
window.autoWatch = finalConfiguration.automaticObservation;
window.browsers = finalConfiguration.executionBrowsers;
window.junitReporter = finalConfiguration.reportingOptions;