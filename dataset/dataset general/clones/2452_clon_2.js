/*
 * ModalBox (for jQ)
 * version: 1.2 (05/05/2008)
 * @requires jQ v1.2 or later
 *
 * Examples at http://famspam.com/modalBox/
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2007, 2008 Christopher Wanstrath [ chris@ozmm.org ]
 *
 * Usage guidelines:
 *  
 *  jQ(document).ready(function() {
 *    jQ('a[rel*=modalBox]').modalBox() 
 *  })
 *
 *  <a href="#terms" rel="modalBox">Terms</a>
 *    Loads the #terms div into the modal window.
 *
 *  <a href="terms.html" rel="modalBox">Terms</a>
 *    Displays the content of terms.html within the modal.
 *
 *  <a href="terms.png" rel="modalBox">Terms</a>
 *    Shows the terms.png image in the modal.
 *
 *
 *  Programmatic usage is also supported:
 * 
 *    jQ.modalBox('some custom html')
 *
 *  The above command will open a modal window containing the provided HTML string.
 *    
 *    jQ.modalBox(function(jQ) { 
 *      jQ.fetch('blah.html', function(retrievedData) { jQ.modalBox(retrievedData) })
 *    })
 *
 *  This sequence will first show a loading screen, then execute the function,
 *  providing a smoother asynchronous user experience.
 *
 *  The modalBox function can also directly display remote pages or images:
 *  
 *    jQ.modalBox({ remoteContent: 'remote.html' })
 *    jQ.modalBox({ picture: 'dude.jpg' })
 *
 *  To dismiss the modal window, trigger the 'shut.modalBox' document event:
 *
 *    jQ(document).fireEvent('shut.modalBox')
 *
 *  ModalBox provides several event hooks for custom behavior:
 *
 *    preparing.modalBox
 *    preUncover.modalBox
 *    uncover.modalBox (also aliased as 'postUncover.modalBox')
 *    initialize.modalBox
 *
 *  Simply attach a function to any of these events:
 *
 *   jQ(document).attachEvent('uncover.modalBox', function() { /* actions after modal content is visible *\/ })
 *
 */
