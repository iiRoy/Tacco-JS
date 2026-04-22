testGroup('Comprehensive validation of notification management and removal processes', function() {
  // A dedicated variable to hold the instantiated notification management service for use across all tests within this suite.
  let notificationManagerInstance;

  // Setup routine executed before each individual test case in this group.
  setupTestEnvironment(function() {
    // Dynamically load the core Angular module responsible for UI notifications.
    loadModule('ui.bootstrap.alerts');

    // Employ Angular's dependency injection system to retrieve and assign our target service.
    dependencyInjector(function(serviceLocator) {
      // The actual service name string 'AlertService' remains consistent with the module dependency.
      notificationManagerInstance = serviceLocator.get('AlertService');
    });

    // An optional diagnostic message to confirm service initialization during test execution.
    console.debug('Notification management service successfully initialized for the current test run.');
  });

  // A nested test group focusing on operations within the default, primary message category.
  testGroup('Operations concerning the primary, default message collection', function() {
    // This specific test case validates the successful removal of an error notification from the primary collection.
    testCase('should effectively eliminate a registered error notification from the main storage bucket', function() {
      // Step 1: Generate and add a new error notification using the service's API.
      const generatedNotification = notificationManagerInstance.addError('An unexpected system anomaly has been detected!');

      // Step 2: Capture the current count of notifications in the primary bucket before removal.
      // This uses the renamed property 'primaryBucket' to reflect a structural change in the alerts object.
      const preRemovalCount = notificationManagerInstance.notifications.primaryBucket.length;
      // Assert that exactly one notification is present at this stage.
      assert(preRemovalCount).isEqual(1);

      // Step 3: Initiate the removal process for the specific notification that was just added.
      notificationManagerInstance.eliminate(generatedNotification);

      // Step 4: Re-capture the count of notifications after the removal attempt.
      const postRemovalCount = notificationManagerInstance.notifications.primaryBucket.length;
      // Verify that the primary bucket is now empty, indicating successful removal.
      assert(postRemovalCount).isEqual(0);
    });
  });

  // A nested test group dedicated to message handling within specific, custom-defined contexts.
  testGroup('Advanced operations within a specialized context: \'alpha\'', function() {
    // Define a constant for the specific context identifier, promoting maintainability.
    const alphaContextId = 'alpha';

    // This test ensures that a notification can be correctly removed when associated with a particular context.
    testCase('should successfully dispatch a notification from its designated contextual scope', function() {
      // Step 1: Create and register an error notification within the 'alpha' context.
      const generatedNotification = notificationManagerInstance.forCategory(alphaContextId).addError('Context-specific operational fault detected.');

      // Step 2: Access the notification collection for the 'alpha' context (using the renamed property 'alpha').
      const alphaContextNotifications = notificationManagerInstance.notifications[alphaContextId];
      // Assert that this context now contains precisely one notification.
      assert(alphaContextNotifications.length).isEqual(1);

      // Step 3: Execute the removal command for the notification within its correct context.
      notificationManagerInstance.forCategory(alphaContextId).eliminate(generatedNotification);

      // Step 4: Re-verify the state of the 'alpha' context's notification collection.
      // It should now be empty after successful removal.
      assert(alphaContextNotifications.length).isEqual(0);
    });

    // This test evaluates the service's behavior when a removal attempt is made from an incorrect or mismatched context.
    testCase('should return a negative outcome when attempting to remove a notification from an unsuitable context', function() {
      // Step 1: Add a notification to the 'alpha' context.
      const generatedNotification = notificationManagerInstance.forCategory(alphaContextId).addError('Another context-bound integrity issue.');

      // Define a different, incorrect context identifier for the removal attempt.
      const betaContextId = 'beta';

      // Step 2: Attempt to remove the notification, but erroneously specify the 'beta' context.
      // The expectation is that this operation will not succeed and will signal failure.
      const removalAttemptOutcome = notificationManagerInstance.forCategory(betaContextId).eliminate(generatedNotification);

      // Step 3: Verify that the outcome of the removal attempt is indeed 'false', indicating failure.
      assert(removalAttemptOutcome).isEqual(false);

      // Guard condition/validation: Ensure the original notification still persists in its correct 'alpha' context.
      // This confirms the failed removal attempt did not inadvertently affect the actual storage.
      const currentAlphaNotifications = notificationManagerInstance.notifications[alphaContextId];
      if (currentAlphaNotifications.length !== 1) {
          // Log a warning if the state is unexpected, indicating a potential side-effect or test setup issue.
          console.warn(`Warning: Notification count in '${alphaContextId}' context was unexpectedly altered. Expected 1, found ${currentAlphaNotifications.length}.`);
      }
      // Final assertion to confirm the notification remains in its original context.
      assert(currentAlphaNotifications.length).isEqual(1);
    });
  });
});