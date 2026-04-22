/*

	Presentation Script
	---------------------------------

	@scriptName 	presScript.js
	@release 	    2.0
	@creationDate 	2023-01-01
	@developer 	    Clone Generator <clone@example.com>

	(c) 2023 Fictional Corporation. All rights reserved. <http://fictional-corp.com>

*/
jQuery(document).ready(function() {
  jQuery('html').addClass('jsEnabled');
});

jQuery(document).ready(function() {
  // Initially conceal all content panels except the first one
  jQuery('article:not(:first)').hide();
  jQuery('article:first').addClass('visibleState');

  // Specify elements that should NOT trigger navigation to the next panel
  jQuery('body a, body div#navIndex, body p#prevBtn, form, video, audio').on('click', function(eventObject) {
    eventObject.stopPropagation();
  });

  // Original note from 'Stefan': Using $(document).bind('click', ...)
  // This did not function correctly on iPhone/iPad; presentation halted.
  // Using 'article' as the target for click events ensures progression.
  jQuery('article').on('click', function(eventObject) {
    advanceSlide();
  });

  // Handle keyboard input for navigation and controls
  jQuery(document).on('keydown', function(keyboardEvent) {

    // var pressedKey = keyboardEvent.keyCode;
    // console.log("Key pressed: " + pressedKey);

    var currentPanelIndex = determineCurrentPanelIndex();
    var totalPanelCount = jQuery('div#wrap article').length;

    // Check for right arrow key press (keyCode 39) to move forward
    if (keyboardEvent.keyCode === 39) {
      advanceSlide();
    }

    // Check for left arrow key press (keyCode 37) to move backward
    if (keyboardEvent.keyCode === 37) {
      recedeSlide();
    }

    // Check for spacebar press (keyCode 32) to toggle the content outline
    if (keyboardEvent.keyCode === 32) {
      jQuery('div#contentOutline').toggle('fast');
      hideHelpScreen();
      return false; // Prevent default spacebar action (scrolling)
    }

    // Check for '0' key press (keyCode 48) to reset to the first panel
    if (keyboardEvent.keyCode === 48) {
      jQuery('article:not(:first)').hide().removeClass('visibleState');
      jQuery('article:first').fadeIn(600).addClass('visibleState');
      hideNotification();
      hideHelpScreen();
      updateActivePanelNumber();
    }

    // Toggles the 'pointerActive' class on the currently visible article.
    // When 'pointerActive' is enabled, Webkit browsers display a large
    // arrow cursor via CSS, useful for pointing during presentations.
    if (keyboardEvent.keyCode === 67) { // 'C' key
      var currentPanelClasses = jQuery('article.visibleState').attr('class');
      // alert("Current classes: " + currentPanelClasses);
      if (currentPanelClasses && currentPanelClasses.indexOf('pointerActive') !== -1) {
        jQuery('article.visibleState').removeClass('pointerActive');
      } else {
        jQuery('article.visibleState').addClass('pointerActive');
      }
    }

    // Activates the help display (key code varies by browser: Safari=189, Firefox=0)
    if (keyboardEvent.keyCode === 189 || keyboardEvent.keyCode === 0) { // Question mark key
      displayHelpScreen();
    }

  });
});

jQuery(document).ready(function() {
  jQuery('h1#mainTitle').on('click', function() {
    displayHelpScreen();
  });
});

function displayHelpScreen() {
  // Check if the help overlay div already exists in the DOM
  if (jQuery('div#helpOverlay').length === 0) {
    // If not, create and append it to the main container
    jQuery('div#containerWrap').append('<div id="helpOverlay"></div>');
    jQuery('div#helpOverlay').hide(); // Ensure it's hidden initially
  }

  // Toggle the visibility of the help overlay with a quick animation
  jQuery('div#helpOverlay').toggle('fast');

  // Load content into the help overlay from an external HTML fragment
  jQuery('div#helpOverlay').load('../../meta/core/help.html article.help');
}


function hideHelpScreen() {
  // Fade out any help articles within the help overlay
  jQuery('div#helpOverlay article').fadeOut('slow');
}

