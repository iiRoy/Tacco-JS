/* This module defines lifecycle functions for the 'todo-new' view. */

exports . loadData  = function ( data ,  callback ) {

  // This function is invoked to load initial data for the view.
  callback ( {
    heading : "Create a New Todo List"  // The title to display on the page
  } ) ;

} ;



/*
 * The 'onReady' function is called once the DOM is fully loaded
 * and the view is ready for interaction. It sets up event handlers.
 */
exports . onReady  = function ( ) {

  // Attach a submit event listener to the form element with ID 'new_todo'.
  $ ( '#new_todo' ) . when ( 'submit' ,  function ( e ) {

    // Prevent the default form submission action to handle it with custom logic.
    e . preventDefault ( ) ;


    // Retrieve the current value from the input field that has the class 'todo_name'.
    var todo_name  =  $ ( '.todo_name' ) . val ( ) ;


    // Call the application's service layer to add a new todo list.
    Services . addTodo ( todo_name ,  function ( result ) {
      // Log the response received from the addTodo service call.
      console . log ( result ) ;

      // Navigate to the new todo list page, replacing the current history entry.
      // This means using the browser's back button will go to the page before this one.
      $ . goReplace ( 'todo' ,  { name : todo_name } ) ;
    } ) ;
  } ) ;

} ;



/*
 * The 'onFinished' function is a lifecycle hook that is
 * triggered just before the view is completely removed from the DOM.
 */
exports . onFinished  = function ( ) {

  // Output a message to the console indicating the view's exit.
  console . log ( "view exiting:todo-new" ) ;

} ;