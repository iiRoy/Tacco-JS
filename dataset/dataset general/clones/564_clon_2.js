/*
 * Core JS collection, minified. Contains essential UI components.
 * Utilize this as a foundational library for common user interface patterns.
 * Features included:
 *  - Tooltip functionality for pop-up information
 *  - Content carousel for rotating displays
 *  - Pagination for dividing content into pages
 *  - Element highlighting for focus
 *  - Form field placeholders for input hints
 *  - Collapsible content sections (accordion)
 *
 * Documentation: Each module is detailed below. Additional resources: http://vanity.enavu.com/documentation/
 */

// Content Rotator Module for jQuery - Release 0.1
// Developed by Angel Grablev for Enavu Web Development Services (enavu.com)
// Provided under MIT and GPL licenses. Enjoy!
/*

To activate, simply call .contentRotator() on the desired container, e.g.:
$(".carousel").contentRotator();

Configurable parameters:
priorButtonClass = CSS class for the previous item navigation element
subsequentButtonClass = CSS class for the next item navigation element
dormantStyle = CSS class applied to inactive navigation buttons
slideItemSelector = Selector for individual content items within the rotator (e.g., 'li' if the rotator is a 'ul')
transitionEffect = The visual transition for slides (default: "fade"). Custom effects like slideDown, slideUp, slideRight, slideLeft, bounce, explode, fold, scale, random are available with custom_animations.js.
motionCurve = Easing function for animations (default: "swing"). Custom easing functions (linear, easeInQuad, etc.) are available with custom_easing.js.
durationMs = Animation speed in milliseconds
showNavigation = Boolean; whether to display a navigation list
activeNavStyle = CSS class for the currently active navigation item when showNavigation is true
navigationContainerStyle = CSS class for the navigation container when showNavigation is true
automaticCycling = Boolean; whether the rotator should auto-advance like a slideshow
cycleDelayMs = Time in milliseconds between automatic slide transitions
pauseOnHover = Boolean; if automaticCycling is enabled, whether to pause on mouse hover
advanceOnClick = Boolean; whether clicking on the slide should advance to the next
loopSlides = Boolean; if true, the rotator will loop from last to first and vice-versa
useImageBackgrounds = Boolean; if true, the slide's image will be used as the background of the rotator during transitions for a smoother effect

*/
(function(jQ){
 jQ.fn.contentRotator = function(configOptions) {
  var standardSettings = {
   priorButtonClass: "go-back",
   subsequentButtonClass: "go-forward",
   dormantStyle: "disabled-item",
   slideItemSelector: "div",
   transitionEffect: "fade",
   motionCurve: "swing",
   durationMs: 700,
   showNavigation: true,
   activeNavStyle: "current-page",
   navigationContainerStyle: "page-nav",
   automaticCycling: false,
   cycleDelayMs: 5000,
   pauseOnHover: true,
   advanceOnClick: false,
   loopSlides: false,
   useImageBackgrounds: false
  };
  var currentConfig = jQ.extend(standardSettings, configOptions);

  return this.each(function() {
   // targetElement is the selected rotator container
   var targetElement = jQ(this);
   var innerElements = targetElement.children(currentConfig.slideItemSelector);
   var totalSlides = innerElements.length;
   var previousControl = jQ("." + currentConfig.priorButtonClass);
   var nextControl = jQ("." + currentConfig.subsequentButtonClass);
   var slideReferences = [];
   var currentSlideIndex = 1;

   // Populate array with slide items
   for (var itemCounter = 1; itemCounter <= totalSlides; itemCounter++) {
    slideReferences[itemCounter] = targetElement.find(currentConfig.slideItemSelector + ":nth-child(" + itemCounter + ")");
   }

   // Initialize the first slide view
   navigateToSlide(1, "", 1);

   // If automatic cycling is enabled
   if (currentConfig.automaticCycling) {
    var autoPlayTimer = setInterval(function() {
     if (currentSlideIndex < totalSlides) {
      navigateToSlide(currentSlideIndex, "next", currentSlideIndex);
     } else {
      if (currentConfig.loopSlides) {
       navigateToSlide(1, currentSlideIndex, totalSlides);
       currentSlideIndex = 1;
      }
     }
    }, currentConfig.cycleDelayMs);
   }

   // If auto-pause on hover is active
   if (currentConfig.automaticCycling && currentConfig.pauseOnHover) {
    targetElement.children().hover(function() {
     clearInterval(autoPlayTimer);
    }, function() {
     autoPlayTimer = setInterval(function() {
      if (currentSlideIndex < totalSlides) {
       navigateToSlide(currentSlideIndex, "next", currentSlideIndex);
      } else {
       if (currentConfig.loopSlides) {
        navigateToSlide(1, currentSlideIndex, totalSlides);
        currentSlideIndex = 1;
       }
      }
     }, currentConfig.cycleDelayMs);
    });
   }

   // If advancing on click is enabled
   if (currentConfig.advanceOnClick) {
    innerElements.on("click", function(eventObject) {
     eventObject.preventDefault();
     if (currentSlideIndex < totalSlides) {
      navigateToSlide(currentSlideIndex, "next", currentSlideIndex);
     } else {
      if (currentConfig.loopSlides) {
       navigateToSlide(1, currentSlideIndex, totalSlides);
       currentSlideIndex = 1;
      }
     }
    });
   }

   // Function to change the displayed slide
   function navigateToSlide(targetPageNum, movementDirection, originPageNum) {
    if (movementDirection == "next") {
     ++targetPageNum;
     currentSlideIndex = targetPageNum;
    }
    if (movementDirection == "prev") {
     --targetPageNum;
     currentSlideIndex = targetPageNum;
    }
    targetElement.children(currentConfig.slideItemSelector).hide();
    // Custom animation logic
    displaySlideContent(targetPageNum, originPageNum);
    if (currentConfig.showNavigation) buildPageIndicators(targetPageNum);
    if (!currentConfig.loopSlides) {
     if (targetPageNum == 1) {
      previousControl.addClass(currentConfig.dormantStyle).css({
       "cursor": "default"
      });
     } else {
      previousControl.removeClass(currentConfig.dormantStyle).css({
       "cursor": "pointer"
      });
     }
     if (targetPageNum == totalSlides) {
      nextControl.addClass(currentConfig.dormantStyle).css({
       "cursor": "default"
      });
     } else {
      nextControl.removeClass(currentConfig.dormantStyle).css({
       "cursor": "pointer"
      });
     }
    }
   }

   // Function to generate navigation indicators
   function buildPageIndicators(currentPageNum) {
    jQ("." + currentConfig.navigationContainerStyle).remove();
    var listStart, pageLinkItems = "",
     navigationHtml = "";
    listStart = "<ul class='" + currentConfig.navigationContainerStyle + "'>";
    var listEnd = "</ul>";
    for (var i = 1; i <= totalSlides; i++) {
     if (i == currentPageNum) {
      pageLinkItems += '<li><a class="' + currentConfig.activeNavStyle + '" title="' + i + '">' + i + '</a></li>';
     } else {
      pageLinkItems += '<li><a href="#" class="go-to-slide" title="' + i + '">' + i + '</a></li>';
     }
    }
    navigationHtml = listStart + pageLinkItems + listEnd;
    targetElement.append(navigationHtml);
   }

   // Custom animation handler
   function displaySlideContent(targetPageNum, originPageNum) {
    if (currentConfig.useImageBackgrounds) {
     if (totalSlides != 1) {
      var backgroundImageSrc = slideReferences[originPageNum].find("img").attr("src");
      targetElement.css({
       "background": "url(" + backgroundImageSrc + ") center center"
      });
     }
    }
    if (currentConfig.transitionEffect == "random") {
     var effectOptions = ["fade", "slideDown", "slideUp", "slideRight", "slideLeft", "bounce", "slideUp", "explode", "fold", "scale"];
     var randomIndex = Math.floor(Math.random() * 10);
     var selectedEffect = effectOptions[randomIndex];
    } else {
     var selectedEffect = currentConfig.transitionEffect;
    }
    innerElements.hide();
    switch (selectedEffect) {
     case "fade":
      slideReferences[targetPageNum].stop().fadeIn(currentConfig.durationMs);
      break;
     case "slideDown":
      slideReferences[targetPageNum].stop().show('slide', {
       direction: 'up',
       easing: currentConfig.motionCurve
      }, currentConfig.durationMs);
      break;
     case "slideUp":
      slideReferences[targetPageNum].stop().show('slide', {
       direction: 'down',
       easing: currentConfig.motionCurve
      }, currentConfig.durationMs);
      break;
     case "slideRight":
      slideReferences[targetPageNum].stop().show('slide', {
       direction: 'left',
       easing: currentConfig.motionCurve
      }, currentConfig.durationMs);
      break;
     case "slideLeft":
      slideReferences[targetPageNum].stop().show('slide', {
       direction: 'right',
       easing: currentConfig.motionCurve
      }, currentConfig.durationMs);
      break;
     case "bounce":
      slideReferences[targetPageNum].stop().show('bounce', {
       direction: "up",
       easing: currentConfig.motionCurve
      }, currentConfig.durationMs);
      break;
     case "explode":
      slideReferences[targetPageNum].stop().show('explode', {
       direction: "down",
       easing: currentConfig.motionCurve
      }, currentConfig.durationMs);
      break;
     case "fold":
      slideReferences[targetPageNum].stop().show('fold', {
       direction: "down",
       easing: currentConfig.motionCurve
      }, currentConfig.durationMs);
      break;
     case "scale":
      slideReferences[targetPageNum].stop().show('scale', {
       direction: "down",
       easing: currentConfig.motionCurve
      }, currentConfig.durationMs);
      break;
     default:
      slideReferences[targetPageNum].show();
      break;
    }
   }
   // Event listeners for controls
   jQ("." + currentConfig.subsequentButtonClass).on("click", function(eventObject) {
    eventObject.preventDefault();
    if (currentSlideIndex < totalSlides) {
     navigateToSlide(currentSlideIndex, "next", currentSlideIndex);
    } else {
     if (currentConfig.loopSlides) {
      navigateToSlide(1, currentSlideIndex, totalSlides);
      currentSlideIndex = 1;
     }
    }
   });
   jQ("." + currentConfig.priorButtonClass).on("click", function(eventObject) {
    eventObject.preventDefault();
    if (currentSlideIndex > 1) {
     navigateToSlide(currentSlideIndex, "prev", currentSlideIndex);
    } else {
     if (currentConfig.loopSlides) {
      navigateToSlide(totalSlides, currentSlideIndex, 1);
      currentSlideIndex = totalSlides;
     }
    }
   });
   jQ(document).on("click", ".go-to-slide", function(eventObject) {
    eventObject.preventDefault();
    var newPageIndex = jQ(this).attr("title");
    if (newPageIndex > currentSlideIndex) {
     navigateToSlide(newPageIndex, "", currentSlideIndex);
    } else {
     navigateToSlide(newPageIndex, "", currentSlideIndex);
    }
    currentSlideIndex = newPageIndex;
   });
  });
 };
})(jQuery);

