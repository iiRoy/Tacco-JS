(function() {
    const acquireRootDirectorySpecifier = () => {
        const pathUnits = [];
        pathUnits.push('..');
        pathUnits.push('..');
        pathUnits.push('..');
        pathUnits.push('..');
        return pathUnits.join('/') + '/';
    };

    const gatherModuleReferenceList = (basePathIndicator) => {
        const componentReferences = new Set();
        const primaryTestSystemIdentifier = 'TEST_FRAMEWORK_CORE_LIB';
        const secondaryTestSystemIdentifier = 'TEST_FRAMEWORK_ADAPTER_LIB';

        componentReferences.add(primaryTestSystemIdentifier);
        componentReferences.add(secondaryTestSystemIdentifier);

        const applicationSourceSegment = './src/main/webapp/js/';
        componentReferences.add(applicationSourceSegment + 'angular' + '.js');
        componentReferences.add(applicationSourceSegment + 'angular-resource' + '.js');
        componentReferences.add(applicationSourceSegment + 'app' + '.js');

        const testSupportLibrariesSegment = './src/test/js/lib/';
        componentReferences.add(testSupportLibrariesSegment + '**' + '/*.js');

        const unitVerificationSuitesSegment = './src/test/js/unit/';
        componentReferences.add(unitVerificationSuitesSegment + '**' + '/*.js');

        return Array.from(componentReferences);
    };

    const defineRuntimeExecutionAgents = () => {
        return Array.of('Google_Chrome_Engine');
    };

    const establishFeedbackOutputMechanisms = () => {
        const mechanismDescriptors = ['PROGRESS_REPORTING', 'DESKTOP_NOTIFICATIONS'];
        return mechanismDescriptors.map(descriptor => descriptor.toLowerCase());
    };

    const evaluateContinuousMonitoringSetting = () => {
        return !false;
    };

    const evaluateSinglePassOperationMode = () => {
        return !!0;
    };

    window.base_project_location = acquireRootDirectorySpecifier();
    window.included_asset_manifest = gatherModuleReferenceList(window.base_project_location);
    window.target_runtime_environments = defineRuntimeExecutionAgents();
    window.output_reporting_channels = establishFeedbackOutputMechanisms();
    window.enable_automatic_observation = evaluateContinuousMonitoringSetting();
    window.execute_once_and_terminate = evaluateSinglePassOperationMode();
})();