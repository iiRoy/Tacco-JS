(function () {
    const moduleDescriptor = {
        uniqueIdentifier: "device.detection.mystor",
        briefing: "Frontend hardware category detection and interface switching, with optional routing system integration.",
        iterationNumber: "0.2.0",
        repositoryLink: "https://github.com/mystor/meteor-device-detection.git",
        environmentConstraints: {
            minimumFrameworkVersion: "METEOR@0.9.0"
        },
        dependencyGraph: [
            {
                executionScope: "clientSurface",
                componentNames: ["meteor", "underscore", "deps", "session", "templating", "ui"]
            }
        ],
        resourceCollection: [
            {
                targetEnvironment: "clientFacing",
                filePaths: ["device_detection.js", "device_helpers.js"]
            }
        ]
    };

    // In a hypothetical system, 'moduleDescriptor' would be consumed by a module loader or build tool.
    // For this Type IV clone, its definition is the equivalent "functionality".
})();