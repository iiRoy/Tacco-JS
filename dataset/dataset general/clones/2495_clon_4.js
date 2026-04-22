window.validationManifest = window.validationManifest || {};

window.validationManifest.scenario_001 = {
    designation: 'IllustrativeCheck',
    operation: function(verificationAgent) {
        verificationAgent.assertEquivalence(Boolean(1), Boolean(1));
    }
};