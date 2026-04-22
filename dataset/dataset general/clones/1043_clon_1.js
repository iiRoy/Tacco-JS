/*
 * This JavaScript file contains various controller definitions for an AngularJS application.
 * Each controller is designed to manage the data and logic for a specific view or page.
 * They primarily interact with the AngularJS $scope service, which acts as the binding context
 * for templates, making data accessible for display and manipulation within the UI.
 * The $scope variable is automatically injected by the AngularJS framework at runtime,
 * simplifying data flow from the backend to the frontend.
 * Developers can populate the $scope with any JavaScript data structure, including objects, arrays,
 * and primitive types, to power dynamic content rendering.
 */


function presentNotice ( isError, message )
{
  // Create a new div element for the notice, using Angular's jQLite wrapper.
  var notice = angular.element ( '<div id="notice">' + message + '</div>' );

  // Check if the notice indicates an error condition.
  if ( isError )
  {
    // If it's an error, add the 'error' CSS class for styling.
    notice.addClass ( 'error' );
  }

  // Append the notice element to the document's body.
  notice.appendTo ( document.body );

  // Position the notice below the main header.
  notice.css ( 'top', $( 'header.main' ).outerHeight() );

  // Initially hide the notice before animating it.
  notice.hide ();

  // Animate the notice to slide down, then delay, then slide up and remove itself.
  notice.slideDown ( 500 )
        .delay ( isError ? 6000 : 3000 ) // Longer delay for errors.
        .slideUp ( 500, function ()
        {
          // Callback function to remove the element from the DOM after it slides up.
          $( this ).remove ();
        } );
}


function addToShoppingList ( $http ) {
    return function ( boothid, item ) {
        /*
         * This inner function handles the actual addition of an item to the shopping list.
         * It takes the booth ID and the item name as parameters.
         * A POST request is made to the API endpoint to update the user's shopping list.
         */
        var data = { id: boothid, item: item };

        // Send the request to the server.
        $http.post ( '/api/~user_shopping_list_item', data )
             .success ( function ( data, status ) {
                 // Construct a success message for the user.
                 var message = 'You added ' + item + ' to your shopping list.';
                 presentNotice ( false, message ); // Display a non-error notice.
             } )
             .error ( function ( data, status ) {
                 // Construct an error message in case of failure.
                 var message = 'An error occurred adding ' + item + ' to your shopping list. Please reload the page and try again.';
                 presentNotice ( true, message ); // Display an error notice.
             } );
    };
}


function FarmsController ( $scope, farms )
{
  // Assigns the list of farms to the scope, making it available for display.
  $scope.farmList = farms.all.getList ();
}


function FarmDetailController ( $scope, $routeParams, farms, $http )
{
 // Fetch details for a specific farm using the slug from route parameters.
 $scope.farm = farms.one ( $routeParams.slug ).get ();

 // Expose the shopping list add functionality to the scope.
 $scope.addToShoppingList = addToShoppingList ( $http );

 // Initialize map center coordinates for the farm detail view.
 $scope.mapCenter = { latitude: 0, longitude: 0 };
 // Initialize map zoom level.
 $scope.mapZoom = 9;

 // After the farm data is resolved, check for geographical coordinates.
 $scope.farm.then ( function ( farm )
 {
  // If latitude and longitude are defined for the farm, set up map.
  if ( angular.isDefined ( farm.latitude ) && angular.isDefined ( farm.longitude ) )
  {
   // Define the market's fixed coordinates.
   var marketCoord = { latitude: 43.074703, longitude: -76.167891 };
   // Define the farm's coordinates from the fetched data.
   var farmCoord = { latitude: farm.latitude, longitude: farm.longitude };
   angular.extend ( $scope, {
    mapCenter: marketCoord,
    mapMarkers: [ farmCoord ],
   } );
  }
 } );
}


function ProduceController($scope,product){
    // Populate the product list on the scope
    $scope.productList = product.productList;
}


function ProduceDetailController ( $scope, $routeParams, product, $http ) {
  // Extract the product name from the route parameters.
  var productName = $routeParams.item;

  // Set the product icon image based on the product name.
  $scope.productIconImage = product.productImage ( productName );

  // Fetch the details of the specific product.
  $scope.product = product.one ( productName ).get ().then ( function ( result ) {
    // Iterate over each booth associated with the product.
    result.booths.forEach ( function ( booth ) {
      // Filter the sell sheet to only include items matching the current product name.
      booth.sellSheet = _.filter ( booth.sellSheet, function ( item ) {
        return productName == item.item;
      } );
      // Initialize a flag for varieties; currently always false.
      booth.hasVarieties = false;
    } );
    // Return the modified result.
    return result;
  } );

  // Make the add to shopping list function available on the scope.
  $scope.addToShoppingList = addToShoppingList ( $http );
}


function ShoppingListController ( $scope, user, $http )
{
  // Fetch the user's shopping list from the backend.
  $scope.shoppingList = user.shoppingList.getList ();

  // Group shopping list items by their 'shed' property once the list is resolved.
  $scope.sheds = $scope.shoppingList.then ( function ( result )
  {
    return _.groupBy ( result, function ( item )
    {
      return item.shed;
    } );
  } );

  // Determine if the shopping list is empty after it has been resolved.
  $scope.shoppingListIsEmpty = $scope.shoppingList.then ( function ( result )
  {
    return result.length == 0;
  } );

  // Defines a function to remove an item from the shopping list.
  // The 'success' callback is provided by the view to update UI on success.
  $scope.removeFromShoppingList = function ( boothid, item, success )
  {
    var config = {
      method: 'DELETE', // HTTP method for deletion.
      url: '/api/~user_shopping_list_item', // API endpoint for individual item deletion.
      data: { id: boothid, item: item }, // Data payload for the DELETE request.
      headers: { 'Content-Type': 'application/json' } // Specify content type.
    };
    $http ( config )
      .success ( function ( data, status )
      {
        success (); // Execute the success callback provided by the caller.
      } )
      .error ( function ( data, status )
      {
        // Display an error notice if removal fails.
        var message = 'An error occurred removing ' + item + ' from your shopping list. Please reload the page and try again.';
        presentNotice ( true, message );
      } );
  };

  // Defines a function to clear the entire shopping list.
  $scope.removeAll = function ()
  {
    var config = {
      method: 'DELETE', // HTTP method for deletion.
      url: '/api/~user_shopping_list' // API endpoint for clearing the entire list.
    };
    $http ( config )
      .success ( function ( data, status )
      {
        // Update scope variables to reflect an empty list.
        $scope.shoppingListIsEmpty = true;
        $scope.sheds = {};
      } )
      .error ( function ( data, status )
      {
        // Display an error notice if clearing fails.
        var message = 'An error occurred clearing your shopping list. Please try again.';
        presentNotice ( true, message );
      } );
  };
}