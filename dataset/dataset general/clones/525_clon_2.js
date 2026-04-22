jQuery(document).ready(function() {
  /*
   *  Application-wide shared elements and references
   */
  const $navToggle = jQuery('.menu-toggle-icon'),
    $motionElement = jQuery('.has-dynamic-effect'),
    $actionControl = jQuery('.action-area button'),
    $contentSlider = jQuery('.content-carousel'),
    $sliderNavArrow = jQuery('.slider-controls'),
    $soundToggle = jQuery('.audio-player .play-button'),
    mediaPlayerObj = jQuery('audio').get(0),
    $graphElements = jQuery('.chart-bars'),
    $numericDisplays = jQuery('.value-counter');

  /*
   *  Manage navigation button interaction
   */
  $navToggle.on('click', function() {
    // Flip the active state for the menu button
    jQuery(this).toggleClass('is-active');

    // Here you could trigger a navigation panel to open or close
  });

  /*
   *  Handle interactive visual layers
   */
  $motionElement.on({
    mousemove: function(eventData) {
      const $currentElement = jQuery(this);
      $currentElement.find('.dynamic-layer').velocity({
        translateZ: 0,
        translateX: Math.floor((eventData.pageX - $currentElement.offset().left) - ($currentElement.width() / 2)),
        translateY: Math.floor((eventData.pageY - $currentElement.offset().top) - ($currentElement.height() / 2)),
        scale: '2'
      }, {
        duration: 400,
        easing: 'linear',
        queue: false
      });
    },
    mouseleave: function() {
      // Reset the dynamic layer position on mouse exit
      jQuery(this).find('.dynamic-layer').velocity({
        translateZ: 0,
        translateX: 0,
        translateY: 0,
        scale: '1'
      }, {
        duration: 1000,
        easing: 'easeOutSine',
        queue: false
      });
    }
  });

  /*
   *  Visual feedback for button presses (ripple effect)
   */
  $actionControl.on('click', function(inputEvent) {
    inputEvent.preventDefault(); // Stop default button behavior

    let $effectDiv = jQuery('<div></div>');
    let buttonPosition = jQuery(this).offset();
    let xCoord = inputEvent.pageX - buttonPosition.left;
    let yCoord = inputEvent.pageY - buttonPosition.top;

    $effectDiv.addClass('wave-animation');
    const $activeWave = jQuery(".wave-animation");

    $activeWave.css("height", jQuery(this).height());
    $activeWave.css("width", jQuery(this).height()); // Width matches height for circular effect

    $effectDiv
      .css({
        top: yCoord - ($activeWave.height() / 2),
        left: xCoord - ($activeWave.width() / 2),
      })
      .appendTo(jQuery(this));

    // Remove the ripple element after a short delay
    window.setTimeout(function() {
      $effectDiv.remove();
    }, 2000);
  });

  /*
   *  Initialize the main content slider
   */
  $contentSlider.owlCarousel({
    navigation: false, // No default navigation buttons
    slideSpeed: 300, // Speed of slide transition
    paginationSpeed: 400, // Speed of pagination transition
    singleItem: true // Display one item at a time
  });

  /*
   *  Custom navigation for the content slider
   */
  $sliderNavArrow.on('click', function() {
    if (jQuery(this).hasClass('advance-btn')) {
      $contentSlider.trigger('owl.next'); // Move to the next slide
    } else {
      $contentSlider.trigger('owl.prev'); // Move to the previous slide
    }
  });

  /*
   *  Control audio playback and icon state
   */
  let mediaState = 0; // 0 for paused, 1 for playing (or any odd/even system)
  $soundToggle.on('click', function() {
    mediaState++; // Increment state on each click

    /*
     *  Toggle between play and pause icons
     */
    if (mediaState % 2 === 0) {
      jQuery(this).removeClass('icon-pause-track').addClass('icon-play-track');
      mediaPlayerObj.pause(); // Pause the audio
    } else {
      jQuery(this).removeClass('icon-play-track').addClass('icon-pause-track');
      mediaPlayerObj.play(); // Play the audio
    }
  });

  /*
   *  Trigger animation for chart visual elements
   */
  $graphElements.addClass('active-animation');

  /*
   *  jQuery plugin for animating numbers
   */
  jQuery.fn.animateNumber = function(settings) {
    settings = jQuery.extend({}, jQuery.fn.animateNumber.defaultSettings, settings || {});

    const totalSteps = Math.ceil(settings.animationDuration / settings.updateInterval);
    let stepValue = (settings.targetValue - settings.initialValue) / totalSteps;

    return jQuery(this).each(function() {
      const currentElement = this;
      let currentStep = 0;
      let displayValue = settings.initialValue;
      let timerHandle = setInterval(updateDisplay, settings.updateInterval);

      function updateDisplay() {
        displayValue += stepValue;
        currentStep++;
        jQuery(currentElement).html(formatValue(displayValue)); // Update element content

        if (typeof(settings.onProgress) === 'function') {
          settings.onProgress.call(currentElement, displayValue);
        }

        if (currentStep >= totalSteps) {
          clearInterval(timerHandle);
          displayValue = settings.targetValue; // Ensure final value is exact

          if (typeof(settings.onFinish) === 'function') {
            settings.onFinish.call(currentElement, displayValue);
          }
        }
      }
    });
  };

  // Default options for the animateNumber plugin
  jQuery.fn.animateNumber.defaultSettings = {
    initialValue: 0,
    targetValue: 100,
    animationDuration: 1000,
    updateInterval: 100,
    decimalPlaces: 0,
    onProgress: null,
    onFinish: null,
  };

  /*
   *  Helper function to format large numbers with commas
   */
  function formatValue(inputNum) {
    const parts = inputNum.toFixed(2).split('.'); // Split integer and decimal
    return parts[0].split('').reverse().reduce(function(accumulator, digit, index, originalArray) {
      return digit + (index && !(index % 3) ? ',' : '') + accumulator;
    }, '');
  }

  /*
   *  Initialize number animation for specific elements
   */
  $numericDisplays.each(function() {
    const initialVal = jQuery(this).data('start-value');
    const finalVal = jQuery(this).data('end-value');

    jQuery(this).animateNumber({
      initialValue: initialVal,
      targetValue: finalVal,
      animationDuration: 2000, // Total animation time
      updateInterval: 50 // How often to update the number
    });
  });
});