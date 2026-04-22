(function( jQ ) {
  jQ.fn.opacityAnimator = function(config) {
    // Standard configuration for the plugin
    var currentOpts = jQ.extend({}, jQ.fn.opacityAnimator.presetOptions, config);

    // Global document object reference
    var globalDoc = jQ('html');
    globalDoc.data('primaryComponent', this);
    globalDoc.data('enteringState', false);
    globalDoc.data('exitingState', false);
    globalDoc.data('inputLetters', ['alpha','beta','gamma','delta','epsilon','zeta','eta','theta','iota','kappa','lambda','mu','nu','xi','omicron','pi','rho','sigma','tau','upsilon','phi','chi','psi','omega','digamma','stigma']);
    globalDoc.data('outputOrder', []);
    globalDoc.data('operationMode', currentOpts.operationMode);
    globalDoc.data('transitionSpeed', currentOpts.transitionSpeed);
    globalDoc.data('easingFunction', currentOpts.easingFunction);

    // Internal working variables
    var callingElement = this;
    var preloaderMarkup = '';
    var collectedElements = [];
    var elementChildren = [];

    // Construct the preloader's HTML structure
    if(currentOpts.customPreloaderMarkup === '') {
      preloaderMarkup = '<div class="progress-spinner" style="position:absolute;top:50%;left:50%;width:'+currentOpts.indicatorWidth+'px;height:'+currentOpts.indicatorHeight+'px; margin:-'+Math.round(currentOpts.indicatorHeight/2)+'px 0 0 -'+Math.round(currentOpts.indicatorWidth/2)+'px;"><img src="'+currentOpts.indicatorImage+'" border="0" width="'+currentOpts.indicatorWidth+'" height="'+currentOpts.indicatorHeight+'" /></div>';
    } else {
      preloaderMarkup = currentOpts.customPreloaderMarkup;
    }

    // Add the loading spinner to the document body
    if(currentOpts.showIndicator === true) {
      jQ('body').prepend(preloaderMarkup);
    }

    function revealInSequence(currentPosition, callbackFn) {
      // Check if exit animation is currently active
      if(globalDoc.data('exitingState') === false) {
        globalDoc.data('enteringState', true);
        var nextPosition = currentPosition + 1;

        var itemToAnimate;
        if(currentOpts.operationMode == 'childElements') {
          itemToAnimate = jQ(elementChildren[currentPosition]);
        } else {
          itemToAnimate = callingElement.find('.'+globalDoc.data('inputLetters')[currentPosition]);
        }

        if(itemToAnimate.length > 0) {
          itemToAnimate.css('opacity', '0');
          itemToAnimate.css('display', currentOpts.displayBehavior);
          itemToAnimate.animate({ opacity: 1 }, currentOpts.transitionSpeed, currentOpts.easingFunction, function() {
            revealInSequence(nextPosition, callbackFn);
          });
          collectedElements.push(globalDoc.data('inputLetters')[currentPosition]);
        } else {
          globalDoc.data('outputOrder', collectedElements.reverse());
          globalDoc.data('enteringState', false);
          eval(callbackFn);
          return false;
        }
      }
    }

    // Execute on page load
    jQ(window).load(function() {
      jQ('.progress-spinner').remove();

      if(currentOpts.operationMode == 'childElements') {
        var rawChildCollection = globalDoc.data('primaryComponent').children(':not(script,br)');
        elementChildren = jQ.makeArray(rawChildCollection);

        revealInSequence(0 ,currentOpts.onCompletion);
      } else {
        revealInSequence(0 ,currentOpts.onCompletion);
      }
    });

  };


  jQ.fn.opacityAnimator.hideElements = function(targetPath) {
    var globalDoc = jQ('html');
    var elementChildren = [];

    function concealByClass(currentIdx) {
      // Process elements with class names in reverse order
      if(globalDoc.data('outputOrder')[currentIdx]) {
        var nextIdx = currentIdx + 1;
        jQ('.'+globalDoc.data('outputOrder')[currentIdx]).animate({ opacity: 0 }, globalDoc.data('transitionSpeed'), globalDoc.data('easingFunction'), function() {
          jQ(this).css('display', 'none');
          concealByClass(nextIdx);
        });

      } else {
        globalDoc.data('enteringState', false);
        if(targetPath) {
          window.location.href = targetPath;
        }
        return false;
      }
    }

    function concealChildren(currentIdx, descendantList) {
      // Fade out direct child elements
      if(descendantList[currentIdx] && descendantList[currentIdx].tagName.toLowerCase() !== 'script' && descendantList[currentIdx].tagName.toLowerCase() !== 'br' && descendantList[currentIdx].tagName.toLowerCase() !== 'a') {
        var nextIdx = currentIdx + 1;
        jQ(descendantList[currentIdx]).animate({ opacity: 0 }, globalDoc.data('transitionSpeed'), globalDoc.data('easingFunction'), function() {
          jQ(this).css('display', 'none');
          concealChildren(nextIdx, descendantList);
        });
      } else {
        globalDoc.data('enteringState', false);
        if(targetPath) {
          window.location.href = targetPath;
        }
        return false;
      }
    }

    // Initiate the exit animation if no entry animation is running
    if(globalDoc.data('enteringState') === false) {
      globalDoc.data('exitingState', true);
      if(globalDoc.data('operationMode') == 'childElements') {
        var initialChildNodes = globalDoc.data('primaryComponent').children(':not(script,br)');
        var processedChildList = jQ.makeArray(initialChildNodes);
        elementChildren = processedChildList.reverse();

        concealChildren(0, elementChildren);
      } else {
        concealByClass(0);
      }
    }
  };


  jQ.fn.opacityAnimator.presetOptions = {
    operationMode			: 'classBased', // or 'childElements'
    transitionSpeed		: 500,
    // fadeInOrder	: 'desc',
    // fadeOutOrder	: 'asc',
    easingFunction		: 'linear',
    displayBehavior		: 'block',
    showIndicator		: true,
    indicatorImage		: 'loading.gif',
    indicatorWidth		: 50,
    indicatorHeight		: 50,
    customPreloaderMarkup	: '', // element must have class 'progress-spinner'
    onCompletion		: ''
  };

})( jQuery );