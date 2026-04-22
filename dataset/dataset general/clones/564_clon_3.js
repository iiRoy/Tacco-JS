/*
 * Core JavaScript Library - Optimized and Enhanced Utilities
 * This module provides a collection of robust jQuery-based functionalities.
 *
 * Featured components:
 *  - Carousel: Dynamic content slider with various animation options.
 *  - Tabbed Interface: Structured content display using tabs.
 *  - Paginator: Efficient content division and navigation.
 *
 * For detailed usage and examples, refer to inline documentation.
 */

// jQueryCarousel Plugin - Version 1.0.0
// Developed by A. Grablev for Enavu Web Development (enavu.com)
// Licensed under MIT and GPL. Enjoy responsibly.
/*
 * Usage: Apply to a container element like so: $(".my-carousel").jQueryCarousel();
 *
 * Configuration Options:
 *  - prevBtnClass: CSS class for the 'previous' navigation button.
 *  - nextBtnClass: CSS class for the 'next' navigation button.
 *  - disabledNavClass: Class applied to inactive navigation buttons.
 *  - slideItemSelector: Selector for individual slide content elements (e.g., 'div', 'li').
 *  - transitionEffect: Animation style ('fade', 'slideDown', 'bounce', 'random', etc.).
 *  - easingFunction: Easing method for animations (requires custom_easing.js for advanced options).
 *  - transitionSpeedMs: Duration of the animation in milliseconds.
 *  - showNavigationDots: Boolean to enable/disable dot-based navigation.
 *  - activeDotClass: CSS class for the currently active navigation dot.
 *  - dotNavContainerClass: Class for the generated navigation dot container.
 *  - autoPlayEnabled: Boolean to enable automatic slide progression.
 *  - autoPlayDelayMs: Time in milliseconds between automatic slide transitions.
 *  - pauseOnHover: If autoPlayEnabled, pauses the carousel on mouse hover.
 *  - clickToAdvance: Allows advancing slides by clicking on the current slide.
 *  - loopSlides: Enables infinite looping of slides.
 *  - useBgImages: If true, sets the current slide's image as the carousel's background during transitions.
 */
