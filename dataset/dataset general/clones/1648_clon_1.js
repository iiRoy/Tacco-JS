$( function ( ) { /* Main initialization function for the application */

  var newProjectButton = $( '#new-project-button' ) ,
      newProjectName   = $( '.new-project-name' ) ; /* jQuery selectors for UI elements */

  /*
   * Verify Node-Webkit presence.
   * This is a critical check for application functionality.
   */
  checkNodeWebkit ( function ( ) {

    $( '#screen-main' ) . hide ( ) ;
    $( '#no-node-webkit-screen' ) . show ( ) ; /* Display an error screen to the user */
    $( '#message-container' ) . append ( '<span class="alert error"><i class="fa fa-info-circle"></i> Cannot find node-webkit in your Applications folder</span>' ) ;
  } ) ;

  /*
   * Handler for the "Download Node-Webkit" button click event.
   * Opens the official Node-Webkit GitHub page in an external browser.
   */
  $( '#download-node-webkit-button' ) . click ( function ( ) {

    var gui = require ( 'nw.gui' ) ; /* Node-Webkit GUI module */
    gui . Shell . openExternal ( 'https://github.com/rogerwang/node-webkit' ) ; /* Open URL */
  } ) ;

  /*
   * Event listener for creating a new project.
   * Shows the input field for the new project name.
   */
  newProjectButton . click ( function ( ) {

    newProjectName . fadeIn ( 300 ) ; /* Smooth fade-in animation */
    newProjectName . find ( 'input' ) . focus ( ) ; /* Set focus to the input field */
  } ) ;

  /*
   * Closes the new project name input dialog when the close icon is clicked.
   * Prevents event bubbling.
   */
  newProjectButton . find ( '.close-icon' ) . click ( function ( e ) {

    closeProjectName ( ) ; /* Call the function to hide the dialog */
    e . stopPropagation ( ) ; /* Stop the event from propagating further */
  } ) ;

  /*
   * Internal utility function to hide the project name input dialog.
   * Also clears the input field after fading out.
   */
  function closeProjectName ( ) {

    newProjectName . fadeOut ( 300 , function ( ) {
      $( this ) . find ( 'input' ) . val ( '' ) ; /* Clear input value */
    } ) ;
  } /* End of closeProjectName function */

  /*
   * Instantiate a new folder dialog for creating projects.
   * This handles the file system interaction.
   */
  var NewProjectFolderDialog = new folderDialog ( '#new-project-dialog' ) ;

  /*
   * Handles keyboard input in the new project name field.
   * Specifically, triggers the "OK" button click on Enter key press.
   */
  newProjectButton . find ( 'input' ) . keydown ( function ( e ) {

    var key = e . charCode ? e . charCode : e . keyCode ? e . keyCode : 0 ; /* Get key code */

    if ( key == 13 ) { /* Check if the pressed key is Enter (key code 13) */
      newProjectButton . find ( '.ok-icon' ) . trigger ( 'click' ) ; /* Simulate click on OK button */
      e . preventDefault ( ) ; /* Prevent default Enter key behavior (e.g., form submission) */
    }
  } ) ;

  /*
   * Event handler for confirming the new project name.
   * Performs validation and initiates project creation.
   */
  newProjectButton . find ( '.ok-icon' ) . click ( function ( e ) {

    /* Check if the project name input field is empty */
    if ( ! newProjectButton . find ( 'input' ) . val ( ) ) {
      showAlert ( 'error' , 'Project name cannot be empty!' ) ; /* Display error message */
      return ; /* Exit the function early */
    }

    /* Validate project name characters using a regular expression */
    if ( ! /^[A-Za-z0-9 _-]+$/ . test ( newProjectButton . find ( 'input' ) . val ( ) ) ) {
      showAlert ( 'error' , 'Project name can only contain: alfanumeric, spaces, _, -' ) ; /* Inform about valid characters */
      return ; /* Exit if validation fails */
    }

    /*
     * Open the folder dialog to select the project's parent directory.
     * The callback receives the selected path.
     */
    NewProjectFolderDialog . open ( function ( path ) {

      var project = require ( './js/models.js' ) . project ; /* Load project model */

      /* Assign project name and construct the full project path */
      project . name = newProjectButton . find ( 'input' ) . val ( ) ;
      project . path = path + '/' + project . name + '/' ;

      /*
       * Attempt to create the new project structure on the file system.
       * Includes success and error callbacks.
       */
      createNewProject ( function ( ) {

        showAlert ( 'success' , 'Well done! ' + project . name + ' is ready...' ) ; /* Success notification */

        /* If project creation was successful, open it */
        openProject ( project . path ) ;

      } , function ( err ) {
        /* Handle error, typically if the folder already exists */
        showAlert ( 'error' , err ) ;
      } ) ;

    } ) ;
    e . stopPropagation ( ) ; /* Prevent event from bubbling */
  } ) ;

  /*
   * Enables drag-and-drop functionality for opening projects.
   * The 'makeDroppable' function handles the UI and file system interaction.
   */
  makeDroppable ( 'open-project-button' , function ( path ) {
    openProject ( path ) ; /* Open the project specified by the dropped path */
  } ) ;

  /*
   * Initialize a folder dialog specifically for opening existing projects.
   */
  var OpenProjectFolderDialog = new folderDialog ( '#open-project-dialog' ) ;

  /*
   * Click handler for the "Open Project" button.
   * Opens a file dialog and then loads the selected project.
   */
  $( '#open-project-button' ) . click ( function ( ) {
    OpenProjectFolderDialog . open ( function ( path ) {
      openProject ( path ) ; /* Initiate project opening with the selected path */
    } ) ;
  } ) ;

  /*
   * Core function to load and display a project.
   * Transitions from the main screen to the build screen.
   */
  function openProject ( path ) {

    /* Load project data from the specified path */
    loadProject ( path , function ( ) {

      /* If project loading is successful, transition the UI */
      $( '#screen-main' ) . fadeOut ( 300 , function ( ) {

        closeProjectName ( ) ; /* Ensure the new project name input is hidden */

        /* Animate the header to a smaller padding, making space for the project title */
        $( 'header' ) . animate ( { padding : '20px' } , 300 , function ( ) {

          /* Display the loaded project's name in the header */
          $( '.project-title' ) . text ( require ( './js/models.js' ) . project . name ) ;

          $( '#screen-build' ) . fadeIn ( 300 ) ; /* Show the build screen */

          /* Enable the "Open Last Project" button, as a project is now open */
          $( '#open-last-project-button' ) . removeAttr ( 'disabled' ) ;
        } ) ;
      } ) ;

    } , function ( err ) {
      /* Handle errors during project file reading (e.g., malformed JSON) */
      showAlert ( 'error' , err ) ;
    } ) ;

  } /* End of openProject function */

  /*
   * Click handler for the "Build Project" button.
   * Initiates the project build process.
   */
  $( '#build-project-button' ) . click ( function ( ) {

    $( this ) . attr ( 'disabled' , 'disabled' ) ; /* Disable the button to prevent multiple builds */

    /* Store the original icon class and replace it with a spinner */
    var icon_class = $( '#build-project-button i' ) . attr ( 'class' ) ;
    $( '#build-project-button i' ) . removeClass ( ) . addClass ( 'fa fa-spinner fa-spin' ) ;

    /*
     * Execute the build process.
     * Includes success, error, and compression flag.
     */
    buildProject ( function ( ) {
      $( '#build-project-button i' ) . removeClass ( ) . addClass ( icon_class ) ; /* Restore original icon */
      $( '#build-project-button' ) . removeAttr ( 'disabled' ) ; /* Re-enable the button */
      showAlert ( 'success' , '<i class="fa fa-check"></i> Your App was built successfully!' ) ; /* Success message */
      var audio = $( '#audioclip' ) [ 0 ] ; /* Get the audio element */
      audio . src = process . cwd ( ) + '/sound.wav' ; /* Set audio source */
      audio . play ( ) ; /* Play success sound */
    } , function ( err ) {
      showAlert ( 'error' , err ) ; /* Display build error */
      $( '#build-project-button' ) . removeAttr ( 'disabled' ) ; /* Re-enable button on error */
    } ,
      $( '#compress-check .check-field' ) . hasClass ( 'active' ) ) ; /* Pass compression status */

  } ) ;

  /*
   * Click handler for the "Run Project" button.
   * Directly calls the `runProject` function.
   */
  $( '#run-project-button' ) . click ( runProject ) ;

  /*
   * Click handler for the "Edit Project" icon.
   * Triggers the project editing interface.
   */
  $( '.edit-project-icon' ) . click ( function ( ) {
    editProject ( ) ; /* Call the edit project function */
  } ) ;

  /*
   * Handles closing the currently opened project from the build screen.
   * Transitions back to the main application screen.
   */
  $( '#screen-build .close-icon' ) . click ( function ( ) {

    $( '#screen-build' ) . fadeOut ( 300 , function ( ) {
      $( 'header' ) . animate ( { padding : '50px' } , 300 , function ( ) {
        $( '#screen-main' ) . fadeIn ( 300 ) ; /* Show the main screen */
      } ) ;
    } ) ;

  } ) ;

  /*
   * Toggles the "active" class on a checkfield when its container is clicked.
   * Used for custom checkbox-like UI elements.
   */
  $( '.check-field-container' ) . click ( function ( ) {
    $( this ) . find ( '.check-field' ) . toggleClass ( 'active' ) ; /* Toggle class */
  } ) ;

  /*
   * Click handler for showing the project folder in the system's file explorer.
   */
  $( '.show-in-finder-icon' ) . click ( function ( ) {
    openFinder ( require ( './js/models.js' ) . project . path ) ; /* Open the project path in finder */
  } ) ;

  /*
   * Initial check: If no favorite path is stored in local storage,
   * disable the "Open Last Project" button.
   */
  if ( ! localStorage . fav_path ) {
    $( '#open-last-project-button' ) . attr ( 'disabled' , 'disabled' ) ; /* Disable button */
  }

  /*
   * Click handler for the "Open Last Project" button.
   * Loads the project from the stored favorite path.
   */
  $( '#open-last-project-button' ) . click ( function ( ) {
    openProject ( localStorage . fav_path ) ; /* Open the project using the saved path */
  } ) ;

} ) ; /* End of main jQuery ready function */