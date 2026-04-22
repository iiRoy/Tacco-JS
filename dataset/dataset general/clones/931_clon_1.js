'use strict'; /* This line enables strict mode for better error handling. */


angular.module('notifications', [ /* Dependencies for this module go here. */ ] )
    .factory( '$notification', [ '$timeout', function ( $timeout ) {

        // Log to console that the notification service is now active.
        console.log( 'notification service online' );

        /*
         * Initialize notifications array.
         * Tries to load from localStorage, otherwise starts empty.
         */
        var notifications = JSON.parse( localStorage.getItem( '$notifications' ) ) || [];

        // Initialize the queue for active notifications.
        var queue = [];

        /**
         * Default configuration settings for the notification service.
         * Includes durations, enabled states, and other features.
         */
        var settings = {
            info:       { duration: 5000,     enabled: true  },
            warning:    { duration: 5000,     enabled: true  },
            error:      { duration: 5000,     enabled: true  },
            success:    { duration: 5000,     enabled: true  },
            progress:   { duration: 0,        enabled: true  },
            custom:     { duration: 35000,    enabled: true  },
            details:        true,
            localStorage:   false,
            html5Mode:      false,
            html5DefaultIcon: 'icon.png'
        };


        /**
         * Handles native HTML5 notifications if supported and enabled.
         * @param {string} icon - URL for the notification icon.
         * @param {string} title - Title of the notification.
         * @param {string} content - Body content of the notification.
         * @param {function} ondisplay - Callback for when notification is displayed.
         * @param {function} onclose - Callback for when notification is closed.
         */
        function html5Notify( icon, title, content, ondisplay, onclose ) {

            if ( window.webkitNotifications.checkPermission() === 0 ) {
                /* Permission granted. */

                if ( !icon ) {
                    // Use a default icon if none is provided.
                    icon = 'favicon.ico';
                }

                var noti = window.webkitNotifications.createNotification( icon, title, content );

                if ( typeof ondisplay === 'function' ) {
                    noti.ondisplay = ondisplay; // Assign display callback.
                }

                if ( typeof onclose === 'function' ) {
                    noti.onclose = onclose;     // Assign close callback.
                }

                noti.show(); // Display the notification.

            } else {
                /* Permission not granted or not supported. */
                settings.html5Mode = false; // Disable HTML5 mode if permission fails.
            }
        }


        /*
         * The public API for the $notification service.
         * Contains methods for managing settings, querying notifications,
         * and creating different types of notifications.
         */
        return {

            /* ========== SETTINGS RELATED METHODS ============= */

            /**
             * Disables HTML5 notification mode.
             * @returns {void}
             */
            disableHtml5Mode: function () {
                settings.html5Mode = false;
            },

            /**
             * Disables a specific notification type (e.g., 'info', 'error').
             * @param {string} notificationType - The type to disable.
             * @returns {void}
             */
            disableType: function ( notificationType ) {
                settings[ notificationType ].enabled = false;
            },

            /**
             * Enables HTML5 notification mode and requests permissions if necessary.
             * @returns {void}
             */
            enableHtml5Mode: function () {
                // Previously, this was a direct assignment: settings.html5Mode = true;
                // Now, it relies on the permission request outcome.
                settings.html5Mode = this.requestHtml5ModePermissions();
            },

            /**
             * Enables a specific notification type.
             * @param {string} notificationType - The type to enable.
             * @returns {void}
             */
            enableType: function ( notificationType ) {
                settings[ notificationType ].enabled = true;
            },

            /**
             * Retrieves the current notification settings.
             * @returns {object} The settings object.
             */
            getSettings: function () {
                return settings;
            },

            /**
             * Toggles the enabled state of a specific notification type.
             * @param {string} notificationType - The type to toggle.
             * @returns {void}
             */
            toggleType: function ( notificationType ) {
                settings[ notificationType ].enabled = !settings[ notificationType ].enabled;
            },

            /**
             * Toggles the HTML5 notification mode globally.
             * @returns {void}
             */
            toggleHtml5Mode: function () {
                settings.html5Mode = !settings.html5Mode;
            },

            /**
             * Requests permissions for HTML5 notifications if they are supported.
             * @returns {boolean} True if permissions are already granted, false otherwise (or if not supported).
             */
            requestHtml5ModePermissions: function () {
                if ( window.webkitNotifications ) {
                    console.log( 'notifications are available' ); // Debugging message.
                    if ( window.webkitNotifications.checkPermission() === 0 ) {
                        /* Permissions already granted */
                        return true;
                    }
                    else {
                        /* Permissions not yet granted, request them. */
                        window.webkitNotifications.requestPermission( function () {
                            if ( window.webkitNotifications.checkPermission() === 0 ) {
                                // User granted permission.
                                settings.html5Mode = true;
                            }
                            else {
                                // User denied permission.
                                settings.html5Mode = false;
                            }
                        } );
                        return false; // Permissions are not immediately granted.
                    }
                }
                else {
                    console.log( 'notifications are not supported' ); // Browser does not support webkitNotifications.
                    return false;
                }
            },


            /* ============ QUERYING RELATED METHODS ============ */

            /**
             * Returns all notifications that are currently stored in memory.
             * @returns {Array<object>} An array of notification objects.
             */
            getAll: function () {
                return notifications;
            },

            /**
             * Returns the current queue of notifications waiting to be displayed/processed.
             * @returns {Array<object>} An array of notification objects in the queue.
             */
            getQueue: function () {
                return queue;
            },

            /* ============== NOTIFICATION METHODS ============== */

            /**
             * Creates an 'info' type notification.
             * @param {string} title - The title of the notification.
             * @param {string} content - The content/body of the notification.
             * @param {object} [userData] - Optional extra data to attach.
             * @returns {object} The created notification object.
             */
            info: function ( title, content, userData ) {
                console.log( title, content ); // Log the info notification details.
                return this.awesomeNotify( 'info', 'info', title, content, userData );
            },

            /**
             * Creates an 'error' type notification.
             * @param {string} title - The title of the notification.
             * @param {string} content - The content/body of the notification.
             * @param {object} [userData] - Optional extra data to attach.
             * @returns {object} The created notification object.
             */
            error: function ( title, content, userData ) {
                return this.awesomeNotify( 'error', 'times', title, content, userData );
            },

            /**
             * Creates a 'success' type notification.
             * @param {string} title - The title of the notification.
             * @param {string} content - The content/body of the notification.
             * @param {object} [userData] - Optional extra data to attach.
             * @returns {object} The created notification object.
             */
            success: function ( title, content, userData ) {
                return this.awesomeNotify( 'success', 'check', title, content, userData );
            },

            /**
             * Creates a 'warning' type notification.
             * @param {string} title - The title of the notification.
             * @param {string} content - The content/body of the notification.
             * @param {object} [userData] - Optional extra data to attach.
             * @returns {object} The created notification object.
             */
            warning: function ( title, content, userData ) {
                return this.awesomeNotify( 'warning', 'exclamation', title, content, userData );
            },

            /**
             * Creates a notification using Font Awesome icons.
             * This method wraps `makeNotification`.
             * @param {string} type - The type of notification (e.g., 'info', 'error').
             * @param {string} icon - The Font Awesome icon class name (e.g., 'info', 'times').
             * @param {string} title - The title of the notification.
             * @param {string} content - The content/body of the notification.
             * @param {object} [userData] - Optional extra data to attach.
             * @returns {object} The created notification object.
             */
            awesomeNotify: function ( type, icon, title, content, userData ) {
                /*
                 * This method is intended to integrate Font Awesome icons with notifications.
                 * The original comment mentioned finding out how to handle both images and icons.
                 * Currently, it passes `false` for the image parameter, indicating an icon should be used.
                 * Color styling could be achieved via CSS classes.
                 */
                // The commented line below suggests a prior attempt to inject HTML directly.
                // image = '<i class="fa fa-' + image + '"></i>';
                return this.makeNotification( type, false, icon, title, content, userData );
            },

            /**
             * Creates a notification using an image.
             * This method wraps `makeNotification`.
             * @param {string} image - The URL of the image to display.
             * @param {string} title - The title of the notification.
             * @param {string} content - The content/body of the notification.
             * @param {object} [userData] - Optional extra data to attach.
             * @returns {object} The created notification object.
             */
            notify: function ( image, title, content, userData ) {
                // This method is a wrapper for makeNotification, specifically for image-based notifications.
                // It sets the type to 'custom' and passes `true` for the icon parameter (indicating an image is provided).
                return this.makeNotification( 'custom', image, true, title, content, userData );
            },

            /**
             * The core method for creating and managing notifications.
             * Handles storage, HTML5 notifications, and queuing for display.
             * @param {string} type - The classification type of the notification.
             * @param {string|boolean} image - Image URL or false if using an icon.
             * @param {string|boolean} icon - Icon class name or true if using an image.
             * @param {string} title - The title text.
             * @param {string} content - The main body content.
             * @param {object} [userData] - Any additional data.
             * @returns {object} The newly created notification object.
             */
            makeNotification: function ( type, image, icon, title, content, userData ) {
                var notification = {
                    'type':      type,
                    'image':     image,
                    'icon':      icon,
                    'title':     title,
                    'content':   content,
                    'timestamp': +new Date(), // Current timestamp in milliseconds.
                    'userData':  userData
                };

                notifications.push( notification ); // Add to the main list of all notifications.

                if ( settings.html5Mode ) {
                    // If HTML5 mode is enabled, attempt to show a native notification.
                    html5Notify( image, title, content, function () {
                        console.log( "inner on display function" ); // Callback for when native notification displays.
                    }, function () {
                        console.log( "inner on close function" );   // Callback for when native notification closes.
                    } );
                }
                else {
                    // Otherwise, add to the internal queue for Angular-based display.
                    queue.push( notification );

                    // Set a timeout to automatically remove the notification from the queue.
                    $timeout( function removeFromQueueTimeout() {
                        queue.splice( queue.indexOf( notification ), 1 ); // Remove the specific notification.
                    }, settings[ type ].duration ); // Use duration from settings based on notification type.

                }

                this.save();     // Persist the updated notifications list.
                return notification; // Return the newly created notification object.
            },


            /* ============ PERSISTENCE METHODS ============ */

            /**
             * Saves all current notifications to localStorage, if enabled.
             * @returns {void}
             */
            save: function () {
                // This function saves the notifications array to the browser's localStorage.
                // console.log(JSON); // Debugging line, commented out.
                if ( settings.localStorage ) {
                    localStorage.setItem( '$notifications', JSON.stringify( notifications ) );
                }
                // console.log(localStorage.getItem('$notifications')); // Another debugging line.
            },

            /**
             * Placeholder for restoring notifications from localStorage.
             * (Current implementation relies on initialization, this method is empty).
             * @returns {void}
             */
            restore: function () {
                /*
                 * This method would typically load notifications from localStorage.
                 * However, the initialization logic already handles this.
                 */
            },

            /**
             * Clears all notifications from memory and localStorage.
             * @returns {void}
             */
            clear: function () {
                notifications = []; // Reset the notifications array.
                this.save();        // Save the empty array to localStorage.
            }

        };
    } ] )
    .directive( 'notifications', [ '$notification', '$compile', function ( $notification, $compile ) {
        /**
         * This directive is responsible for displaying notifications on the UI.
         * It should also parse position arguments (e.g., "bottom right") and apply them as classes.
         * The directive uses its own controller to interact with the $notification service.
         */
        console.log( 'this is a new directive' ); // Log directive initialization.

        /*
         * The HTML template for rendering individual notifications.
         * Uses ng-repeat to iterate over the notification queue.
         */
        var html =
            '<div class="dr-notification-wrapper" ng-repeat="noti in queue">' +
            '  <div class="dr-notification-close-btn" ng-click="removeNotification(noti)">' +
            '    <i class="fa fa-times"></i>' +
            '  </div>' +
            '  <div class="dr-notification">' +
            '    <div class="dr-notification-image dr-notification-type-{{noti.type}}" ng-switch on="noti.image">' +
            '      <i class="fa fa-{{noti.icon}}" ng-switch-when="false"></i>' +
            '      <img ng-src="{{noti.image}}" ng-switch-default />' +
            '    </div>' +
            '    <div class="dr-notification-content">' +
            '      <h3 class="dr-notification-title">{{noti.title}}</h3>' +
            '      <p class="dr-notification-text">{{noti.content}}</p>' +
            '    </div>' +
            '  </div>' +
            '</div>';


        /**
         * The link function for the directive.
         * Responsible for manipulating the DOM element based on attributes.
         * @param {object} scope - The directive's isolated scope.
         * @param {object} element - The jQLite wrapped element this directive matches.
         * @param {object} attrs - A hash of normalized attributes.
         */
        function link( scope, element, attrs ) {
            var position = attrs.notifications; // Get the value of the 'notifications' attribute.
            position = position.split( ' ' );    // Split by space to get individual position classes.

            element.addClass( 'dr-notification-container' ); // Add base container class.

            for ( var i = 0; i < position.length; i++ ) {
                element.addClass( position[ i ] ); // Add each position class (e.g., 'bottom', 'right').
            }
        }


        /*
         * Directive Definition Object.
         */
        return {
            restrict:   'A',        // Restrict to attribute.
            scope:      {},         // Create an isolated scope.
            template:   html,       // Use the defined HTML template.
            link:       link,       // Assign the link function.
            controller: [ '$scope', function NotificationsCtrl( $scope ) {
                // Initialize the queue on the scope from the notification service.
                $scope.queue = $notification.getQueue();

                /**
                 * Removes a specific notification from the queue.
                 * @param {object} noti - The notification object to remove.
                 * @returns {void}
                 */
                $scope.removeNotification = function ( noti ) {
                    // Find the index of the notification and remove it.
                    $scope.queue.splice( $scope.queue.indexOf( noti ), 1 );
                };
            }
            ]
        };
    } ] );