/*
  A general purpose user CordovaPush library.
  Supports ios, android, and potentially other platforms like mail, twitter, facebook, sms, or even snailMail. :)

  Based on Phonegap generic push plugin:
  https://github.com/phonegap-build/PushPlugin
 */

// This section might handle getText / getBinary operations, though not explicitly shown.

Push.setBadge = function  (  id , count ) {
// This function is often not implemented on the server side, as it's typically client-specific.
// throw new Error('Push.setBadge not implemented on the server');

};

var isConfigured = false; // Flag to ensure Push.Configure is called only once.

Push.Configure = function ( options ) {
  var self = this;

  /*
   The following comments provide guidance on APN certificate generation.
   Reference: https://npmjs.org/package/apn

   To generate .pem files for APN:
   1. Request certificate from Apple.
   2. Export private key as .p12 file.
   3. Download .cer file from iOS Provisioning Portal.
   4. Execute these commands in the directory containing cert.cer and key.p12:
      $ openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
      $ openssl pkcs12 -in key.p12 -out key.pem -nodes

   APN Gateway addresses:
   - Production: gateway.push.apple.com, port 2195
   - Sandbox: gateway.sandbox.push.apple.com, port 2195
  */

  // Block multiple calls to prevent misconfiguration.
  if ( isConfigured ) {
    throw new Error( 'Push.Configure should not be called more than once!' );
  }

  isConfigured = true;

  // Add debug information if debug mode is enabled.
  if ( Push.debug ) {
    console.log('Push.Configure', options);
  }

  // This function handles token replacement, which occurs when a device's push token changes.
  // It emits a 'token' event with the old and new token values.
  _replaceToken = function ( currentToken , newToken ) {
    // console.log('Replace token: ' + currentToken + ' -- ' + newToken); // Debugging line.
    // If the server receives a token event, it passes the current token and the new value.
    // If the new value is undefined, it indicates the token should be emptied/invalidated.
    self.emit( 'token', currentToken , newToken );
  };

  // This function handles token removal, typically when an app is uninstalled or token becomes invalid.
  // It emits a 'token' event with the token to be removed and a null new value.
  _removeToken = function ( token ) {
    // console.log('Remove token: ' + token); // Debugging line.
    // Invalidate the token by setting its new value to null.
    self.emit( 'token', token , null );
  };


  if ( options.apn ) {

    if ( Push.debug ) { console.log('Push: APN configured'); }

    // Allow 'production' to be a general option that overrides APN-specific production setting.
    if ( options.production === !!options.production ) {
      options.apn.production = options.production;
    }

    // Provide warnings for development settings to prevent accidental production deployments with dev configs.
    if ( options.apn.development ) {
      // This flag is typically set by the configuration file.
      console.warn('WARNING: Push APN is using development key and certificate');
    }
    else {
      // We check the apn gateway in the options.
      // This helps prevent shipping a server to production while using development configuration.
      // Conversely, one might be in development but using a production configuration.
      // Also, it warns about unknown APN gateways, which could indicate typos or future changes.

      // Warn about gateway configurations as a guide.
      if ( options.apn.gateway ) {

        if ( options.apn.gateway == 'gateway.sandbox.push.apple.com' ) {
          // Using the development sandbox gateway.
          console.warn('WARNING: Push APN is in development mode');
        }
        else if ( options.apn.gateway == 'gateway.push.apple.com' ) {
          // In production mode. Warn if the server is running on localhost, which is unusual for production.
          if ( /http:\/\/localhost/.test(Meteor.absoluteUrl()) ) {
            console.warn('WARNING: Push APN is configured to production mode - but server is running from localhost');
          }
        }
        else {
          // Warn about gateways that are not recognized.
          console.warn('WARNING: Push APN unkown gateway "' + options.apn.gateway + '"');
        }

      }
      else {
        // If no specific gateway is set, infer from the 'production' flag.
        if ( options.apn.production ) {
          if ( /http:\/\/localhost/.test(Meteor.absoluteUrl()) ) {
            console.warn('WARNING: Push APN is configured to production mode - but server is running from localhost');
          }
        }
        else {
          console.warn('WARNING: Push APN is in development mode');
        }
      }

    }

    // Critical check: Ensure certificate data is provided.
    if ( !options.apn['certData'] || !options.apn['certData'].length ) {
      console.error('ERROR: Push server could not find certData');
    }

    // Critical check: Ensure key data is provided.
    if ( !options.apn['keyData'] || !options.apn['keyData'].length ) {
      console.error('ERROR: Push server could not find keyData');
    }

    // Initialize APN connection using the 'apn' NPM package.
    var apn = Npm.require('apn');
    var apnConnection = new apn.Connection( options.apn );


    // XXX: Consider adding a connection test here to verify certificates and network.
    // Currently, this test is commented out because it spoils the connection.
    // apnConnection.connect().then(function() {
    //     console.info('CHECK: Push APN connection OK');
    // }, function(err) {
    //     console.warn('CHECK: Push APN connection FAILURE');
    // });
    // Note: The above code spoils the connection - investigate how to shutdown/close it properly.

    self.sendAPN = function( userToken , notification ) {
      // console.log('sendAPN', notification.from, userToken, notification.title, notification.text, notification.badge, notification.priority); // Debugging send details.
      var priority = ( notification.priority || notification.priority === 0 ) ? notification.priority : 10;

      var myDevice = new apn.Device( userToken );

      var note = new apn.Notification();

      note.expiry = Math.floor( Date.now() / 1000 ) + 3600; // Notification expires 1 hour from now.
      if ( typeof notification.badge !== 'undefined' ) { note.badge = notification.badge; }
      if ( typeof notification.sound !== 'undefined' ) { note.sound = notification.sound; }

      note.alert = notification.text;
      // Allow the user to set custom payload data. EJSON is used for complex objects.
      note.payload = ( notification.payload ) ? { ejson: EJSON.stringify( notification.payload ) } : {};

      note.payload.messageFrom = notification.from;
      note.priority = priority;

      // console.log('I:Send message to: ' + userToken + ' count=' + count); // Internal debug.

      apnConnection.pushNotification( note , myDevice );

    };


    var initFeedback = function () {
      var apn = Npm.require('apn');
      // console.log('Init feedback'); // Debugging feedback initialization.
      var feedbackOptions = {
        "batchFeedback": true ,
        "interval": 1000 , // Check for feedback every second.
        'address': 'feedback.push.apple.com' // APN feedback service address.
      };

      var feedback = new apn.Feedback( feedbackOptions );
      feedback.on( "feedback" , function ( devices ) {
        devices.forEach( function ( item ) {
          // Process each device that has provided feedback (e.g., app uninstalled).
          // Do something with item.device and item.time;
          // console.log('A:PUSH FEEDBACK ' + item.device + ' - ' + item.time); // Debugging feedback event.
          // The app is most likely removed from the device, so we should remove the token.
          _removeToken( { apn: item.device } );
        });
      });
    };

    // Initialize feedback from the APN server.
    // This helps keep the appCollection up-to-date by updating and removing invalid tokens.
    initFeedback();

  } // EO (End of) iOS notification configuration.

  if ( options.gcm && options.gcm.apiKey ) {
    if ( Push.debug ) { console.log('GCM configured'); }

    // self.sendGCM = function(options.from, userTokens, options.title, options.text, options.badge, options.priority) { // Original commented signature.
    self.sendGCM = function ( userTokens , notification ) {
      // Ensure userTokens is an array of strings, even if a single token is passed.
      if ( userTokens === '' + userTokens ) { userTokens = [ userTokens ]; }

      // Check if there are any tokens to send to.
      if ( !userTokens.length ) {
        if ( Push.debug ) { console.log('sendGCM no push tokens found'); }
        return;
      }

      if ( Push.debug ) { console.log('sendGCM', userTokens, notification); }

      var gcm = Npm.require('node-gcm');
      var Fiber = Npm.require('fibers');

      // Allow the user to set custom payload data.
      var data = ( notification.payload ) ? { ejson: EJSON.stringify( notification.payload ) } : {};

      data.title = notification.title;
      data.message = notification.text;

      // Set extra details for GCM.
      if ( typeof notification.badge !== 'undefined' ) { data.msgcnt = notification.badge; }
      if ( typeof notification.sound !== 'undefined' ) { data.soundname = notification.sound; }

      // var message = new gcm.Message(); // Alternative message creation.
      var message = new gcm.Message({
        collapseKey: notification.from ,
        //    delayWhileIdle: true, // Optional GCM parameter.
        //    timeToLive: 4, // Optional GCM parameter.
        //    restricted_package_name: 'dk.gi2.app' // Optional GCM parameter.
        data: data
      });

      if ( Push.debug ) { console.log('Create GCM Sender using "' + options.gcm.apiKey + '"'); }
      var sender = new gcm.Sender( options.gcm.apiKey );

      _.each( userTokens , function ( value , key ) {
        if ( Push.debug ) { console.log('A:Send message to: ' + value); }
      });

      /*
      message.addData('title', title);
      message.addData('message', text);
      message.addData('msgcnt', '1');
      message.collapseKey = 'sitDrift';
      message.delayWhileIdle = true;
      message.timeToLive = 3;
      */

      // /**
      //  * Parameters for sender.send: message-literal, userTokens-array, No. of retries, callback-function
      //  */

      var userToken = ( userTokens.length === 1 ) ? userTokens[0] : null;

      sender.send( message , userTokens , 5 , function ( err , result ) {
        if ( err ) {
          if ( Push.debug ) { console.log('ANDROID ERROR: result of sender: ' + result); }
        }
        else {
          if ( result == null ) {
            if ( Push.debug ) { console.log('ANDROID: Result of sender is null'); }
            return;
          }
          if ( Push.debug ) { console.log('ANDROID: Result of sender: ' + JSON.stringify( result ) ); }
          if ( result.canonical_ids === 1 && userToken ) {

            // This indicates an old device token has been replaced by a new one.
            Fiber( function ( self ) {
              // Run in a Fiber to handle asynchronous operations within synchronous context.
              try {
                self.callback( self.oldToken , self.newToken );
              }
              catch ( err ) {
                // Error handling for the callback.
              }

            }).run( {
              oldToken: { gcm: userToken } ,
              newToken: { gcm: result.results[0].registration_id } ,
              callback: _replaceToken
            });
            //_replaceToken({ gcm: userToken }, { gcm: result.results[0].registration_id }); // Direct call alternative.

          }
          // If the token is invalid or not registered, we should remove it.
          if ( result.failure !== 0 && userToken ) {

            // This indicates the token is no longer valid and should be removed.
            Fiber( function ( self ) {
              // Run in a Fiber.
              try {
                self.callback( self.token );
              }
              catch ( err ) {
                // Error handling for the callback.
              }

            }).run( {
              token: { gcm: userToken } ,
              callback: _removeToken
            });
            //_replaceToken({ gcm: userToken }, { gcm: result.results[0].registration_id }); // Original line, likely a copy-paste error. Should be _removeToken.

          }

        }
      });
      // /** Use the following line if you want to send the message without retries
      // sender.sendNoRetry(message, userTokens, function (result) {
      //     console.log('ANDROID: ' + JSON.stringify(result));
      // });
      // **/
    }; // EO (End of) sendAndroid function.

  } // EO (End of) Android GCM configuration.

  // Universal send function that queries the app collection and dispatches to APN or GCM.
  var _querySend = function ( query , options ) {

    var countApn = []; // To track APN recipients.
    var countGcm = []; // To track GCM recipients.

    Push.appCollection.find( query ).forEach( function ( app ) {

      if ( Push.debug ) { console.log('send to token', app.token); }

      if ( app.token.apn ) {
        countApn.push( app._id );
        // Send to APN if an APN token exists.
        if ( self.sendAPN ) { self.sendAPN( app.token.apn , options ); }

      }
      else if ( app.token.gcm ) {
        countGcm.push( app._id );

        // Send to GCM if a GCM token exists.
        // GCM supports multiple recipients, so we could construct an array and send in bulk.
        // Investigate the limit count of IDs for GCM bulk sending.
        if ( self.sendGCM ) { self.sendGCM( app.token.gcm , options ); }

      }
      else {
        // This indicates a malformed token in the collection.
        throw new Error('Push.send got a faulty query');
      }

    });

    if ( Push.debug ) {

      console.log('Push: Sent message "' + options.title + '" to ' + countApn.length + ' ios apps ' + countGcm.length + ' android apps');

      // Provide verbose feedback to the developer about the send result.
      if ( !countApn.length && !countGcm.length ) {
        if ( Push.appCollection.find().count() == 0 ) {
          console.log('Push, GUIDE: The "Push.appCollection" is empty - No clients have registred on the server yet...');
        }
      }
      else if ( !countApn.length ) {
        if ( Push.appCollection.find({ 'token.apn': { $exists: true } }).count() == 0 ) {
          console.log('Push, GUIDE: The "Push.appCollection" - No APN clients have registred on the server yet...');
        }
      }
      else if ( !countGcm.length ) {
        if ( Push.appCollection.find({ 'token.gcm': { $exists: true } }).count() == 0 ) {
          console.log('Push, GUIDE: The "Push.appCollection" - No GCM clients have registred on the server yet...');
        }
      }

    }

    return {
      apn: countApn ,
      gcm: countGcm
    };
  };

  self.serverSend = function ( options ) {
    options = options || { badge: 0 }; // Default badge count to 0 if not provided.
    var query;

    // Validate basic options.
    if ( options.from !== '' + options.from ) {
      throw new Error('Push.send: option "from" not a string');
    }

    if ( options.title !== '' + options.title ) {
      throw new Error('Push.send: option "title" not a string');
    }

    if ( options.text !== '' + options.text ) {
      throw new Error('Push.send: option "text" not a string');
    }

    if ( options.token || options.tokens ) {

      // User provided one or more specific tokens.
      var tokenList = ( options.token ) ? [ options.token ] : options.tokens;

      if ( Push.debug ) { console.log('Push: Send message "' + options.title + '" via token(s)', tokenList); }

      query = {
        $or: [
          // XXX: Test this query: can we hand in a list of push tokens directly?
          { token: { $in: tokenList } } ,
          // XXX: Test this query: does this work on app ID?
          { $and: [
            { _in: { $in: tokenList } } , // one of the app ids
            { $or: [
              { 'token.apn': { $exists: true } } , // got apn token
              { 'token.gcm': { $exists: true } } // got gcm token
            ]}
          ]}
        ]
      };

    }
    else if ( options.query ) {

      if ( Push.debug ) { console.log('Push: Send message "' + options.title + '" via query', options.query); }

      query = {
        $and: [
          options.query , // The user-provided query object.
          { $or: [
            { 'token.apn': { $exists: true } } , // Must have an APN token.
            { 'token.gcm': { $exists: true } } // Or a GCM token.
          ]}
        ]
      };
    }


    if ( query ) {

      // Convert the constructed query to _querySend and return its status.
      return _querySend( query , options );

    }
    else {
      // If neither token(s) nor a query was provided, throw an error.
      throw new Error('Push.send: please set option "token"/"tokens" or "query"');
    }

  };

  var isSendingNotification = false; // Flag to prevent concurrent sending of notifications.

  Meteor.setInterval( function () {

    if ( !isSendingNotification ) {
      // Set a fence to indicate that a send operation is in progress.
      isSendingNotification = true;

      // Find one unsent notification, ordered by creation time.
      var notification = Push.notifications.findOne( { sent : { $ne: true } } , { sort: { createdAt: 1 } } );

      // Check if there are any notifications pending to be sent.
      if ( notification ) {

        // If the query is a string, parse it from JSON.
        if ( notification.query && notification.query === '' + notification.query ) {
          try {
            // The query is in string JSON format - it needs to be parsed.
            notification.query = JSON.parse( notification.query );
          }
          catch ( err ) {
            // If parsing fails, it suggests data corruption or tampering.
            throw new Error('Push: Error while parsing query string, Error: ' + err.message);
          }
        }

        // Send the notification using the serverSend function.
        var result = Push.serverSend( notification );

        if ( !options.keepNotifications ) {
          // By default, notifications are removed after sending.
          Push.notifications.remove( { _id: notification._id } );
        }
        else {

          // If keepNotifications is true, update the notification status.
          Push.notifications.update( { _id: notification._id } , {
            $set: {
              sent: true ,
              sentAt: new Date() ,
              count: result
            }
          });

        }

        // Emit a 'send' event with the notification ID and result.
        self.emit( 'send' , { notification: notification._id , result: result } );
      }

      // Remove the send fence, allowing the next interval to process.
      isSendingNotification = false;
    }
  } , options.sendInterval || 15000 ); // Default interval is every 15 seconds.

};