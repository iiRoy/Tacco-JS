/*
 * viewport-adapt.js - A compact and rapid polyfill for min/max-width CSS3 Media Directives
 * Copyright 2023, Your Name, yourwebsite.com
 * Dual licensed under the MIT or Apache Version 2.0 licenses. 
 * Usage: Refer to the documentation or source repository at github.com/yourname/viewport-adapt
*/
( function( globalScope, mqFeatureSupported ) {
  // exported module namespace
  globalScope.viewportAdapt = {};

  // define refreshStyles even in native-mq-supporting browsers, to avoid errors
  viewportAdapt.refreshStyles = function() {};

  // expose media query support indicator for external consumption
  viewportAdapt.mediaDirectivesSupported = mqFeatureSupported;

  // if media queries are supported, exit here
  if ( mqFeatureSupported ) {
    return;
  }

  // define variables
  const currentDocument = globalScope.document;
  const documentRoot = currentDocument.documentElement;
  const directiveCollections = [];
  const styleRules = [];
  const insertedElements = [];
  const processedSheets = {};
  const resizeDelayDuration = 30;
  const documentHead = currentDocument.getElementsByTagName( "head" )[ 0 ] || documentRoot;
  const linkElements = documentHead.getElementsByTagName( "link" );
  const requestQueueItems = [];

  // iterate through stylesheets, send text content to transform
  const parseAllCSS = function() {
    const allLinks = linkElements;
    const linkCount = allLinks.length;

    for ( let idx = 0; idx < linkCount; idx++ ) {
      const currentLink = allLinks[ idx ];
      const linkRef = currentLink.href;
      const mediaAttr = currentLink.media;
      const isExternalCSS = currentLink.rel && currentLink.rel.toLowerCase() === "stylesheet";

      // only link elements please and prevent re-processing
      if ( !!linkRef && isExternalCSS && !processedSheets[ linkRef ] ) {
        if (
          !/^([a-zA-Z]+?:(\/\/)?(www\.)?)/.test( linkRef ) ||
          linkRef.replace( RegExp.$1, "" ).split( "/" )[ 0 ] === globalScope.location.host
        ) {
          requestQueueItems.push( {
            url: linkRef,
            mediaType: mediaAttr,
          } );
        } else {
          processedSheets[ linkRef ] = true;
        }
      }
    }
    initiateRequests();
  };

  // recurse through request queue, fetch css text
  const initiateRequests = function() {
    if ( requestQueueItems.length ) {
      const nextRequest = requestQueueItems.shift();

      fetchContent( nextRequest.url, function( styleContent ) {
        processCSS( styleContent, nextRequest.url, nextRequest.mediaType );
        processedSheets[ nextRequest.url ] = true;
        initiateRequests();
      } );
    }
  };

  // find media blocks in css text, convert to style blocks
  const processCSS = function( cssText, stylesheetUrl, mediaAttribute ) {
    const querySections = cssText.match( /@media ([^\{]+)\{([\S\s]+?)(?=\}\/\*\/mediaquery\*\/)/gmi );
    const sectionCount = ( querySections && querySections.length ) || 0;
    // attempt to determine CSS base path
    const baseUrl = stylesheetUrl.substring( 0, stylesheetUrl.lastIndexOf( "/" ) );
    const resolveRelativeUrls = function( css ) {
      return css.replace( /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, "$1" + baseUrl + "$2$3" );
    };
    const useExternalMedia = !sectionCount && mediaAttribute;

    // if path exists, append trailing slash
    if ( baseUrl.length ) {
      baseUrl += "/";
    }

    // if no internal queries exist, but media attr does, use that
    // note: this currently lacks support for situations where a media attr is specified on a link AND
    // its associated stylesheet has internal CSS media queries.
    // In those cases, the media attribute will currently be ignored.
    if ( useExternalMedia ) {
      sectionCount = 1;
    }

    for ( let i = 0; i < sectionCount; i++ ) {
      let fullQuery;

      // media attribute
      if ( useExternalMedia ) {
        fullQuery = mediaAttribute;
        styleRules.push( resolveRelativeUrls( cssText ) );
      }
      // parse for styles
      else {
        fullQuery = querySections[ i ].match( /@media ([^\{]+)\{([\S\s]+?)$/ ) && RegExp.$1;
        styleRules.push( RegExp.$2 && resolveRelativeUrls( RegExp.$2 ) );
      }

      const individualQueries = fullQuery.split( "," );
      const queryPartCount = individualQueries.length;

      for ( let j = 0; j < queryPartCount; j++ ) {
        const currentQuery = individualQueries[ j ];
        directiveCollections.push( {
          mediaType: currentQuery.match( /(only\s+)?([a-zA-Z]+)(\sand)?/ ) && RegExp.$2,
          ruleIndex: styleRules.length - 1,
          minWidthValue: currentQuery.match( /\(min\-width:\s?(\s?[0-9]+)px\s?\)/ ) && parseFloat( RegExp.$1 ),
          maxWidthValue: currentQuery.match( /\(max\-width:\s?(\s?[0-9]+)px\s?\)/ ) && parseFloat( RegExp.$1 ),
        } );
      }
    }

    applyCurrentMedia();
  };

  let lastExecutionTime;
  let deferredResizeHandler;

  // enable/disable styles
  const applyCurrentMedia = function( triggeredByResize ) {
    const dimensionProperty = "clientWidth";
    const rootElementDimension = documentRoot[ dimensionProperty ];
    const currentViewportWidth =
      currentDocument.compatMode === "CSS1Compat" && rootElementDimension ||
      currentDocument.body[ dimensionProperty ] ||
      rootElementDimension;
    const activeStyleBlocks = {};
    const documentFragment = currentDocument.createDocumentFragment();
    const lastLinkInHead = linkElements[ linkElements.length - 1 ];
    const currentTime = new Date().getTime();

    // throttle resize calls
    if ( triggeredByResize && lastExecutionTime && currentTime - lastExecutionTime < resizeDelayDuration ) {
      clearTimeout( deferredResizeHandler );
      deferredResizeHandler = setTimeout( applyCurrentMedia, resizeDelayDuration );
      return;
    } else {
      lastExecutionTime = currentTime;
    }

    for ( const key in directiveCollections ) {
      const currentDirective = directiveCollections[ key ];
      if (
        ( !currentDirective.minWidthValue && !currentDirective.maxWidthValue ) ||
        ( ( !currentDirective.minWidthValue || ( currentDirective.minWidthValue && currentViewportWidth >= currentDirective.minWidthValue ) ) &&
          ( !currentDirective.maxWidthValue || ( currentDirective.maxWidthValue && currentViewportWidth <= currentDirective.maxWidthValue ) ) )
      ) {
        if ( !activeStyleBlocks[ currentDirective.mediaType ] ) {
          activeStyleBlocks[ currentDirective.mediaType ] = [];
        }
        activeStyleBlocks[ currentDirective.mediaType ].push( styleRules[ currentDirective.ruleIndex ] );
      }
    }

    // remove any existing viewport-adapt style element(s)
    for ( const key in insertedElements ) {
      if ( insertedElements[ key ] && insertedElements[ key ].parentNode === documentHead ) {
        documentHead.removeChild( insertedElements[ key ] );
      }
    }

    // inject active styles, grouped by media type
    for ( const mediaType in activeStyleBlocks ) {
      const styleElement = currentDocument.createElement( "style" );
      const cssContent = activeStyleBlocks[ mediaType ].join( "\n" );

      styleElement.type = "text/css";
      styleElement.media = mediaType;

      if ( styleElement.styleSheet ) {
        styleElement.styleSheet.cssText = cssContent;
      } else {
        styleElement.appendChild( currentDocument.createTextNode( cssContent ) );
      }
      documentFragment.appendChild( styleElement );
      insertedElements.push( styleElement );
    }

    // append to DOM at once
    documentHead.insertBefore( documentFragment, lastLinkInHead.nextSibling );
  };

  // modified Ajax functions from Quirksmode
  const fetchContent = function( urlAddress, completionCallback ) {
    const httpRequest = createXmlHttpObject();
    if ( !httpRequest ) {
      return;
    }
    httpRequest.open( "GET", urlAddress, true );
    httpRequest.onreadystatechange = function() {
      if ( httpRequest.readyState !== 4 || ( httpRequest.status !== 200 && httpRequest.status !== 304 ) ) {
        return;
      }
      completionCallback( httpRequest.responseText );
    };
    if ( httpRequest.readyState === 4 ) {
      return;
    }
    httpRequest.send();
  };

  // define ajax object factory
  const createXmlHttpObject = ( function() {
    let xmlHttpInstance = false;
    const possibleImplementations = [
      function() {
        return new ActiveXObject( "Microsoft.XMLHTTP" );
      },
      function() {
        return new ActiveXObject( "Msxml3.XMLHTTP" );
      },
      function() {
        return new ActiveXObject( "Msxml2.XMLHTTP" );
      },
      function() {
        return new XMLHttpRequest();
      },
    ];
    let attemptCount = possibleImplementations.length;

    while ( attemptCount-- ) {
      try {
        xmlHttpInstance = possibleImplementations[ attemptCount ]();
      } catch ( err ) {
        continue;
      }
      break;
    }
    return function() {
      return xmlHttpInstance;
    };
  } )();

  // process all CSS
  parseAllCSS();

  // expose refreshStyles for re-running viewportAdapt later on
  viewportAdapt.refreshStyles = parseAllCSS;

  // adjust on resize
  function handleWindowResize() {
    applyCurrentMedia( true );
  }
  if ( globalScope.addEventListener ) {
    globalScope.addEventListener( "resize", handleWindowResize, false );
  } else if ( globalScope.attachEvent ) {
    globalScope.attachEvent( "onresize", handleWindowResize );
  }
} )(
  this,
  ( function( currentWindow ) {
    // for speed, flag browsers with window.matchMedia support and IE 9 as supported
    if ( currentWindow.matchMedia ) {
      return true;
    }

    let supportStatus;
    const currentDocument = document;
    const documentRoot = currentDocument.documentElement;
    const referenceNode = documentRoot.firstElementChild || documentRoot.firstChild;
    // dummyBody required for <FF4 when executed in <head>
    const dummyBody = currentDocument.createElement( "body" );
    const testDiv = currentDocument.createElement( "div" );
    const mediaQueryString = "only all";

    testDiv.id = "mq-test-probe-1";
    testDiv.style.cssText = "position:absolute;top:-99em";
    dummyBody.appendChild( testDiv );

    testDiv.innerHTML = '_<style media="' + mediaQueryString + '"> #mq-test-probe-1 { width: 9px; }</style>';
    documentRoot.insertBefore( dummyBody, referenceNode );
    testDiv.removeChild( testDiv.firstChild );
    supportStatus = testDiv.offsetWidth === 9;
    documentRoot.removeChild( dummyBody );
    return supportStatus;
  } )( this )
);