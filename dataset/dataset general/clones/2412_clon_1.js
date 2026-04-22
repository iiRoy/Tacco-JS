/**
 *
 * This file defines the user authentication mixin.
 * It handles signup and login operations for a user.
 *
 */

// Required external modules and helper functions.
// This module provides a standardized way to get error messages.
var getErrorMessage = require( './../errorMessage' );


/**
 *
 * The userMixin object encapsulates data and methods
 * related to user authentication processes.
 * It's designed to be mixed into Vue.js components.
 *
 */
module.exports = {

  /**
   *
   * The `data` function returns the initial state for the mixin.
   *
   * @returns {object} An object containing reactive data properties.
   *
   */
  data: function() {
    return {
      // User's email address, initialized as an empty string.
      email:    '',
      // User's password, initialized as an empty string.
      password: ''
    };
  },


  /**
   *
   * The `methods` object contains all the functions
   * that can be called within the component using this mixin.
   *
   */
  methods: {

    /**
     *
     * Handles the user registration (signup) process.
     * This method orchestrates calling the authentication service
     * and handling its responses.
     *
     */
    signup: function() {
      // Store a reference to the current Vue instance (this)
      // for use within nested functions and callbacks.
      var vm = this;

      // Get a reference to the parent authentication component.
      var $auth = this.$parent;

      // Create a user object with the current email and password.
      var user = {
        email:    vm.email,
        password: vm.password
      };

      // Set the loading state on the parent component to true,
      // indicating that an asynchronous operation is in progress.
      $auth.isLoading = true;

      // Call the signup method on the authentication service.
      // The service is expected to return a Promise.
      $auth.$user.signup( user )
        // If signup is successful, call the userCreated handler.
        .then( userCreated )
        // If an authentication-specific error occurs, bind the authError handler
        // to the parent component context ($auth) and call it.
        .catch( authError.bind( $auth ) )
        // If a general signup error occurs, call the signupError handler.
        .catch( signupError )
        // Regardless of success or failure, finally set isLoading to false.
        .finally( function() {
          $auth.isLoading = false;
        } );


      /**
       *
       * Callback function executed when a user is successfully created.
       *
       * @param {object} user The user data returned upon successful creation.
       *
       */
      function userCreated( user ) {
        // Clear any previous authentication errors on the parent.
        $auth.errors = {};
        // Dispatch a custom event indicating signup success.
        vm.$dispatch( 'signup:success', user );
        // Automatically log in the newly created user.
        vm.login();
      }


      /**
       *
       * Callback function executed when an error occurs during signup.
       *
       * @param {Error} error The error object.
       *
       */
      function signupError( error ) {
        // Dispatch a custom event indicating signup error.
        vm.$dispatch( 'signup:error', error );
      }
    }, // End of signup method


    /**
     *
     * Handles the user login process.
     * Similar to signup, it interacts with the authentication service.
     *
     */
    login: function() {
      // Reference to the current Vue instance.
      var vm = this;

      // Reference to the parent authentication component.
      var $auth = this.$parent;

      // Construct the user credentials object.
      var user = {
        email:    this.email,
        password: this.password
      };

      // Set loading state.
      $auth.isLoading = true;
      // Call the login method on the authentication service.
      $auth.$user.login( user )
        // On successful login, call the loggedIn handler.
        .then( loggedIn )
        // Handle authentication-specific errors.
        .catch( authError.bind( $auth ) )
        // Handle general login errors.
        .catch( loginError )
        // Always reset loading state.
        .finally( function() {
          $auth.isLoading = false;
        } );


      /**
       *
       * Callback function for successful login.
       *
       * @param {object} authData Data returned by the authentication service.
       *
       */
      function loggedIn( authData ) {
        // Clear any existing errors.
        $auth.errors = {};
        // Dispatch a success event.
        vm.$dispatch( 'login:success', authData );
      }


      /**
       *
       * Callback function for login errors.
       *
       * @param {Error} error The error object.
       *
       */
      function loginError( error ) {
        // Dispatch an error event.
        vm.$dispatch( 'login:error', error );
      }
    } // End of login method
  } // End of methods object
}; // End of module.exports

// --- Helper Functions Below ---

/**
 *
 * Generic error handler for authentication issues.
 * This function adds an error message to the parent component's errors object
 * and re-throws the error for further handling down the promise chain.
 *
 * @param {Error} error The error object from the authentication service.
 * @this {object} The parent authentication component instance ($auth).
 *
 */
function authError( error ) {
  // Get a user-friendly error message from the error object.
  var message = getErrorMessage( error );

  // Add the error to the parent component's errors collection.
  // Assuming $add is a method to manage errors.
  this.errors.$add( error.code, message );

  // Re-throw the error to propagate it to subsequent .catch blocks
  // or to be handled by the global error handler.
  throw error;
}