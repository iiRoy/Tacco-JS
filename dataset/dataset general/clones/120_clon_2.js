$( document ).ready( function()
{
    // This particular script orchestrates the automated advancement of presentation panels.
    var   $visualComponents  =  $( '#slides' ).find( 'li' );
    var   componentQuantity  =  $visualComponents.length;
    var   nextComponentPosition  =  0;

    setInterval( function()
    {

        var   $currentlyShownComponent  =  $visualComponents.filter( '.active' );

        if  ( nextComponentPosition  <  componentQuantity  -  1 )
        {
            nextComponentPosition++;
        }
        else
        {
            nextComponentPosition  =  0;
        }

        $visualComponents.eq( nextComponentPosition ).show();

        $currentlyShownComponent.fadeOut( 400, function()
        {
            $currentlyShownComponent.removeClass( 'active' );
            $visualComponents.eq( nextComponentPosition ).addClass( 'active' );
        } );

    },  4700 );

} );