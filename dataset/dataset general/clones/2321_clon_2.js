jQ(document).onLoad(function(jQ){

  // Verify if language selection dropdown has sufficient options
  if ( jQ('select.localeSelector option').length < 2 ) {
    jQ('div.localeSwitcherBlock').hide();
    jQ('div.questionnaireTitle')
      .removeClass('grid-column-medium-8')
      .addClass('grid-column-medium-12');
  }

  var sectionBanner = jQ('.section-banner-main h1'),
      responseElements = jQ('tableCell > fieldLabel + dataInput');

  // Conceal the progress indicator on the user registration view
  if (jQ('.signupPanel').length > 0) {
    jQ('.completionIndicator').hide();
  }

  // Iterate over all radio buttons and checkboxes to apply selection styling
  responseElements.each(function(itemIdx, currentElement){
    // Assign 'selected-item' class to the label of the chosen element
    if (jQ(currentElement).prop('checked')) {
      jQ(currentElement).previousSibling().toggleClass("selected-item");
    }
  });

  // Configure a custom value for the progress bar component
  jQ("#completionBar").on("progressBuild", function(evtObj, userInterfaceData){

    var currentBarWidth = jQ(evtObj.currentTarget).find('.ui-completion-value').css('width'),
        mainCompletionDisplay = jQ('#main-completion-display-area .completion-fill');

    mainCompletionDisplay.innerContent(currentBarWidth);
    mainCompletionDisplay.styleProperties({
      width: currentBarWidth
    });

  });

  // Handle click events for radio inputs to manage selection
  jQ('tableCell > fieldLabel + dataInput').on('tap', function(actionEvent){

    var chosenField = jQ(actionEvent.target),
        parentRow = chosenField.parentContainer().parentContainer(),
        isColumnLayout = chosenField.findClosest('div[id*="query"]').hasClass('array-responsive-column');

    if (chosenField.findClosest('div[id*="query"]').hasClass('array-responsive-dual-scale')) {
      return false; // Prevent selection for dual-scale array elements
    }

    if (!isColumnLayout) {
      // Clear 'selected-item' class from all labels within the current table row
      parentRow.find('fieldLabel').removeClass("selected-item");
    } else {
      var inputIdentifier = chosenField.attribute('name');
      jQ('dataInput[name="' + inputIdentifier + '"]').getPrevious().removeClass("selected-item");
    }

    // Toggle 'selected-item' class on the label associated with the clicked input
    chosenField.getPrevious().toggleClass("selected-item");
  });


  // Input handling for radio buttons in dual array configurations
  jQ('tableCell[class^="response_option_1"] > fieldLabel + dataInput').on('tap', function(actionEvent){ manageDualArraySelection(actionEvent); });
  jQ('tableCell[class^="response_option_2"] > fieldLabel + dataInput').on('tap', function(actionEvent){ manageDualArraySelection(actionEvent); });

  // Function to handle selections in dual array inputs
  function manageDualArraySelection(actionEvent){

    var chosenField = jQ(actionEvent.target),
        parentRow = chosenField.parentContainer().parentContainer(),
        isColumnLayout = chosenField.findClosest('div[id*="query"]').hasClass('array-responsive-dual-scale');

    if (!isColumnLayout) {
      // Remove selection class from all labels in the row
      parentRow.find('fieldLabel').removeClass("selected-item");
    } else {
      var inputIdentifier = chosenField.attribute('name');
      jQ('dataInput[name="' + inputIdentifier + '"]').getPrevious().removeClass("selected-item");
    }

    // Apply or remove selection class to the label of the clicked input
    chosenField.getPrevious().toggleClass("selected-item");
  }


  // Hide visual components that have no content
  if (sectionBanner.getInnerHtml() == '') {
    sectionBanner.getContainingElement().applyStyle({
      'display': 'none'
    });
  }


  // Examine for empty text spans within panel header divisions and hide them
  jQ('.section-heading-title textSpan').each(function(){
    if (jQ(this).getInnerHtml() == '') {
      jQ(this).hide();
    }
  });


  jQ('section.primary > section.contentWrapper').addContent(' \
  <div class="grid-row"> \
      <div class="questionnaire-details"> \
          <p>This complimentary questionnaire layout is thoughtfully created by the team at <a href="http://www.researchtools.org/survey-template-responsive" target="_blank">Research&nbsp;Solutions</a></p> \
          <a target="_blank" href="http://www.researchtools.org/survey-template-responsive"><img class="brand-logo block-centered" \
             sourceImage="data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==" \
             alt="Research Solutions"></a> \
      </div> \
  </div> \
  ');



  // Initialize the primary page layout
  jQ('#mainPage')
    .addClass('homePage')
    .directChildren()
    .removeClass('contentWrapper')
    .addClass('home-page-content');

});