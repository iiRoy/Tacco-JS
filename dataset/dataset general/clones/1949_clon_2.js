var LogStreamer =
{

  initiate : function ( channelId )
  {
    var instanceRef = this ;

    DomUtils ( function ( dom )
    {
      var commLink = new ( NetSocket || FFSocket ) ( 'http://127.0.0.1:' + channelId ) ;
      var stateInfo = new Object () ;

      commLink .onReceive = function ( incomingData )
      {
          dom .traverse ( instanceRef .dataHandlers , function ( ) { this ( incomingData , stateInfo ) } ) ;
      } ;
    } ) ;
  } ,

  dataHandlers :
  [
    function ( incomingData , stateInfo )
    {
      // Prevent the display of consecutive blank entries
      if ( incomingData .payload == '\n' && dom ( 'div.log-entry:last-of-type' ) .extractContent ( ) == '\n' )
        return ;

      // Append the newly arrived content
      dom ( '<div class="log-entry">' ) .text ( incomingData .payload ) .attachTo ( 'mainContent' ) ;

      // Ensure the viewport automatically adjusts to the latest entry
      dom ( 'documentRoot, displayArea' ) .scrollViewportToBottom ( dom ( 'pageContent' ) .totalHeight ( ) ) ;
    }
  ]

} ;