(function($) {
    $.fn.jQueryCarousel = function(customOpts) {
        // Base configuration settings for the carousel.
        const defaultOpts = {
            prevBtnClass: "prev-slide-btn",
            nextBtnClass: "next-slide-btn",
            disabledNavClass: "disabled-nav",
            slideItemSelector: "section.slide-item",
            transitionEffect: "fade",
            easingFunction: "swing",
            transitionSpeedMs: 700,
            showNavigationDots: true,
            activeDotClass: "active-dot",
            dotNavContainerClass: "slide-nav-dots",
            autoPlayEnabled: false,
            autoPlayDelayMs: 5000,
            pauseOnHover: true,
            clickToAdvance: false,
            loopSlides: false,
            useBgImages: false
        };

        // Merge user-provided options with defaults.
        const configParams = $.extend({}, defaultOpts, customOpts);

        // Iterate over each selected carousel container.
        return this.each(function() {
            const carouselContainer = $(this);

            // Early exit if the container has no children.
            if (carouselContainer.children(configParams.slideItemSelector).length === 0) {
                console.warn("jQueryCarousel: No slide items found in container.", carouselContainer);
                return;
            }

            const slideElements = carouselContainer.children(configParams.slideItemSelector);
            const totalSlidesCount = slideElements.length;
            const prevControl = $(`.${configParams.prevBtnClass}`);
            const nextControl = $(`.${configParams.nextBtnClass}`);

            let slideCollection = []; // Array to store jQuery objects of slides
            let currentSlideIndex = 0; // Using 0-based indexing internally

            // Populate slideCollection array (adjusting from 1-based to 0-based).
            for (let k = 0; k < totalSlidesCount; k++) {
                slideCollection[k] = slideElements.eq(k);
            }

            let autoPlayTimer; // Timer for automatic slide progression.

            // Initialize the first slide display.
            displaySlide(0, "", 0);

            // Set up automatic slide progression if enabled.
            if (configParams.autoPlayEnabled) {
                const startAutoPlay = () => {
                    autoPlayTimer = setInterval(() => {
                        let nextIdx = currentSlideIndex + 1;
                        if (nextIdx >= totalSlidesCount) {
                            if (configParams.loopSlides) {
                                nextIdx = 0; // Loop back to the first slide
                            } else {
                                clearInterval(autoPlayTimer); // Stop auto-play at the end
                                return;
                            }
                        }
                        displaySlide(nextIdx, "next", currentSlideIndex);
                    }, configParams.autoPlayDelayMs);
                };
                startAutoPlay(); // Begin auto-play immediately.
            }

            // Implement pause on hover functionality.
            if (configParams.autoPlayEnabled && configParams.pauseOnHover) {
                carouselContainer.children().hover(
                    () => clearInterval(autoPlayTimer), // Pause on hover in
                    () => configParams.autoPlayEnabled && startAutoPlay() // Resume on hover out
                );
            }

            // Enable slide advance on click if configured.
            if (configParams.clickToAdvance) {
                slideElements.on("click", function(evt) {
                    evt.preventDefault();
                    let nextIdx = currentSlideIndex + 1;
                    if (nextIdx >= totalSlidesCount) {
                        if (configParams.loopSlides) {
                            nextIdx = 0;
                        } else {
                            return; // Do nothing if not looping and at last slide
                        }
                    }
                    displaySlide(nextIdx, "next", currentSlideIndex);
                });
            }

            // Function to update and display the current slide.
            function displaySlide(targetPageIdx, moveDirection, previousPageIdx) {
                let actualTargetIdx = targetPageIdx;

                if (moveDirection === "next") {
                    actualTargetIdx = currentSlideIndex + 1;
                } else if (moveDirection === "prev") {
                    actualTargetIdx = currentSlideIndex - 1;
                }

                // Ensure index is within bounds for non-looping carousels.
                if (!configParams.loopSlides) {
                    actualTargetIdx = Math.max(0, Math.min(totalSlidesCount - 1, actualTargetIdx));
                }

                if (actualTargetIdx === currentSlideIndex && moveDirection !== "") {
                    // If no actual change in slide for non-empty direction, just return.
                    return;
                }

                currentSlideIndex = actualTargetIdx; // Update global current index.

                slideElements.hide(); // Hide all slides initially.
                applyTransitionEffect(currentSlideIndex, previousPageIdx); // Show the new slide.

                if (configParams.showNavigationDots) {
                    renderDotNavigation(currentSlideIndex);
                }

                // Manage navigation button states (active/inactive).
                if (!configParams.loopSlides) {
                    if (currentSlideIndex === 0) {
                        prevControl.addClass(configParams.disabledNavClass).css({ "cursor": "default" });
                    } else {
                        prevControl.removeClass(configParams.disabledNavClass).css({ "cursor": "pointer" });
                    }

                    if (currentSlideIndex === totalSlidesCount - 1) {
                        nextControl.addClass(configParams.disabledNavClass).css({ "cursor": "default" });
                    } else {
                        nextControl.removeClass(configParams.disabledNavClass).css({ "cursor": "pointer" });
                    }
                }
            }

            // Generates the dot navigation for slides.
            function renderDotNavigation(activeDotIdx) {
                carouselContainer.find(`.${configParams.dotNavContainerClass}`).remove(); // Clear existing dots.
                const navList = $(`<ul class="${configParams.dotNavContainerClass}"></ul>`);

                for (let k = 0; k < totalSlidesCount; k++) {
                    const dotItem = $(`<li><a href="#" class="nav-dot" data-slide-idx="${k}" title="Go to slide ${k + 1}">${k + 1}</a></li>`);
                    if (k === activeDotIdx) {
                        dotItem.find("a").addClass(configParams.activeDotClass);
                    }
                    navList.append(dotItem);
                }
                carouselContainer.append(navList);
            }

            // Applies the chosen animation effect for slide display.
            function applyTransitionEffect(slideToShowIdx, previousSlideIdx) {
                if (configParams.useBgImages && totalSlidesCount > 1) {
                    const currentImgSrc = slideCollection[previousSlideIdx].find("img").attr("src");
                    if (currentImgSrc) {
                        carouselContainer.css({ "background": `url(${currentImgSrc}) center center / cover no-repeat` });
                    }
                }

                let chosenAnimation = configParams.transitionEffect;
                if (chosenAnimation === "random") {
                    const animationOptions = ["fade", "slideDown", "slideUp", "slideRight", "slideLeft", "bounce", "explode", "fold", "scale"];
                    chosenAnimation = animationOptions[Math.floor(Math.random() * animationOptions.length)];
                }

                // Ensure all slides are hidden before showing the target one.
                slideElements.hide();

                // Execute the animation based on the chosen effect.
                switch (chosenAnimation) {
                    case "fade":
                        slideCollection[slideToShowIdx].stop(true, true).fadeIn(configParams.transitionSpeedMs);
                        break;
                    case "slideDown":
                        slideCollection[slideToShowIdx].stop(true, true).show('slide', { direction: 'up', easing: configParams.easingFunction }, configParams.transitionSpeedMs);
                        break;
                    case "slideUp":
                        slideCollection[slideToShowIdx].stop(true, true).show('slide', { direction: 'down', easing: configParams.easingFunction }, configParams.transitionSpeedMs);
                        break;
                    case "slideRight":
                        slideCollection[slideToShowIdx].stop(true, true).show('slide', { direction: 'left', easing: configParams.easingFunction }, configParams.transitionSpeedMs);
                        break;
                    case "slideLeft":
                        slideCollection[slideToShowIdx].stop(true, true).show('slide', { direction: 'right', easing: configParams.easingFunction }, configParams.transitionSpeedMs);
                        break;
                    case "bounce":
                        slideCollection[slideToShowIdx].stop(true, true).show('bounce', { direction: "up", easing: configParams.easingFunction }, configParams.transitionSpeedMs);
                        break;
                    case "explode":
                        slideCollection[slideToShowIdx].stop(true, true).show('explode', { direction: "down", easing: configParams.easingFunction }, configParams.transitionSpeedMs);
                        break;
                    case "fold":
                        slideCollection[slideToShowIdx].stop(true, true).show('fold', { direction: "down", easing: configParams.easingFunction }, configParams.transitionSpeedMs);
                        break;
                    case "scale":
                        slideCollection[slideToShowIdx].stop(true, true).show('scale', { direction: "down", easing: configParams.easingFunction }, configParams.transitionSpeedMs);
                        break;
                    default:
                        slideCollection[slideToShowIdx].show(); // Fallback to immediate show.
                        break;
                }
            }

            // Event listener for next slide button.
            $(document).on("click", `.${configParams.nextBtnClass}`, function(evt) {
                evt.preventDefault();
                let nextIdx = currentSlideIndex + 1;
                if (nextIdx >= totalSlidesCount) {
                    if (configParams.loopSlides) {
                        nextIdx = 0;
                    } else {
                        return; // Stop if at end and not looping.
                    }
                }
                displaySlide(nextIdx, "next", currentSlideIndex);
            });

            // Event listener for previous slide button.
            $(document).on("click", `.${configParams.prevBtnClass}`, function(evt) {
                evt.preventDefault();
                let prevIdx = currentSlideIndex - 1;
                if (prevIdx < 0) {
                    if (configParams.loopSlides) {
                        prevIdx = totalSlidesCount - 1;
                    } else {
                        return; // Stop if at beginning and not looping.
                    }
                }
                displaySlide(prevIdx, "prev", currentSlideIndex);
            });

            // Event listener for navigation dots.
            $(document).on("click", `.${configParams.dotNavContainerClass} .nav-dot`, function(evt) {
                evt.preventDefault();
                const newTargetIdx = parseInt($(this).attr("data-slide-idx"), 10);
                if (!isNaN(newTargetIdx) && newTargetIdx !== currentSlideIndex) {
                    displaySlide(newTargetIdx, "", currentSlideIndex);
                }
            });
        });
    };
})(jQuery);

