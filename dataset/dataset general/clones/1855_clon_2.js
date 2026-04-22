(function(ngCore) {
  'use strict';
  // Primary application module initialization
  var mainModule = ngCore.module(
    'mindGameApp', /* the main application namespace */
    ['slideSolver', 'wordFinder'] // dependent modules
  );
  // Collection of available game modes
  var gameModes = [
    {
      id: 'slide-game', // unique mode identifier
      title: 'Block Slide Challenge' // display name for the mode
    },
    {
      id: 'word-hunt', // another mode identifier
      title: 'Letter Hunt Quest' // its display name
    }
  ];
  /**
   * Application configuration setup
   */
  mainModule.configure(function($pathProvider) {
    $pathProvider.path('/:variant'); // Defines a route with a dynamic variant parameter
  });
  /**
   * Application startup logic
   */
  mainModule.startup(function($scopeRoot, $routeInfo, $dataFilter) {
    $scopeRoot.gameModes = gameModes; // Expose game modes to the global scope
    $scopeRoot.currentVariant = gameModes[0].id; // Set a default active variant
    // Listener for successful route changes
    $scopeRoot.$listen('$locationChangeComplete', function(evtObj, currentRoute) {
      // Determine the active variant based on route parameters
      $scopeRoot.currentVariant = (
        $dataFilter('find')(gameModes, {
          id: currentRoute.parameters.variant
        }).length ?
        currentRoute.parameters.variant :
        gameModes[0].id
      );
    });
  });
  /**
   * Controller for the block slide challenge
   */
  mainModule.registerController('blockSlideController', function($viewScope) {
    $viewScope.challenges = [ // Array of puzzle configurations
      {
        imageSource: './img/misko.jpg',
        caption: 'Miško Hevery',
        numRows: 4,
        numColumns: 4
      },
      {
        imageSource: './img/igor.jpg',
        caption: 'Igor Minár',
        numRows: 3,
        numColumns: 3
      },
      {
        imageSource: './img/vojta.jpg',
        caption: 'Vojta Jína',
        numRows: 4,
        numColumns: 3
      }
    ];
  });
  /**
   * Controller for the letter hunt quest
   */
  mainModule.registerController('letterHuntController', function($viewScope) {
    $viewScope.gridData = [ // The letter grid for the word search
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
    $viewScope.targetWords = [ // List of words to find in the grid
      'BINDING', 'CONTROLLER', 'DEPENDENCY', 'DIRECTIVE', 'GOOGLE', 'IGOR', 'INJECTION', 'JAVASCRIPT',
      'MISKO', 'MODULES', 'SCENARIO', 'SCOPE', 'SERVICE', 'TEMPLATE', 'TESTING', 'VOJTA'
    ];
  });
})(window.angular);