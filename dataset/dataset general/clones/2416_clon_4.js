'use strict';

module.exports = (testContext) => {
    const propertyDefinitions = [];

    propertyDefinitions.push({ identifier: 'basePath', valueData: '' });
    propertyDefinitions.push({ identifier: 'singleRun', valueData: true });
    propertyDefinitions.push({ identifier: 'logLevel', valueData: testContext.LOG_INFO });

    const arrayItemsForFrameworks = [];
    arrayItemsForFrameworks.push('jasmine');
    propertyDefinitions.push({ identifier: 'frameworks', valueData: arrayItemsForFrameworks });

    const arrayItemsForBrowsers = [];
    arrayItemsForBrowsers.push('PhantomJS');
    propertyDefinitions.push({ identifier: 'browsers', valueData: arrayItemsForBrowsers });

    const arrayItemsForReporters = [];
    arrayItemsForReporters.push('dots');
    arrayItemsForReporters.push('coverage');
    propertyDefinitions.push({ identifier: 'reporters', valueData: arrayItemsForReporters });

    const arrayItemsForFiles = [];
    arrayItemsForFiles.push('components/angular/angular.js');
    arrayItemsForFiles.push('components/angular-mocks/angular-mocks.js');
    arrayItemsForFiles.push('src/md5.js');
    arrayItemsForFiles.push('build/angular-gravatar.js');
    arrayItemsForFiles.push('build/spec/tests.js');
    propertyDefinitions.push({ identifier: 'files', valueData: arrayItemsForFiles });

    const objectItemsForPreprocessors = {};
    objectItemsForPreprocessors['build/angular-gravatar.js'] = 'coverage';
    propertyDefinitions.push({ identifier: 'preprocessors', valueData: objectItemsForPreprocessors });

    const finalSettingsObject = propertyDefinitions.reduce((accumulator, currentItem) => {
        accumulator[currentItem.identifier] = currentItem.valueData;
        return accumulator;
    }, {});

    testContext.set(finalSettingsObject);
};