(function(applicationFrame) {
    'use strict';

    // Core application container
    var _coreApplication = applicationFrame.module('mainApplicationContainer', ['moduleForSlideMechanics', 'moduleForTextSearch']);

    // Definition of content variants
    var _variantDefinitions = [
        { _identifierToken: 'sliding-puzzle', _displayCaption: 'Sliding puzzle' },
        { _identifierToken: 'word-search-puzzle', _displayCaption: 'Word search puzzle' }
    ];

    // Configuration phase for routing
    _coreApplication.config(function(pathManagerProvider) {
        pathManagerProvider.when('/:_variantId');
    });

    // Initialization and lifecycle management
    _coreApplication.run(function(applicationRoot, pathDetails) {
        // Expose variant definitions globally
        applicationRoot.allVariantDefinitions = _variantDefinitions;
        // Set initial selected variant to the first one
        applicationRoot.activeVariantKey = _variantDefinitions[0]._identifierToken;

        // Subscribe to route change completion notifications
        applicationRoot.$on('$routeChangeSuccess', function(eventObject, currentRouteInfo) {
            var requestedIdentifier = currentRouteInfo.params._variantId;
            var isValidIdentifier = _variantDefinitions.some(function(definition) {
                return definition._identifierToken === requestedIdentifier;
            });

            // Update the active variant based on route or default to the first
            applicationRoot.activeVariantKey = isValidIdentifier ? requestedIdentifier : _variantDefinitions[0]._identifierToken;
        });
    });

    // Controller for advanced sliding puzzle display
    _coreApplication.controller('SlideDisplayControl', function() {
        this.arrangedElements = [
            { _sourcePath: './img/misko.jpg', _captionText: 'Miško Hevery', _verticalCount: 4, _horizontalCount: 4 },
            { _sourcePath: './img/igor.jpg', _captionText: 'Igor Minár', _verticalCount: 3, _horizontalCount: 3 },
            { _sourcePath: './img/vojta.jpg', _captionText: 'Vojta Jína', _verticalCount: 4, _horizontalCount: 3 }
        ];
    });

    // Controller for word search puzzle display
    _coreApplication.controller('TextSearchControl', function() {
        this.characterGrid = [
            ['N', 'I', 'G', 'O', 'R', 'Y', 'G', 'S', 'T', 'T', 'A', 'N'],
            ['O', 'G', 'G', 'U', 'L', 'C', 'O', 'E', 'P', 'E', 'A', 'S'],
            ['I', 'N', 'N', 'R', 'M', 'N', 'O', 'R', 'I', 'M', 'E', 'C'],
            ['T', 'I', 'A', 'I', 'O', 'E', 'G', 'V', 'R', 'P', 'V', 'E'],
            ['C', 'T', 'T', 'E', 'D', 'D', 'L', 'I', 'C', 'L', 'I', 'N'],
            ['E', 'S', 'J', 'P', 'U', 'N', 'E', 'C', 'S', 'A', 'T', 'A'],
            ['J', 'E', 'O', 'O', 'L', 'E', 'I', 'E', 'A', 'T', 'C', 'R'],
            ['N', 'T', 'V', 'C', 'E', 'P', 'J', 'B', 'V', 'E', 'E', 'I'],
            ['I', 'S', 'I', 'S', 'S', 'E', 'S', 'A', 'A', 'W', 'R', 'O'],
            ['O', 'K', 'S', 'I', 'M', 'D', 'E', 'S', 'J', 'O', 'I', 'M'],
            ['R', 'E', 'L', 'L', 'O', 'R', 'T', 'N', 'O', 'C', 'D', 'E']
        ];
        this.lexiconEntries = [
            'BINDING', 'CONTROLLER', 'DEPENDENCY', 'DIRECTIVE', 'GOOGLE', 'IGOR', 'INJECTION', 'JAVASCRIPT',
            'MISKO', 'MODULES', 'SCENARIO', 'SCOPE', 'SERVICE', 'TEMPLATE', 'TESTING', 'VOJTA'
        ];
    });

})(window.angular);