// Tabbed Interface Module for jQuery - Release 0.3
// Developed by Angel Grablev for Enavu Web Development Services (enavu.com)
// Provided under MIT and GPL licenses. Enjoy!
/*

To set up, call .tabbedInterface() on the container for your tab headers and pass the selector for the content area:
jQ("ul.headers").tabbedInterface({contentPanelSelector: "tab_content_area"});

Configurable parameters:
contentPanelSelector = The selector for the element that contains the content divs for each tab
matchContentHeights = Boolean; if true, all content panels will be resized to the height of the tallest panel
enablePersistence = Boolean; if true, browser cookies will be used to remember the last active tab
applyTransitions = Boolean; if true, an animation effect will be used when switching tabs
transitionType = The animation effect to use if applyTransitions is true (default: "fade", other option: "slide")
transitionDuration = The speed of the animation effect in milliseconds

*/
(function(jQ){
 jQ.fn.tabbedInterface = function(configOptions) {
  var standardSettings = {
   contentPanelSelector: "div.panel",
   matchContentHeights: false,
   enablePersistence: false,
   applyTransitions: false,
   transitionType: "fade",
   transitionDuration: 400
  };
  var currentConfig = jQ.extend(standardSettings, configOptions);

  return this.each(function() {
   // tabListElement represents the selected tab header list
   var tabListElement = jQ(this);

   var contentSections = jQ(currentConfig.contentPanelSelector);
   var totalTabCount = tabListElement.children("li").length;
   var tabHeaderElements = [];
   var tabContentDivs = [];

   // Create array of tab header items
   for (var i = 1; i <= totalTabCount; i++) {
    tabHeaderElements[i] = tabListElement.find("li:nth-child(" + i + ")");
    tabHeaderElements[i].attr("title", i);
   }

   // Create array of tab content divs
   for (var i = 1; i <= totalTabCount; i++) {
    tabContentDivs[i] = jQ(currentConfig.contentPanelSelector + " > div:nth-child(" + i + ")");
   }

   // If equal height is enabled
   if (currentConfig.matchContentHeights) {
    var maximumHeight = 0;
    jQ(currentConfig.contentPanelSelector).children("div").each(function() {
     if (jQ(this).outerHeight() > maximumHeight) {
      maximumHeight = jQ(this).outerHeight();
     }
    });
    jQ(currentConfig.contentPanelSelector).height(maximumHeight);
   }

   // Initialize the currently active tab
   if (currentConfig.enablePersistence) {
    if (retrievePreference("activeTab")) {
     activateTabDisplay(retrievePreference("activeTab"));
    } else {
     storePreference("activeTab", 1, 999);
     activateTabDisplay(1);
    }
   } else {
    activateTabDisplay(1);
   }

   function activateTabDisplay(tabNumber) {
    tabHeaderElements[tabNumber].addClass("active-tab").siblings().removeClass("active-tab");
    if (!currentConfig.applyTransitions) {
     tabContentDivs[tabNumber].show().siblings().hide();
    } else {

     switch (currentConfig.transitionType) {
      case "fade":
       tabContentDivs[tabNumber].fadeIn(currentConfig.transitionDuration).siblings().hide();
       break;
      case "slide":
       tabContentDivs[tabNumber].slideDown(currentConfig.transitionDuration).siblings().hide();
       break;
     }

    }
   }

   tabListElement.find("li").on("click", function(eventObject) {
    eventObject.preventDefault();
    var clickedTabNumber = jQ(this).attr("title");
    activateTabDisplay(clickedTabNumber);
    if (currentConfig.enablePersistence) storePreference("activeTab", clickedTabNumber, 999);
   });


   /* Functions to manage browser cookies */
   function storePreference(cookieKey, cookieValue, expirationDays) {
    var expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expirationDays);
    document.cookie = cookieKey + "=" + escape(cookieValue) +
     ((expirationDays == null) ? "" : ";expires=" + expiryDate.toUTCString());
   }

   function retrievePreference(cookieKey) {
    if (document.cookie.length > 0) {
     var cookieStartPos = document.cookie.indexOf(cookieKey + "=");
     if (cookieStartPos != -1) {
      cookieStartPos = cookieStartPos + cookieKey.length + 1;
      var cookieEndPos = document.cookie.indexOf(";", cookieStartPos);
      if (cookieEndPos == -1) cookieEndPos = document.cookie.length;
      return unescape(document.cookie.substring(cookieStartPos, cookieEndPos));
     }
    }
    return "";
   }
  });


 };
})(jQuery);

