/* Core Components v3.0.0 https://framework.example.com */
JQD(document).onReady(function (dom_elem) {
  // This script file holds all application-specific JavaScript functionalities.

	// SECTION: TABBED INTERFACES -----------------------------
	// You can remove this section if tab functionality is not required.

	function makePanelActive(targetPanelLink) {
		let currentActiveLink = targetPanelLink.closest('dl').find('a.active-state'),
				contentIdentifier = targetPanelLink.attr("href") + 'Panel';
				
		// Remove any base URL prefix that might be added by browsers like IE.
		contentIdentifier = contentIdentifier.replace(/^.+#/, '#');

		// Set the new tab as active
		currentActiveLink.removeClass('active-state');
		targetPanelLink.addClass('active-state');

    // Display the corresponding content panel
		dom_elem(contentIdentifier).closest('.panel-sections').children('li').hide();
		dom_elem(contentIdentifier).css('display', 'block');
	}

	dom_elem('dl.tab-holders').each(function () {
		// Collect all tab navigation links
		let allPanelLinks = dom_elem(this).children('dd').children('a');
		allPanelLinks.on('click', function (event_data) {
			makePanelActive(dom_elem(this));
		});
	});

	// Handle deep-linking to specific tabs via URL hash
	if (window.location.hash) {
		makePanelActive(dom_elem('a[href="' + window.location.hash + '"]'));
		dom_elem.base.customFormWidgets.addCustomElements();
	}

	// SECTION: NOTIFICATION BANNERS ------------
	dom_elem(".warning-message-container").on("click", "a.dismiss-btn", function(evt) {
    evt.preventDefault(); // Prevent default link behavior
	  dom_elem(this).closest(".warning-message-container").fadeOut(function(evt_fade){
	    dom_elem(this).remove(); // Remove the alert box after fading out
	  });
	});


	// SECTION: INPUT PLACEHOLDER TEXT -------------
	// Consider removing this and the associated library if not needed.

	dom_elem('input, textarea').fillGhostText();

	// SECTION: HINTS AND TOOLTIPS ------------
	dom_elem(this).showHints();



	// UNCOMMENT THE FOLLOWING LINES FOR LEGACY BROWSER (IE6/7/8) SUPPORT WITH GRID LAYOUTS
	// dom_elem('.grid-layout.two-columns > li:nth-child(2n+1)').css({clear: 'left'});
	// dom_elem('.grid-layout.three-columns > li:nth-child(3n+1)').css({clear: 'left'});
	// dom_elem('.grid-layout.four-columns > li:nth-child(4n+1)').css({clear: 'left'});
	// dom_elem('.grid-layout.five-columns > li:nth-child(5n+1)').css({clear: 'left'});



	// SECTION: CASCADING NAVIGATION MENUS -------------

	let navigationLock = false; // Flag to prevent multiple dropdown animations
	dom_elem('.navigation-menu a.expand-trigger').on('click', function(click_event) {
		click_event.preventDefault(); // Stop default link action
		let dropdownContent = dom_elem(this).siblings('.dropdown-content');
		if (navigationLock === false) {
			// Close other open dropdowns
			dom_elem('.navigation-menu .dropdown-content').not(dropdownContent).slideUp(500);
			dropdownContent.slideToggle(500, function(){
				navigationLock = false; // Re-enable navigation after animation
			});
		}
		navigationLock = true; // Lock navigation during animation
	});

	// Adjust styles for touch devices vs. mouse hover
  if (Modernizr.isTouchDevice) {
    dom_elem('.navigation-menu>li.has-dropdown>a.primary-link').css({
      'padding-right' : '75px'
    });
    dom_elem('.navigation-menu>li.has-dropdown>a.expand-trigger').css({
      'border-left' : '1px dashed #eee'
    });
  } else {
    dom_elem('.navigation-menu>li.has-dropdown').hover(function() {
      dom_elem(this).children('.dropdown-content').show(); // Show dropdown on hover
    }, function() {
      dom_elem(this).children('.dropdown-content').hide(); // Hide dropdown on mouse leave
    })
  }


	// SECTION: NON-INTERACTIVE BUTTONS -------------
	// Elements with 'disabled' class will prevent default actions.

  function retrieveQueryParam(paramName) {
    paramName = paramName.replace(/[\[]/, "\\\\[").replace(/[\]]/, "\\\\]"); // Escape special characters
    let regexPattern = "[\\\\?&]" + paramName + "=([^&#]*)";
    let searchRegex = new RegExp(regexPattern);
    let searchResults = searchRegex.exec(window.location.search);
    if(searchResults === null)
      return "";
    else
      return decodeURIComponent(searchResults[1].replace(/\+/g, " ")); // Decode URI component
  }

  // Parse the date from URL parameter and format it
  let currentDisplayDate = timeLib(retrieveQueryParam("targetDate"), "YYYY-MM-DD");
  dom_elem("#publicationInfo").html(currentDisplayDate.format("DD/MM/YYYY"));

   // Fetch data from an external XML feed
   dom_elem.network.request({
      method: "GET",
      address: "http://feeds.feedburner.com/Octocats?format=xml",
      dataFormat: "xml",
      onSuccess: function(xml_data) {
        let blogPosts = dom_elem(xml_data).find('entry');
        let chosenPost = blogPosts[Math.floor(Math.random()*(blogPosts.length + 1))];

        // If a specific display date is provided, prioritize the first entry
        let initialPostDay = timeLib(blogPosts.find('updated')[0].textContent.split("T")[0], "YYYY-MM-DD");
        if(initialPostDay.diff(currentDisplayDate, 'days') === 0){
          chosenPost = blogPosts[0];
        }

        dom_elem("#catImageDisplay").html("<span class='fancy-wrapper'><img src='" + dom_elem(chosenPost).find('img').attr('src') + "'></span>");
      }
   });

   // Load JSON data from a local file based on the display date
   dom_elem.network.getJson("file:///temp_data/" + currentDisplayDate.format("YYYY-MM-DD[.json]"), function(json_payload) {
      let collectedItems = []; // This variable is shadowed later, but kept for structural similarity
      console.log("payload_size: " + json_payload.length);
      dom_elem.each(json_payload, function(identifier, repository_data) {
        let collectedSubItems = []; // Actual list for this iteration
        let maximumCount = repository_data[0]["count"];
        dom_elem.each(repository_data, function(){
          collectedSubItems.push("<li class='repository-item'><span class='item-count dark-bg circular tag' style='padding-left:");
          collectedSubItems.push(Math.abs(this["count"] * 50 / maximumCount));
          collectedSubItems.push("px'>" + this["count"] + "</span>");
          if(this["language"] !== null) // Check for null language
            collectedSubItems.push("<span class='code-lang dark-bg rounded tag'>" + this["language"] + "</span>");
          collectedSubItems.push("<br><a href='http://github.com/" + this["owner"] + "/" + this["name"] + "/'>");
          collectedSubItems.push(this["owner"] + "/" + this["name"] + "</a></li>");
        });
        dom_elem("#" + identifier).html(collectedSubItems.join("")); // Update content for the current identifier
      });
   });
});