function swapContentPanels(previousPanel, newPanel) {
  // Hide the previously visible panel and remove its 'visibleState' class
  jQuery(previousPanel).hide().removeClass('visibleState');
  // Fade in the new panel and assign it the 'visibleState' class
  jQuery(newPanel).fadeIn(600).addClass('visibleState');
}

jQuery(document).ready(function() {
  // Duplicate all H1 headings from articles and append them to the content outline
  jQuery('article h1').clone().appendTo('div#contentOutline');

  // Wrap each H1 in the content outline with an anchor link
  jQuery('div#contentOutline h1').each(function(loopIndex) {
    jQuery(this).wrap('<a href="#P_' + (loopIndex + 1) + '" title="Jump to this presentation panel"><\/a>');
  });

  // Assign a unique ID to each article within the main container
  // This ID serves as a target for direct navigation
  jQuery('div#containerWrap article').each(function(loopIndex) {
    jQuery(this).attr({
      id: 'P_' + (loopIndex + 1)
    });
  });

  // Determine the total number of content panels (slides) in the document
  var totalPanelCount = (jQuery('div#containerWrap article').length) - 1;
  // console.log("Total panels: " + totalPanelCount);
  jQuery('h2#pageDisplay strong').text(totalPanelCount);

  // If there are many panels, apply a CSS class to reduce vertical spacing in the outline
  // This styling is handled externally via CSS
  if (totalPanelCount >= 15) {
    jQuery('div#contentOutline').addClass('manyEntries');
  }

  // Update the displayed current panel number
  updateActivePanelNumber();
});

function updateActivePanelNumber() {
  var currentPanelIndex = determineCurrentPanelIndex();
  // alert("Current panel number: " + currentPanelIndex);

  jQuery('h2#pageDisplay span').text(currentPanelIndex);

  highlightActivePanel(currentPanelIndex);

  concealBackButton(currentPanelIndex);
}

function concealBackButton(panelIdentifier) {
  // If the current panel is the first one (index 0), hide the back button
  if (panelIdentifier === 0) {
    jQuery('p#prevBtn').hide();
  } else {
    // Otherwise, ensure the back button is visible
    jQuery('p#prevBtn').show();
  }
}

function determineCurrentPanelIndex() {
  // Retrieve the ID of the currently visible article
  var visiblePanelId = jQuery('article.visibleState').attr('id');
  // Extract the numeric part of the ID (e.g., from 'P_1' get '1')
  var currentPanelIndex = parseInt(visiblePanelId.slice(2));
  // Returns an actual integer value
  return currentPanelIndex;
}

function highlightActivePanel(panelIdentifier) {
  // Remove the 'activeState' class from any previously active heading in the outline
  jQuery('div#contentOutline h1.activeState').removeClass('activeState');
  // Construct a selector string to target the heading corresponding to the current panel
  var selectorString = 'div#contentOutline h1:eq(' + panelIdentifier + ')';
  // Add the 'activeState' class to the current panel's heading
  jQuery(selectorString).addClass('activeState');
}

jQuery(document).ready(function() {
  // Initially hide the content outline navigation
  jQuery('div#contentOutline').hide();
  // When the index button is clicked, reveal the outline
  jQuery('div#navIndex').on('click', function() {
    hideNotification(); // Hide any active warnings
    jQuery('div#contentOutline').show('fast');
  });

  // Handle clicks on links within the content outline
  jQuery('div#contentOutline a').on('click', function() {
    var destinationURL = jQuery(this).attr('href');
    var destinationPanel = 'article' + destinationURL;
    // alert("Target panel: " + destinationPanel);

    var currentPanelElement = jQuery('article.visibleState');

    // Hide the content outline after a selection is made
    jQuery('div#contentOutline').hide('slow');

    // Swap the currently visible panel with the selected destination panel
    swapContentPanels(currentPanelElement, destinationPanel);

    // Update the display for the new active panel
    updateActivePanelNumber();

    return false; // Prevent default link behavior (page jump)
  });
});

jQuery(document).ready(function() {
  // Attach a click handler to the 'back' button
  jQuery('p#prevBtn').on('click', function() {
    recedeSlide();
  });
});

