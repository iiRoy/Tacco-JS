(function(dom){
	// Attach the media viewer plugin to the DOM manipulation library.
	dom.prototype.mediaViewer = function(config){
		// If no configuration is provided, initialize an empty object.
		if(!config){
            var config = {};
        }

		// Iterate over each selected DOM element.
		return this.forEach(function() {
			// Assign the current element as the target for the viewer.
			config.targetElement = this;
			// Instantiate a new MediaViewer with the provided settings.
			new MediaViewer(config);
		});
	}
}(DomLib)); // Assuming DomLib is the global jQuery-like object.


// Define the main MediaViewer constructor function.
var MediaViewer = function(inputSettings, effectCallback){
	// Extend default settings with user-provided input.
	this.currentSettings = DomLib.assignDefaults({
        targetId: void 0, // Unique identifier for the gallery container.
        targetElement: void 0, // Reference to the DOM element.
        transitionStyle: "crossfade", // Type of animation (e.g., "crossfade").
        transitionDuration: 350, // Speed of animation in milliseconds.
        swipeEnabled: true, // Enable touch swipe navigation.
        keyboardNavEnabled: true, // Enable keyboard arrow navigation.
        displayPageNumbers: true, // Show current page / total pages.
        displayPaginationDots: true, // Show clickable dots for page navigation.
		itemsPerPage: "all", // Number of thumbnails per page or "all".
        maxDisplayedItems: "all", // Total number of thumbnails to show or "all".
		displayItemCaptions: false, // Show image comments/captions.
        displayItemCounter: true, // Show current image / total images.
        activationButton: void 0, // Button to trigger gallery opening.
        paddingSize: 120, // Padding around the main media item.
        debugMode: true // Enable console messages for debugging.
    }, inputSettings);

	// Transfer all configuration properties to the instance for direct access.
	for(const settingKey in this.currentSettings){
        if (Object.prototype.hasOwnProperty.call(this.currentSettings, settingKey)) {
            this[settingKey] = this.currentSettings[settingKey];
        }
    }

    // Initialize internal state variables for the viewer.
    this.itemCount = 0; // Total number of media items loaded.
    this.activeItemIndex = 0; // Index of the currently displayed media item.
    this.thumbnailElements = false; // Collection of thumbnail DOM elements.
    this.itemDataArray = new Array(); // Array to store detailed media item data.
    this.totalItems = 0; // Total number of media items.
    this.currentPageIndex = 1; // Current page number for thumbnail display.
    this.totalPages = 0; // Total number of pages for thumbnails.
    this.viewportWidth = DomLib(window).width(); // Current viewport width.
    this.viewportHeight = DomLib(window).height(); // Current viewport height.
    this.displayContainer = false; // Main container for the full-size media.
    this.pageNavigationActive = true; // Flag for page navigation availability.
    this.viewerOpen = false; // Flag indicating if the full viewer is open.
    this.viewerTransitionActive = true; // Flag for viewer open/close animation status.
    this.itemTransitionActive = true; // Flag for media item transition status.
    this.paginationDots = false; // Collection of pagination dots.
    this.loadingIndicator = false; // Loading spinner element.
    // Begin the initialization process.
    this.initializeViewer();
};