// jQueryTabPanel Plugin - Version 1.0.0
// Developed by A. Grablev for Enavu Web Development (enavu.com)
// Dual license under MIT and GPL.
/*
 * Usage: Initialize on a tab list, providing the selector for content panels.
 * Example: $("ul.my-tabs").jQueryTabPanel({contentPaneSelector: ".tab-content-wrapper"});
 *
 * Configuration Options:
 *  - contentPaneSelector: Selector for the container holding all tab content divs.
 *  - enforceEqualHeight: If true, sets all content panes to the height of the tallest one.
 *  - persistSelection: If true, uses browser cookies to remember the last active tab.
 *  - useTransitions: If true, animates tab switching.
 *  - transitionStyle: Animation effect ('fade' or 'slide').
 *  - transitionDuration: Speed of the animation in milliseconds.
 */
(function($) {
    $.fn.jQueryTabPanel = function(customSettings) {
        const defaultTabConfig = {
            contentPaneSelector: "div.tab-content",
            enforceEqualHeight: false,
            persistSelection: false,
            useTransitions: false,
            transitionStyle: "fade",
            transitionDuration: 400
        };
        const tabConfig = $.extend({}, defaultTabConfig, customSettings);

        return this.each(function() {
            const tabListElement = $(this);
            const allTabContentPanes = $(tabConfig.contentPaneSelector);

            if (tabListElement.length === 0 || allTabContentPanes.length === 0) {
                console.warn("jQueryTabPanel: Tab list or content panes not found.");
                return;
            }

            const totalTabCount = tabListElement.children("li").length;
            let tabHeaders = []; // Stores jQuery objects for tab header list items.
            let tabContentUnits = []; // Stores jQuery objects for individual tab content divs.

            if (totalTabCount === 0) {
                console.warn("jQueryTabPanel: No tab items (li) found in the tab list.");
                return;
            }

            // Populate tabHeaders and tabContentUnits arrays (0-based indexing).
            for (let k = 0; k < totalTabCount; k++) {
                tabHeaders[k] = tabListElement.find(`li:nth-child(${k + 1})`).attr("data-tab-index", k);
                tabContentUnits[k] = allTabContentPanes.find(`div:nth-child(${k + 1})`);
            }

            // Apply equal height to content panes if enabled.
            if (tabConfig.enforceEqualHeight) {
                let currentMaxHeight = 0;
                allTabContentPanes.children("div").each(function() {
                    const currentPaneHeight = $(this).outerHeight();
                    if (currentPaneHeight > currentMaxHeight) {
                        currentMaxHeight = currentPaneHeight;
                    }
                });
                allTabContentPanes.height(currentMaxHeight);
            }

            // Determine initial tab to show.
            let initialTabIndex = 0;
            if (tabConfig.persistSelection) {
                const storedTabIndex = retrieveTabState("activeTab");
                if (storedTabIndex !== null && storedTabIndex >= 0 && storedTabIndex < totalTabCount) {
                    initialTabIndex = storedTabIndex;
                }
            }
            activateTabAtIndex(initialTabIndex);

            // Function to display a specific tab and its content.
            function activateTabAtIndex(indexToActivate) {
                tabHeaders[indexToActivate].addClass("active").siblings().removeClass("active");

                if (!tabConfig.useTransitions) {
                    tabContentUnits[indexToActivate].show().siblings().hide();
                } else {
                    switch (tabConfig.transitionStyle) {
                        case "fade":
                            tabContentUnits[indexToActivate].fadeIn(tabConfig.transitionDuration).siblings().hide();
                            break;
                        case "slide":
                            tabContentUnits[indexToActivate].slideDown(tabConfig.transitionDuration).siblings().hide();
                            break;
                        default:
                            tabContentUnits[indexToActivate].show().siblings().hide(); // Fallback
                            break;
                    }
                }
            }

            // Event handler for tab clicks.
            tabListElement.on("click", "li", function(evt) {
                evt.preventDefault();
                const clickedTabIndex = parseInt($(this).attr("data-tab-index"), 10);
                if (!isNaN(clickedTabIndex)) {
                    activateTabAtIndex(clickedTabIndex);
                    if (tabConfig.persistSelection) {
                        saveTabState("activeTab", clickedTabIndex, 999); // Store for 999 days.
                    }
                }
            });

            /* Cookie management helper functions */
            function saveTabState(cookieName, value, expiresInDays) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + expiresInDays);
                document.cookie = `${cookieName}=${encodeURIComponent(value)}; expires=${expiryDate.toUTCString()}; path=/`;
            }

            function retrieveTabState(cookieName) {
                const namePrefix = `${cookieName}=`;
                const cookieArray = document.cookie.split(';');
                for (let i = 0; i < cookieArray.length; i++) {
                    let cookie = cookieArray[i].trim();
                    if (cookie.indexOf(namePrefix) === 0) {
                        return parseInt(decodeURIComponent(cookie.substring(namePrefix.length)), 10);
                    }
                }
                return null;
            }
        });
    };
})(jQuery);