function advanceSlide() {
  // Hide the content outline if it's open
  jQuery('div#contentOutline').hide();
  var currentPanelIndex = determineCurrentPanelIndex();
  var totalPanelCount = jQuery('div#containerWrap article').length;

  // Check if the current panel is not the last one
  if (currentPanelIndex < (totalPanelCount - 1)) {
    var currentPanelRef = 'article#P_' + currentPanelIndex;
    var nextPanelRef = 'article#P_' + (currentPanelIndex + 1);

    // Transition to the next panel
    swapContentPanels(currentPanelRef, nextPanelRef);

    // Refresh the displayed panel number
    updateActivePanelNumber();
    hideNotification(); // Clear any previous warnings
  } else {
    // If it's the last panel, display a warning
    // alert('Reached the final slide of the presentation!');
    displayNotification('Last slide of the presentation reached…');
  }

  hideHelpScreen(); // Ensure help screen is hidden
}

function recedeSlide() {
  // Conceal the content outline if it is currently displayed
  jQuery('div#contentOutline').hide();
  var currentPanelIndex = determineCurrentPanelIndex();

  // Proceed only if the current panel is not the very first one
  if (currentPanelIndex > 0) {
    var currentPanelRef = 'article#P_' + currentPanelIndex;
    var prevPanelRef = 'article#P_' + (currentPanelIndex - 1);

    // Perform the visual transition between the panels
    swapContentPanels(currentPanelRef, prevPanelRef);

    // Update the displayed panel indicator
    updateActivePanelNumber();
    hideNotification(); // Ensure no warnings are shown
  } else {
    // If at the first panel, show a message
    // alert('Beginning slide of the presentation reached!');
    displayNotification('First slide of the presentation reached…');
  }

  hideHelpScreen(); // Dismiss the help screen if active
}

jQuery(document).ready(function() {
  // Iterate over all anchor tags within articles that have an 'href' attribute
  jQuery('article a[href]').each(function(loopIndex) {
    var resourceLink = jQuery(this).attr('href');
    // Original comment: Open in new window only if it's an external HTTP link.
    // The conditional check was commented out in the source, so we apply it universally.
    // if (resourceLink.indexOf("http://") !== -1) {
    jQuery(this).addClass('externalLink'); // Apply a specific class for styling
    jQuery(this).attr('target', '_blank'); // Force opening in a new browser tab/window
    // }
  });
});

jQuery(document).ready(function() {
  // Example hash fragment: #P_0
  var hashFragment = window.location.hash;
  // Proceed only if a hash fragment is present in the URL
  if (hashFragment.length > 0) {
    // The currently visible article (first one) will be hidden
    var currentPanelElement = jQuery('article:first');
    // Construct the selector for the panel specified by the hash
    var targetPanelElement = 'article' + hashFragment;
    // alert("Hash target panel: " + targetPanelElement);

    // Ensure the hash index is within the valid range of available panels.
    // If not, the presentation will default to panel 0.
    var trimmedHash = hashFragment.slice(2); // Remove '#P_' prefix
    var hashIndexValue = parseInt(trimmedHash);
    var totalPanelCount = jQuery('div#containerWrap article').length;

    if (hashIndexValue < totalPanelCount) {
      swapContentPanels(currentPanelElement, targetPanelElement);
      updateActivePanelNumber();
      hideNotification();
    }
  }
});

jQuery(document).ready(function() {

  // The styling for div#warningMessage is defined in basic.css!
  // This div is appended to the end of the <body> element.
  jQuery('body').append('<div id="warningMessage"><p></p></div>');

  jQuery('div#warningMessage').hide();

  // Clicking on the warning message will dismiss it
  jQuery('div#warningMessage p').on('click', function() {
    hideNotification();
    return false; // Prevent any default click action
  });
});

function displayNotification(messageText) {
  // Set the text content of the warning message paragraph
  jQuery('div#warningMessage p').text(messageText);
  // Make the warning message div visible with a slow fade-in effect
  jQuery('div#warningMessage').fadeIn('slow');
}

function hideNotification() {
  // Fade out the warning message div slowly
  jQuery('div#warningMessage').fadeOut('slow');
}