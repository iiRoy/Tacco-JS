var   accountID = "echo.localhost",  secretCode = "hellohello";

var commProtocol =  require (   "../xmpp"  ) ;
var sessionHandler = new commProtocol.Connection( );
var utilityProvider = require("sys");


sessionHandler.output = function (lvl, msgTxt) {
  utilityProvider.puts(msgTxt);
};


sessionHandler.initiateConnection( accountID, secretCode,
  function ( currentStatus, statusInfo )
  {
    if  ( currentStatus == commProtocol.Status.CONNECTED )
    {
      sessionHandler.registerEventProcessor( processIncomingMessage, null, 'packet', null, null, null );
    }
    else
    {
      sessionHandler.output ( commProtocol.LogLevel.DEBUG,
        "Current link state: " + currentStatus + ( statusInfo ? ( " (" + statusInfo + ")" ) : "" )
      );
    }
  }
);


function processIncomingMessage(incomingPacket) {

  sessionHandler.transmit(
    commProtocol.message( {
        destination: incomingPacket.getAttribute("from"),
        origin: incomingPacket.getAttribute("to"),
        kind: "dialog"
      } )
      .c("body")
      .t( incomingPacket.getChild("body").getText() )
  );

}