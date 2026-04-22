testSuite( 'clearingNotifications' , function()
{
  // This setup routine runs before each individual test case.
  preTestSetup( function()
  {
    // Load the designated application component.
    loadModule( 'app.notifications.components' ) ;

    // Utilize dependency injection to acquire necessary services.
    dependencyInjection( function( serviceLocator )
    {
      // Assign the NotificationManager service for use throughout the test suite.
      NotificationManager = serviceLocator.obtainService( 'NotificationManager' ) ;
    } ) ;
  } ) ;

  // This sub-suite focuses on operations within the primary notification collection.
  testSuite( 'main' , function()
  {
    // Test case: Verify an issue can be successfully removed from the main alerts object.
    testCase( 'verifyNotificationRemovalFromMain' , function()
    {
      // Create a new notification item.
      let notificationItem = NotificationManager.issue( 'Critical Fault' ) ;
      
      // Assert that there is initially one notification.
      assertThat( NotificationManager.allNotifications.main.count ).isEqualTo( 1 ) ;
      // Proceed to delete the notification item.
      NotificationManager.deleteEntry( notificationItem ) ;
      // Confirm that no notifications remain.
      assertThat( NotificationManager.allNotifications.main.count ).isEqualTo( 0 ) ;
    } ) ;
  } ) ;

  // This sub-suite covers functionality related to specific notification domains.
  testSuite( 'specificDomain \'alpha\'' , function()
  {
    // Test case: Confirm an issue can be removed from a specified domain.
    testCase( 'verifyRemovalFromSpecificDomain' , function()
    {
      // Generate a notification within the 'alpha' domain.
      let notificationItem = NotificationManager.domain( 'alpha' ).issue( 'Critical Fault' ) ;

      // Check if the 'alpha' domain now contains a single notification.
      assertThat( NotificationManager.allNotifications.alpha.count ).isEqualTo( 1 ) ;
      // Remove the notification from its respective domain.
      NotificationManager.domain( 'alpha' ).deleteEntry( notificationItem ) ;
      // Verify that the 'alpha' domain is now empty.
      assertThat( NotificationManager.allNotifications.alpha.count ).isEqualTo( 0 ) ;
    } ) ;
    // Test case: Ensure that an attempt to remove from an incorrect domain returns a failure status.
    testCase( 'confirmFailureOnInvalidRemoval' , function()
    {
      // Create a notification within the 'alpha' domain.
      let notificationItem = NotificationManager.domain( 'alpha' ).issue( 'Critical Fault' ) ;
      // Attempt to remove the notification from a different domain ('beta') and expect a false result.
      assertThat( NotificationManager.domain( 'beta' ).deleteEntry( notificationItem ) ).isEqualTo( false ) ;
    } ) ;
  } ) ;
} ) ;