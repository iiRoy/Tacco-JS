(function(jq){

    var mobileDevice, oldInternetExplorer, backdropShade, backdropElement, contentWidth, edgeThickness, backgroundShade, contentHeight, verticalMargin, childElementHeight, windowHeight, showCount,
        pageWrapper, displayArea, loopGallery, displayContent, baseStructure, targetUrl, initialScrollPosition, firstImage, mediaKind, currentGalleryId, galleryItems, nextItem, previousItem,
        mediaTitle, canGoNext, canGoPrevious, keyboardBlocked, titleDisplay, numberDisplay, avoidNextButton, avoidPreviousButton, avoidContentArea,
        allChildElements, additionalStyles;

    jq.fn.extend({
        // This is the core plugin functionality, providing a lightbox display
        lightBox: function(pluginOptions) {

          // Define the default configuration options for the lightbox
          var defaultSettings = {
              displayFrameWidth: '',
              displayFrameHeight: '',
              frameBorderWidth: '0',
              frameBackgroundColor: '#fff',
              titleAttribute: 'title', // Custom HTML attribute to fetch the content title (e.g., [data-media-caption])
              displayNumeration: false,
              infiniteLoop: false,
              closeOnBackdropClick: true // Determines if clicking the overlay closes the lightbox
          };

          var currentOptions = jq.extend(defaultSettings, pluginOptions);

            return this.each(function() {
                  var currentItem = jq(this);

                  // Do not re-initialize the lightbox if already active on this element
                  if(currentItem.data('lightbox-active')) {
                    return true;
                  }

                  currentItem.addClass('display-item');
                  currentItem.data('frame-width', currentOptions.displayFrameWidth);
                  currentItem.data('frame-height', currentOptions.displayFrameHeight);
                  currentItem.data('frame-border', currentOptions.frameBorderWidth);
                  currentItem.data('background-color', currentOptions.frameBackgroundColor);
                  currentItem.data('show-count', currentOptions.displayNumeration);
                  currentItem.data('loop-gallery', currentOptions.infiniteLoop);
                  currentItem.data('close-on-click', currentOptions.closeOnBackdropClick);
                  currentItem.data('lightbox-active', true);

                  mobileDevice = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);

                  // Identify IE 9 or older versions of Internet Explorer
                  oldInternetExplorer = ((document.all && !window.atob) ? true : false);

                  currentItem.click(function(evt){
                    evt.stopPropagation();
                    evt.preventDefault();
                    currentItem = jq(this);
                    backdropShade = currentItem.data('backdrop-color');
                    contentWidth = currentItem.data('frame-width');
                    contentHeight = currentItem.data('frame-height');
                    edgeThickness = currentItem.data('frame-border');
                    backgroundShade = currentItem.data('background-color');
                    canGoNext = false;
                    canGoPrevious = false;
                    keyboardBlocked = false;
                    targetUrl = currentItem.attr('href');
                    initialScrollPosition = jq(window).scrollTop();
                    initialScrollPosition = -initialScrollPosition;
                    additionalStyles = currentItem.data( 'extra-styles' ) || "";

                    jq('body').wrapInner('<div class="page-wrapper"></div>');

                    pageWrapper = jq('.page-wrapper');
                    baseStructure = '<div class="lightbox-backdrop ' + additionalStyles + '" style="background:'+ backdropShade +'"><div class="lightbox-loader">Loading content...</div><div class="lightbox-container"><div class="lightbox-content"></div></div><div class="lightbox-title-bar"></div><div class="lightbox-counter">0/0</div><div class="lightbox-close-btn">X</div><div class="lightbox-next-btn">next</div><div class="lightbox-prev-btn">prev</div></div>';

                    jq('body').append(baseStructure);

                    backdropElement = jq('.lightbox-backdrop');
                    displayArea = jq('.lightbox-container');
                    displayContent = jq('.lightbox-content');
                    numberDisplay = jq('.lightbox-counter');
                    titleDisplay = jq('.lightbox-title-bar');

                    displayContent.html('');
                    displayContent.css('opacity', '0');

                    verifyNavigation();

                    backdropElement.css('min-height', jq(window).outerHeight());

                    if (oldInternetExplorer) {
                      backdropElement.animate({opacity:1}, 250, function(){
                        backdropElement.css({
                          'min-height': jq(window).outerHeight(),
                          height : 'auto'
                        });
                        if(currentItem.data('media-type') == 'iframe'){
                          embedFrame();
                        }else if (currentItem.data('media-type') == 'inline'){
                          displayInlineContent();
                        }else if (currentItem.data('media-type') == 'ajax'){
                          fetchRemoteContent();
                        }else if (currentItem.data('media-type') == 'vimeo'){
                          loadVimeoVideo();
                        }else if (currentItem.data('media-type') == 'youtube'){
                          loadYouTubeVideo();
                        } else {
                          displayContent.html('<img src="'+targetUrl+'">');
                          preLoadImage();
                        }
                      });
                    } else {
                      backdropElement.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(eventObject){

                        // Verify that the transition event originated from the backdrop element itself
                        if( eventObject.target != eventObject.currentTarget ) {
                          return;
                        }

                        backdropElement.css({
                          'min-height': jq(window).outerHeight(),
                          height : 'auto'
                        });
                        if(currentItem.data('media-type') == 'iframe'){
                          embedFrame();
                        }else if (currentItem.data('media-type') == 'inline'){
                          displayInlineContent();
                        }else if (currentItem.data('media-type') == 'ajax'){
                          fetchRemoteContent();
                        }else if (currentItem.data('media-type') == 'vimeo'){
                          loadVimeoVideo();
                        }else if (currentItem.data('media-type') == 'youtube'){
                          loadYouTubeVideo();
                        } else {
                          displayContent.html('<img src="'+targetUrl+'">');
                          preLoadImage();
                        }
                      });
                      backdropElement.css('opacity', '1');
                    }

                    if (mobileDevice) {
                      pageWrapper.css({
                        'position': 'fixed',
                        'top': initialScrollPosition,
                        'opacity': '0'
                      }).data('top', initialScrollPosition);
                    } else {
                      pageWrapper.css({
                        'position': 'fixed',
                        'top': initialScrollPosition
                      }).data('top', initialScrollPosition);
                      jq(window).scrollTop(0);
                    }

                    /* -------- Function to Check and Update Navigation State -------- */
                    function verifyNavigation(){

                      currentGalleryId = currentItem.data('group');
                      showCount = currentItem.data('show-count');
                      loopGallery = currentItem.data('loop-gallery');

                      galleryItems = jq('.display-item[data-group="' + currentGalleryId + '"]');

                      if(galleryItems.length > 0 && showCount === true){
                        numberDisplay.html(galleryItems.index(currentItem)+1 + ' / ' + galleryItems.length);
                        numberDisplay.fadeIn();
                      }else{
                        numberDisplay.fadeOut();
                      }

                      nextItem = galleryItems.eq( galleryItems.index(currentItem) + 1 );
                      previousItem = galleryItems.eq( galleryItems.index(currentItem) - 1 );

                      if(currentItem.attr(currentOptions.titleAttribute)){
                        mediaTitle = currentItem.attr(currentOptions.titleAttribute);
                        titleDisplay.fadeIn();
                      }else{
                        mediaTitle = '';
                        titleDisplay.fadeOut();
                      }

                      if (galleryItems.length > 0 && loopGallery === true) {

                        canGoNext = true;
                        canGoPrevious = true;

                        if(nextItem.length < 1 ){
                          nextItem = galleryItems.eq(0);
                        }
                        if(galleryItems.index(currentItem) < 1 ){
                          previousItem = galleryItems.eq( galleryItems.index(galleryItems.length) ); // This original logic appears to be a bug for looping to the last item.
                        }

                      } else {

                        if(nextItem.length > 0 ){
                          jq('.lightbox-next-btn').css('display', 'block');
                          canGoNext = true;
                        }else{
                          jq('.lightbox-next-btn').css('display', 'none');
                          canGoNext = false;
                        }
                        if(galleryItems.index(currentItem) > 0 ){
                          jq('.lightbox-prev-btn').css('display', 'block');
                          canGoPrevious = true;
                        }else{
                          jq('.lightbox-prev-btn').css('display', 'none');
                          canGoPrevious = false;
                        }
                      }
                    }

                     /* -------- Object containing Gallery Navigation Methods -------- */
                    var galleryNavigator = {

                      showPrevious: function() {

                        if (keyboardBlocked) return; else keyboardBlocked = true;

                        backdropShade = previousItem.data('backdrop-color');

                        contentWidth = previousItem.data('frame-width');
                        contentHeight = previousItem.data('frame-height');
                        edgeThickness = previousItem.data('frame-border');
                        backgroundShade = previousItem.data('background-color');

                        targetUrl = previousItem.attr('href');

                        if(previousItem.attr(currentOptions.titleAttribute)){
                          mediaTitle = previousItem.attr(currentOptions.titleAttribute);
                        }else{
                          mediaTitle = '';
                        }

                        if (backdropShade === undefined ) {
                          backdropShade = "";
                        }

                        backdropElement.css('min-height', jq(window).outerHeight());

                        displayContent.animate({ opacity:0}, 450, function(){ // Animation duration slightly modified
                        backdropElement.css('min-height', jq(window).outerHeight()).css('background',backdropShade);

                          if (previousItem.data('media-type') == 'iframe') {
                            embedFrame();
                          } else if (previousItem.data('media-type') == 'inline'){
                            displayInlineContent();
                          } else if (previousItem.data('media-type') == 'ajax'){
                            fetchRemoteContent();
                          } else if (previousItem.data('media-type') == 'youtube'){
                            loadYouTubeVideo();
                          } else if (previousItem.data('media-type') == 'vimeo'){
                            loadVimeoVideo();
                          }else{
                            displayContent.html('<img src="'+targetUrl+'">');
                            preLoadImage();
                          }
                          currentItem = previousItem;
                          verifyNavigation();
                          keyboardBlocked = false;
                        });

                      },

                      showNext: function() {

                        if (keyboardBlocked) return; else keyboardBlocked = true;

                        backdropShade = nextItem.data('backdrop-color');

                        contentWidth = nextItem.data('frame-width');
                        contentHeight = nextItem.data('frame-height');
                        edgeThickness = nextItem.data('frame-border');
                        backgroundShade = nextItem.data('background-color');


                        targetUrl = nextItem.attr('href');

                        if(nextItem.attr(currentOptions.titleAttribute)){
                          mediaTitle = nextItem.attr(currentOptions.titleAttribute);
                        }else{
                          mediaTitle = '';
                        }

                        if (backdropShade === undefined ) {
                          backdropShade = "";
                        }

                        backdropElement.css('min-height', jq(window).outerHeight());

                        displayContent.animate({ opacity:0}, 450, function(){ // Animation duration slightly modified
                        backdropElement.css('min-height', jq(window).outerHeight()).css('background',backdropShade);

                          if (nextItem.data('media-type') == 'iframe') {
                            embedFrame();
                          } else if (nextItem.data('media-type') == 'inline'){
                            displayInlineContent();
                          } else if (nextItem.data('media-type') == 'ajax'){
                            fetchRemoteContent();
                          } else if (nextItem.data('media-type') == 'youtube'){
                            loadYouTubeVideo();
                          } else if (nextItem.data('media-type') == 'vimeo'){
                            loadVimeoVideo();
                          }else{
                            displayContent.html('<img src="'+targetUrl+'">');
                            preLoadImage();
                          }
                          currentItem = nextItem;
                          verifyNavigation();
                          keyboardBlocked = false;
                        });

                      }

                    };

                    /* -------- Keyboard Input Handling for Navigation -------- */
                    jq('body').keydown(function(keyEvent) {

                      if(keyEvent.keyCode == 37 && canGoPrevious == true) { // Left arrow key pressed
                        galleryNavigator.showPrevious();
                      }

                      if(keyEvent.keyCode == 39 && canGoNext == true) { // Right arrow key pressed
                        galleryNavigator.showNext();
                      }

                    });

                    /* -------- Event Listener for Previous Button Click -------- */
                    jq('.lightbox-prev-btn').click(function(){
                      galleryNavigator.showPrevious();
                    });

                    /* -------- Event Listener for Next Button Click -------- */
                    jq('.lightbox-next-btn').click(function(){
                      galleryNavigator.showNext();
                    });

                    /* -------- Handler for the Escape Key to Close Lightbox -------- */
                    function handleEscapeKey(keyEvent) {
                      if(keyEvent.keyCode === 27) { // Escape key
                        closeLightBox();
                      }
                    }

                    /* -------- Function to Close the Lightbox Display -------- */

                    function closeLightBox(){

                      jq('body').unbind('keydown', handleEscapeKey);

                      if (oldInternetExplorer) {

                        backdropElement.animate({opacity:0}, 500, function(){
                          backdropElement.remove();
                          jq('.page-wrapper').children().unwrap();
                          jq(window).scrollTop(-initialScrollPosition);
                          keyboardBlocked = false;
                          currentItem.focus();
                        });

                      } else {

                        backdropElement.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
                        backdropElement.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(eventObject){

                          // Ensure the transition event is from the backdrop element itself
                          if( eventObject.target != eventObject.currentTarget ) {
                            return;
                          }

                          backdropElement.remove();
                          if (mobileDevice) {
                            jq('.page-wrapper').bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
                              jq('.page-wrapper').children().unwrap();
                              jq(window).scrollTop(-initialScrollPosition);
                            });
                            jq('.page-wrapper').css('opacity', '1');
                          }else{
                            jq('.page-wrapper').children().unwrap();
                            jq(window).scrollTop(-initialScrollPosition);
                          }
                          keyboardBlocked = false;
                          currentItem.focus();
                        });
                        backdropElement.css('opacity', '0');
                      }
                    }

                    /* -------- Close Event Listener for Clicks -------- */
                    var closeClickSelector = '.lightbox-close-btn, .lightbox-backdrop';
                    if(!currentItem.data('close-on-click')){
                        closeClickSelector = '.lightbox-close-btn';    // Only close when the explicit close button is clicked
                    }

                    jq(closeClickSelector).click(function(eventObject){
                      avoidContentArea = '.inner-element';
                      avoidPreviousButton = '.lightbox-prev-btn';
                      avoidNextButton = '.lightbox-next-btn';
                      allChildElements = '.inner-element *';
                      if(!jq(eventObject.target).is(avoidContentArea) && !jq(eventObject.target).is(avoidNextButton) && !jq(eventObject.target).is(avoidPreviousButton)&& !jq(eventObject.target).is(allChildElements)){
                        closeLightBox();
                      }
                    });
                    jq('body').keydown(handleEscapeKey);
                    return false;
                  });
            });
        }
    });

    /* -------- Function to Load Content via AJAX Request -------- */
    function fetchRemoteContent(){
      jq.ajax({
      url: targetUrl,
      cache: false
      }).done(function( responseData ) {
          displayContent.html('<div class="lightbox-inline-content">'+ responseData +'</div>');
          adjustDisplay(true);

      }).fail(function() {
          displayContent.html('<div class="lightbox-inline-content"><p>Content retrieval failed, please try again.</div>');
          adjustDisplay(true);
      })
    }

    /* -------- Function to Embed an Iframe Element -------- */
    function embedFrame(){
      displayContent.html('<iframe class="lightbox-frame" src="'+targetUrl+'"></iframe>');
    //  jq('.lightbox-frame').load(function(){ // This event is typically used for iframes on the same origin
      adjustDisplay();
    //  });
    }

    /* -------- Function to Load a Vimeo Video into the Lightbox -------- */
    function loadVimeoVideo(){
      var urlParts = targetUrl.split('/');
      var videoIdentifier = urlParts[urlParts.length-1];
      displayContent.html('<iframe class="lightbox-frame" src="//player.vimeo.com/video/'+videoIdentifier+'"></iframe>');
      adjustDisplay();
    }

    /* -------- Function to Load a YouTube Video into the Lightbox -------- */
    function loadYouTubeVideo(){
      var urlParts = targetUrl.split('/');
      var videoIdentifier = urlParts[urlParts.length-1];
      displayContent.html('<iframe class="lightbox-frame" allowfullscreen src="//www.youtube.com/embed/'+videoIdentifier+'"></iframe>');
      adjustDisplay();
    }

    /* -------- Function to Display Inline Content from the Current Page -------- */
    function displayInlineContent(){
      displayContent.html('<div class="lightbox-inline-content">'+jq(targetUrl).html()+'</div>');
      adjustDisplay();
    }

    /* -------- Function to Preload the First Image Found in the Content -------- */
    function preLoadImage(){
        firstImage = jq('.lightbox-content').find('img');
        firstImage.one('load', function() {
          adjustDisplay();
        }).each(function() {
          if(this.complete) jq(this).load();
        });
    }

    /* -------- Function to Adjust and Center the Lightbox Display -------- */
    function adjustDisplay(noScrollReset){
      noScrollReset = noScrollReset || false;
      if (noScrollReset != true) {
        jq(window).scrollTop(0);
      }

      titleDisplay.html(mediaTitle);
      displayContent.find(">:first-child").addClass('inner-element');
      jq('.inner-element').css('width', contentWidth).css('height', contentHeight).css('padding', edgeThickness).css('background', backgroundShade);

      childElementHeight = displayContent.outerHeight();
      windowHeight = jq(window).height();

      if(childElementHeight+80 < windowHeight){
        verticalMargin = (windowHeight - childElementHeight)/2;
        displayContent.css('margin-top', verticalMargin);
        displayContent.css('margin-bottom', verticalMargin);

      }else{
        displayContent.css('margin-top', '40px');
        displayContent.css('margin-bottom', '40px');
      }
      displayContent.animate({
        'opacity': '1'
      },'slow');