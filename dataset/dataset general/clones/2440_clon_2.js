;
(function(_jq) {
	/*
	 *  _jq.paginateElements.js - edition 0.0.1
	 *  A _jq extension for navigating through various DOM components.
	 *
	 *  Copyright (c) 2024, [Developer Name] (http://mydevsite.com)
	 *  Released under the Permissive License (PERMISSIVE-LICENSE.txt)
	 *  http://www.opensource.org/licenses/permissive-license.php
	 *  Created: 2024-01-01 | Updated: 2024-03-15
	 *
	 */

	_jq.fn.paginateElements = function(config) {
		// Establish some internal state data keys
		const currDispIdx = 'currentDisplayIndex';
		const elemsPerPage = 'elementsPerView';

		let pageDataStore;

		// Configure standard option values
		const standardSettings = {
			contentWrapperSelector: '.display-area',
			elemsPerView: 10,
			navControlsSelector: '.page-controls',
			infoDisplaySelector: '.status-message',
			maxNavLinksToShow: 20,
			initialPageIndex: 0,
			cycleNavigation: false,
			firstBtnLabel: 'Start',
			prevBtnLabel: 'Previous',
			nextBtnLabel: 'Forward',
			lastBtnLabel: 'End',
			navBtnSequence: ["firstButton", "prevButton", "pageNumbers", "nextButton", "lastButton"],
			infoTextFormat: 'Displaying {0} to {1} of {2} entries',
			displayFirstLastBtns: true,
			skipSmallLists: false,
			useJqueryUI: false,
			jqUIActiveClass: "ui-highlighted",
			jqUIDefaultClass: "ui-standard",
			jqUIDisabledClass: "ui-inactive"
		};

		const combinedConfig = _jq.extend(standardSettings, config);
		let $contentWrapper;
		let $componentRoot;
		let $allElements;
		let $navControlBars;
		let totalLinkCount;
		const defaultUIClass = combinedConfig.useJqueryUI ? combinedConfig.jqUIDefaultClass : '';
		const activeUIClass = combinedConfig.useJqueryUI ? combinedConfig.jqUIActiveClass : '';
		const disabledUIClass = combinedConfig.useJqueryUI ? combinedConfig.jqUIDisabledClass : '';

		return this.each(function() {
			$componentRoot = _jq(this);
			$contentWrapper = _jq(this).find(combinedConfig.contentWrapperSelector);
			$allElements = $componentRoot.find(combinedConfig.contentWrapperSelector).children();

			// Abort if the list is small and configured to do so
			if (combinedConfig.skipSmallLists && combinedConfig.elemsPerView >= $allElements.length) {
				return $componentRoot;
			}

			pageDataStore = $componentRoot;

			// Initialize metadata storage
			pageDataStore.data(currDispIdx, 0);
			pageDataStore.data(elemsPerPage, combinedConfig.elemsPerView);

			// Determine the overall count of items
			const totalVisibleElements = $contentWrapper.children().length;

			// Calculate the necessary number of pages
			const numPagesRequired = Math.ceil(totalVisibleElements / combinedConfig.elemsPerView);

			// Assemble the navigation bar elements
			const ellipsisMore = '<span class="ellipses-more">...</span>';
			const ellipsisLess = '<span class="ellipses-less">...</span>';
			const firstPageLink = !combinedConfig.displayFirstLastBtns ? '' : '<a class="first-nav-button ' + defaultUIClass + '" href="">' + combinedConfig.firstBtnLabel + '</a>';
			const lastPageLink = !combinedConfig.displayFirstLastBtns ? '' : '<a class="last-nav-button ' + defaultUIClass + '" href="">' + combinedConfig.lastBtnLabel + '</a>';

			let navBarMarkup = "";

			// Build navigation based on the specified order
			for (let idx = 0; idx < combinedConfig.navBtnSequence.length; idx++) {
				switch (combinedConfig.navBtnSequence[idx]) {
					case "firstButton":
						navBarMarkup += firstPageLink;
						break;
					case "lastButton":
						navBarMarkup += lastPageLink;
						break;
					case "nextButton":
						navBarMarkup += '<a class="next-nav-button ' + defaultUIClass + '" href="">' + combinedConfig.nextBtnLabel + '</a>';
						break;
					case "prevButton":
						navBarMarkup += '<a class="prev-nav-button ' + defaultUIClass + '" href="">' + combinedConfig.prevBtnLabel + '</a>';
						break;
					case "pageNumbers":
						navBarMarkup += ellipsisLess;
						let currentLinkIndex = 0;
						// Generate page index links
						while (numPagesRequired > currentLinkIndex) {
							navBarMarkup += '<a class="page-idx-link ' + defaultUIClass + '" href="" data-page-index="' + currentLinkIndex + '">' + (currentLinkIndex + 1) + '</a>';
							currentLinkIndex++;
						}
						navBarMarkup += ellipsisMore;
						break;
					default:
						// No action for unrecognized sequence items
						break;
				}
			}

			// Embed the constructed navigation into the DOM
			$navControlBars = $componentRoot.find(combinedConfig.navControlsSelector);
			$navControlBars.html(navBarMarkup).each(function() {
				// Apply specific classes to the first and last page links
				_jq(this).find('.page-idx-link:first').addClass('first-link-class');
				_jq(this).find('.page-idx-link:last').addClass('last-link-class');
			});

			// Initially conceal the ellipsis indicators
			$navControlBars.children('.ellipses-more, .ellipses-less').hide();

			// Highlight the active page link
			$navControlBars.find('.prev-nav-button').next().next().addClass('current-page-indicator ' + activeUIClass);

			/* Configure Element Display */
			// Start by hiding all paginated elements
			$allElements.hide();
			// Reveal the elements for the initial page
			$allElements.slice(0, pageDataStore.data(elemsPerPage)).show();

			/* Configure Navigation Menu Presentation */
			// Determine the total count of page number links
			totalLinkCount = $componentRoot.find(combinedConfig.navControlsSelector + ':first').children('.page-idx-link').length;
			// Ensure the number of links to display doesn't exceed the total available
			combinedConfig.maxNavLinksToShow = Math.min(combinedConfig.maxNavLinksToShow, totalLinkCount);

			$navControlBars.children('.page-idx-link').hide(); // Hide all page number links initially
			// Only display the configured number of links
			$navControlBars.each(function() {
				_jq(this).children('.page-idx-link').slice(0, combinedConfig.maxNavLinksToShow).show();
			});

			/* Attach event handlers to navigation elements */

			// Handler for the 'Start' link
			$componentRoot.find('.first-nav-button').click(function(eventObj) {
				eventObj.preventDefault();
				shiftPageNumbersRight(_jq(this), 0);
				navigateToPage(0);
			});

			// Handler for the 'End' link
			$componentRoot.find('.last-nav-button').click(function(eventObj) {
				eventObj.preventDefault();
				const finalPageNum = totalLinkCount - 1;
				shiftPageNumbersLeft(_jq(this), finalPageNum);
				navigateToPage(finalPageNum);
			});

			// Handler for the 'Previous' link
			$componentRoot.find('.prev-nav-button').click(function(eventObj) {
				eventObj.preventDefault();
				displayPreviousPage(_jq(this));
			});


			// Handler for the 'Forward' link
			$componentRoot.find('.next-nav-button').click(function(eventObj) {
				eventObj.preventDefault();
				displayNextPage(_jq(this));
			});

			// Handler for each individual 'Page' link
			$componentRoot.find('.page-idx-link').click(function(eventObj) {
				eventObj.preventDefault();
				navigateToPage(_jq(this).attr('data-page-index'));
			});

			// Go to the initial page as specified in configuration
			navigateToPage(parseInt(combinedConfig.initialPageIndex, 10));
			toggleEllipsesVisibility();
			// Apply boundary link styling if wrapping is not enabled
			if (!combinedConfig.cycleNavigation) {
				markBoundaryLinks();
			}
		});

		/**
		 * Displays the previous page of elements.
		 * @param {jQuery} triggerElem The element that triggered the action.
		 */
		function displayPreviousPage(triggerElem) {
			const targetPageIdx = parseInt(pageDataStore.data(currDispIdx), 10) - 1;

			// Check if we are at the beginning boundary
			if (_jq(triggerElem).siblings('.current-page-indicator').prev('.page-idx-link').length === 1) {
				shiftPageNumbersRight(triggerElem, targetPageIdx);
				navigateToPage(targetPageIdx);
			} else if (combinedConfig.cycleNavigation) {
				// Wrap around to the last page if enabled
				navigateToPage(totalLinkCount - 1);
			}
		}

		/**
		 * Displays the next page of elements.
		 * @param {jQuery} triggerElem The element that triggered the action.
		 */
		function displayNextPage(triggerElem) {
			const targetPageIdx = parseInt(pageDataStore.data(currDispIdx), 10) + 1;

			// Check if we are at the ending boundary
			if (_jq(triggerElem).siblings('.current-page-indicator').next('.page-idx-link').length === 1) {
				shiftPageNumbersLeft(triggerElem, targetPageIdx);
				navigateToPage(targetPageIdx);
			} else if (combinedConfig.cycleNavigation) {
				// Wrap around to the first page if enabled
				navigateToPage(0);
			}
		}

		/**
		 * Navigates to a specific page number.
		 * @param {number|string} pageNumber The index of the page to navigate to.
		 */
		function navigateToPage(pageNumber) {

			pageNumber = parseInt(pageNumber, 10);

			const itemsCountPerDisplay = parseInt(pageDataStore.data(elemsPerPage), 10);

			// Calculate the starting index for the new slice
			const startIndex = pageNumber * itemsCountPerDisplay;

			// Calculate the ending index for the new slice
			const endIndex = startIndex + itemsCountPerDisplay;

			// Hide current elements and show the new page's elements
			const visibleElements = $allElements.hide().slice(startIndex, endIndex);

			visibleElements.show();

			// Update the active page class
			$componentRoot.find(combinedConfig.navControlsSelector).children('.page-idx-link[data-page-index=' + pageNumber + ']').addClass('current-page-indicator ' + activeUIClass).siblings('.current-page-indicator').removeClass('current-page-indicator ' + activeUIClass);

			// Update the stored current page index
			pageDataStore.data(currDispIdx, pageNumber);

			/* --- Augmentation for current page / total pages info --- */
			const currentDisplayPage = parseInt(pageDataStore.data(currDispIdx), 10) + 1;
			const totalElementCount = $contentWrapper.children().length;
			const totalPageCount = Math.ceil(totalElementCount / combinedConfig.elemsPerView);
			/* -------------------------------------------------------- */

			// Update the informational text
			$componentRoot.find(combinedConfig.infoDisplaySelector).html(combinedConfig.infoTextFormat.replace("{0}", startIndex + 1).replace("{1}", startIndex + visibleElements.length).replace("{2}", $allElements.length).replace("{3}", currentDisplayPage).replace("{4}", totalPageCount));

			// Adjust visibility of ellipsis indicators
			toggleEllipsesVisibility();

			// Apply boundary classes to next/prev links
			markBoundaryLinks();

			// Invoke the callback function if it exists
			if (typeof(combinedConfig.onPageRendered) !== "undefined") {
				combinedConfig.onPageRendered.call(this, pageNumber + 1);
			}
		}

		/**
		 * Shifts the displayed page number links to the left.
		 * @param {jQuery} triggerElem The element that initiated the shift.
		 * @param {number} newPageIndex The index of the new page.
		 */
		function shiftPageNumbersLeft(triggerElem, newPageIndex) {
			const $activeLinkElement = _jq(triggerElem).siblings('.current-page-indicator');

			// Only shift if the target link is currently hidden
			if ($activeLinkElement.siblings('.page-idx-link[data-page-index=' + newPageIndex + ']').css('display') === 'none') {
				$navControlBars.each(function() {
					_jq(this).children('.page-idx-link').hide() // Hide all page links
						.slice(parseInt(newPageIndex - combinedConfig.maxNavLinksToShow + 1), newPageIndex + 1).show(); // Show a new slice
				});
			}
		}

		/**
		 * Shifts the displayed page number links to the right.
		 * @param {jQuery} triggerElem The element that initiated the shift.
		 * @param {number} newPageIndex The index of the new page.
		 */
		function shiftPageNumbersRight(triggerElem, newPageIndex) {
			const $activeLinkElement = _jq(triggerElem).siblings('.current-page-indicator');

			// Only shift if the target link is currently hidden
			if ($activeLinkElement.siblings('.page-idx-link[data-page-index=' + newPageIndex + ']').css('display') === 'none') {
				$navControlBars.each(function() {
					_jq(this).children('.page-idx-link').hide() // Hide all page links
						.slice(newPageIndex, newPageIndex + parseInt(combinedConfig.maxNavLinksToShow, 10)).show(); // Show a new slice
				});
			}
		}

		/**
		 * Shows or hides the ellipsis indicators based on visible page links.
		 */
		function toggleEllipsesVisibility() {
			// Show 'more' ellipsis if the last visible link is not the actual last link
			if (!$navControlBars.children('.page-idx-link:visible').hasClass('last-link-class')) {
				$navControlBars.children('.ellipses-more').show();
			} else {
				$navControlBars.children('.ellipses-more').hide();
			}

			// Show 'less' ellipsis if the first visible link is not the actual first link
			if (!$navControlBars.children('.page-idx-link:visible').hasClass('first-link-class')) {
				$navControlBars.children('.ellipses-less').show();
			} else {
				$navControlBars.children('.ellipses-less').hide();
			}
		}

		/**
		 * Applies a 'no-more-pages' class to navigation links when at boundaries.
		 */
		function markBoundaryLinks() {
			// If at the last page, disable next and last links
			if ($navControlBars.children('.last-link-class').hasClass('current-page-indicator')) {
				$navControlBars.children('.next-nav-button').add('.last-nav-button').addClass('no-more-pages ' + disabledUIClass);
			} else {
				$navControlBars.children('.next-nav-button').add('.last-nav-button').removeClass('no-more-pages ' + disabledUIClass);
			}

			// If at the first page, disable previous and first links
			if ($navControlBars.children('.first-link-class').hasClass('current-page-indicator')) {
				$navControlBars.children('.prev-nav-button').add('.first-nav-button').addClass('no-more-pages ' + disabledUIClass);
			} else {
				$navControlBars.children('.prev-nav-button').add('.first-nav-button').removeClass('no-more-pages ' + disabledUIClass);
			}
		}
	};
})(jQuery);