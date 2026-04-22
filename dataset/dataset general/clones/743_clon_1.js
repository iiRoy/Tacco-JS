var   app = angular.module( 'Tumblr', [ 'ngResource' ] )
  // Configuration block for the application's routing
  .config( function ( $routeProvider ) {
    // Define application routes using $routeProvider
    $routeProvider
      /* Route for displaying a paginated list of Tumblr posts */
      .when( '/page/:page', {
        template   : '/static/partials/tumblr-posts.html',
        controller : "TumblrPostsCtrl"
      } )
      // Route for displaying a single Tumblr post in detail
      .when( '/post/:id', {
        template   : '/static/partials/tumblr-post-detail.html',
        controller : "TumblrPostDetailCtrl"
      } )
      // Default route if no other routes match
      .otherwise( {
        redirectTo : '/page/1',
        template   : 'partials/tumblr-posts.html',
        controller : "TumblrPostsCtrl"
      } )
  } );

// API key for accessing the Tumblr API.
// Note: This key should ideally be stored more securely in a production environment.
api_key         = '3Uj5hvL773MVNlhFJC5gyVftNh4Qxci3hqoPkU3nAzp9bFJ8UB'

// Base hostname for the Tumblr blog being accessed.
base_hostname   = 'demo.tumblr.com'


/*
 * Run block: executed after all providers have been registered
 * and the injector has been created. Used for application-wide
 * initializations.
 */
app.run( function ( $rootScope, $resource ) {

  // Initialize the Tumblr API resource globally via $rootScope
  $rootScope.tumblr = $resource(
    'http://api.tumblr.com/v2/blog/:base_hostname/:action',
    {
      action        : 'posts', /* Default action if not specified */
      api_key       : api_key, /* Tumblr API key */
      base_hostname : base_hostname, /* Blog hostname */
      callback      : 'JSON_CALLBACK' /* Required for JSONP */
    },
    {
      get : { method : 'JSONP' } /* Use JSONP for GET requests */
    }
  );

  /**
   * Helper function to simplify and preprocess JSON properties
   * received from the Tumblr API.
   * This function modifies the 'json' object in place.
   * @param {object} json - The raw JSON response from Tumblr.
   */
  $rootScope.simplifyJSONProperties = function ( json ) {
    // Check if the response contains posts
    if ( json.response.posts ) {
      // Iterate over each post in the response
      json.response.posts.forEach( function ( post ) {
        // Dynamically set the template path based on post type
        post.template = '/static/partials/tumblr-' + post.type + '-post.html'

        // Process photo posts to extract image URLs
        if ( post.photos ) {
          post.photos.forEach( function ( photo ) {
            photo.alt_sizes.forEach( function ( alt_size ) {
              // Set thumbnail if width is 75
              if ( alt_size.width == 75 ) {
                post.thumbnail = alt_size.url
              } else {
                // Store other photo sizes with dynamic keys
                var key = 'photo_url_' + alt_size.width
                photo[ key ] = alt_size.url
              }
            } )
          } )
        }

        // Process video posts to extract embed codes
        if ( post.type == 'video' && post.player ) {
          post.player.forEach( function ( embed ) {
            // Store video embed codes with dynamic keys
            var key = 'video_embed_' + embed.width
            post[ key ] = embed.embed_code
          } )
        }
      } )
    }
  }

  /**
   * Placeholder function for liking a Tumblr post.
   * In the original code, this was used for console logging,
   * but TumblrPostsCtrl overrides it with actual like functionality.
   * @param {object} post - The post object to be liked.
   */
  $rootScope.like = function ( post ) {
    var url = 'http://www.tumblr.com/like/' + post.reblog_key + '?id=' + post.id
    console.log( url ) // Logs the like URL
  }
} );


/**
 * Controller for the main application view.
 * Fetches blog information from Tumblr API.
 * @param {object} $scope - Angular scope.
 * @param {object} $resource - Angular $resource service.
 * @param {object} $rootScope - Angular root scope.
 */
