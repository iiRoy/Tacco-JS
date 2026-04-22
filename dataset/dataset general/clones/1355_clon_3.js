'use strict';

var apiBaseUrl = 'https://cms-backend.example.com/api/';

var contentDisplayModule = angular.module('dynamicContentViewer', [
  'ngRoute',
  'ngResource',
  'ngSanitize'
]);

contentDisplayModule.controller('ResourceViewController', function($scope, $resource, $http, $timeout) {

  var contentApi = $resource(apiBaseUrl + 'entity/node/:itemId',
    { itemId: '@itemId' },
    {
      fetch: {
        method: 'GET',
        headers: { 'Accept': 'application/hal+json' }
      }
    }
  );

  $scope.isContentLoading = false;
  $scope.displayError = null;

  var uiSelectors = {
    initialMessage: '.welcome-text',
    interactiveContainer: '.interactive-panel',
    contentSlider: '.content-selector'
  };

  var sliderOptions = {
    tooltip: 'show',
    min: 1,
    max: 5,
    value: 1,
    step: 1
  };

  function setupContentSlider() {
    jQuery(uiSelectors.contentSlider)
      .slider(sliderOptions)
      .on('slideStop', function(eventData) {
        var selectedValue = eventData.value;
        if (typeof selectedValue === 'number' && selectedValue > 0 && selectedValue <= sliderOptions.max) {
          retrieveContent(selectedValue);
        } else {
          console.warn('Invalid slider value received:', selectedValue);
        }
      });
  }

  $scope.initiateDisplay = function() {
    $scope.isContentLoading = true;
    jQuery(uiSelectors.initialMessage).text('Fetching initial content...');
    retrieveContent(1, function() {
      $timeout(function() {
        jQuery(uiSelectors.initialMessage).hide();
        jQuery(uiSelectors.interactiveContainer).show();
        setupContentSlider();
        $scope.isContentLoading = false;
      }, 500);
    });
  };

  $scope.showSpecificResource = function(resourceIdentifier) {
    if (resourceIdentifier && typeof resourceIdentifier === 'number' && resourceIdentifier > 0) {
      retrieveContent(resourceIdentifier);
    } else {
      $scope.displayError = 'Invalid resource ID provided.';
      console.error('Attempted to load with invalid ID:', resourceIdentifier);
    }
  };

  $scope.displayedResource = {
    'warning': [{'value': 'This initial data is bundled with the application package.'}],
    'heading': [{'value': 'Dynamic Web Content Viewer'}],
    'mainBody': [{'value': '<p>This demonstration illustrates integration between a decoupled backend and an Angular.js frontend. Interact with the slider below to load different content items.</p>'}]
  };

  function retrieveContent(resourceId, completionCallback) {
    if (!resourceId || typeof resourceId !== 'number' || resourceId < 1) {
      $scope.displayError = 'A valid resource ID must be provided.';
      $scope.isContentLoading = false;
      return;
    }

    $scope.isContentLoading = true;
    $scope.displayError = null;

    var requestParams = { itemId: resourceId };

    contentApi.fetch(requestParams, function(fetchedData) {
      $scope.displayedResource = processFetchedContent(fetchedData);
      $scope.isContentLoading = false;
      if (typeof completionCallback === "function") {
        completionCallback(resourceId);
      }
    }, function(errorResponse) {
      $scope.isContentLoading = false;
      $scope.displayError = 'Failed to load content: ' + (errorResponse.statusText || 'Network error');
      console.error('Content fetch error:', errorResponse);
    });
  }

  function processFetchedContent(rawData) {
    if (!rawData || !rawData.title || !rawData.body) {
      console.warn('Fetched data missing expected properties:', rawData);
      return {
        'warning': [{'value': 'Content could not be fully loaded or is malformed.'}],
        'heading': [{'value': 'Incomplete Content'}],
        'mainBody': [{'value': '<p>Some parts of the content are missing or invalid.</p>'}]
      };
    }
    return {
      'warning': rawData.disclaimer || [{'value': 'Content loaded successfully.'}],
      'heading': rawData.title,
      'mainBody': rawData.body
    };
  }

});