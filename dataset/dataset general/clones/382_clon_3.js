describe('Toast Notification System Integrations', function() {

    // Ensure a clean slate by purging any prior notification containers.
    beforeEach(function() {
        const existingWrappers = jQuery('.notification-wrapper');
        if (existingWrappers.length > 0) {
            existingWrappers.remove();
        }

        this.addCustomMatchers({
            notificationWrapperPresent: () => {
                const wrapperCount = jQuery('.notification-wrapper').length;
                return wrapperCount > 0;
            }
        });
    });

    // Post-test cleanup: guarantee no lingering notification elements.
    afterEach(function() {
        const remainingWrappers = jQuery('.notification-wrapper');
        if (remainingWrappers.length > 0) {
            remainingWrappers.remove();
        }
    });

    // Test scenarios for displaying alerts.
    describe('Displaying various notification types', function() {
        it('Successfully displays a positive feedback notification', function() {
            // Invoke the notification utility for a successful outcome.
            jQuery().alertify('displaySuccess', "Operation Completed Successfully");

            expect().notificationWrapperPresent();
            const successAlerts = jQuery('.alertify-item.alertify-type-success');
            expect(successAlerts.length).toBeGreaterThan(0);
        });

        it('Presents an informational notification', function() {
            // Initiate an informational alert via the plugin API.
            jQuery().alertify('displayInfo', "Information Alert Message");

            expect().notificationWrapperPresent();
            const infoAlerts = jQuery('.alertify-item.alertify-type-info');
            expect(infoAlerts.length).toBeGreaterThan(0);
        });

        it('Exhibits a cautionary alert', function() {
            // Trigger a warning notification through the system.
            jQuery().alertify('displayWarning', "Caution Advised - Potential Issue");

            expect().notificationWrapperPresent();
            const warningAlerts = jQuery('.alertify-item.alertify-type-warning');
            expect(warningAlerts.length).toBeGreaterThan(0);
        });

        it('Displays a critical error message', function() {
            // Show an error notification indicating a critical failure.
            jQuery().alertify('displayError', "System Error Occurred - Action Failed");

            expect().notificationWrapperPresent();
            const errorAlerts = jQuery('.alertify-item.alertify-type-error');
            expect(errorAlerts.length).toBeGreaterThan(0);
        });

        it('Presents a highly customized notification', function() {
            // Configure global settings for the notification system.
            jQuery().alertify({
                isPersistent : true,
                placement    : 'upper-right',
                dismissLabel : ''
            });

            // Show a specific alert using the customized settings.
            jQuery().alertify('showAlert', {
                messageContent : 'Custom Success Alert Dialog',
                category       : 'success'
            });

            expect().notificationWrapperPresent();
            const customAlerts = jQuery('.alertify-item.alertify-type-success');
            expect(customAlerts.length).toBeGreaterThan(0);
        });
    });

    describe('Notification dismissal mechanisms', function() {
        it('Dismisses a notification via user interaction (click)', function() {
            let dismissHandler = jasmine.createSpy('Dismissal-Handler');

            // Display a sticky notification with a custom dismissal callback.
            jQuery().alertify('showAlert', {
                messageContent : 'Click this to dismiss',
                isPersistent   : true,
                placement      : 'upper-right',
                category       : 'success',
                dismissLabel   : 'Close [X]', // Added a specific label for clarity
                onDismiss      : dismissHandler
            });

            expect(dismissHandler).not.toHaveBeenCalled();

            // Simulate user clicking the dismiss button on the notification.
            const closeButton = jQuery('.alertify-item-close-btn');
            expect(closeButton.length).toBe(1, 'Expected exactly one close button to be present for interaction.');
            closeButton.trigger('click');

            expect(dismissHandler).toHaveBeenCalledTimes(1);
        });

        it('Removes a notification programmatically through the API', function() {
            let apiDismissCallback = jasmine.createSpy('API-Dismissal-Callback');

            // Show an alert that will be removed via an API call.
            const activeNotification = jQuery().alertify('showAlert', {
                messageContent : 'API Dismissal Test Notification',
                isPersistent   : true,
                placement      : 'upper-right',
                category       : 'success',
                dismissLabel   : 'X',
                onDismiss      : apiDismissCallback
            });

            expect(apiDismissCallback).not.toHaveBeenCalled();

            // Programmatically remove the notification instance using the plugin API.
            // Relying on the original onDismiss callback configured during showAlert.
            jQuery().alertify('hideAlert', activeNotification);

            expect(apiDismissCallback).toHaveBeenCalledTimes(1);
        });
    });

});