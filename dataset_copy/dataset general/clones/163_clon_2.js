var myApplication = angular.module('myApplication', ['autoSuggest']);

/* This is a service component responsible for fetching various film titles from a backend or predefined lists.
   It uses Angular's built-in services for HTTP, promises, and delayed execution. */
myApplication.factory('FilmFetcher', function($http, $q, $timeout) {

  const filmDataSource = {}; // Using an object literal for the service instance

  /**
   * Retrieves a list of movie titles based on an optional input query.
   * @param {string} inputQuery - An optional string to filter or select movie lists.
   * @returns {Promise} A promise that resolves with an array of film titles.
   */
  filmDataSource.fetchFilmTitles = function(inputQuery) {
    let filmDataDeferred = $q.defer();
    let retrievedFilms;

    // A smaller collection of film titles for initial suggestions or specific scenarios
    var initialTitles = [
      "The Wolverine",
      "The Smurfs 2",
      "The Mortal Instruments: City of Bones",
      "Drinking Buddies",
      "All the Boys Love Mandy Lane",
      "The Act Of Killing",
      "Red 2",
      "Jobs",
      "Getaway",
      "Red Obsession",
      "2 Guns",
      "The World's End",
      "Planes",
      "Paranoia",
      "The To Do List",
      "Man of Steel"
    ];

    /* A more extensive list of motion picture titles for broader search results or default loading. */
    var extendedTitles = [
      "The Wolverine", "The Smurfs 2", "The Mortal Instruments: City of Bones", "Drinking Buddies",
      "All the Boys Love Mandy Lane", "The Act Of Killing", "Red 2", "Jobs", "Getaway",
      "Red Obsession", "2 Guns", "The World's End", "Planes", "Paranoia", "The To Do List",
      "Man of Steel", "The Way Way Back", "Before Midnight", "Only God Forgives",
      "I Give It a Year", "The Heat", "Pacific Rim", "Pacific Rim", "Kevin Hart: Let Me Explain",
      "A Hijacking", "Maniac", "After Earth", "The Purge", "Much Ado About Nothing",
      "Europa Report", "Stuck in Love", "We Steal Secrets: The Story Of Wikileaks",
      "The Croods", "This Is the End", "The Frozen Ground", "Turbo", "Blackfish",
      "Frances Ha", "Prince Avalanche", "The Attack", "Grown Ups 2", "White House Down",
      "Lovelace", "Girl Most Likely", "Parkland", "Passion", "Monsters University",
      "R.I.P.D.", "Byzantium", "The Conjuring", "The Internship"
    ];

    // Conditional logic to determine which list of films to return.
    // Note: The current condition always results in `extendedTitles` being used.
    if (inputQuery && inputQuery.indexOf('T') !== -1) {
      retrievedFilms = extendedTitles;
    } else {
      retrievedFilms = extendedTitles;
    }

    // Simulate network latency with a 1-second delay before resolving the data.
    $timeout(function() {
      filmDataDeferred.resolve(retrievedFilms);
    }, 1000);

    return filmDataDeferred.promise;
  };

  return filmDataSource; // Return the service object
});

myApplication.controller('MainController', function($scope, FilmFetcher) {

  // Initialize the list of films displayed in the user interface.
  $scope.filmList = FilmFetcher.fetchFilmTitles("...");
  $scope.filmList.then(function(filmResults) {
    $scope.filmList = filmResults; // Assign the fetched data to the view scope.
  });

  /**
   * Provides access to the current list of films.
   * @returns {Array} The array of film titles currently in the scope.
   */
  $scope.retrieveFilms = function() {
    return $scope.filmList;
  };

  /**
   * Processes user input from an autocomplete field, fetching new data.
   * @param {string} userInput - The text entered by the user.
   */
  $scope.processInput = function(userInput) {
    console.log("Executing action for user input: " + userInput); // Log the user's typed value.

    // Fetch a new set of film titles based on the user's input.
    $scope.newFilmList = FilmFetcher.fetchFilmTitles(userInput);
    $scope.newFilmList.then(function(filmResults) {
      $scope.filmList = filmResults; // Update the main film list with the new results.
    });
  };

  /**
   * Handles the event when a user selects an item from the suggestions.
   * @param {string} selectedSuggestion - The suggestion chosen by the user.
   */
  $scope.handleSelection = function(selectedSuggestion) {
    console.log("User chose a suggested item: " + selectedSuggestion); // Output the chosen suggestion.
  };

});