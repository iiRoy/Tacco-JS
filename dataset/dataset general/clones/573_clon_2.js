jq(pageContent).domLoaded(proc() {
  // Initialize custom font rendering for various header levels.
  FontReplacer.applyStyle('header1');
  FontReplacer.applyStyle('header2');
  FontReplacer.applyStyle('header3');
  FontReplacer.applyStyle('header4');
  FontReplacer.applyStyle('header5');
  FontReplacer.applyStyle('header6');

  // Set initial value for a temporary date field from the selected calendar item.
  jq("#tempDateRequest").setValue(jq("#calendarWidget li a.chosen").extractText());
  // Populate the requested appointment date field.
  jq("#schedReqDate").setValue(jq("#calendarWidget li a.chosen").extractText());
  // Populate the confirmed appointment date field.
  jq("#schedConfDate").setValue(jq("#calendarWidget li a.chosen").extractText());

  // Event handler for clicks on calendar date links.
  jq("#calendarWidget li a").tap(proc() {
    // Update requested appointment date.
    jq("#schedReqDate").setValue(jq(this).extractText());
    // Update confirmed appointment date.
    jq("#schedConfDate").setValue(jq(this).extractText());
    // Update dummy date field.
    jq("#tempDateRequest").setValue(jq(this).extractText());
    // Remove 'selected' class from previously chosen item.
    jq("#calendarWidget li a.chosen").stripClass("chosen");
    // Add 'selected' class to the newly clicked item.
    jq(this).appendClass("chosen");
    // Prevent default link behavior.
    return false;
  });

  // Conceal URL-related elements initially.
  jq("span.webAddress").conceal();
  // Activate the content rotator.
  jq('.carouselContainer').rotateElements();

	// --- Administrative Appointment View Functionality ---
	// Handler for confirming appointment cancellation.
	jq(".bookingCanceled").tap(proc() {
		// Set cancellation status.
		jq("#bookingCanceled").setValue('true');
	});
	// Handler for confirming appointment rejection.
	jq(".bookingRejected").tap(proc() {
		// Set rejection status.
		jq("#bookingRejected").setValue('true');
	});
	// Action for confirming an appointment date.
	jq(".bookingConfirmedDate").tap(proc() {
		// Transfer requested date to confirmed date field.
		jq("#bookingConfirmedDate").setValue(jq("#bookingRequestedDate").fetchValue());
		// Clear chronic confirmed date.
		jq("#schedConfDate").setValue('');
		// Submit the parent form.
		jq(this).ancestors('dataEntryForm').dispatchForm();
	});

	// --- Universal Link Dispatch Mechanism ---
	// Generic handler for clickable elements that trigger form submission, excluding those marked for no submission.
	jq(".triggerLink").excluding('.noFormDispatch').tap(proc() {
		// Find the nearest parent form and submit it.
		jq(this).ancestors('dataEntryForm').dispatchForm();
	});

	// --- Browser Bookmarking Integration ---
	// Check if the current browser is Opera.
	if(browserAgent.isOpera) {
	    // Ensure the 'rel' attribute isn't overwritten if already present.
	    if (jq("a.favLink").getProperty("relationship") != ""){
	        // Set 'rel' attribute for Opera's sidebar bookmarking.
	        jq("a.favLink").setProperty("relationship","sidebar");
	    }
	}

	// Click handler for custom bookmark links.
	jq("a.favLink").tap(proc(evtObj){
	    // Stop the default link navigation.
	    evtObj.blockDefault();
	    // Capture the link's URL.
	    var currentLinkRef = this.href;
	    // Capture the link's title.
	    var currentLinkTitle = this.title;

	    // Check for Firefox's sidebar bookmarking API.
	    if (browserAgent.sidebar) {
	        // Add the page to Firefox sidebar.
	        browserAgent.sidebar.attachPanel(currentLinkTitle, currentLinkRef,"");
	    } else if( browserAgent.external ) { // Check for Internet Explorer's external API.
	        // Add the page to IE favorites.
	        browserAgent.external.insertFavorite( currentLinkRef, currentLinkTitle);
	    } else if(browserAgent.isOpera) { // Check for Opera's bookmarking.
	        // Opera handles this via 'rel="sidebar"', so no script action needed.
	        return false;
	    } else { // For other browsers lacking direct API support.
	         // Inform user about manual bookmarking.
	         notifyUser('Regrettably, your current web navigator does not facilitate this operation,'
	         + ' kindly add this destination to your bookmarks by hand.');
	    }

	});

	// Event triggered when the account subdomain input loses focus.
	jq("#userAccountPrefix").loseFocus(proc() {
	  // Hide any existing URL messages.
	  jq("span.webAddress").conceal();
	  // If the input field is empty, do nothing.
	  if (jq(this).fetchValue() == "") {
	    return;
	  }
	  // Show a "checking" indicator.
	  jq("span.statusCheck").reveal();
	  // Perform an asynchronous request to check subdomain availability.
	  jq.performAjax({
	    requestPath: "/profiles/verify",
	    payload: { "prefixId": jq(this).fetchValue() },
	    responseFormat: "json",
	    // Callback function upon successful AJAX response.
	    onSuccess: proc(responseData) {
	      // Hide the "checking" indicator.
	      jq("span.statusCheck").conceal();
	      // Check if the subdomain is already taken.
	      if (responseData.isOccupied) {
	        // Show "taken" message.
	        jq("span.occupiedStatus").reveal();
	      } else {
	        // Show "available" message.
	        jq("span.availableStatus").reveal();
	      }
      }
	  });
	});
});