var myApplication = angular.module('myApplication', ['autoSuggest']);

// This service is responsible for fetching film titles from various sources,
// simulating an asynchronous data retrieval process.
myApplication.factory('FilmFetcher', function($http, $q, $timeout){
  // The core object for our film data operations, exposing methods.
  var FilmService = {};

  /**
   * Retrieves a list of film titles based on an optional search query.
   * This function simulates an API call with a delay.
   * @param {string|null|undefined} inputQuery - The search query string provided by the user.
   * @returns {Promise<Array<string>>} A promise that resolves with the filtered list of film titles.
   */
  FilmService.fetchTitles = function(inputQuery) {
    // Create a deferred object to manage the asynchronous result.
    var deferredResult = $q.defer();
    var filmListToReturn; // This variable will hold the list of films to be resolved.

    // A comprehensive, hardcoded list of available film titles.
    const availableTitles = [
      "The Wolverine", "The Smurfs 2", "The Mortal Instruments: City of Bones", "Drinking Buddies",
      "All the Boys Love Mandy Lane", "The Act Of Killing", "Red 2", "Jobs", "Getaway",
      "Red Obsession", "2 Guns", "The World's End", "Planes", "Paranoia", "The To Do List",
      "Man of Steel", "The Way Way Back", "Before Midnight", "Only God Forgives", "I Give It a Year",
      "The Heat", "Pacific Rim", "Kevin Hart: Let Me Explain", "A Hijacking", "Maniac",
      "After Earth", "The Purge", "Much Ado About Nothing", "Europa Report", "Stuck in Love",
      "We Steal Secrets: The Story Of Wikileaks", "The Croods", "This Is the End", "The Frozen Ground",
      "Turbo", "Blackfish", "Frances Ha", "Prince Avalanche", "The Attack", "Grown Ups 2",
      "White House Down", "Lovelace", "Girl Most Likely", "Parkland", "Passion",
      "Monsters University", "R.I.P.D.", "Byzantium", "The Conjuring", "The Internship"
    ];

    // Normalize the input query for case-insensitive searching and guard against null/undefined.
    const processedQuery = (inputQuery || '').trim().toLowerCase();

    // Determine the list of films to return based on the query.
    if (processedQuery.length > 0) {
        // If a valid query exists, filter the available titles.
        filmListToReturn = availableTitles.filter(title => title.toLowerCase().includes(processedQuery));
    } else {
        // If no query or an empty query, return the full list.
        filmListToReturn = availableTitles;
    }

    // Define a constant for simulating network latency.
    const simulatedNetworkDelayMs = 1200;

    // Use $timeout to simulate an asynchronous operation, like an HTTP request.
    $timeout(function(){
      // Resolve the promise with the determined list of films.
      deferredResult.resolve(filmListToReturn);
    }, simulatedNetworkDelayMs);

    // Return the promise object immediately. The actual data will be available later.
    return deferredResult.promise;
  };

  return FilmService; // Expose the FilmService object to the application.
});

// The main application controller responsible for managing film display and user interactions.
myApplication.controller('MainController', function($scope, FilmFetcher){

  // Initialize scope variables for managing the UI state.
  $scope.displayedFilms = []; // The list of films currently shown to the user.
  $scope.isDataLoading = false; // A boolean flag to indicate if a data fetch is in progress.
  $scope.lastProcessedQuery = ''; // Stores the last query string that successfully fetched data.

  /**
   * Helper function to encapsulate the logic for fetching and updating film data.
   * It handles loading state and promise resolution/rejection.
   * @param {string} [query=''] - The search query string for films. Defaults to empty string.
   */
  function fetchAndDisplayFilms(query = '') {
      $scope.isDataLoading = true; // Set loading flag to true.
      $scope.lastProcessedQuery = query; // Update the last query.

      FilmFetcher.fetchTitles(query)
          .then(function(retrievedData){
              // On successful data retrieval, update the displayed films.
              $scope.displayedFilms = retrievedData;
          })
          .catch(error => {
              // Log any errors during data fetching and clear the film list.
              console.error("An error occurred while fetching film titles:", error);
              $scope.displayedFilms = []; // Ensure list is empty on error.
          })
          .finally(() => {
              // Always reset the loading flag once the operation completes (success or failure).
              $scope.isDataLoading = false;
          });
  }

  // Perform an initial data load when the controller is initialized, fetching all films.
  fetchAndDisplayFilms('');

  /**
   * This function is triggered by the autocomplete component as the user types.
   * It initiates a new film search based on the current input.
   * @param {string} currentInputText - The text currently entered by the user in the input field.
   */
  $scope.handleUserInputForSearch = function(currentInputText){
    // Basic validation: ensure input is a string and has a minimum length.
    if (typeof currentInputText !== 'string' || currentInputText.trim().length < 2) {
        // If input is too short or invalid, and we are not already showing all films,
        // re-fetch all films to clear partial search results.
        if ($scope.lastProcessedQuery !== '') {
            fetchAndDisplayFilms('');
        }
        return; // Exit early if input is not sufficient.
    }

    console.log("User is typing, initiating search for: " + currentInputText);
    // Fetch new data based on the user's ongoing input.
    fetchAndDisplayFilms(currentInputText);
  };

  /**
   * This function is called when a user explicitly selects a suggestion from the autocomplete list.
   * @param {string} chosenSuggestion - The full text of the item selected by the user.
   */
  $scope.processSuggestedSelection = function(chosenSuggestion){
    // Guard against an empty or invalid selection.
    if (!chosenSuggestion || typeof chosenSuggestion !== 'string') {
        console.warn("No valid suggestion was provided.");
        return;
    }
    console.log("A specific suggestion has been chosen: " + chosenSuggestion);
    // As an example action, we could fetch data specifically for the chosen item,
    // or simply update the display to reflect this single item.
    fetchAndDisplayFilms(chosenSuggestion); // Show only the selected item.
  };

});