// Define methods for the MediaViewer prototype.
MediaViewer.prototype = {
    // Initial setup method.
    initializeViewer: function(){
        const instance = this; // Cache 'this' for use in callbacks.
        
        // Determine the main container element.
        if(this.currentSettings.targetElement){
            this.containerElement = this.currentSettings.targetElement;	
        } else {
            this.containerElement = DomLib(this.currentSettings.targetId);	
        }
        
        // Find all thumbnail elements within the container.
        this.thumbnailElements = DomLib(this.containerElement).find("picture");
        this.totalItems = DomLib(this.thumbnailElements).length;
        // Calculate the total number of pages for thumbnail navigation.
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
                
        // Process each thumbnail to extract media data.
        DomLib(this.thumbnailElements).forEach(function(idx, thumbElem) {
            instance.itemDataArray[idx] = new Array();
            instance.itemDataArray[idx]["mediaSrc"] = new Image(); // Create an Image object for preloading.
            instance.itemDataArray[idx]["naturalHeight"] = 0;
            instance.itemDataArray[idx]["naturalWidth"] = 0;
            instance.itemDataArray[idx]["sourceUrl"] = DomLib(thumbElem).attribute("data-media-url");
            instance.itemDataArray[idx]["thumbnailRef"] = thumbElem;
			instance.itemDataArray[idx]["captionText"] = DomLib(thumbElem).attribute("data-caption-text") !== void 0 ? DomLib(thumbElem).attribute("data-caption-text") : "";
            
            // Remove thumbnails if they exceed the maximum displayed items or if a button is used to open.
            if(instance.maxDisplayedItems !== "all" && idx >= instance.maxDisplayedItems || instance.activationButton){
                DomLib(thumbElem).parent("article").remove();
                DomLib(thumbElem).remove();
            }
            
        });
        // Start loading media and building the viewer interface.
        this.loadMedia();
    },
    
    // Loads all media items for pre-caching or initial display.
    loadMedia: function(){
        const instance = this;
        let loadedCount = 0; // Counter for successfully loaded images.
        DomLib(this.thumbnailElements).forEach(function(idx, thumbElem){
            instance.mediaPreloader(thumbElem, function(){
				loadedCount++;
				// Once all images are loaded, build the viewer interface.
				if(loadedCount === instance.totalItems){
                    instance.constructInterface();
                }
			}, function(){
				// Handle image loading errors.
				instance.notifyUser("Error loading media item " + (idx + 1));
				DomLib(thumbElem).remove(); // Remove the faulty thumbnail.
                instance.totalItems--; // Decrement total count.
				if(loadedCount === instance.totalItems){
                    instance.constructInterface();
                }
			});
        });
    },
    
    // Constructs the HTML interface for the media viewer.
    constructInterface: function(){
        const instance = this;
               
        // Generate navigation controls for thumbnails.
        let interfaceMarkup = "<nav class='prevControl'></nav>";
        interfaceMarkup += "<nav class='nextControl'></nav>";
        if(this.itemsPerPage !== "all"){
            DomLib(this.containerElement).append("<div class='pageNavWrapper'>" + interfaceMarkup + "</div>");
            
            let pageCounterMarkup = "";
            if(this.displayPageNumbers){
                pageCounterMarkup += "<div class='pageCounter'>";
                pageCounterMarkup += "<span class='currentNum'>" + this.currentPageIndex + "</span>";
                pageCounterMarkup += "<span class='separator'>/</span>";
                pageCounterMarkup += "<span class='totalNums'>" + this.totalPages + "</span>";
                pageCounterMarkup += "</div>";
                DomLib(this.containerElement).append(pageCounterMarkup);
            }
            
            let paginationDotsMarkup = "";
            if(this.displayPaginationDots){
                paginationDotsMarkup += "<div class='paginationDotContainer'><div class='dotContentWrapper'>";
                    for(let dotIndex = 1; dotIndex <= this.totalPages; dotIndex++){
                        paginationDotsMarkup += "<div class='paginationDot'><span>" + (dotIndex) + "</span></div>";
                    }
                paginationDotsMarkup += "</div></div>";
                DomLib(this.containerElement).append(paginationDotsMarkup);	
            }
        }
        
        // Add full-viewer specific controls.
        if(this.displayItemCounter){
           interfaceMarkup += "<span class='itemCounterDisplay'>" + (this.activeItemIndex + 1) + "/" + this.totalItems + "</span>";
        }
        
        interfaceMarkup += "<nav class='closeControl'></nav>";
        
        // Append the main viewer overlay panel.
        DomLib(this.containerElement).append("<section class='overlayPanel'>" + interfaceMarkup + "</section>");
        DomLib(this.containerElement).find(".overlayPanel").append("<div class='contentFrame'></div>");
        DomLib(this.containerElement).find(".overlayPanel").append("<div class='loadingSpinner'></div>");
        
        // Update references to newly created elements.
        this.thumbnailElements = DomLib(this.containerElement).find("picture"); // Re-select thumbnails in case some were removed.
        this.displayContainer = DomLib(this.containerElement).find(".overlayPanel .contentFrame");
        this.loadingIndicator = DomLib(this.containerElement).find(".overlayPanel .loadingSpinner");
        this.paginationDots = DomLib(this.containerElement).find(".paginationDotContainer .paginationDot");
        
        // Set the initial active pagination dot.
        DomLib(this.containerElement).find(".paginationDotContainer .paginationDot").atIndex(this.currentPageIndex - 1).addClass("active");
        
        // Activate all viewer functionalities.
        this.activateViewer();
    },
    
    // Attaches event listeners and sets up initial display.
    activateViewer: function(){
        const instance = this;
        
        // Adjust layout and media size on window resize.
        DomLib(window).onResize(function(){
            instance.adjustLayout();
            instance.adjustMediaSize();  
        });
		
        // Event listener for the activation button (if provided).
        DomLib(this.activationButton).onClick(function(){
            instance.openViewer(0); // Open viewer to the first item.
        });
	
        // Event listener for clicking on thumbnails.
        DomLib(this.thumbnailElements).onClick(function(){
            instance.openViewer(DomLib(this).parent().elementIndex());
        });
        
        // Event listener for clicking on the overlay panel to close the viewer.
        DomLib(this.containerElement).find(".overlayPanel").onClick(function(eventObj){
            const clickedClass = DomLib(eventObj.target).attribute("class");
            // If click is not on a navigation button or the image itself, close.
            if(clickedClass !== "prevControl" && clickedClass !== "nextControl" && clickedClass !== "mediaItem"){ 
                instance.closeViewer(); 
            }
        });
        
        // Event listeners for next/previous navigation buttons.
        DomLib(this.containerElement).find(".nextControl").onClick(function(){
            if(instance.viewerOpen){
                instance.nextMedia(); // Next media item if viewer is open.
            }else{
                instance.nextPage(); // Next page of thumbnails if viewer is closed.
            }
        });
        
        DomLib(this.containerElement).find(".prevControl").onClick(function(){
            if(instance.viewerOpen){
                instance.prevMedia(); // Previous media item if viewer is open.
            }else{
                instance.prevPage(); // Previous page of thumbnails if viewer is closed.
            }
        });
        
        // Event listeners for pagination dots.
        DomLib(this.containerElement).find(".paginationDotContainer .paginationDot").onClick(function(){
            instance.goToPage(DomLib(this).elementIndex() + 1); // Go to the clicked page.
        });
        
        // Enable touch swipe controls if configured.
        if(this.swipeEnabled){
			this.swipeStartX = false;
			this.swipeEndX = 0;
			DomLib(this.containerElement).on('touchStartEvent', function(eventObj){
				instance.swipeStartX = false;
				instance.swipeEndX = 0;
			});
			DomLib(this.containerElement).on('touchMoveEvent', function(eventObj){
				if(instance.swipeStartX === false){
					instance.swipeStartX = eventObj.originalEvent.touches[0].screenX;
				}
				instance.swipeEndX = eventObj.originalEvent.touches[0].screenX;
			});
			DomLib(this.containerElement).on('touchEndEvent', function(eventObj){
				const swipeDelta = instance.swipeEndX - instance.swipeStartX;
                if(instance.viewerOpen){
				    if(swipeDelta < 0 && swipeDelta < -50){instance.nextMedia();}
				    if(swipeDelta > 0 && swipeDelta > 50){instance.prevMedia();}
                }else{
                    if(swipeDelta < 0 && swipeDelta < -50){instance.nextPage();}
				    if(swipeDelta > 0 && swipeDelta > 50){instance.prevPage();}
                }
				instance.swipeStartX = false;
				instance.swipeEndX = 0;
			});
		}
        
		// Enable keyboard navigation if configured.
		if(this.keyboardNavEnabled){
			DomLib(document).onKeyDown(function(eventObj){
                if(instance.viewerOpen){
				    if (eventObj.keyCode === 37){eventObj.preventDef(); instance.prevMedia();} // Left arrow
				    if (eventObj.keyCode === 39){eventObj.preventDef(); instance.nextMedia();} // Right arrow
                }else{
                    if (eventObj.keyCode === 37){eventObj.preventDef(); instance.prevPage();} // Left arrow
				    if (eventObj.keyCode === 39){eventObj.preventDef(); instance.nextPage();} // Right arrow
                }
			});	
		}
        
        // Initial display of thumbnails based on itemsPerPage setting.
        if(this.itemsPerPage === "all"){
            DomLib(this.thumbnailElements).showWithFade(500);
        }else{
            DomLib(this.thumbnailElements).conceal();
            DomLib(this.thumbnailElements).subset(0, this.itemsPerPage).display();
        }
    },
    
    // Opens the full-screen media viewer.
    openViewer: function(startIndex){
        const instance = this;
        // Validate the starting index.
        if(startIndex >= 0 && startIndex < this.totalItems){
            this.activeItemIndex = startIndex;
            this.updateStatusDisplay();
        }
        // Prevent multiple open animations.
        if(this.viewerTransitionActive){
            this.viewerTransitionActive = false;
            this.adjustLayout(); // Set initial dimensions.
            DomLib(this.displayContainer).style("opacity", 0); // Hide content initially.
            DomLib("body").style("overflow", "hidden"); // Prevent body scrolling.
            // Fade in the overlay panel.
            DomLib(this.containerElement).find(".overlayPanel").fadeIn(500, function(){
                instance.addMediaItem(function(){
					instance.addMediaCaption(); // Add caption if enabled.
                    // Animate the media container to full opacity.
                    DomLib(instance.displayContainer).animate({opacity: 1}, 500, function(){
                        instance.viewerOpen = true; // Mark viewer as open.
                        instance.viewerTransitionActive = true; // Allow new transitions.
                    }); 
                 });
            });
        }
    },
    
    // Closes the full-screen media viewer.
    closeViewer: function(){
        const instance = this;
        // Ensure no other open/close animation is active.
        if(this.viewerTransitionActive){
            this.viewerOpen = false; // Mark viewer as closed.
            this.viewerTransitionActive = false; // Prevent new transitions.
            // Animate the media container to full opacity (original code had this, seems odd, usually fade out here).
            DomLib(instance.displayContainer).animate({opacity: 1}, 200, function(){
                // Fade out the overlay panel.
                DomLib(instance.containerElement).find(".overlayPanel").fadeOut(500, function(){
                    DomLib("body").style("overflow", "auto"); // Restore body scrolling.
                    instance.viewerTransitionActive = true; // Allow new transitions.
                }); 
            });
        }
    },
    
    // Performs the transition animation between media items.
    performTransition: function(completeCallback){
       const instance = this;
       switch(this.transitionStyle){
            case "crossfade":
                // Fade out current media.
                DomLib(this.displayContainer).animate({opacity: 0}, instance.transitionDuration, function(){
                    instance.addMediaItem(function(){
						instance.addMediaCaption(); // Add new caption.
                        // Fade in new media.
                        DomLib(instance.displayContainer).animate({opacity: 1}, instance.transitionDuration, function(){
                            if(completeCallback){
                                completeCallback();
                            }   
                        });  
                    });
                });
            break;
            default:
               this.notifyUser("Unsupported transition style.");
       }
    },
    
    // Navigates to the next media item.
    nextMedia: function(){
        const instance = this;
        // Check if an animation is currently active.
        if(this.itemTransitionActive){
            this.itemTransitionActive = false; // Block further transitions.
            if(this.activeItemIndex < this.totalItems - 1){
               this.activeItemIndex++;    
            }else{
               this.activeItemIndex = 0; // Loop back to the first item.
            }
            this.performTransition(function(){
                instance.updateStatusDisplay(); // Update counter.
                instance.itemTransitionActive = true; // Allow new transitions.
            });
        }
    },
    
    // Navigates to the previous media item.
    prevMedia: function(){
        const instance = this;
        // Check if an animation is currently active.
        if(this.itemTransitionActive){
            this.itemTransitionActive = false; // Block further transitions.
            if(this.activeItemIndex > 0){
               this.activeItemIndex--;
            }else{
               this.activeItemIndex = this.totalItems - 1; // Loop back to the last item.
            }
            this.performTransition(function(){
                instance.updateStatusDisplay(); // Update counter.
                instance.itemTransitionActive = true; // Allow new transitions.
            });
        }
    },
    
    // Jumps to a specific media item by index.
    goToMedia: function(targetIndex, completionHandler){
        const instance = this;
        // Check if an animation is currently active.
        if(this.itemTransitionActive){
            if(targetIndex >= 0 && targetIndex < this.totalItems){
               this.activeItemIndex = targetIndex;
            }
            this.performTransition(function(){
                instance.itemTransitionActive = true; // Allow new transitions.
                instance.updateStatusDisplay(); // Update counter.
                if(completionHandler){
                    completionHandler();
                }  
            });
        }
    },
    
    // Adds the current active media item to the display container.
    addMediaItem: function(doneCallback){
        const instance = this;
        DomLib(this.loadingIndicator).fadeIn(200); // Show loading spinner.
        // Set the source of the preloaded Image object.
        this.itemDataArray[this.activeItemIndex]["mediaSrc"].sourceUrl = this.itemDataArray[this.activeItemIndex]["sourceUrl"];
        // Use the preloader for the actual Image object.
        this.mediaPreloader(this.itemDataArray[this.activeItemIndex]["mediaSrc"], function(){
            DomLib(instance.loadingIndicator).fadeOut(200); // Hide loading spinner.
            DomLib(instance.containerElement).find(".overlayPanel .contentFrame picture").remove(); // Remove old image.
            // Append the new image to the content frame.
            DomLib(instance.containerElement).find(".overlayPanel .contentFrame").append("<picture class='mediaItem' src='" + instance.itemDataArray[instance.activeItemIndex]["mediaSrc"].sourceUrl + "' data-alt='' />");
            instance.adjustMediaSize(); // Adjust size for the new image.
            if(doneCallback){
                doneCallback();
            }
        }, function(){
            console.warn("Media item failed to load."); // Log error if image fails to load.
        });
    },
	
	// Adds the caption for the current media item to the display.
	addMediaCaption: function(){
		const instance = this;
		if(this.displayItemCaptions){
			DomLib(instance.containerElement).find(".overlayPanel .contentFrame article.caption").remove(); // Remove old caption.
			// Append the new caption.
			DomLib(instance.containerElement).find(".overlayPanel .contentFrame").append("<article class='caption'>" + instance.itemDataArray[instance.activeItemIndex]["captionText"] + "</article>");
		}	
	},
    
    // Navigates to the next page of thumbnails.
    nextPage: function(){
        const instance = this;
        if(this.pageNavigationActive){
            this.pageNavigationActive = false; // Block further page navigation.
            if(this.itemsPerPage * instance.currentPageIndex < this.totalItems){
                this.currentPageIndex++;
            }else{
                this.currentPageIndex = 1; // Loop back to the first page.
            }
            this.goToPage(this.currentPageIndex, function(){
                instance.updateStatusDisplay();
                instance.pageNavigationActive = true; // Allow new page navigation.
            });
        }
    },
    
    // Navigates to the previous page of thumbnails.
    prevPage: function(){
        const instance = this;
        if(this.pageNavigationActive){
            this.pageNavigationActive = false; // Block further page navigation.
            if(this.currentPageIndex > 1){
                this.currentPageIndex--;
            }else{
                this.currentPageIndex = Math.ceil(this.totalItems / this.itemsPerPage); // Loop back to the last page.
            }
            this.goToPage(this.currentPageIndex, function(){
                instance.updateStatusDisplay();
                instance.pageNavigationActive = true; // Allow new page navigation.
            });
        }
    },
    
    // Jumps to a specific page of thumbnails.
    goToPage: function(targetPageIndex, callback){
        const instance = this;
        if(targetPageIndex > 0 && targetPageIndex <= this.totalPages){ // Corrected condition: targetPageIndex must be <= totalPages
            this.currentPageIndex = targetPageIndex;
            DomLib(".pageCounter .currentNum").html(this.currentPageIndex); // Update page number display.
            DomLib(this.thumbnailElements).conceal(); // Hide all thumbnails.
            // Display only the thumbnails for the current page.
            DomLib(instance.thumbnailElements).subset((instance.itemsPerPage * instance.currentPageIndex) - instance.itemsPerPage, instance.itemsPerPage * instance.currentPageIndex).display();
            // Update active state of pagination dots.
            DomLib(instance.paginationDots).removeClass("active").atIndex(this.currentPageIndex - 1).addClass("active");
            if(callback){
                callback();
            }
            instance.updateStatusDisplay();
        }
    },
    
    // Preloads a media object, handling cache-busting and error.
    mediaPreloader: function(mediaObject, successCallback, errorCallback){
		if(mediaObject.isComplete || mediaObject.loadState === 4){ // Check if already loaded or loading.
			mediaObject.sourceUrl += "?cachebust=" + new Date().getTime(); // Add cache-buster.
			DomLib(mediaObject).onLoad(function(resData, reqStatus, xhrObj){
                if(successCallback){
                    successCallback();
                }
            }).onError(function(){
                if(errorCallback){
                    errorCallback();
                }
            });
		}else{
			if(successCallback){ // If not yet loading, but no error, proceed.
                successCallback();
            }
		}
	},
    
    // Adjusts the size of the main media display container.
    adjustLayout: function(){
		const instance = this;
		this.viewportWidth = DomLib(window).width();
        this.viewportHeight = DomLib(window).height();
        // Set width and height of the content frame, accounting for padding.
        DomLib(this.containerElement).find(".overlayPanel .contentFrame").style({"width": this.viewportWidth - this.paddingSize, "height": this.viewportHeight - this.paddingSize});
	},
    
    // Adjusts the size of the displayed media item to fit the container.
    adjustMediaSize: function(){
        const displayedMedia = DomLib(this.containerElement).find(".overlayPanel .contentFrame picture");
        DomLib(displayedMedia).height(""); // Reset height for recalculation.
        DomLib(displayedMedia).width(this.viewportWidth - this.paddingSize); // Fit to width first.
        // If height exceeds container, fit to height instead.
        if((this.viewportHeight - this.paddingSize) < DomLib(displayedMedia).height()){
            DomLib(displayedMedia).width(""); // Reset width.
            DomLib(displayedMedia).height(this.viewportHeight - this.paddingSize); // Fit to height.
        }
    },
    
    // Updates the display of the current item number / total items.
    updateStatusDisplay: function(){
        if(this.displayItemCounter){
           DomLib(this.containerElement).find(".overlayPanel .itemCounterDisplay").html((this.activeItemIndex + 1) + "/" + this.totalItems);
        }   
    },
    
    // Displays messages in a developer console if debug mode is enabled.
	notifyUser: function(alertText){
		if(this.debugMode){
			if(DomLib("#dev_alert_console").length){
				let consoleMarkup = "<div class='dev_alert_item' style='font-size: 0.7em; text-align: start; line-height: 1.8em; border-bottom: 1px solid #ccc; padding-left: 0.4em;'><div>";
				DomLib("#dev_alert_title").after(consoleMarkup);
				DomLib(".dev_alert_item").first().text("- " + alertText);
			}else{
				let consoleMarkup = "<div id='dev_alert_console' style='position: fixed; top: 1em; right: 1em; z-index: 99999; min-height: 6em; max-height: 12em; width: 18em; border: 2px solid #333; display: none; background-color: #eee; overflow-y: auto; box-shadow: 0 0 10px rgba(0,0,0,0.3);'>";
				consoleMarkup += "<h4 id='dev_alert_title' style='display: block; text-align: center; background-color: #555; color: #fff; font-size: 0.9em; line-height: 2em; margin: 0; padding: 0.2em 0;'>Developer Console</h4>";
				consoleMarkup += "<div class='dev_alert_item' style='font-size: 0.7em; text-align: start; line-height: 1.8em; border-bottom: 1px solid #ccc; padding-left: 0.4em;'><div>";
				consoleMarkup += "</div>";			
				DomLib(this.containerElement).append(consoleMarkup);
				DomLib(".dev_alert_item").text("- " + alertText);
				DomLib("#dev_alert_console").showWithFade(500);
			}
		}
	}
};