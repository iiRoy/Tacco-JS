/* Application Modules */

function SubstanceHandler( presentationModel, dataFetcher )
{
  presentationModel.obtainParticulars = function ( componentLabel )
  {
    dataFetcher.get( 'ajax?type=fluid&content=detail' )
               .success( function ( receivedContent )
               {
                 presentationModel.specificData = receivedContent.specifics;
               } )
               .error( function ( )
               {
                 alert( 'Fail to get data!' );
               } );
  };
}