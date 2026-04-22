(function(ngCore) {
    'use strict';

    // A central object to manage application constants and configurations.
    const appConfig = {
        appName: 'mindGamePlatform',
        moduleDependencies: ['tileScramble', 'lexiQuest'],
        defaultGameVariantKey: 'tile-scramble-challenge'
    };

    // The main application instance.
    const mainApp = ngCore.module(appConfig.appName, appConfig.moduleDependencies);

    // Definition of various game modes available in the platform.
    const challengeVariants = [
        { keyIdentifier: 'tile-scramble-challenge', displayName: 'Tile Scramble Challenge', description: 'Rearrange image tiles to complete the picture.' },
        { keyIdentifier: 'lexi-quest-adventure', displayName: 'Lexi-Quest Adventure', description: 'Find hidden words within a grid of letters.' }
    ];

    /**
     * Application Routing Configuration Phase.
     * Sets up the URL routes for different game types.
     */
    mainApp.config(function($pathRouter) {
        // Define a route for game types, allowing a dynamic parameter.
        // A placeholder template is added for illustrative purposes.
        $pathRouter
            .when('/variant/:gameTypeAlias', {
                template: '<div class="game-view-container"></div>', // Dummy template
                controller: 'GameLauncherController' // Dummy controller, actual logic is in run block
            })
            .otherwise({
                redirectTo: `/variant/${appConfig.defaultGameVariantKey}` // Default fallback route
            });
    });

    /**
     * Application Initialization and Runtime Logic.
     * This block runs after all services have been configured.
     */
    mainApp.run(function($globalScope, $currentRoute, $dataFilter, $location) {
        $globalScope.availableModes = challengeVariants; // Expose variants to global scope.
        $globalScope.activeModeKey = appConfig.defaultGameVariantKey; // Initialize with default.

        // Helper function to determine the current game mode based on route parameters.
        const resolveCurrentGameMode = (routeParameters) => {
            const requestedType = routeParameters ? routeParameters.gameTypeAlias : null;
            if (!requestedType) {
                // If no type specified in route, use the default.
                return appConfig.defaultGameVariantKey;
            }

            // Attempt to find a matching game variant.
            const matchingVariant = challengeVariants.find(
                (variant) => variant.keyIdentifier === requestedType
            );

            // If a valid variant is found, use its key; otherwise, fall back to default.
            return matchingVariant ? matchingVariant.keyIdentifier : appConfig.defaultGameVariantKey;
        };

        // Listen for successful route changes to update the active game mode.
        $globalScope.onEvent('$routeChangeSuccess', (evtObj, routeInfo) => {
            if (routeInfo && routeInfo.routeParameters) {
                const determinedMode = resolveCurrentGameMode(routeInfo.routeParameters);
                if ($globalScope.activeModeKey !== determinedMode) {
                     $globalScope.activeModeKey = determinedMode;
                     console.log(`Application mode switched to: ${determinedMode}`);
                }
            } else {
                // If routeInfo is missing parameters, ensure a default is set.
                if ($globalScope.activeModeKey !== appConfig.defaultGameVariantKey) {
                    $globalScope.activeModeKey = appConfig.defaultGameVariantKey;
                    console.warn("Route parameters missing, reverting to default game mode.");
                }
            }
        });

        // Immediately apply the route logic on startup if a path is already set.
        // This handles cases where the app loads on a specific URL.
        if ($currentRoute.current && $currentRoute.current.routeParameters) {
            $globalScope.activeModeKey = resolveCurrentGameMode($currentRoute.current.routeParameters);
        }
    });

    /**
     * Controller for the Tile Scramble Challenge (formerly Sliding Puzzle).
     * Manages a collection of image-based puzzles.
     */
    mainApp.controller('TileScrambleController', function($viewContext) {
        // Defines the available image puzzles with their characteristics.
        $viewContext.imageChallenges = [
            { imagePath: './img/misko.jpg', description: 'Miško Hevery, Angular Co-founder', gridRows: 4, gridCols: 4, difficulty: 'medium' },
            { imagePath: './img/igor.jpg', description: 'Igor Minár, Angular Core Team', gridRows: 3, gridCols: 3, difficulty: 'easy' },
            { imagePath: './img/vojta.jpg', description: 'Vojta Jína, Creator of AngularJS', gridRows: 4, gridCols: 3, difficulty: 'hard' }
        ];

        // Placeholder for a currently selected puzzle.
        $viewContext.currentChallenge = null;

        /**
         * Selects a puzzle from the available challenges.
         * @param {object} challengeData The puzzle object to select.
         */
        $viewContext.chooseChallenge = function(challengeData) {
            if (challengeData && $viewContext.imageChallenges.includes(challengeData)) {
                $viewContext.currentChallenge = challengeData;
                console.log(`Selected challenge: ${challengeData.description}`);
            } else {
                console.error("Attempted to select an invalid challenge.");
            }
        };

        // Initialize with the first challenge by default.
        if ($viewContext.imageChallenges.length > 0) {
            $viewContext.chooseChallenge($viewContext.imageChallenges[0]);
        }
    });

    /**
     * Controller for the Lexi-Quest Adventure (formerly Word Search Puzzle).
     * Manages the letter grid and target words.
     */
    mainApp.controller('LexiQuestController', function($viewContext) {
        // The grid of letters for the word search.
        $viewContext.letterGrid = [
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

        // The list of words to find within the grid.
        $viewContext.targetWords = [
            'BINDING', 'CONTROLLER', 'DEPENDENCY', 'DIRECTIVE', 'GOOGLE', 'IGOR', 'INJECTION', 'JAVASCRIPT',
            'MISKO', 'MODULES', 'SCENARIO', 'SCOPE', 'SERVICE', 'TEMPLATE', 'TESTING', 'VOJTA'
        ];

        // State to track found words (initially all false).
        $viewContext.foundWordsStatus = {};
        $viewContext.targetWords.forEach(word => {
            $viewContext.foundWordsStatus[word] = false;
        });

        // A simple helper to mark a word as found.
        $viewContext.markWordAsFound = function(wordToMark) {
            if ($viewContext.foundWordsStatus.hasOwnProperty(wordToMark)) {
                $viewContext.foundWordsStatus[wordToMark] = true;
                console.log(`Word found: ${wordToMark}`);
                $viewContext.checkGameCompletion();
            } else {
                console.warn(`Attempted to mark an unknown word: ${wordToMark}`);
            }
        };

        // Checks if all target words have been found.
        $viewContext.checkGameCompletion = function() {
            const allFound = $viewContext.targetWords.every(word => $viewContext.foundWordsStatus[word]);
            if (allFound) {
                console.info("Congratulations! All words have been found!");
                // Potentially trigger a game over or victory state here.
            }
            return allFound;
        };

        // Example: simulate finding a word after a delay.
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * $viewContext.targetWords.length);
            const randomWord = $viewContext.targetWords[randomIndex];
            // $viewContext.markWordAsFound(randomWord); // Uncomment to test
        }, 3000);
    });

    // Dummy controller for the route, as actual logic is in run block.
    mainApp.controller('GameLauncherController', function($viewContext) {
        // This controller can be expanded to dynamically load templates/components
        // based on $viewContext.activeModeKey, if needed.
        console.log("GameLauncherController initialized.");
    });


})(window.angular);