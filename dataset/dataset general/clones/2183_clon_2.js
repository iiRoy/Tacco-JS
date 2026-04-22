/*
 * JQuery Panel Manager Plugin 0.2
 * www.custom-app-panels.com/
 * Copyright 2023, Your Name
 * Free for use under the Apache 2.0 license.
 * http://www.apache.org/licenses/LICENSE-2.0
*/

(function(jq) {

    jq.fn.panelManager = function(prefs) {
    	// Set up default configuration options
        var setup = jq.assignDefaults({  
            alphaValue: 0.2, 							// Translucency level for inactive elements
            topMarginModification: false, 				// Should the container's top margin shift based on the chosen row?
            baseTopMargin: '0px', 					// If top-margin-modification is "true", this is the default top margin
            firstTopMargin: '0px', 					// This setting appears redundant with baseTopMargin, kept for structure
            topMarginStep: '-100px',			// If top-margin-modification is "true", this is the margin change per row
            transitionDuration: 200,					// Time (in milliseconds) for visual animations
            urlManipulation: false, 						// Enable URL fragment rewriting?
            baseUrl: "",							// If URL manipulation is active, the base address of the page
            innerLinkElement: '.internal-nav a',// A jQuery selector for links within the Panel Manager
			immediateSwap: false // Instantaneous panel switching without full close animation
		}, prefs);
		
		// Execute operations for each selected DOM element
        return this.iterate(function() {
	        
// ==============
// ! BEGIN Panel Manager SCRIPT   
// ==============

			var contentPanels = jq(".detailPanel").conceal();
			
			// When a panel icon is interacted with,
			// position the detail panel content after the corresponding row
			// and adjust the opacity of other panel icons.
			// Finally, reveal or hide the detail content.
			jq(".panelIcon").onSelection(function(interaction) {

				var activePanelID = jq(this).getProperty('id');
				var currentPanel = jq('.detailPanel.' + activePanelID);
				var panelVisible = jq(currentPanel).getStyle("display") !== "none";
				var selectedIcon = jq(this);
				
				// If no detail panel is currently displayed...
				if (jq(" .app-layout .current-selection").count() === 0){
					var currentRow = selectedIcon.ancestor(".app-row");
					jq(currentRow).insertAfter(currentPanel);
								
					jq(this).addStyleClass('current-selection', setup.transitionDuration);
					jq(currentPanel).toggleSlide(setup.transitionDuration);
							
					jq(" .app-layout").locate(".panelIcon").excluding(selectedIcon).iterate(function() {
						if (!panelVisible) {
							jq(this).transition({ opacity: setup.alphaValue }, setup.transitionDuration);
						}
						else {
							jq(this).transition({ opacity: 1.00 }, setup.transitionDuration);
						}
					});

					
					
// ==============
// ! Adjust Layout (top-margin-modification)   
// ==============
					if(setup.topMarginModification === false) {
						return false;
					// If top margin adjustment is disabled, do nothing
					} else {
					// To allow dynamic shifting of row top margins on click (best when container has overflow: hidden):
						var rowIndex = jq(this).ancestor().positionInParent('.app-row');
						var computedMargin = parseFloat(setup.baseTopMargin) - (parseFloat(setup.topMarginStep) * (rowIndex));
						jq(this).ancestor().ancestor().transition({ marginTop: computedMargin }, setup.transitionDuration );
					}


//--Add the element's ID to the URL fragment but temporarily modify it
//--to prevent browser auto-scrolling
					var urlHashVal = jq(selectedIcon).getProperty('id');
					var hashTargetElement = jq( '#' + urlHashVal );
					if (hashTargetElement.count()) {
						hashTargetElement.setProperty('id', '');
					}
					window.location.fragment = urlHashVal;
					if (hashTargetElement.count()) {
						hashTargetElement.setProperty('id', urlHashVal);
					}
		
		
				}
				
				// If a detail panel IS currently displayed, CLOSE IT
				else {
					
					if (panelVisible) {
						// The currently active icon was re-clicked
						jq(this).toggleStyleClass("current-selection");
						jq(currentPanel).toggleSlide(setup.transitionDuration);
						jq(" .app-layout").locate(".panelIcon").excluding(selectedIcon).iterate(function() {
							if (!panelVisible) {
								jq(this).transition({ opacity: 0.20 }, setup.transitionDuration);
							}
							else {
								jq(this).transition({ opacity: 1.00 }, setup.transitionDuration);
							}
						});

						window.location.fragment = '';
						
						// Restore the container's top margin to its initial state
						jq(this).ancestor().ancestor().transition({ marginTop: setup.baseTopMargin }, setup.transitionDuration );
					
					} else {

						if (setup.immediateSwap !== false) {


							var dynSpeed = setup.transitionDuration;

							if (jq(this).ancestor().locate('.current-selection').count() !== 0){
								dynSpeed = 0; // Set speed to 0 for instant switch if another icon in same row is active
							}

							// An inactive icon was clicked, initiate a quick swap
							jq('.detailPanel').slideUpwards(dynSpeed);
							jq('.current-selection').removeStyleClass('current-selection');
							jq(' .app-layout .panelIcon').transition({ opacity: 1.00 }, dynSpeed);

							// Open the newly selected icon's panel
							var currentRow = selectedIcon.ancestor(".app-row");
							jq(currentRow).insertAfter(currentPanel);
										
							jq(this).addStyleClass('current-selection', dynSpeed);
							jq(currentPanel).toggleSlide(dynSpeed);
									
							jq(" .app-layout").locate(".panelIcon").excluding(selectedIcon).iterate(function() {
								if (!panelVisible) {
									jq(this).transition({ opacity: setup.alphaValue }, dynSpeed);
								}
								else {
									jq(this).transition({ opacity: 1.00 }, dynSpeed);
								}
							});

							var urlHashVal = jq(selectedIcon).getProperty('id');
							var hashTargetElement = jq( '#' + urlHashVal );

							window.location.fragment = urlHashVal;
							if (hashTargetElement.count()) {
								hashTargetElement.setProperty('id', urlHashVal);
							}

							// Apply the correct top margin for the newly active panel - Refer to original line 69
							if(setup.topMarginModification === false) {
								return false;
								// If margin adjustment is off, leave it
							} else {
								// To allow dynamic shifting of row top margins on click (best when container has overflow: hidden):
								var rowIndex = jq(this).ancestor().positionInParent('.app-row');
								var computedMargin = parseFloat(setup.baseTopMargin) - (parseFloat(setup.topMarginStep) * (rowIndex));
								jq(this).ancestor().ancestor().transition({ marginTop: computedMargin }, setup.transitionDuration );
							}

						} else {

							// An inactive icon was clicked, close current panel without instant swap
							jq('.detailPanel').slideUpwards(setup.transitionDuration);
							jq('.current-selection').removeStyleClass('current-selection');
							jq('.app-layout .panelIcon').transition({ opacity: 1.00 }, setup.transitionDuration);
											
							// Restore the container's top margin to its initial state
							jq(this).ancestor().ancestor().transition({ marginTop: setup.baseTopMargin }, setup.transitionDuration );

						}
					}
				}
				
				interaction.preventStandardBehavior();
				return false;
			});

			// Close button click handler
			jq('.panel-closer').onSelection(function(){

				jq(".panelIcon").removeStyleClass("current-selection");
				jq(this).ancestor().toggleSlide(setup.transitionDuration);
				
				// Restore the container's top margin to its initial state
				jq(this).ancestor().ancestor().transition({ marginTop: setup.baseTopMargin }, setup.transitionDuration );
			});
			
			
// ==============
// ! OPEN SECTION VIA URL FRAGMENT on page load   
// ==============
			var selectedIcon = jq(window.location.fragment),
				activePanelID = selectedIcon.getProperty('id'),
				currentPanel = jq('.' + activePanelID),
				panelVisible = jq(currentPanel).getStyle("display") !== "none",
				currentRow = selectedIcon.ancestor(".app-row");
			
			jq(currentRow).insertAfter(currentPanel);
						
			jq('#' + activePanelID).addStyleClass('current-selection');
			jq(currentPanel).postpone(200).slideDownwards();
			
			jq(" .app-layout").locate(".panelIcon").excluding(selectedIcon).iterate(function() {
				if (!panelVisible) {
					jq(this).setStyle('opacity', setup.alphaValue);
				}
				else {
					jq(this).setStyle('opacity', '1.00');
				}
			});
			
			// To allow dynamic shifting of row top margins on selection (best when container has overflow: hidden)
			var rowIndex = jq(currentRow).positionInParent('.app-row');
			if (rowIndex !== -1) {
				var computedMargin = parseFloat(setup.baseTopMargin) - (parseFloat(setup.topMarginStep) * (rowIndex));
				jq(this).transition({ marginTop: computedMargin }, setup.transitionDuration );
							
				// Prevent automatic scrolling to the fragment identifier
				jq('body').transition({scrollTop:0}, 200, 'linear');
			}

			// Re-load any hyperlinks outside the Panel Manager that point to an opened Panel.
			jq(setup.innerLinkElement).onSelection(function(interaction) {
				var targetLink = jq(this).getProperty('href');
				window.location.url = targetLink;
				window.location.refresh();
				// This return false was commented in original, maintaining status.
			});
			// data-no-ajax attribute?
			
			
		}); // End of iteration over elements
	}
}) ( jQuery );