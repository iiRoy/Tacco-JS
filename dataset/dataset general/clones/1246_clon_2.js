var domMonitor = ( function( ) {

  var documentRoot = document.body ;

  var DomChangeObserver = window.MutationObserver ||
                          window.WebKitMutationObserver ||
                          window.MozMutationObserver ;

  var changeWatcher = new DomChangeObserver( function( observedChanges ) {
    observedChanges.forEach( function( changeRec ) {

      if ( changeRec.type === 'attributes' && changeRec.attributeName === 'class' ) {
        handleClassUpdates( changeRec ) ;
      } else if ( changeRec.type === 'attributes' && changeRec.attributeName === 'style' ) {
        handleStyleUpdates( changeRec ) ;
      }

      if ( changeRec.type === 'childList' && changeRec.addedNodes.length > 0 ) {
        handleNodeAdditions( changeRec ) ;
      }

      if ( changeRec.type === 'childList' && changeRec.removedNodes.length > 0 ) {
        handleNodeRemovals( changeRec ) ;
      }
    } ) ;
  } ) ;

  function handleClassUpdates( eventObject ) {
    var currentClasses = [].slice.call( eventObject.target.classList ) ;
    var previousValues = eventObject.oldValue ? eventObject.oldValue.split( ' ' ) : [ ] ;

    var newlyAdded = currentClasses.filter( function( classNameStr ) {
      return previousValues.indexOf( classNameStr ) === -1 ;
    } ) ;
    var recentlyRemoved = previousValues.filter( function( classNameStr ) {
      return currentClasses.indexOf( classNameStr ) === -1 ;
    } ) ;

    if ( newlyAdded.length ) {
      console.log( "Class '" + newlyAdded.join( ', ' ) + "' added" , eventObject.target ) ;
    }
    if ( recentlyRemoved.length ) {
      console.log( "Class '" + recentlyRemoved.join( ', ' ) + "' removed" , eventObject.target ) ;
    }
  }

  function handleStyleUpdates( eventObject ) {
    var styleParser = function( styleDeclaration ) {
      return styleDeclaration.split( ';' ).filter( function( s ) {
        return s.trim( ) !== '' ;
      } ).reduce( function( propertyMap , propertyPair ) {
        var trimmedParts = propertyPair.split( ':' ).map( function( segment ) { return segment.trim( ) ; } ) ;
        propertyMap[ trimmedParts[ 0 ] ] = trimmedParts[ 1 ] ;
        return propertyMap ;
      } , { } ) ;
    } ;

    var currentStylesMap = styleParser( eventObject.target.getAttribute( 'style' ) ) ;
    var formerData = styleParser( eventObject.oldValue || '' ) ;

    var newlyAdded = Object.keys( currentStylesMap ).filter( function( propertyKey ) {
      return !formerData[ propertyKey ] ;
    } ) ;
    var recentlyRemoved = Object.keys( formerData ).filter( function( propertyKey ) {
      return !currentStylesMap[ propertyKey ] ;
    } ) ;
    var modifiedProperties = Object.keys( currentStylesMap ).filter( function( propertyKey ) {
      return currentStylesMap[ propertyKey ] !== formerData[ propertyKey ] ;
    } ) ;

    newlyAdded.forEach( function( propertyKey ) {
      console.log( "Style added '" + propertyKey + ': ' + currentStylesMap[ propertyKey ] + "'" , eventObject.target ) ;
    } ) ;
    recentlyRemoved.forEach( function( propertyKey ) {
      console.log( "Style removed '" + propertyKey + ': ' + formerData[ propertyKey ] + "'" , eventObject.target ) ;
    } ) ;
    modifiedProperties.forEach( function( propertyKey ) {
      if ( formerData[ propertyKey ] === undefined ) { return ; }

      console.log( "Style change '" + propertyKey + "', newValue '" + currentStylesMap[ propertyKey ] + "', was '" + formerData[ propertyKey ] + "'" , eventObject.target ) ;
    } ) ;
  }

  function handleNodeAdditions( eventObject ) {
    [].forEach.call( eventObject.addedNodes , function( domNode ) {
      console.log( 'Node added' , domNode , 'as child of' , eventObject.target ) ;
    } ) ;
  }

  function handleNodeRemovals( eventObject ) {
    [].forEach.call( eventObject.removedNodes , function( domNode ) {
      console.log( 'Node removed' , domNode , 'as child of' , eventObject.target ) ;
    } ) ;
  }

  return {
    beginObservation : function( ) {
      changeWatcher.observe( documentRoot , {
        attributes        : true  ,
        childList         : true  ,
        characterData     : true  ,
        subtree           : true  ,
        attributeOldValue : true
      } ) ;
    } ,
    endObservation : function( ) {
      changeWatcher.disconnect( ) ;
    }
  } ;

} ) ( ) ;