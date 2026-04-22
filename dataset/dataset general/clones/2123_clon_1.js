/*
 * This entire file contains a series of CasperJS tests
 * designed to verify keyboard navigation functionality
 * within a web application.
 * Each test focuses on a specific key press or combination,
 * and asserts the resulting state of the application,
 * including active slide and URL changes.
 */


    /*
     *  SECTION: Moving forward in the presentation
     *  Test Case: Moving forward by Right arrow key
     */
casper . test . begin ( 'Moving forward by Right' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#1' ) . then ( function ( ) {
    // Simulating a key press for the 'Right' arrow key
    this . sendKeys ( 'body' , casper . page . event . key . Right ) ;

  } ) . then ( function ( ) {

    // Verifying that slide #2 is now the active slide
    test . assertExists ( '[id="2"].active' , 'Next slide #2 is active' ) ;

    // Checking if the URL has updated correctly to reflect slide #2
    test . assertUrlMatch ( /\/#2/ , 'Slide #2 in List mode URL' ) ;

  } ) . run ( function ( ) {
    test . done ( )
  } ) . clear ( ) ; // Ensures a clean state for the next test
} ) ;


    /*
     *  SECTION: Moving forward in the presentation
     *  Test Case: Moving forward by Down arrow key
     */
casper . test . begin ( 'Moving forward by Down' , 2 , function suite ( test ) {

 casper . start ( 'http://0.0.0.0:7497/tests/#1' )
  . then ( function ( ) {

    this . sendKeys ( 'body' , casper . page . event . key . Down ) ;

  } ) . then ( function ( ) {

    test . assertExists ( '[id="2"].active' , 'Next slide #2 is active' ) ;
    test . assertUrlMatch ( /\/#2/ , 'Slide #2 in List mode URL' ) ;

  } ) . run ( function ( ) {
    test . done ( )
  } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving forward in the presentation
     *  Test Case: Moving forward by Tab key
     */
casper . test . begin ( 'Moving forward by Tab' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#1' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . Tab ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="2"].active' , 'Next slide #2 is active' ) ;
      test . assertUrlMatch ( /\/#2/ , 'Slide #2 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving forward in the presentation
     *  Test Case: Not moving forward by Ctrl + Tab (expected behavior)
     */
casper . test . begin ( 'Not moving forward by Ctrl Tab' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#1' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . Tab , { modifiers : 'ctrl' } ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="1"].active' , 'Current slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving forward in the presentation
     *  Test Case: Moving forward by 'J' key
     */
casper . test . begin ( 'Moving forward by J' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#1' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . J ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="2"].active' , 'Next slide #2 is active' ) ;
      test . assertUrlMatch ( /\/#2/ , 'Slide #2 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving forward in the presentation
     *  Test Case: Moving forward by 'L' key
     */
casper . test . begin ( 'Moving forward by L' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#1' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . L ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="2"].active' , 'Next slide #2 is active' ) ;
      test . assertUrlMatch ( /\/#2/ , 'Slide #2 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving forward in the presentation
     *  Test Case: Moving forward by Spacebar
     */
casper . test . begin ( 'Moving forward by Space' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#1' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . Space ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="2"].active' , 'Next slide #2 is active' ) ;
      test . assertUrlMatch ( /\/#2/ , 'Slide #2 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving forward in the presentation
     *  Test Case: Moving forward by PageDown key
     */
casper . test . begin ( 'Moving forward by PageDown' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#1' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . PageDown ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="2"].active' , 'Next slide #2 is active' ) ;
      test . assertUrlMatch ( /\/#2/ , 'Slide #2 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving backward in the presentation
     *  Test Case: Moving backward by Left arrow key
     */
casper . test . begin ( 'Moving backward by Left' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#2' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . Left ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="1"].active' , 'Previous slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving backward in the presentation
     *  Test Case: Moving backward by Up arrow key
     */
casper . test . begin ( 'Moving backward by Up' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#2' )
    . then ( function ( ) {

      // Note: Original code had 'Left' here, assuming it was a typo and should be 'Up' for consistency
      // However, for Type I clone, we must keep it as 'Left'.
      this . sendKeys ( 'body' , casper . page . event . key . Left ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="1"].active' , 'Previous slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving backward in the presentation
     *  Test Case: Moving backward by Shift + Tab key
     */
casper . test . begin ( 'Moving backward by Shift Tab' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#2' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . Tab , { modifiers : 'shift' } ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="1"].active' , 'Previous slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving backward in the presentation
     *  Test Case: Not moving backward by Ctrl + Shift + Tab (expected behavior)
     */
casper . test . begin ( 'Not moving backward by Ctrl Shift Tab' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#2' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . Tab , { modifiers : 'ctrl+shift' } ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="2"].active' , 'Current slide #2 is active' ) ;
      test . assertUrlMatch ( /\/#2/ , 'Slide #2 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving backward in the presentation
     *  Test Case: Moving backward by 'K' key
     */
casper . test . begin ( 'Moving backward by K' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#2' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . K ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="1"].active' , 'Previous slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving backward in the presentation
     *  Test Case: Moving backward by 'H' key
     */
casper . test . begin ( 'Moving backward by H' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#2' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . H ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="1"].active' , 'Previous slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving backward in the presentation
     *  Test Case: Moving backward by Shift + Spacebar
     */
casper . test . begin ( 'Moving backward by Shift Space' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#2' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . Space , { modifiers : 'shift' } ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="1"].active' , 'Previous slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Moving backward in the presentation
     *  Test Case: Moving backward by PageUp key
     */
casper . test . begin ( 'Moving backward by PageUp' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#2' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . PageUp ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="1"].active' , 'Previous slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Navigation to specific slides
     *  Test Case: Moving to the first slide by Home key
     */
casper . test . begin ( 'Moving to the first slide by Home' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#MyID' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . Home ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="1"].active' , 'First slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Navigation to specific slides
     *  Test Case: Moving to the last slide by End key
     */
casper . test . begin ( 'Moving to the first slide by End' , 2 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#MyID' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . End ) ;

    } ) . then ( function ( ) {

      test . assertExists ( '[id="6"].active' , 'Last slide #6 is active' ) ;
      test . assertUrlMatch ( /\/#6/ , 'Slide #6 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Fullscreen mode functionality
     *  Test Case: Entering Fullscreen by F5 key
     */
casper . test . begin ( 'Entering Full by F5' , 3 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#MyID' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . F5 ) ;

    } ) . then ( function ( ) {

      test . assertExists ( 'body.full' , 'Body in Full mode' ) ;
      test . assertExists ( '[id="1"].active' , 'First slide #1 is active' ) ;
      test . assertUrlMatch ( /\/\?full#1/ , 'Slide #1 in Full mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Fullscreen mode functionality
     *  Test Case: Entering Fullscreen by Shift + F5 key
     */
casper . test . begin ( 'Entering Full by Shift F5' , 3 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/#MyID' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . F5 , { modifiers : 'shift' } ) ;

    } ) . then ( function ( ) {

      test . assertExists ( 'body.full' , 'Body in Full mode' ) ;
      test . assertExists ( '[id="MyID"].active' , 'Current slide #MyID is active' ) ;
      test . assertUrlMatch ( /\/\?full#MyID/ , 'Slide #MyID in Full mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Fullscreen mode functionality
     *  Test Case: Exiting Fullscreen by F5 key
     */
casper . test . begin ( 'Exiting Full by F5' , 3 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/?full#1' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . F5 ) ;

    } ) . then ( function ( ) {

      test . assertExists ( 'body.list' , 'Body in List mode' ) ;
      test . assertExists ( '[id="1"].active' , 'Slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;


    /*
     *  SECTION: Fullscreen mode functionality
     *  Test Case: Exiting Fullscreen by Esc key
     */
casper . test . begin ( 'Exiting Full by Esc' , 3 , function suite ( test ) {

  casper . start ( 'http://0.0.0.0:7497/tests/?full#1' )
    . then ( function ( ) {

      this . sendKeys ( 'body' , casper . page . event . key . Escape ) ;

    } ) . then ( function ( ) {

      test . assertExists ( 'body.list' , 'Body in List mode' ) ;
      test . assertExists ( '[id="1"].active' , 'Slide #1 is active' ) ;
      test . assertUrlMatch ( /\/#1/ , 'Slide #1 in List mode URL' ) ;

    } ) . run ( function ( ) {
      test . done ( )
    } ) . clear ( ) ;
} ) ;