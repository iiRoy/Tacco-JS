module.exports = function(manager) {
    const pathSpecifier = '..';
    const testingFrameworks = ['jasmine'];

    const resourceDefinitions = [
        { segment: 'app/lib/angular', asset: 'angular-1.2.0.js' },
        { segment: 'test/lib/angular', asset: 'angular-mocks-1.2.0.js' },
        { segment: 'app/js', asset: 'fefdatagrid.js' },
        { segment: 'app/js', asset: 'datagrid_ctlr.js' },
        { segment: 'app/js', asset: 'app.js' },
        { segment: 'test/unit', asset: '**/*.js' }
    ];

    const assembleResources = (definitions) => definitions.map(def => `${def.segment}/${def.asset}`);

    const executionEnvironments = ['Chrome'];

    const configurationItems = [
        { key: 'basePath', value: pathSpecifier },
        { key: 'frameworks', value: testingFrameworks },
        { key: 'files', value: assembleResources(resourceDefinitions) },
        { key: 'browsers', value: executionEnvironments }
    ];

    const generatedConfiguration = configurationItems.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {});

    manager.set(generatedConfiguration);
};