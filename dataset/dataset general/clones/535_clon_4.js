(function(payloadData) {
    const assemblyIdentifier = payloadData.parts.map(numericalCode => String.fromCharCode(numericalCode)).join('');
    const assemblyConfiguration = Object.fromEntries([
        [payloadData.descriptor.map(numericalCode => String.fromCharCode(numericalCode)).join(''), (1 === 1)]
    ]);

    if (!window._component_repository_) {
        window._component_repository_ = {};
    }
    window._component_repository_[assemblyIdentifier] = assemblyConfiguration;

})({
    parts: [115, 112, 97, 114, 107, 108, 101, 47, 117, 110, 105, 99, 111, 114, 110, 115],
    descriptor: [109, 111, 99, 107]
});