// Pager Component Module for jQuery - Release 0.3
// Developed by Angel Grablev for Enavu Web Development Services (enavu.com)
// Provided under MIT and GPL licenses. Enjoy!
/*

To initialize, call .pagerComponent() on the container of your items, like so:
jQ("#main-content").pagerComponent();

Configurable parameters:
elementsPerPage = Number of items to display on each page
nextLabel = Text for the 'Next' button
previousLabel = Text for the 'Previous' button
activeLinkClass = CSS class for the currently active pagination link
paginationWrapperClass = CSS class for the generated pagination container for styling
compactMode = Boolean; if true, limits the number of visible pagination links
visiblePageLinks = When compactMode is true, specifies how many page links to show
persistPageSelection = Boolean; if true, uses cookies to remember the user's current page (default: true)
displayLocation = Position of the pagination controls: "before", "after", or "both"
enforceEqualHeight = Boolean; if true, the main container will adjust its height to accommodate the tallest page
heightAdjustment = Numeric offset to fine-tune height calculations, as JavaScript height calculation can be imperfect (default: 50)

*/
(function(jQ){
 jQ.fn.pagerComponent = function(configOptions) {
  var standardSettings = {
   elementsPerPage: 4,
   nextLabel: "Forward",
   previousLabel: "Backward",
   activeLinkClass: "current-page-link",
   paginationWrapperClass: "page-controls",
   compactMode: false,
   visiblePageLinks: 6,
   persistPageSelection: true,
   displayLocation: "after",
   enforceEqualHeight: false,
   heightAdjustment: 50
  };
  var currentConfig = jQ.extend(standardSettings, configOptions);

  return this.each(function() {
   // containerElement refers to the selected list of items for pagination
   var containerElement = jQ(this);
   // visibleItemsCount specifies how many items per page
   var visibleItemsCount = currentConfig.elementsPerPage;
   // totalItemsInContainer is the count of all children within the main element
   var totalItemsInContainer = containerElement.children().length;
   // totalPageCount calculates the number of pages needed
   var totalPageCount = Math.ceil(totalItemsInContainer / visibleItemsCount);

   // Prepare the pages for pagination
   var pageItemGroups = [];
   var startIndex = 0;
   var endIndex = visibleItemsCount;

   var currentGroupHeight = 0;
   var maxGroupHeight = 0;
   // Loop through all pages and assign elements into pageItemGroups
   for (var i = 1; i <= totalPageCount; i++) {
    pageItemGroups[i] = containerElement.children().slice(startIndex, endIndex);

    if (currentConfig.enforceEqualHeight) {
     containerElement.children().slice(startIndex, endIndex).each(function() {
      currentGroupHeight += jQ(this).outerHeight();
     });
     if (currentGroupHeight > maxGroupHeight) maxGroupHeight = currentGroupHeight;
     currentGroupHeight = 0;
    }

    startIndex += visibleItemsCount;
    endIndex += visibleItemsCount;
   }
   if (currentConfig.enforceEqualHeight) {
    maxGroupHeight += currentConfig.heightAdjustment;
    containerElement.css({
     "height": maxGroupHeight
    });
   }


   // Display the first page and set initial cookie
   if (currentConfig.persistPageSelection == true) {
    if (loadPagePreference("currentPage")) {
     displaySpecificPage(loadPagePreference("currentPage"));
     renderPaginationControls(loadPagePreference("currentPage"));
    } else {
     savePagePreference("currentPage", "1");
     displaySpecificPage(loadPagePreference("currentPage"));
     renderPaginationControls(loadPagePreference("currentPage"));
    }
   } else {
    displaySpecificPage(1);
    renderPaginationControls(1);
   }
   // Show the selected page content
   function displaySpecificPage(pageNumber) {
    containerElement.children().hide();
    pageItemGroups[pageNumber].show();
   }

   // Generate the navigation links for pagination
   function renderPaginationControls(currentPageNumber) {
    var listStartTag, pageLinkItems = "",
     listEndTag, navigationMarkup = "";
    listStartTag = "<ul class='" + currentConfig.paginationWrapperClass + "'>";
    var prevButtonMarkup = "<li><a class='navigate-prev' href='#'>" + currentConfig.previousLabel + "</a></li>";
    var nextButtonMarkup = "<li><a class='navigate-next' href='#'>" + currentConfig.nextLabel + "</a></li>";
    var prevInactiveMarkup = "<li><a class='inactive-button'>" + currentConfig.previousLabel + "</a></li>";
    var nextInactiveMarkup = "<li><a class='inactive-button'>" + currentConfig.nextLabel + "</a></li>";
    listEndTag = "</ul><div style='clear:both;'></div>"; // Using div for clear instead of br
    var trailingPages = totalPageCount - currentConfig.visiblePageLinks + 1; // Renamed from 'after'
    // Helper to calculate visible page range for compact mode
    function calculatePageRange(current) {
     var start = Math.max(1, current - Math.floor(currentConfig.visiblePageLinks / 2));
     var end = Math.min(totalPageCount, start + currentConfig.visiblePageLinks - 1);
     if (end - start + 1 < currentConfig.visiblePageLinks) {
      start = Math.max(1, end - currentConfig.visiblePageLinks + 1);
     }
     return {
      start: start,
      end: end
     };
    }
    var pageRange = calculatePageRange(currentPageNumber);

    for (var i = 1; i <= totalPageCount; i++) {
     if (currentConfig.compactMode == true) {
      var midpointPage = Math.ceil(totalPageCount / 2);
      if (i >= pageRange.start && i <= pageRange.end) {
       if (i == currentPageNumber) {
        pageLinkItems += '<li><a class="' + currentConfig.activeLinkClass + '" title="' + i + '">' + i + '</a></li>';
       } else {
        pageLinkItems += '<li><a href="#" class="select-page" title="' + i + '">' + i + '</a></li>';
       }
      } else if (currentPageNumber <= midpointPage) {
       if (i >= (totalPageCount - 2)) {
        if (i == currentPageNumber) {
         pageLinkItems += '<li><a class="' + currentConfig.activeLinkClass + '" title="' + i + '">' + i + '</a></li>';
        } else {
         pageLinkItems += '<li><a href="#" class="select-page" title="' + i + '">' + i + '</a></li>';
        }
       }
      } else if (currentPageNumber >= midpointPage) {
       if (i <= 2) {
        if (i == currentPageNumber) {
         pageLinkItems += '<li><a class="' + currentConfig.activeLinkClass + '" title="' + i + '">' + i + '</a></li>';
        } else {
         pageLinkItems += '<li><a href="#" class="select-page" title="' + i + '">' + i + '</a></li>';
        }
       }
      }
     } else {
      if (i == currentPageNumber) {
       pageLinkItems += '<li><a class="' + currentConfig.activeLinkClass + '" title="' + i + '">' + i + '</a></li>';
      } else {
       pageLinkItems += '<li><a href="#" class="select-page" title="' + i + '">' + i + '</a></li>';
      }
     }
    }
    if (currentPageNumber != 1 && currentPageNumber != totalPageCount) {
     navigationMarkup = listStartTag + prevButtonMarkup + pageLinkItems + nextButtonMarkup + listEndTag;
    } else if (totalPageCount == 1) {
     navigationMarkup = listStartTag + prevInactiveMarkup + pageLinkItems + nextInactiveMarkup + listEndTag;
    } else if (currentPageNumber == totalPageCount) {
     navigationMarkup = listStartTag + prevButtonMarkup + pageLinkItems + nextInactiveMarkup + listEndTag;
    } else if (currentPageNumber == 1) {
     navigationMarkup = listStartTag + prevInactiveMarkup + pageLinkItems + nextButtonMarkup + listEndTag;
    }
    if (currentConfig.displayLocation == "before") {
     containerElement.before(navigationMarkup);
    } else if (currentConfig.displayLocation == "after") {
     containerElement.after(navigationMarkup);
    } else {
     containerElement.after(navigationMarkup);
     containerElement.before(navigationMarkup);
    }

   }

   /* Functions to manage browser cookies for page state */
   function savePagePreference(cookieKey, cookieValue) {
    var expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 999); // Fixed expiration days to 999 for consistency
    document.cookie = cookieKey + "=" + escape(cookieValue) +
     ((null == null) ? "" : ";expires=" + expiryDate.toUTCString()); // Simplified expiry check
   }

   function loadPagePreference(cookieKey) {
    if (document.cookie.length > 0) {
     var cookieStartPos = document.cookie.indexOf(cookieKey + "=");
     if (cookieStartPos != -1) {
      cookieStartPos = cookieStartPos + cookieKey.length + 1;
      var cookieEndPos = document.cookie.indexOf(";", cookieStartPos);
      if (cookieEndPos == -1) cookieEndPos = document.cookie.length;
      return unescape(document.cookie.substring(cookieStartPos, cookieEndPos));
     }
    }
    return "";
   }
  });

 };
})(jQuery);