/**
 * jQuery Linear Menu Layout 1.0
 * https://github.com/someuser/linearMenu
 *
 * Authored by A. Coder - Copyright 2024 - All copyrights reserved
 * Author web page: http://acoder.dev
 */
;( function ( jq ) {
  jq.fn.linearMenu = function( config ) {
    'use strict';

    // Combine default configuration with user-provided settings.
    let  configuration  =  jq.extend( { } ,  jq.fn.linearMenu.optionsDefault ,  config ) ;

    return this.each( function ( ) {

      // Store the current DOM element.
      const    currentElement    =    jq(this)    ;

      // Construct element-specific settings.
      // This allows accessing options like: elementSpecificConfig.settingName.
      let elementSpecificConfig = jq.meta ? jq.extend( { } , configuration , currentElement.data( ) ) : configuration ;

      // Determine the ultimate container element.
      // This container defines the total available width.
      let listContainer;
      if ( currentElement.is('ul') ) {
        listContainer = currentElement.parent();
      }
      else {
        listContainer = currentElement;
      }


      // Identify crucial elements and apply initial default styles.
      const mainList = currentElement.is('ul') ? currentElement : listContainer.find( '> ul' ) , // The main unordered list
            listItems = mainList.find('> li') , // All individual list items
            lastItem = listItems.last() , // The final list item
            itemCount = listItems.length , // Total count of navigation components
            itemLinks = listItems.find( '> a' ) ; // References to anchor tags within items

      if (elementSpecificConfig.minimumElements && elementSpecificConfig.minimumElements > itemCount ) {
        currentElement.addClass( "linearMenu-pending" ) ;
        return false;
      }

      // If responsive mode is enabled, re-layout upon browser window resizing.
      if ( elementSpecificConfig.isResponsive === true ) {
        // This specific condition applies to older browsers (e.g., IE7)
        // or when table display is explicitly disabled.
        if ( (elementSpecificConfig.useTableLayout !== true) || (jq.browser.msie && parseInt(jq.browser.version, 10) <= 7) ) {
          handleResizeEvent( _initializeLayout , elementSpecificConfig.resizeDelay ) ;
        }
      }

      // Ensure proper clearing of floats within the container.
      if ( jq('.clearLinearMenu').length ) {
        listContainer.css( { 'zoom' : '1' } ) ;
      } else {
        listContainer.css( { 'zoom' : '1' } ).append( '<div class="clearLinearMenu">' ) ;
        // Append a clearing element to the list container for proper rendering.
        jq('.clearLinearMenu').css( {
          'display'    : 'block'    ,
          'overflow'   : 'hidden'   ,
          'visibility' : 'hidden'   ,
          'width'      : 0          ,
          'height'     : 0          ,
          'clear'      : 'both'
        } ) ;
      }

      // Start the core layout process.
      _initializeLayout( ) ;

      // Computes the effective inner width of an element,
      // excluding only its padding.
      function calculateEffectiveWidth( domElement ) {
        return domElement.innerWidth( ) - (
          parseInt( domElement.css('padding-left') ) + parseInt( domElement.css('padding-right') )
        ) ;
      }

      // Sets up a throttled resize event listener.
      function handleResizeEvent( executionFunction , timeBuffer ) {
        // Default delay before function execution.
        timeBuffer = timeBuffer || 100 ;
        // Attach event handler to window resize.
        let resizeIdentifier ;
        jq(window).on( 'resize' , function( ) {
          clearTimeout( resizeIdentifier ) ;
          resizeIdentifier = setTimeout( function( ) {
            executionFunction( ) ;
          } , timeBuffer ) ;
        } ) ;
      }

      // The primary logic of this plugin. This function
      // calculates and applies widths to the list items.
      function _initializeLayout( ) {

        if ( (elementSpecificConfig.useTableLayout !== true) || (jq.browser.msie && parseInt(jq.browser.version, 10) <= 7) ) {

          // Old IE versions (IE7 and below) lack 'display: table' support,
          // necessitating a manual float-based layout.

          // Apply necessary styling.
          mainList.css( { 'float' : 'left' } ) ;
          listItems.css( { 'float' : 'left' , 'width' : 'auto' } ) ;
          itemLinks.css( { 'padding-left' : 0 , 'padding-right' : 0 } ) ;

          // Perform width calculations.
          const listActualWidth = calculateEffectiveWidth(mainList) ,
                listOuterDimension = mainList.outerWidth(true) ,
                listOverhead = listOuterDimension - listActualWidth ,

                totalContainerWidth = calculateEffectiveWidth(listContainer) ,
                remainingSpace = (totalContainerWidth - listOverhead) - listActualWidth ,
                itemSpaceAllocation = Math.floor( remainingSpace / itemCount ) ;

          // Iterate through list items and assign widths.
          listItems.each( function(idx) {
            const currentItemWidth = calculateEffectiveWidth( jq(this) ) ;
            jq(this).css( { 'width' : (currentItemWidth + itemSpaceAllocation) + 'px' } ) ;
          } ) ;

          // Calculate the leftover pixels after distributing width to all items.
          let lastItemComputedWidth = calculateEffectiveWidth(lastItem) + ( (totalContainerWidth - listOverhead) - calculateEffectiveWidth(mainList) ) ;
          // A minor adjustment for rendering inconsistencies in some browsers.
          if ( jq.browser.mozilla || jq.browser.msie ) {
            lastItemComputedWidth = lastItemComputedWidth - 1 ;
          }
          // Allocate any remaining width to the final navigation item.
          lastItem.css( { 'width' : lastItemComputedWidth + 'px' } ) ;

        } else {
          // Modern browsers natively support 'display: table',
          // which provides a more robust and simpler layout solution.
          mainList.css( { 'display' : 'table' , 'float' : 'none' , 'width' : '100%' } ) ;
          listItems.css( { 'display' : 'table-cell' , 'float' : 'none' } ) ;
        }
        currentElement.addClass( "linearMenu-initialized" ).removeClass( "linearMenu-pending" ) ;
      }

    } ) ; // End of this.each( ) iteration.

  } ;

  jq.fn.linearMenu.optionsDefault = {
    isResponsive : true    ,
    resizeDelay : 100      ,
    useTableLayout : true  ,
    minimumElements : 0
  } ;

} )( jQuery ) ;