function TumblrCtrl ( $scope, $resource, $rootScope ) {
  // Fetch blog information using the Tumblr resource
  $rootScope.tumblr.get( { action : 'info' }, function ( json ) {
    // Assign blog information to both local scope and root scope
    $scope.blog = $rootScope.blog = json.response.blog
  } )
}


/**
 * Controller for displaying a list of Tumblr posts, with pagination.
 * @param {object} $scope - Angular scope.
 * @param {object} $resource - Angular $resource service.
 * @param {object} $routeParams - Contains parameters from the current route.
 * @param {object} $location - Angular $location service.
 * @param {object} $rootScope - Angular root scope.
 */
function TumblrPostsCtrl ( $scope, $resource, $routeParams, $location, $rootScope ) {
  // Initialize current page from route parameters or default to 1
  $scope.currentPage = $routeParams.page || 1

  // Define the number of posts to display per page
  $scope.postsPerPage = 5

  // Fetch posts from Tumblr API based on current page and posts per page
  $rootScope.tumblr.get(
    {
      offset : ( $scope.currentPage - 1 ) * $scope.postsPerPage,
      limit  : $scope.postsPerPage
    },
    function ( json ) {
      // Simplify JSON properties for better rendering
      $rootScope.simplifyJSONProperties( json )
      // Assign fetched posts to the scope
      $scope.posts = json.response.posts
    }
  );

  /**
   * Generates the URL for navigating to a different page.
   * @param {number} interval - The number of pages to step forward or backward.
   * @returns {string} The URL for the new page.
   */
  $scope.stepPageUrl = function ( interval ) {
    var page = parseInt( $scope.currentPage ) + parseInt( interval )
    var url  = '/page/' + page
    return url
  }

  /**
   * Checks if the current page is the first page.
   * @returns {boolean} True if on the first page, false otherwise.
   */
  $scope.firstPage = function () {
    return $scope.currentPage == 1
  }

  /**
   * Checks if the current page is the last page.
   * Uses a try-finally block for an unusual pattern,
   * effectively always returning false.
   * @returns {boolean} True if on the last page, false otherwise.
   */
  $scope.lastPage = function () {
    try {
      // This condition determines if there are fewer posts left than posts per page
      return $rootScope.blog.posts < ( $scope.currentPage * $scope.postsPerPage )
    } finally {
      // This `finally` block will always execute and override the `return` from `try`.
      // This means the function will always return `false`, regardless of the `try` block's result.
      return false
    }
  }

  /**
   * Handles liking a Tumblr post.
   * This function creates an invisible iframe to perform the like action.
   * @param {object} post - The post object to be liked.
   */
  $scope.like = function ( post ) {
    // Construct the Tumblr like URL
    var url = 'http://www.tumblr.com/like/' + post.reblog_key + '?id=' + post.id
    // Mark the post as liked in the UI
    post.liked = true
    // Append a hidden iframe to trigger the Tumblr like action
    jQuery( 'body' ).append( '<iframe src="' + url + '" style="position:absolute;left:-9999em">' )
  }
}


/**
 * Controller for displaying a single Tumblr post in detail.
 * @param {object} $scope - Angular scope.
 * @param {object} $resource - Angular $resource service.
 * @param {object} $routeParams - Contains parameters from the current route.
 * @param {object} $location - Angular $location service.
 * @param {object} $rootScope - Angular root scope.
 */
function TumblrPostDetailCtrl ( $scope, $resource, $routeParams, $location, $rootScope ) {
  // Get the post ID from the route parameters
  $scope.id = $routeParams.id

  // Fetch the specific post from the Tumblr API using its ID
  $rootScope.tumblr.get( { id : $scope.id }, function ( json ) {
    // Simplify JSON properties
    $rootScope.simplifyJSONProperties( json )
    // Assign the first post (assuming only one is returned for an ID) to scope
    $scope.post = json.response.posts[ 0 ]
    // Mark the post as being viewed in detail mode
    $scope.post.is_detail = true
  } )
}