/*
 * This file contains the main application logic for the Angular.js example.
 * It defines the primary module, a service for retrieving movie data,
 * and a controller to manage the view's interactions.
 */

// Initialize the Angular application module.
// The module is named 'app' and depends on the 'autocomplete' module.
var app = angular
  .module ( 'app' , [ 'autocomplete' ] ) ;


/*
 * MovieRetriever Factory:
 * This factory is responsible for fetching movie titles.
 * It simulates an asynchronous data retrieval process using $q and $timeout.
 */
app
  .factory (
    'MovieRetriever' ,
    function ( $http , $q , $timeout ) {

      // Create a new object to hold the MovieRetriever's methods.
      var MovieRetriever = new Object ( ) ;


      /**
       * getmovies method:
       * Simulates fetching a list of movie titles.
       * @param {string} i - An optional input string, currently used for a mock condition.
       * @returns {Promise} A promise that resolves with an array of movie titles.
       */
      MovieRetriever.getmovies = function ( i ) {

        // Create a deferred object to handle the asynchronous operation.
        var moviedata = $q
          .defer ( ) ;

        // Declare a variable to hold the final list of movies.
        var movies ;

        // Define a base list of movie titles.
        var someMovies = [
          "The Wolverine" ,
          "The Smurfs 2" ,
          "The Mortal Instruments: City of Bones" ,
          "Drinking Buddies" ,
          "All the Boys Love Mandy Lane" ,
          "The Act Of Killing" ,
          "Red 2" ,
          "Jobs" ,
          "Getaway" ,
          "Red Obsession" ,
          "2 Guns" ,
          "The World's End" ,
          "Planes" ,
          "Paranoia" ,
          "The To Do List" ,
          "Man of Steel"
        ] ;

        // Define a more extensive list of movie titles.
        var moreMovies = [
          "The Wolverine" ,
          "The Smurfs 2" ,
          "The Mortal Instruments: City of Bones" ,
          "Drinking Buddies" ,
          "All the Boys Love Mandy Lane" ,
          "The Act Of Killing" ,
          "Red 2" ,
          "Jobs" ,
          "Getaway" ,
          "Red Obsession" ,
          "2 Guns" ,
          "The World's End" ,
          "Planes" ,
          "Paranoia" ,
          "The To Do List" ,
          "Man of Steel" ,
          "The Way Way Back" ,
          "Before Midnight" ,
          "Only God Forgives" ,
          "I Give It a Year" ,
          "The Heat" ,
          "Pacific Rim" ,
          "Pacific Rim" ,
          "Kevin Hart: Let Me Explain" ,
          "A Hijacking" ,
          "Maniac" ,
          "After Earth" ,
          "The Purge" ,
          "Much Ado About Nothing" ,
          "Europa Report" ,
          "Stuck in Love" ,
          "We Steal Secrets: The Story Of Wikileaks" ,
          "The Croods" ,
          "This Is the End" ,
          "The Frozen Ground" ,
          "Turbo" ,
          "Blackfish" ,
          "Frances Ha" ,
          "Prince Avalanche" ,
          "The Attack" ,
          "Grown Ups 2" ,
          "White House Down" ,
          "Lovelace" ,
          "Girl Most Likely" ,
          "Parkland" ,
          "Passion" ,
          "Monsters University" ,
          "R.I.P.D." ,
          "Byzantium" ,
          "The Conjuring" ,
          "The Internship"
        ] ;

        // This conditional logic currently assigns 'moreMovies' in both cases.
        // It could be expanded to return different sets based on the input 'i'.
        if ( i && i.indexOf ( 'T' ) != -1 ) {
          movies = moreMovies ;
        }
        else {
          movies = moreMovies ;
        }


        // Simulate a network delay using $timeout.
        // The promise will resolve after 1000 milliseconds (1 second).
        $timeout ( function ( ) {
          moviedata.resolve ( movies ) ;
        } , 1000 ) ;

        // Return the promise object.
        return moviedata.promise ;
      } ;

      // Return the MovieRetriever object, making its methods available to other components.
      return MovieRetriever ;
    }
  ) ;


/*
 * MyCtrl Controller:
 * This controller manages the view where movie suggestions are displayed and interacted with.
 * It uses the MovieRetriever factory to get movie data.
 */
app
  .controller (
    'MyCtrl' ,
    function ( $scope , MovieRetriever ) {

      // Initialize the 'movies' scope variable by fetching movie data.
      // The initial call uses "..." as a placeholder input.
      $scope.movies = MovieRetriever
        .getmovies ( "..." ) ;

      // Once the initial movie data promise resolves, update the $scope.movies.
      $scope.movies
        .then (
          function ( data ) {
            $scope.movies = data ;
          }
        ) ;


      /**
       * getmovies method on $scope:
       * Returns the current list of movies available in the scope.
       * This is likely used by the autocomplete directive to get its data source.
       * @returns {Array} The array of movie titles.
       */
      $scope.getmovies = function ( ) {
        return $scope.movies ;
      } ;


      /**
       * doSomething method on $scope:
       * This function is triggered when the user types something into the autocomplete input.
       * It logs the typed input and then fetches a new list of movies based on it.
       * @param {string} typedthings - The text typed by the user.
       */
      $scope.doSomething = function ( typedthings ) {
        console.log ( "Do something like reload data with this: " + typedthings ) ;

        // Fetch new movie data based on the user's input.
        $scope.newmovies = MovieRetriever
          .getmovies ( typedthings ) ;

        // Update the $scope.movies with the new data once the promise resolves.
        $scope.newmovies
          .then (
            function ( data ) {
              $scope.movies = data ;
            }
          ) ;
      } ;


      /**
       * doSomethingElse method on $scope:
       * This function is called when a suggestion from the autocomplete list is selected.
       * It logs the selected suggestion.
       * @param {string} suggestion - The movie title selected by the user.
       */
      $scope.doSomethingElse = function ( suggestion ) {
        console.log ( "Suggestion selected: " + suggestion ) ;
      } ;

    }
  ) ;