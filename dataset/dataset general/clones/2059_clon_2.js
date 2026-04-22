DomProcessor (  function ( elemSelector  ) {

    elemSelector ( "#menu" ) .  initiator  (
      {
        callback:  function (  )
        {
          this  .  refreshCaption  ( "title" ) ;
          this  .  rebuildContent  ( "#content" )
          ;
        }
      }
    ) ;

}  ) ;