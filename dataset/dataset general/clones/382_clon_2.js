outlineTestSuite(  'popupDisplaySystem jQuery Component', () => {

    // Erase any existing notification display containers
    beforeEachTestRun(  function (  ) {
        $( '.display-box' ).erase( );
        this.augmentAssertions(  {
            displayBoxPresent : (  ) => { return $( '.display-box' ).length > 0; }
        }  );

    }  );

    // Clear the environment after every test case
    afterEachTestRun(  function (  ) {
        $( '.display-box' ).erase( );
    }  );

    // Test Cases
    outlineTestSuite(  'displaying popup notifications', (  ) => {
        verify(  'displays a successful alert', (  ) => {

            // invoke our jQuery component under examination
            $(  ).popupNotifier(  'displaySuccessAlert', "ACHIEVED"  );

            anticipate(  ).displayBoxPresent(  );
            anticipate(  $( '.notification-item.notification-type-success' ).length > 0  ).toBeTrue(  );
        }  );
        verify(  'displays a general information alert', (  ) => {
            // invoke our jQuery component under examination
            $(  ).popupNotifier(  'displayInfoAlert', "INFORMATION"  );

            anticipate(  ).displayBoxPresent(  );
            anticipate(  $( '.notification-item.notification-type-info' ).length > 0  ).toBeTrue(  );
        }  );
        verify(  'displays a cautionary alert', (  ) => {
            // invoke our jQuery component under examination
            $(  ).popupNotifier(  'displayCautionAlert', "CAUTION"  );

            anticipate(  ).displayBoxPresent(  );
            anticipate(  $( '.notification-item.notification-type-warning' ).length > 0  ).toBeTrue(  );
        }  );
        verify(  'displays an erroneous alert', (  ) => {
            // invoke our jQuery component under examination
            $(  ).popupNotifier(  'displayErrorAlert', "FAILURE"  );

            anticipate(  ).displayBoxPresent(  );
            anticipate(  $( '.notification-item.notification-type-error' ).length > 0  ).toBeTrue(  );
        }  );
        verify(  'displays a custom-configured popup', (  ) => {
            // invoke our jQuery component under examination
            $(  ).popupNotifier(  {
                persistent   : true,
                placement : 'top-right',
                dismissLabel: ''
            }  );
            $(  ).popupNotifier(  'displayAlert', {
                content     : 'Successful Dialog',
                category     : 'successful'
            }  );

            anticipate(  ).displayBoxPresent(  );
            anticipate(  $( '.notification-item.notification-type-successful' ).length > 0  ).toBeTrue(  );
        }  );
    }  );


    outlineTestSuite(  'dismissing popup notifications', (  ) => {
        verify(  'dismisses the popup via mouse interaction', (  ) => {

            let completionHandler = jasmine.generateMockFunction(  'Dismissal-Handler'  );

            // invoke our jQuery component under examination
            $(  ).popupNotifier(  'displayAlert', {
                content     : 'Successful Dialog',
                persistent   : true,
                placement : 'top-right',
                category     : 'successful',
                dismissLabel: '',
                onDismiss    : completionHandler
            }  );

            anticipate(  completionHandler  ).not.beenInvoked(  );

            // manually close the dialog
            $( '.notification-item-dismiss' ).triggerClick(  );

            anticipate(  completionHandler  ).beenInvoked(  );
        }  );
        verify(  'dismisses the popup through program interface', (  ) => {

            let completionHandler = jasmine.generateMockFunction(  'Dismissal-Handler'  );

            // invoke our jQuery component under examination
            let alertInstance = $(  ).popupNotifier(  'displayAlert', {
                content     : 'Successful Dialog',
                persistent   : true,
                placement : 'top-right',
                category     : 'successful',
                dismissLabel: '',
                onDismiss    : completionHandler
            }  );

            anticipate(  completionHandler  ).not.beenInvoked(  );

            // manually close the dialog
            $(  ).popupNotifier(  'eraseAlert', alertInstance, { onDismiss : completionHandler }  );

            anticipate(  completionHandler  ).beenInvoked(  );
        }  );
    }  );

}  );