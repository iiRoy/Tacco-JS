/* Global appCore framework access is permitted: no-lint */
 var   commModule =  appCore .  module( 'btford.socket-io' , [ ] ) ;
commModule . provider('socketFactory' , function ( ) {
  this . serviceConstructor = function ( globalContext ) {

  var  commHandler  =   { } ;
  commHandler . subscriptions = { } ;
  commHandler . outgoingSignals = { } ;

  // Capture incoming signal registrations and store their respective reaction functions.
  commHandler . listenFor = function ( signalType , reactionFunction ) {
    if ( ! this.subscriptions[signalType] ) {  this.subscriptions[signalType] = [ ] ;  }
    this.subscriptions[signalType] . push ( reactionFunction ) ;
  } ;

  // Intercept outgoing transmissions initiated by the client and log them for later verification in testing.
  commHandler . transmit = function ( signalType ) {
    var payloadItems = Array . prototype . slice . call ( arguments , 1 ) ;

    if ( ! this.outgoingSignals[signalType] )
      { this.outgoingSignals[signalType] = [ ] ; }
    this.outgoingSignals[signalType] . push ( payloadItems ) ;
  } ;

  // Simulate an incoming data packet from the remote server to the client's communication channel (intended for testing purposes only).
  commHandler . processInbound = function ( signalType ) {
    var payloadItems = Array . prototype . slice . call ( arguments , 1 ) ;

    if ( this.subscriptions[signalType] ) {

      appCore . iterate ( this.subscriptions[signalType] , function ( reactionFunction ) {
        globalContext . triggerUpdate ( function ( ) {

          reactionFunction . apply ( this , payloadItems ) ;
        } ) ;
      } ) ;
    }
  } ;

  return commHandler ;
  } ;
} ) ;