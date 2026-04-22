(   function( angular ) {

 /* Enforcing strict mode for better error handling and cleaner code. */
  'use strict' ;

 /*
  * Declare the main application module.
  * It depends on 'slidingPuzzle' and 'wordSearchPuzzle' modules.
  */
  var app = angular .module( 'puzzleApp', [ 'slidingPuzzle' , 'wordSearchPuzzle' ] ) ;

 // --- Puzzle Type Definitions ---
 // This array defines the different types of puzzles available in the application.
  var types = [
    {  id: 'sliding-puzzle' ,  title: 'Sliding puzzle'  } ,
    {  id: 'word-search-puzzle' ,  title: 'Word search puzzle'  }
  ] ;


 /*
  * Application Configuration Block
  * Sets up routing for the application.
  */
  app .config( function( $routeProvider ) {
   // Defines a route that captures a 'type' parameter.
   // This allows dynamic loading of puzzle types based on the URL.
    $routeProvider .when( '/:type' ) ;
  } ) ;


 /*
  * Application Run Block
  * Executed after all modules have been loaded.
  * Initializes root scope variables and sets up route change listeners.
  */
  app .run( function( $rootScope , $route , $filter ) {
   // Make puzzle types available globally on the root scope.
    $rootScope .types = types ;
   // Set the initial active puzzle type to the first one in the list.
    $rootScope .type = types[ 0 ] .id ;

   // Listen for successful route changes to update the current puzzle type.
    $rootScope .$on( '$routeChangeSuccess' , function( event , route ) {
     // Determine the new puzzle type based on the route parameter.
     // If the type from the route exists in 'types', use it; otherwise, default to the first type.
      $rootScope .type = ( $filter( 'filter' )( types , {  id: route .params .type  } ) .length ? route .params .type : types[ 0 ] .id ) ;
    } ) ;
  } ) ;


 /*
  * Controller for the Advanced Sliding Puzzle
  * Manages the data model for the sliding puzzle view.
  */
  app .controller( 'slidingAdvancedCtrl' , function( $scope ) {
   // Defines an array of puzzle configurations for the sliding puzzle.
   // Each object specifies an image source, title, and grid dimensions (rows, cols).
    $scope .puzzles = [
      {  src: './img/misko.jpg' ,  title: 'Miško Hevery' ,  rows: 4 ,  cols: 4  } ,
      {  src: './img/igor.jpg' ,  title: 'Igor Minár' ,  rows: 3 ,  cols: 3  } ,
      {  src: './img/vojta.jpg' ,  title: 'Vojta Jína' ,  rows: 4 ,  cols: 3  }
    ] ;
  } ) ;


 /*
  * Controller for the Word Search Puzzle
  * Manages the data model for the word search puzzle view.
  */
  app .controller( 'wordSearchCtrl' , function( $scope ) {
   // Defines the letter matrix for the word search grid.
   // Each inner array represents a row of characters.
    $scope .matrix = [
      [ 'N' , 'I' , 'G' , 'O' , 'R' , 'Y' , 'G' , 'S' , 'T' , 'T' , 'A' , 'N' ] ,
      [ 'O' , 'G' , 'G' , 'U' , 'L' , 'C' , 'O' , 'E' , 'P' , 'E' , 'A' , 'S' ] ,
      [ 'I' , 'N' , 'N' , 'R' , 'M' , 'N' , 'O' , 'R' , 'I' , 'M' , 'E' , 'C' ] ,
      [ 'T' , 'I' , 'A' , 'I' , 'O' , 'E' , 'G' , 'V' , 'R' , 'P' , 'V' , 'E' ] ,
      [ 'C' , 'T' , 'T' , 'E' , 'D' , 'D' , 'L' , 'I' , 'C' , 'L' , 'I' , 'N' ] ,
      [ 'E' , 'S' , 'J' , 'P' , 'U' , 'N' , 'E' , 'C' , 'S' , 'A' , 'T' , 'A' ] ,
      [ 'J' , 'E' , 'O' , 'O' , 'L' , 'E' , 'I' , 'E' , 'A' , 'T' , 'C' , 'R' ] ,
      [ 'N' , 'T' , 'V' , 'C' , 'E' , 'P' , 'J' , 'B' , 'V' , 'E' , 'E' , 'I' ] ,
      [ 'I' , 'S' , 'I' , 'S' , 'S' , 'E' , 'S' , 'A' , 'A' , 'W' , 'R' , 'O' ] ,
      [ 'O' , 'K' , 'S' , 'I' , 'M' , 'D' , 'E' , 'S' , 'J' , 'O' , 'I' , 'M' ] ,
      [ 'R' , 'E' , 'L' , 'L' , 'O' , 'R' , 'T' , 'N' , 'O' , 'C' , 'D' , 'E' ]
    ] ;
   // Defines the list of words to be found in the puzzle.
    $scope .words = [
      'BINDING' , 'CONTROLLER' , 'DEPENDENCY' , 'DIRECTIVE' , 'GOOGLE' , 'IGOR' , 'INJECTION' , 'JAVASCRIPT' ,
      'MISKO' , 'MODULES' , 'SCENARIO' , 'SCOPE' , 'SERVICE' , 'TEMPLATE' , 'TESTING' , 'VOJTA'
    ] ;
  } ) ;

} )( window .angular ) ;