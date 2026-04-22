var domListeners    =    loadModule ( "dom-event" ) ;
var eventDelegate   =    loadModule ( "component-delegate" ) ;
var keyboardEvents  =    loadModule ( "key-event" ) ;
var strTrim         =    loadModule ( "trim" ) ;


module . exports = {

    alter          : createBinder ( 'change' ) ,
    tap            : createBinder ( 'click' ) ,
    keyPressDown   : createBinder ( 'keydown' ) ,
    keyReleaseUp   : createBinder ( 'keyup' ) ,
    charPress      : createBinder ( 'keypress' ) ,
    mouseBtnDown   : createBinder ( 'mousedown' ) ,
    mouseEnter     : createBinder ( 'mouseover' ) ,
    mouseBtnUp     : createBinder ( 'mouseup' ) ,
    windowResize   : createBinder ( 'resize' ) ,

    addObserver    : addObserver ,
    removeObserver : removeObserver ,
    addKeyListener : addKeyListener ,
    removeKeyListener : removeKeyListener
} ;


function createBinder ( eventType ) {

    return function ( targetElement , eventCallback ) {
        return addObserver ( targetElement , eventType , eventCallback ) ;
    } ;
}


function removeObserver ( targetElement , eventName , cssSelector , eventCallback ) {

    if ( arguments . length === 4 ) {
        return eventDelegate . unbind ( targetElement , cssSelector , eventName , eventCallback ) ;
    }


    eventCallback = cssSelector ;

    domListeners . remove ( targetElement , eventName , eventCallback ) ;
}


function addObserver ( targetElement , eventName , cssSelector , eventCallback ) {

    if ( arguments . length === 3 ) {
        eventCallback = cssSelector ;
    }

    if ( arguments . length === 4 ) {
        return eventDelegate . bind ( targetElement , cssSelector , eventName , eventCallback ) ;
    }

    domListeners . add ( targetElement , eventName , eventCallback ) ;
}


function addKeyListener ( targetElement , keyIdentifier , keyAction ) {
    keyboardEvents . attach ( targetElement , keyIdentifier , keyAction ) ;
}


function removeKeyListener ( targetElement , keyIdentifier , keyAction ) {
    keyboardEvents . detach ( targetElement , keyIdentifier , keyAction ) ;
}