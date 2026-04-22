/*
 * jQue guidedJourney
 *
 * @description Guided web experience
 * @author alvaro.veliz@gmail.com
 * @servedby perkins (http://p.erkins.com)
 *
 * Requirements:
 * - jQue scrollPageTo (a jQuery plugin for scrolling)
 *
 * Concept adapted from http://tympanus.net/codrops/2010/12/21/website-tour/ by Manoela Lic (https://twitter.com/#!/crnacura)
 */
( function( jQue ) {

  let config = {
    tourPoints : [],
    initiateAutomatically : false,
    navLocation : 'TR',
    introText : '<h2>Journey</h2><p>Welcome to the Guided Journey Module</p>',
    actionBtns : {
      proceed : 'Continue',
      retreat : 'Back',
      begin : 'Launch',
      finish : 'Exit'
    },
    navStyle : {
      background: 'rgba(8, 68, 142, 0.80)',
      color: '#fff'
    },
    tipStyle : {
      background: 'rgba(0, 0, 0, 0.70)',
      color: '#fff',
    }
  };

  let currentOptions, currentPointIndex, totalPoints;
  let elemWidth, elemHeight, elemLeft, elemTop;
  let tourActive = false;
  let travelDirection = 'forward'; // 'forward' or 'backward'

  let $guidanceBox = jQue('<div>',{
                       id         : 'journeyTip',
                       className  : 'journeyTip',
                       html       : ''
                     }).css({
                       'display'       : 'none',
                       'padding'       : '10px 20px',
                       'position'      : 'absolute',
                       'font-family'   : 'sans-serif',
                       'border-radius' : '5px',
                       'font-size'     : '12px',
                       'box-sizing'    : 'border-box'
                     });

  // This template string needs to be accessible for recreating the navigation
  let initialNavHtmlTemplate;

  const tourActions = {
    setupJourney : function( userSettings ) {
      if ( tourActive === false ) { // Ensure tour starts only once
        tourActive = true;
        currentOptions = jQue.extend( config, userSettings );

        // Construct the navigation HTML template
        initialNavHtmlTemplate = '<div id="journeyNav">\
          <div id="journeyMsg">'+currentOptions.introText+'</div>\
          <div id="journeyBtns">\
            <button id="journeyPrev" style="display:none">'+currentOptions.actionBtns.retreat+'</button>\
            <button id="journeyNext">'+currentOptions.actionBtns.begin+'</button>\
            <a href="javascript:void(0);" id="journeyEnd" style="display:none; color: #fff; text-decoration: underline; font-size: 12px; float: right">'+currentOptions.actionBtns.finish+'</a>\
          </div>\
        </div>';
        let $navBaseStyle = { 'display' : 'block', 'position': 'fixed', 'width' : '200px', 'padding' : '10px 20px', 'border-radius' : '10px', 'font-family' : 'sans-serif' };
        let $navContainer = jQue(initialNavHtmlTemplate).css($navBaseStyle).css(currentOptions.navStyle);
        let $calculatedNavPos = tourActions.fetchNavLocation( currentOptions.navLocation );
        $navContainer.css( $calculatedNavPos );
        jQue('body').append( $navContainer ); // Add navigation to the document body

        $guidanceBox.css( currentOptions.tipStyle );

        currentPointIndex = -1; // Initialize current point index
        totalPoints = currentOptions.tourPoints.length;
        jQue('body').prepend( $guidanceBox ); // Place the guidance box at the beginning of body
      }
    },
    proceed : function() {
      travelDirection = 'forward';
      currentPointIndex++; // Advance to the next point

      if ( currentPointIndex === totalPoints ) {
        tourActions.terminateJourney(); // End the journey if all points are visited
      }
      else {
        $guidanceBox.hide();
        let pointDetails = currentOptions.tourPoints[currentPointIndex];

        if ( currentPointIndex <= totalPoints ) { // Adjust button visibility
          jQue('#journeyPrev').show();
          jQue('#journeyEnd').show();
          jQue('#journeyNext').show().html( currentOptions.actionBtns.proceed );
        }

        tourActions.positionGuidance( pointDetails ); // Update guidance box content and position
      }
    },
    retreat : function() {
      travelDirection = 'backward';

      $guidanceBox.hide(); // Hide guidance box initially

      if ( currentPointIndex < totalPoints ) {
        jQue('#journeyNext').show().html( currentOptions.actionBtns.proceed );
      }

      if ( currentPointIndex <= 0 ) { // If at the first point or before
        jQue('#journeyPrev').hide();
        jQue('#journeyEnd').hide();
        jQue('#journeyNext').html( currentOptions.actionBtns.begin );
        currentPointIndex--;
      }
      else {
        currentPointIndex--; // Go back to the previous point
        let pointDetails = currentOptions.tourPoints[currentPointIndex];

        tourActions.positionGuidance( pointDetails ); // Update guidance box
      }
    },
    positionGuidance : function( pointDetails ) {
      let $targetElem = jQue( pointDetails.element ); // The element the guidance refers to

      if ( pointDetails.controlsPosition ) {
        tourActions.updateNavLocation( pointDetails.controlsPosition ); // Reposition navigation if specified
      }

      if ( pointDetails.tooltip ) {
        $guidanceBox.html( pointDetails.tooltip );
        let displayMessage = ( typeof pointDetails.text !== 'undefined' ) ? pointDetails.text : pointDetails.tooltip;
        jQue('#journeyMsg').html( displayMessage );

        let tipPlacement = ( typeof pointDetails.position === 'undefined' ) ? 'BL' : pointDetails.position;
        let $finalPos = tourActions.fetchGuidancePlacement( tipPlacement, $targetElem );

        $guidanceBox.css({ 'top': $finalPos.top+'px', 'left': $finalPos.left+'px' });
        $guidanceBox.show('fast');

        // Scroll the page to make the guidance box visible
        jQue.scrollPageTo( $guidanceBox, 400, { offset : -100 } );
      }

      // Execute a callback if defined for the current point
      if ( typeof pointDetails.callback !== 'undefined' ) {
        if ( pointDetails.callback === 'click' ) {
          let urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          let slugPattern = /^[a-z0-9-]+$/;

          if ( urlPattern.test( $targetElem.attr('href') ) || slugPattern.test( $targetElem.attr('href') ) ) {
            location.href = $targetElem.attr('href');
          }
          else {
            $targetElem.trigger('click'); // Simulate a click event
          }
        }
        else {
          if ( typeof eval( pointDetails.callback ) === 'function' ) {
            eval( pointDetails.callback ); // Execute a custom function
          }
        }
      }

      // Automatically advance or retreat if 'next' is true
      if ( pointDetails.next === true ) {
        if ( travelDirection === 'forward' ) {
          tourActions.proceed();
        }
        else {
          tourActions.retreat();
        }
      }
    },
    updateNavLocation : function( placement ) {
      let currentNavInnerHtml = jQue('#journeyNav').html(); // Get existing navigation content
      jQue('#journeyNav').remove(); // Remove old navigation container
      let $navBaseStyle = { 'display' : 'block', 'position': 'fixed', 'width' : '200px', 'padding' : '10px 20px', 'border-radius' : '10px', 'font-family' : 'sans-serif' }; // Re-define base style
      let $navContainer = jQue(initialNavHtmlTemplate).html(currentNavInnerHtml); // Recreate container using template, then populate with content
      $navContainer = $navContainer.css($navBaseStyle).css(currentOptions.navStyle); // Apply styles
      let finalNavPosition = tourActions.fetchNavLocation( placement ); // Calculate new position
      $navContainer.css( finalNavPosition );
      jQue('body').append( $navContainer ); // Append updated navigation
    },
    fetchGuidancePlacement : function( tipPlacement, $elemRef ) {
      elemWidth = $elemRef.outerWidth();
      elemHeight = $elemRef.outerHeight();
      elemLeft = $elemRef.offset().left;
      elemTop = $elemRef.offset().top;
      let tipWidth = $guidanceBox.width() + parseInt( $guidanceBox.css('padding-left') ) + parseInt( $guidanceBox.css('padding-right') );
      let tipHeight = $guidanceBox.height() + parseInt( $guidanceBox.css('padding-top') ) +  parseInt( $guidanceBox.css('padding-bottom') );

      jQue('.journeyArrow').remove(); // Remove existing arrows
      let tipBgColor = $guidanceBox.css('background-color'); // Get background color for arrow styling

      // Create arrow elements for different directions
      let $upPtr = jQue('<div class="journeyArrow"></div>').css({ 'position' : 'absolute', 'display' : 'block', 'width' : '0', 'height' : '0', 'border-left' : '5px solid transparent', 'border-right' : '5px solid transparent', 'border-bottom' : '5px solid '+tipBgColor });
      let $downPtr = jQue('<div class="journeyArrow"></div>').css({ 'position' : 'absolute', 'display' : 'block', 'width' : '0', 'height' : '0', 'border-left' : '5px solid transparent', 'border-right' : '5px solid transparent', 'border-top' : '5px solid '+tipBgColor });
      let $rightPtr = jQue('<div class="journeyArrow"></div>').css({ 'position' : 'absolute', 'display' : 'block', 'width' : '0', 'height' : '0', 'border-top' : '5px solid transparent', 'border-bottom' : '5px solid transparent', 'border-left' : '5px solid '+tipBgColor });
      let $leftPtr = jQue('<div class="journeyArrow"></div>').css({ 'position' : 'absolute', 'display' : 'block', 'width' : '0', 'height' : '0', 'border-top' : '5px solid transparent', 'border-bottom' : '5px solid transparent', 'border-right' : '5px solid '+tipBgColor });

      let finalPos; // Variable to store calculated position
      switch ( tipPlacement ) {
        case 'BL' : // Bottom Left
          finalPos = { 'left'  : elemLeft, 'top' : elemTop + elemHeight + 10 };
          $upPtr.css({ top: '-5px', left: '48%' });
          $guidanceBox.prepend($upPtr);
          break;

        case 'BR' : // Bottom Right
          finalPos = { 'left'  : elemLeft + elemWidth - tipWidth, 'top' : elemTop + elemHeight + 10 };
          $upPtr.css({ top: '-5px', left: '48%' });
          $guidanceBox.prepend($upPtr);
          break;

        case 'TL' : // Top Left
          finalPos = { 'left'  : elemLeft, 'top' : (elemTop - tipHeight) -10 };
          $downPtr.css({ top: tipHeight, left: '48%' });
          $guidanceBox.append($downPtr);
          break;

        case 'TR' : // Top Right
          finalPos = { 'left'  : (elemLeft + elemWidth) - tipWidth, 'top' : elemTop - tipHeight -10 };
          $downPtr.css({ top: tipHeight, left: '48%' });
          $guidanceBox.append($downPtr);
          break;

        case 'RT' : // Right Top
          finalPos = { 'left'  : elemLeft + elemWidth + 10, 'top' : elemTop };
          $leftPtr.css({ left: '-5px' });
          $guidanceBox.prepend($leftPtr);
          break;

        case 'RB' : // Right Bottom
          finalPos = { 'left'  : elemLeft + elemWidth + 10, 'top' : elemTop + elemHeight - tipHeight };
          $leftPtr.css({ left: '-5px' });
          $guidanceBox.prepend($leftPtr);
          break;

        case 'LT' : // Left Top
          finalPos = { 'left'  : (elemLeft - tipWidth) - 10, 'top' : elemTop };
          $rightPtr.css({ right: '-5px' });
          $guidanceBox.prepend($rightPtr);
          break;

        case 'LB' : // Left Bottom
          finalPos = { 'left'  : (elemLeft - tipWidth) - 10, 'top' : elemTop + elemHeight - tipHeight};
          $rightPtr.css({ right: '-5px' });
          $guidanceBox.prepend($rightPtr);
          break;

        case 'B'  : // Bottom Center
          finalPos = { 'left'  : elemLeft + elemWidth/2 - tipWidth/2, 'top' : (elemTop + elemHeight) + 10 };
          $upPtr.css({ top: '-5px', left: '48%' });
          $guidanceBox.prepend($upPtr);
          break;

        case 'L'  : // Left Center
          finalPos = { 'left'  : (elemLeft - tipWidth) - 10, 'top' : elemTop + elemHeight/2 - tipHeight/2 };
          $rightPtr.css({ right: '-5px' });
          $guidanceBox.prepend($rightPtr);
          break;

        case 'T'  : // Top Center
          finalPos = { 'left'  : elemLeft + elemWidth/2 - tipWidth/2, 'top' : (elemTop - tipHeight) - 10 };
          $downPtr.css({ top: tipHeight, left: '48%' });
          $guidanceBox.append($downPtr);
          break;

        case 'R'  : // Right Center
          finalPos = { 'left'  : (elemLeft + elemWidth) + 10, 'top' : elemTop + elemHeight/2 - tipHeight/2 };
          $leftPtr.css({ left: '-5px' });
          $guidanceBox.prepend($leftPtr);
          break;
      }
      return finalPos; // Return the calculated position
    },
    fetchNavLocation: function( locationKey ) {
      let calculatedPosition;
      switch ( locationKey )
      {
        case 'TR': // Top Right
          calculatedPosition = { 'top' : '10px', 'right' : '10px' };
          break;

        case 'TL': // Top Left
          calculatedPosition = { 'top' : '10px', 'left' : '10px' };
          break;

        case 'BL': // Bottom Left
          calculatedPosition = { 'bottom' : '10px', 'left' : '10px' };
          break;

        case 'BR': // Bottom Right
          calculatedPosition = { 'bottom' : '10px', 'right' : '10px' };
          break;
      }
      return calculatedPosition; // Return the position object
    },
    terminateJourney : function() {
      jQue('#journeyNav').remove(); // Remove navigation controls
      jQue('#journeyTip').remove(); // Remove the guidance box element
      $guidanceBox.css({ 'display' : 'none' }).html(''); // Reset hidden guidance box
      currentPointIndex = -1; // Reset point index
      tourActive = false; // Mark tour as inactive
    }
  };

  jQue( document ).on( 'click', "#journeyNext", function() {
    tourActions.proceed(); // Handle click on 'next' button
  });

  jQue( document ).on( 'click', "#journeyPrev", function() {
    tourActions.retreat(); // Handle click on 'previous' button
  });

  jQue( document ).on( 'click', "#journeyEnd", function() {
    tourActions.terminateJourney(); // Handle click on 'end' button
  });

  // Attach the guidedJourney plugin to jQue's prototype
  jQue.fn.guidedJourney = function( actionName )
  {
    if ( tourActions[actionName] ) {
      // If a specific action method is called
      return tourActions[actionName].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    }
    else if ( typeof actionName === 'object' || ! actionName ) {
      // If no action name or an options object is provided, initialize
      return tourActions.setupJourney.apply( this, arguments );
    }
    else {
      // Handle unknown method calls
      jQue.error( 'Method ' +  actionName + ' does not exist on jQue.guidedJourney' );
    }
  };
})( jQue ); // Pass jQue into the IIFE

// Direct Access via jQue object
jQue.guidedJourney = function( userSettings ) { jQue.fn.guidedJourney( userSettings ); }