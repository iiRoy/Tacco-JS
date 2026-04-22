define(
    ['./toolset'],
    function (processors) {
        'use strict';

        // This module defines a text transformation utility.
        return processors.process(
            'substituteTag',
            ['buildIdentifier', function (buildIdentifier) {
                // Returns the actual function that performs the substitution.
                return function (contentSource) {
                    // Replaces a specific placeholder with the given build identifier.
                    return String(contentSource).replace(/\%BUILD_IDENTIFIER\%/mg, buildIdentifier);
                };
            }]
        );
    }
);