// jQueryPaginator Plugin - Version 1.0.0
// Developed by A. Grablev for Enavu Web Development (enavu.com)
// Dual license under MIT and GPL.
/*
 * Usage: Call on a container element that holds items to be paginated.
 * Example: $("#my-items").jQueryPaginator();
 *
 * Configuration Options:
 *  - itemsPerPage: Number of content items to display per page.
 *  - nextText: Text for the 'Next' navigation button.
 *  - prevText: Text for the 'Previous' navigation button.
 *  - activePageClass: CSS class for the currently active pagination link.
 *  - navContainerClass: Class applied to the generated pagination navigation container.
 *  - condensePageLinks: If true, limits the number of visible page links.
 *  - visiblePageLinks: When condensePageLinks is true, specifies how many links to show.
 *  - rememberPage: If true, uses cookies to recall the last visited page.
 *  - navPlacement: Position of the pagination navigation ('before', 'after', 'both').
 *  - equalizeContentHeight: If true, sets the main content wrapper's height to the tallest page.
 *  - heightAdjustmentOffset: An additional pixel offset for height calculation when equalizeContentHeight is true.
 */
(function($) {
    $.fn.jQueryPaginator = function(customPaginatorSettings) {
        const defaultPaginatorSettings = {
            itemsPerPage: 4,
            nextText: "Next &raquo;",
            prevText: "&laquo; Previous",
            activePageClass: "current-page",
            navContainerClass: "page-navigation",
            condensePageLinks: false,
            visiblePageLinks: 6,
            rememberPage: true,
            navPlacement: "after",
            equalizeContentHeight: false,
            heightAdjustmentOffset: 50
        };
        const paginationSettings = $.extend({}, defaultPaginatorSettings, customPaginatorSettings);

        return this.each(function() {
            const contentWrapper = $(this);

            // Retrieve configuration values.
            const itemsPerDisplayPage = paginationSettings.itemsPerPage;
            const totalContentItems = contentWrapper.children().length;

            // Handle cases with no items or only one page.
            if (totalContentItems === 0) {
                console.warn("jQueryPaginator: No content items found for pagination.");
                return;
            }
            const pageCount = Math.ceil(totalContentItems / itemsPerDisplayPage);
            if (pageCount <= 1) {
                // No need for pagination if there's only one page or no items.
                contentWrapper.children().show();
                return;
            }

            let pageContentGroups = []; // Array to hold jQuery objects for each page's content.
            let startIndex = 0;
            let endIndex = itemsPerDisplayPage;

            let currentMaxHeight = 0; // For equal height calculation.

            // Divide content items into pages and store them.
            for (let pageNum = 0; pageNum < pageCount; pageNum++) {
                const currentPageItems = contentWrapper.children().slice(startIndex, endIndex);
                pageContentGroups[pageNum] = currentPageItems;

                if (paginationSettings.equalizeContentHeight) {
                    let pageHeight = 0;
                    currentPageItems.each(function() {
                        pageHeight += $(this).outerHeight(true); // Include margins.
                    });
                    if (pageHeight > currentMaxHeight) {
                        currentMaxHeight = pageHeight;
                    }
                }

                startIndex += itemsPerDisplayPage;
                endIndex += itemsPerDisplayPage;
            }

            // Apply equal height to the content wrapper if enabled.
            if (paginationSettings.equalizeContentHeight) {
                contentWrapper.css({ "min-height": currentMaxHeight + paginationSettings.heightAdjustmentOffset + "px" });
            }

            let currentPage = 0; // 0-based index for the current page.

            // Initialize the paginator: display first page or remembered page.
            if (paginationSettings.rememberPage) {
                const storedPage = fetchPageState("paginationCurrentPage");
                if (storedPage !== null && storedPage >= 0 && storedPage < pageCount) {
                    currentPage = storedPage;
                }
            }
            displayContentPage(currentPage);
            generatePageNavigation(currentPage);

            // Shows the content for the specified page index.
            function displayContentPage(pageIndex) {
                contentWrapper.children().hide(); // Hide all items.
                pageContentGroups[pageIndex].show(); // Show items for the target page.
                if (paginationSettings.rememberPage) {
                    storePageState("paginationCurrentPage", pageIndex);
                }
            }

            // Constructs and appends the pagination navigation links.
            function generatePageNavigation(activePageIndex) {
                contentWrapper.siblings(`.${paginationSettings.navContainerClass}`).remove(); // Remove existing navs.

                let navHtmlParts = [];
                navHtmlParts.push(`<ul class="${paginationSettings.navContainerClass} clearfix">`);

                // Previous button.
                if (activePageIndex > 0) {
                    navHtmlParts.push(`<li><a class="nav-prev" href="#">${paginationSettings.prevText}</a></li>`);
                } else {
                    navHtmlParts.push(`<li><span class="nav-prev ${paginationSettings.activePageClass}">${paginationSettings.prevText}</span></li>`);
                }

                // Page number links.
                const pageRange = calculateVisiblePageRange(activePageIndex, pageCount, paginationSettings.visiblePageLinks);

                for (let i = 0; i < pageCount; i++) {
                    if (paginationSettings.condensePageLinks) {
                        // Logic for minimized pagination (showing start, end, and around current).
                        if (i < 2 || i >= pageCount - 2 || (i >= pageRange.start && i <= pageRange.end)) {
                            if (i === activePageIndex) {
                                navHtmlParts.push(`<li><span class="${paginationSettings.activePageClass}">${i + 1}</span></li>`);
                            } else {
                                navHtmlParts.push(`<li><a href="#" class="nav-page-link" data-page-idx="${i}">${i + 1}</a></li>`);
                            }
                        } else if (i === 2 && pageRange.start > 2) {
                            navHtmlParts.push(`<li><span>...</span></li>`);
                        } else if (i === pageCount - 3 && pageRange.end < pageCount - 3) {
                            navHtmlParts.push(`<li><span>...</span></li>`);
                        }
                    } else {
                        // Full pagination without minimization.
                        if (i === activePageIndex) {
                            navHtmlParts.push(`<li><span class="${paginationSettings.activePageClass}">${i + 1}</span></li>`);
                        } else {
                            navHtmlParts.push(`<li><a href="#" class="nav-page-link" data-page-idx="${i}">${i + 1}</a></li>`);
                        }
                    }
                }

                // Next button.
                if (activePageIndex < pageCount - 1) {
                    navHtmlParts.push(`<li><a class="nav-next" href="#">${paginationSettings.nextText}</a></li>`);
                } else {
                    navHtmlParts.push(`<li><span class="nav-next ${paginationSettings.activePageClass}">${paginationSettings.nextText}</span></li>`);
                }

                navHtmlParts.push(`</ul>`);
                const fullNavigationHtml = navHtmlParts.join('');

                // Insert navigation based on placement option.
                if (paginationSettings.navPlacement === "before" || paginationSettings.navPlacement === "both") {
                    contentWrapper.before(fullNavigationHtml);
                }
                if (paginationSettings.navPlacement === "after" || paginationSettings.navPlacement === "both") {
                    contentWrapper.after(fullNavigationHtml);
                }
            }

            // Determines the range of page links to display when minimized.
            function calculateVisiblePageRange(currentPageIdx, totalPages, visibleLinksCount) {
                const halfVisible = Math.floor(visibleLinksCount / 2);
                let startRange = Math.max(0, currentPageIdx - halfVisible);
                let endRange = Math.min(totalPages - 1, currentPageIdx + halfVisible);

                // Adjust range if it extends beyond boundaries.
                if (endRange - startRange + 1 < visibleLinksCount) {
                    if (startRange === 0) {
                        endRange = Math.min(totalPages - 1, visibleLinksCount - 1);
                    } else if (endRange === totalPages - 1) {
                        startRange = Math.max(0, totalPages - visibleLinksCount);
                    }
                }
                return { start: startRange, end: endRange };
            }

            // Event delegation for navigation clicks.
            $(document).on("click", `.${paginationSettings.navContainerClass} .nav-page-link`, function(evt) {
                evt.preventDefault();
                const newPageIndex = parseInt($(this).attr("data-page-idx"), 10);
                if (!isNaN(newPageIndex) && newPageIndex !== currentPage) {
                    currentPage = newPageIndex;
                    displayContentPage(currentPage);
                    generatePageNavigation(currentPage);
                }
            });

            $(document).on("click", `.${paginationSettings.navContainerClass} .nav-prev`, function(evt) {
                evt.preventDefault();
                if (currentPage > 0) {
                    currentPage--;
                    displayContentPage(currentPage);
                    generatePageNavigation(currentPage);
                }
            });

            $(document).on("click", `.${paginationSettings.navContainerClass} .nav-next`, function(evt) {
                evt.preventDefault();
                if (currentPage < pageCount - 1) {
                    currentPage++;
                    displayContentPage(currentPage);
                    generatePageNavigation(currentPage);
                }
            });

            /* Cookie management helper functions for pagination */
            function storePageState(cookieKey, value) {
                const expiry = new Date();
                expiry.setTime(expiry.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days expiry.
                document.cookie = `${cookieKey}=${encodeURIComponent(value)}; expires=${expiry.toUTCString()}; path=/`;
            }

            function fetchPageState(cookieKey) {
                const keyPrefix = `${cookieKey}=`;
                const allCookies = document.cookie.split(';');
                for (let i = 0; i < allCookies.length; i++) {
                    let cookieVal = allCookies[i].trim();
                    if (cookieVal.indexOf(keyPrefix) === 0) {
                        return parseInt(decodeURIComponent(cookieVal.substring(keyPrefix.length)), 10);
                    }
                }
                return null;
            }
        });
    };
})(jQuery);