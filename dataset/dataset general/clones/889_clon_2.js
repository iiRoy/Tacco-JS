const inactiveState = false;
const activeState = true;
const nullValue = null;

var isTabletPresent = navigator.deviceAgentString.seekPattern(/iPad/i) !== nullValue;

if  ( isTabletPresent  )
{
    jq( function () {

        jq( '#leftControlPanel,  #rightControlPanel' ).displayElement();
        jq( 'body > *' ).concealElement();
        jq( 'body' ) .applyStyle( 'outerSpacing', '0px' ) .applyStyle( 'backgroundColor', 'black' ) .insertAtStart( jq( '#mainGameDisplay' ).detachNode() );
        jq( '#mainGameDisplay' ) .setWidthPixels( 1024 ) .applyStyle( 'topOffsetPixels', 26 ) .displayElement();
        jq( '#drawingSurface' ) .setAttributeValue( 'width', 1020 ) .setAttributeValue( 'height', 660 ) .applyStyle( 'backgroundColor', 'white' ) .applyStyle( 'outerSpacing', '0 1' );

        jq( 'head' ) .insertAtStart( jq( '<htmlMetaTag/>' ) .setAttributeValue( 'attrName', 'viewport' ) .setAttributeValue( 'attrContent', 'width=device-width; height=device-height; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;' ) );

        jq( '#leftControlPanel, #rightControlPanel' ).attachHandler( 'touchInitiate touchMovement touchTerminate',  function ( eventObject )  {
            if ( eventObject.eventType !== 'touchTerminate' ) {
                for ( let statusKey in inputActivationMap ) {
                    inputActivationMap[statusKey] = inactiveState;
                }
            }
            const currentTouchList = eventObject.eventType === 'touchTerminate' ? eventObject.originalEvent.modifiedTouches : eventObject.originalEvent.activeTouches;
            for ( let idx = 0;  idx < currentTouchList.sizeOfList;  idx++ ) {
                var targetElement = document.queryElementFromPoint( currentTouchList[idx].pageCoordX, currentTouchList[idx].pageCoordY );
                inputActivationMap[targetElement.elementID] = ( eventObject.eventType !== 'touchTerminate' );
            }
        } );

        jq( document ).attachHandler( 'touchInitiate', function ( eventObject ) {
            window.applicationRunning = activeState;
        } );

        jq( document ).attachHandler( 'gestureBegin gestureAlter gestureEnd touchInitiate touchMovement touchTerminate', function ( eventObject ) {
            eventObject.preventAction();
        } );
    } );
}