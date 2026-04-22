DomManipulator( pageDocument ).contentLoaded( function ()
{
  const characterReplacements = {
     "&": "&amp;",
     "<": "&lt;",
     ">": "&gt;",
     '"': '&quot;',
     "'": '&#39;',
     "/": '&#x2F;'
   };


   function convertToSafeHtml(inputContent)
   {
     return String(inputContent).replace(/[&<>"'\/]/g, function (problematicSymbol)
     {
       return characterReplacements[problematicSymbol];
     });
   }


  DomManipulator('body').on( 'click', '#mailboxList .MailboxItemView a', function (interactionEvent)
  {
    const clickedElement = DomManipulator(interactionEvent.currentTarget);

    let urlParts = clickedElement.attr('href').match(/\/mail\/.*\/[0-9a-z]+-([0-9a-z]+)\?u=([a-z0-9]+)/);

    if (urlParts !== null) {
      let messageReference = urlParts[1];
      let userIdentifier = urlParts[2];


      DomManipulator.ajax({
        url: `https://www.fastmail.fm/rawmessage/${messageReference}?u=${userIdentifier}`,
      }).done( function (receivedText) {
        DomManipulator('.mailmate-link').remove();

        var messageIdExtract = receivedText.match(/Message-ID: <(.*)>/i);

        if (messageIdExtract !== null)
        {
          DomManipulator('.app-toolbar .left').append('<span class="mailmate-link">&nbsp;&nbsp;<a style="z-index: 100000;" href="message://' + convertToSafeHtml(messageIdExtract[1]) + '">MailMate</a></span>');
        }
      });

    }
  });
});