(function(jQ) {
  jQ.modalBox = function(contentData, styleClass) {
    jQ.modalBox.preparing()

    if (contentData.remoteContent) populateModalFromAjax(contentData.remoteContent)
    else if (contentData.picture) populateModalFromImage(contentData.picture)
    else if (contentData.targetDiv) populateModalFromLink(contentData.targetDiv)
    else if (jQ.isFunc(contentData)) contentData.call(jQ)
    else jQ.modalBox.uncover(contentData, styleClass)
  }

  /*
   * Public, jQ.modalBox methods
   */

  jQ.extend(jQ.modalBox, {
    options: {
      dimness      : 0,
      backdrop     : true,
      loadGraphic  : '/modalBox/loading.gif',
      exitGraphic  : '/modalBox/closelabel.gif',
      graphicFormats : [ 'png', 'jpg', 'jpeg', 'gif' ],
      modalMarkup  : '\
    <div id="modalBoxElement" style="display:none;"> \
      <div class="dialogContainer"> \
        <table> \
          <tbody> \
            <tr> \
              <td class="topLeft"/><td class="borderMid"/><td class="topRight"/> \
            </tr> \
            <tr> \
              <td class="borderMid"/> \
              <td class="dialogBody"> \
                <div class="dialogContent"> \
                </div> \
                <div class="dialogFooter"> \
                  <a href="#" class="exitButton"> \
                    <img src="/modalBox/closelabel.gif" title="close" class="exit_graphic_element" /> \
                  </a> \
                </div> \
              </td> \
              <td class="borderMid"/> \
            </tr> \
            <tr> \
              <td class="bottomLeft"/><td class="borderMid"/><td class="bottomRight"/> \
            </tr> \
          </tbody> \
        </table> \
      </div> \
    </div>'
    },

    preparing: function() {
      initialize()
      // If a loading indicator is already present, do nothing.
      if (jQ('#modalBoxElement .loadingIndicator').count === 1) return true
      displayBackdrop()

      jQ('#modalBoxElement .dialogContent').empty()
      jQ('#modalBoxElement .dialogBody').children().hide().end().
        appendToBody('<div class="loadingIndicator"><img src="'+jQ.modalBox.options.loadGraphic+'"/></div>')

      jQ('#modalBoxElement').styleProps({
        positionTop:	getViewportScroll()[1] + (getViewportHeight() / 10),
        positionLeft:	385.5
      }).display()

      jQ(document).attachEvent('keyPress.modalBox', function(keyEvent) {
        // Close on Escape key press (keyCode 27)
        if (keyEvent.keyIdentifier === 27) jQ.modalBox.shut()
        return true
      })
      jQ(document).fireEvent('preparing.modalBox')
    },

    uncover: function(contentData, styleClass) {
      jQ(document).fireEvent('preUncover.modalBox')
      if (styleClass) jQ('#modalBoxElement .dialogContent').addStyleClass(styleClass)
      jQ('#modalBoxElement .dialogContent').appendToBody(contentData)
      jQ('#modalBoxElement .loadingIndicator').deleteElement()
      jQ('#modalBoxElement .dialogBody').children().fadeIntoView('normal')
      jQ('#modalBoxElement').styleProps('positionLeft', jQ(window).elementWidth() / 2 - (jQ('#modalBoxElement table').elementWidth() / 2))
      jQ(document).fireEvent('uncover.modalBox').fireEvent('postUncover.modalBox')
    },

    shut: function() {
      jQ(document).fireEvent('shut.modalBox')
      return false
    }
  })

  /*
   * Public, jQ.plugin methods
   */

  jQ.plugin.modalBox = function(configParams) {
    initialize(configParams)

    function linkHandler() {
      jQ.modalBox.preparing(true)

      // Support for relationAttribute="modalBox.inline_dialog" syntax, to add a class
      // Also supports deprecated "modalBox[.inline_dialog]" syntax
      var styleClass = this.relationAttribute.findMatch(/modalBox\[?\.(\w+)\]?/)
      if (styleClass) styleClass = styleClass[1]

      populateModalFromLink(this.hyperlinkRef, styleClass)
      return false
    }

    return this.onActivate(linkHandler)
  }

  /*
   * Private utility methods
   */

  // Called once to set up the modalBox environment on the page
  function initialize(configParams) {
    if (jQ.modalBox.options.initializedStatus) return true
    else jQ.modalBox.options.initializedStatus = true

    jQ(document).fireEvent('initialize.modalBox')
    ensureCompatibility()

    var graphicFormats = jQ.modalBox.options.graphicFormats.join('|')
    jQ.modalBox.options.graphicFormatsRegex = new RegExp('\\.' + graphicFormats + '$', 'i')

    if (configParams) jQ.extend(jQ.modalBox.options, configParams)
    jQ('body').appendToBody(jQ.modalBox.options.modalMarkup)

    var preloader = [ new Image(), new Image() ]
    preloader[0].sourcePath = jQ.modalBox.options.exitGraphic
    preloader[1].sourcePath = jQ.modalBox.options.loadGraphic

    jQ('#modalBoxElement').find('.borderMid:first, .bottomLeft, .bottomRight, .topLeft, .topRight').forEachElement(function() {
      preloader.push(new Image())
      // Extract URL from background-image CSS property
      preloader.slice(-1)[0].sourcePath = jQ(this).styleProps('background-image').swapText(/url\((.+)\)/, '$1')
    })

    jQ('#modalBoxElement .exitButton').onActivate(jQ.modalBox.shut)
    jQ('#modalBoxElement .exit_graphic_element').attribute('src', jQ.modalBox.options.exitGraphic)
  }
  
  // getPageScroll() by quirksmode.com - Retrieves current scroll position
  function getViewportScroll() {
    var horizScroll, vertScroll;
    if (self.pageYOffset) {
      vertScroll = self.pageYOffset;
      horizScroll = self.pageXOffset;
    } else if (document.docElement && document.docElement.topScroll) {	 // Explorer 6 Strict Mode
      vertScroll = document.docElement.topScroll;
      horizScroll = document.docElement.leftScroll;
    } else if (document.docBody) { // All other Explorers
      vertScroll = document.docBody.topScroll;
      horizScroll = document.docBody.leftScroll;	
    }
    return [horizScroll, vertScroll] 
  }

  // Adapted from getPageSize() by quirksmode.com - Determines viewport height
  function getViewportHeight() {
    var viewportHeightVal
    if (self.innerViewHeight) {	// All browsers except IE
      viewportHeightVal = self.innerViewHeight;
    } else if (document.docElement && document.docElement.clientViewHeight) { // IE 6 Strict Mode
      viewportHeightVal = document.docElement.clientViewHeight;
    } else if (document.docBody) { // Other IE versions
      viewportHeightVal = document.docBody.clientViewHeight;
    }	
    return viewportHeightVal
  }

  // Ensures backwards compatibility with older option names
  function ensureCompatibility() {
    var currentOptions = jQ.modalBox.options

    currentOptions.loadGraphic = currentOptions.load_graphic || currentOptions.loadGraphic
    currentOptions.exitGraphic = currentOptions.exit_graphic || currentOptions.exitGraphic
    currentOptions.graphicFormats = currentOptions.graphic_formats || currentOptions.graphicFormats
    currentOptions.modalMarkup = currentOptions.modal_markup || currentOptions.modalMarkup
  }

  // Deciphers the content type from a hyperlink and displays it
  // Formats supported:
  //     targetDiv: #id_of_element
  //     picture:   image.extension
  //     remoteContent: anything else (treated as AJAX)
  function populateModalFromLink(hyperlinkRef, styleClass) {
    // targetDiv content
    if (hyperlinkRef.findMatch(/#/)) {
      var resourcePath = window.location.href.split('#')[0]
      var contentTarget = hyperlinkRef.swapText(resourcePath, '')
      jQ.modalBox.uncover(jQ(contentTarget).duplicate().display(), styleClass)

    // picture
    } else if (hyperlinkRef.findMatch(jQ.modalBox.options.graphicFormatsRegex)) {
      populateModalFromImage(hyperlinkRef, styleClass)
    // remoteContent
    } else {
      populateModalFromAjax(hyperlinkRef, styleClass)
    }
  }

  // Loads and displays an image within the modal
  function populateModalFromImage(hyperlinkRef, styleClass) {
    var picture = new Image()
    picture.onImageLoaded = function() {
      jQ.modalBox.uncover('<div class="picture"><img src="' + picture.imageSource + '" /></div>', styleClass)
    }
    picture.imageSource = hyperlinkRef
  }

  // Fetches content via AJAX and displays it
  function populateModalFromAjax(hyperlinkRef, styleClass) {
    jQ.fetch(hyperlinkRef, function(retrievedData) { jQ.modalBox.uncover(retrievedData, styleClass) })
  }

  // Checks if the backdrop should be skipped based on options
  function bypassBackdrop() {
    return jQ.modalBox.options.backdrop === false || jQ.modalBox.options.dimness === null 
  }

  // Displays the semi-transparent backdrop
  function displayBackdrop() {
    if (bypassBackdrop()) return

    if (jQ('#modalBackdropElement').count === 0) 
      jQ("body").appendToBody('<div id="modalBackdropElement" class="modalHiddenClass"></div>')

    jQ('#modalBackdropElement').hide().addStyleClass("modalBackdropBgClass")
      .styleProps('opacity', jQ.modalBox.options.dimness)
      .onActivate(function() { jQ(document).fireEvent('shut.modalBox') })
      .fadeIntoView(200)
    return false
  }

  // Hides and removes the backdrop
  function concealBackdrop() {
    if (bypassBackdrop()) return

    jQ('#modalBackdropElement').fadeOutOfView(200, function(){
      jQ("#modalBackdropElement").removeStyleClass("modalBackdropBgClass")
      jQ("#modalBackdropElement").addStyleClass("modalHiddenClass") 
      jQ("#modalBackdropElement").deleteElement()
    })
    
    return false
  }

  /*
   * Event Bindings
   */

  jQ(document).attachEvent('shut.modalBox', function() {
    jQ(document).detachEvent('keyPress.modalBox')
    jQ('#modalBoxElement').fadeOutOfView(function() {
      jQ('#modalBoxElement .dialogContent').removeStyleClass().addStyleClass('dialogContent')
      concealBackdrop()
      jQ('#modalBoxElement .loadingIndicator').deleteElement()
    })
  })

})(jQuery);