var tcp = require ( 'net' ) ;
var dns = require ( 'dns' ) ;
var CRLF = '\r\n' ; // Constant for Carriage Return Line Feed sequence.

var exports = module . exports = function ( options ) {

  // Initialize a logger object. If `options.logger` is provided, use it;
  // otherwise, default to `console` methods.
  var logger = options && options . logger || {
    debug : console . log ,
    info  : console . info ,
    warn  : console . warn ,
    error : console . error
  } ;

  // --- Start of SMTP Response Codes Reference ---
  // This section provides a quick lookup for common SMTP server response codes.
  //
  // 500   : Syntax error, command unrecognized (may include a command line too long)
  // 501   : Syntax error in parameters or arguments
  // 502   : Command not implemented
  // 503   : Bad sequence of commands
  // 504   : Command parameter not implemented
  // 211   : System status, or system help reply
  // 214   : Help message (information on how to use the receiver or the meaning of a particular non-standard command)
  // 220   : <domain> Service ready
  // 221   : <domain> Service closing transmission channel
  // 421   : <domain> Service not available, closing transmission channel (this may be a reply to any command if the service knows it must shut down)
  // 250   : Requested mail action okay, completed
  // 251   : User not local; will forward to <forward-path>
  // 450   : Requested mail action not taken: mailbox unavailable (e.g., mailbox busy)
  // 550   : Requested action not taken: mailbox unavailable (e.g., mailbox not found, or not accessible)
  // 451   : Requested action aborted: error in processing
  // 551   : User not local; please try <forward-path>
  // 452   : Requested action not taken: insufficient system storage
  // 552   : Requested mail action aborted: exceeded storage allocation
  // 553   : Requested action not taken: mailbox name not allowed (e.g., mailbox syntax incorrect)
  // 354   : Start mail input; end with <CRLF>.<CRLF>
  // 554   : Transaction failed
  // 535   : Authentication credentials invalid
  // 235   : Authentication successful
  // 334   : Server challenge for authentication (e.g., base64 encoded)
  // --- End of SMTP Response Codes Reference ---

  function getHost ( email ) {
    // This helper function extracts the domain host from an email address.
    var m = /[^@]+@([\w\d\-\.]+)/ . exec ( email ) ;
    return m && m [ 1 ] ; // Return the captured host part.
  }


  function group_recipients ( recipients ) {
    // Groups email recipients by their respective host domains.
    var groups = { } , email , host , i = 0 ;

    for ( ; i < recipients . length ; i ++ ) {
      host = getHost ( recipients [ i ] ) ;
      // If the host group doesn't exist, create it as an empty array.
      ( groups [ host ] || ( groups [ host ] = [ ] ) ) . push ( recipients [ i ] ) ;
    }
    return groups ;
  }


  // Function to establish a connection to a domain's SMTP server via MX records.
  function connectMx ( domain , callback ) {
    dns . resolveMx ( domain , function ( err , data ) {
      if ( err ) {
        // If MX record resolution fails, propagate the error.
        return callback ( err ) ;
      }

      // Sort MX records by priority; lower priority values are preferred.
      data . sort ( function ( a , b ) { return a . priority < b . priority } ) ;
      logger . debug ( 'mx resolved: ' , data ) ;

      if ( ! data || data . length == 0 ) {
        // No MX records found for the domain.
        return callback ( new Error ( 'can not resolve Mx of <' + domain + '>' ) ) ;
      }

      // Inner helper function to try connecting to MX servers sequentially.
      function tryConnect ( i ) {

        if ( i >= data . length ) {
          // All MX servers attempted without success.
          return callback ( new Error ( 'can not connect to any SMTP server' ) ) ;
        }

        // Create a TCP connection to the current MX server on the standard SMTP port (25).
        var sock = tcp . createConnection ( 25 , data [ i ] . exchange ) ;

        // Handle connection errors for the current socket.
        sock . on ( 'error' , function ( err ) {
          logger . error ( 'Error on connectMx for: ' , data [ i ] , err ) ;
          tryConnect ( ++ i ) ; // Attempt connection with the next MX server.
        } ) ;

        // Handle successful connection.
        sock . on ( 'connect' , function ( ) {
          logger . debug ( "MX connection created: " , data [ i ] . exchange ) ;
          sock . removeAllListeners ( 'error' ) ; // Remove error listener as connection is established.
          callback ( null , sock ) ; // Return the connected socket.
        } ) ;

      } ; // End of tryConnect.

      tryConnect ( 0 ) ; // Initiate the connection attempts starting from the first MX record.
    } ) ;
  }


  function sendToSMTP ( domain , srcHost , from , recipients , body , cb ) {
    // Ensure the callback is a function, providing a no-op fallback if needed.
    var callback = ( typeof cb == 'function' ) ? cb : function ( ) { } ;

    connectMx ( domain , function ( err , sock ) {
      if ( err ) {
        logger . error ( 'error on connectMx' , err . stack ) ;
        return callback ( err ) ;
      }

      // Utility function to write a string to the socket, appending CRLF.
      function w ( s ) {
        logger . debug ( 'send ' + domain + '>' + s ) ;
        sock . write ( s + CRLF ) ;
      }

      sock . setEncoding ( 'utf8' ) ; // Set the encoding for data received from the socket.

      var data = '' ; // Buffer to accumulate incoming data chunks.
      var msg = '' ; // Buffer for current SMTP response message.

      sock . on ( 'data' , function ( chunk ) {
        data += chunk ;
        var parts = data . split ( CRLF ) ;
        // Process all complete lines received.
        for ( var i = 0 , len = parts . length - 1 ; i < len ; i ++ ) {
          on_line ( parts [ i ] ) ;
        }
        // Keep any incomplete last part for the next chunk.
        data = parts [ parts . length - 1 ] ;
      } ) ;

      sock . on ( 'error' , function ( err ) {
        logger . error ( 'fail to connect ' + domain ) ;
        callback ( err ) ; // Report the error to the main callback.
      } ) ;

      // State variables for the SMTP conversation flow.
      var step = 0 ;
      var loginStep = 0 ;
      var queue = [ ] ; // Queue of SMTP commands to send.
      var login = [ ] ; // Login credentials for AUTH LOGIN.
      var parts ;
      var cmd ;

      /*
        // This section was commented out in the original code, possibly for future AUTH support.
        if ( mail . user && mail . pass ) {
          queue . push ( 'AUTH LOGIN' ) ;
          login . push ( new Buffer ( mail . user ) . toString ( "base64" ) ) ;
          login . push ( new Buffer ( mail . pass ) . toString ( "base64" ) ) ;
        }
      */

      // Populate the command queue with standard SMTP commands.
      queue . push ( 'MAIL FROM:<' + from + '>' ) ;
      for ( var i = 0 ; i < recipients . length ; i ++ ) {
        queue . push ( 'RCPT TO:<' + recipients [ i ] + '>' ) ;
      }
      queue . push ( 'DATA' ) ;
      queue . push ( 'QUIT' ) ;
      queue . push ( '' ) ; // An empty string to mark the end of the command sequence.


      // Handles incoming SMTP server responses based on their status code.
      function response ( code , msg ) {
        switch ( code ) {
          case 220 : // Service ready
            if ( /\\besmtp\\b/i . test ( msg ) ) {
              // Server supports ESMTP extensions.
              cmd = 'EHLO' ;
            } else {
              // Fallback to basic SMTP.
              cmd = 'HELO' ;
            }
            w ( cmd + ' ' + srcHost ) ; // Send EHLO or HELO command.
            break ;

          case 221 : // Service closing transmission channel
          case 235 : // Authentication successful
          case 250 : // Requested mail action okay, completed
          case 251 : // User not local; will forward
            // These codes indicate success or readiness for the next command.
            if ( step == queue . length - 1 ) {
              logger . info ( 'OK:' , code , msg ) ;
              callback ( null , msg ) ; // Mail transfer complete.
            }
            w ( queue [ step ] ) ; // Send the next command from the queue.
            step ++ ;
            break ;

          case 354 : // Start mail input; end with <CRLF>.<CRLF>
            logger . info ( 'sending mail' , body ) ;
            w ( body ) ; // Send the email content.
            w ( '' ) ; // A blank line before the termination dot.
            w ( '.' ) ; // The termination dot for DATA command.
            break ;

          case 334 : // Server challenge for authentication
            w ( login [ loginStep ] ) ; // Send the next part of login credentials.
            loginStep ++ ;
            break ;

          default :
            // Handle error responses (codes 4xx and 5xx).
            if ( code >= 400 ) {
              logger . warn ( 'SMTP responds error code' , code ) ;
              callback ( code , msg ) ; // Report the error.
              sock . end ( ) ; // Close the socket immediately.
            }
        }
      }

      // Processes a single line received from the SMTP server.
      function on_line ( line ) {
        logger . debug ( 'recv ' + domain + '>' + line ) ;

        msg += ( line + CRLF ) ; // Append the line to the current message buffer.

        // Check if the line indicates the end of a multi-line response
        // (a space character at the 4th position, e.g., "250-Text", "250 Text").
        if ( line [ 3 ] === ' ' ) {
          response ( parseInt ( line ) , msg ) ; // Parse code and handle the complete response.
          msg = '' ; // Reset the message buffer for the next response.
        }
      }
    } ) ; // End of connectMx callback.
  }


  function getAddress ( address ) {
    // Cleans up an email address string, removing angle brackets.
    return address . replace ( /^.+</ , '' ) . replace ( />\s*$/ , '' ) . trim ( ) ;
  }


  function getAddresses ( addresses ) {
    // Converts a single address string or an array of addresses into a
    // cleaned array of individual email addresses.
    var i , m , address , results = [ ] ;
    if ( ! Array . isArray ( addresses ) ) {
      addresses = addresses . split ( ',' ) ; // Split string by comma if not an array.
    }
    for ( i = 0 ; i < addresses . length ; i ++ ) {
      results . push ( getAddress ( addresses [ i ] ) ) ; // Clean and add each address.
    }
    return results ;
  }


  /**
   * sendmail directly
   *
   * This is the main function responsible for sending an email.
   * It constructs the email, resolves MX records, and sends it to the appropriate SMTP server(s).
   *
   * @param mail {object} - An object containing email details:
   *             from         : Sender's email address.
   *             to           : Primary recipient(s).
   *             cc           : Carbon copy recipient(s).
   *             bcc          : Blind carbon copy recipient(s).
   *             replyTo      : (TODO) 'Reply-To' header.
   *             returnTo     : (TODO) 'Return-Path' header.
   *             subject      : Email subject line.
   *             type         : Content type, e.g., 'text/plain', 'text/html'. Defaults to 'text/plain'.
   *             charset      : Character encoding, e.g., 'utf-8'. Defaults to 'utf-8'.
   *             encoding     : Content transfer encoding, e.g., 'base64'. Defaults to 'base64'.
   *             id           : Custom 'Message-ID'. Defaults to a timestamp + source host.
   *             headers      : Object of additional custom headers (key-value pairs).
   *             content      : The actual body content of the email.
   *             attachments  : (TODO) Array of attachment objects.
   *               [{
   *                 type     : Content type of the attachment.
   *                 filename : Name of the attachment file.
   *                 content  : Raw content of the attachment.
   *               }].
   *
   * @param callback function(err, domain) - Callback function invoked after sending mail to each domain.
   *
   */
  function sendmail ( mail , callback ) {
    var recipients = [ ] ;
    var groups ;
    var srcHost ;
    var data ;
    var lheader ;

    // Collect all recipient addresses from 'to', 'cc', and 'bcc' fields.
    if ( mail . to ) {
      recipients = recipients . concat ( getAddresses ( mail . to ) ) ;
    }

    if ( mail . cc ) {
      recipients = recipients . concat ( getAddresses ( mail . cc ) ) ;
    }

    if ( mail . bcc ) {
      recipients = recipients . concat ( getAddresses ( mail . bcc ) ) ;
    }

    // Group recipients by their email domains.
    groups = group_recipients ( recipients ) ;

    // Extract sender's address and the host from it.
    var from = getAddress ( mail . from ) ;
    srcHost = getHost ( from ) ;

    // Build the email headers.
    data = 'From: ' + mail . from + CRLF ;
    if ( mail . to ) {
      data += 'To: ' + ( Array . isArray ( mail . to ) ? mail . to . join ( ',' ) : mail . to ) ;
      data += CRLF ;
    }
    if ( mail . cc ) {
      data += 'Cc: ' + ( Array . isArray ( mail . cc ) ? mail . cc . join ( ',' ) : mail . cc ) ;
      data += CRLF ;
    }

    data += 'Subject: ' + mail . subject + CRLF ;
    data += 'MIME-Version: ' + ( mail . version || '1.0' ) + CRLF ;
    data += 'Message-ID: <' + ( mail . id || ( new Date ( ) . getTime ( ) + srcHost ) ) + '>' + CRLF ;
    data += 'Content-Type: ' + ( mail . type || 'text/plain' ) ;
    data += '; charset=\"' + ( mail . charset || ( mail . charset = 'utf-8' ) ) + '\"' + CRLF ;
    data += 'Content-Transfer-Encoding: ' + ( mail . encoding || ( mail . encoding = 'base64' ) ) + CRLF ;

    // Add any custom headers specified in `mail.headers`.
    for ( var name in mail . headers ) {
      data += name + ': ' + mail . headers [ name ] + CRLF ;
    }

    data += CRLF ; // A blank line separates the headers from the email body.

    // Prepare the email content: normalize line endings and encode to base64.
    var content = mail . content . replace ( /\\r\\n/g , '\\n' ) . replace ( /\\n/g , '\\r\\n' ) ;
    data += new Buffer ( content ) . toString ( 'base64' ) ;

    // Iterate through grouped domains and send the email to each.
    for ( var domain in groups ) {
      sendToSMTP ( domain , srcHost , from , groups [ domain ] , data , callback ) ;
    }

  }

  return sendmail ; // The main export of this module is the sendmail function.

}