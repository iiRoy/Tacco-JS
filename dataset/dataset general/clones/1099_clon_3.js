/*
 * Frontend Enhancements Module
 * Developed and maintained by the Web Innovations Team
 * Licensed under the Apache 2.0 License.
 *
 * This script provides various client-side functionalities
 * to improve user experience on responsive layouts.
 */

// Module for viewport management on mobile devices
// Aims to normalize viewport behavior, especially hiding the browser's address bar.
(function( globalScope ) {
  "use strict"; // Enforce stricter parsing and error handling

  const documentRef = globalScope.document;

  // Proceed only if the URL lacks a hash fragment and event listeners are supported.
  // This prevents interference with deep links and ensures modern browser support.
  if ( !globalScope.location.hash && globalScope.addEventListener ) {

    // Initial scroll attempt to hide the address bar on page load.
    // Scrolls by a minimal amount to trigger the browser's hide mechanism.
    globalScope.scrollTo( 0, 1 );
    let currentScrollPos = 1;

    // Helper function to robustly determine the current vertical scroll position.
    const obtainScrollPosition = () => {
      // Handles cross-browser differences for scroll position retrieval.
      return globalScope.pageYOffset || documentRef.documentElement.scrollTop || documentRef.body.scrollTop || 0;
    };

    // Periodically check if the document body is ready.
    // This addresses scenarios where the body might not be fully rendered immediately.
    const bodyReadinessChecker = setInterval( () => {
      if ( documentRef.body ) {
        clearInterval( bodyReadinessChecker ); // Stop checking once body is ready.
        currentScrollPos = obtainScrollPosition();
        // Adjust scroll to either 0 or 1 based on the initial state,
        // ensuring the address bar remains hidden or is hidden if not already.
        globalScope.scrollTo( 0, currentScrollPos === 1 ? 0 : 1 );
      }
    }, 25 ); // Check every 25 milliseconds for body readiness.

    // Attach an event listener for the 'load' event to perform final adjustments.
    globalScope.addEventListener( "load", () => {
      // Defer the execution slightly to allow other load-time operations to complete.
      setTimeout( () => {
        // If the user hasn't scrolled significantly after load (e.g., less than 25 pixels),
        // re-attempt to hide the address bar.
        if ( obtainScrollPosition() < 25 ) {
          globalScope.scrollTo( 0, currentScrollPos === 1 ? 0 : 1 );
        }
      }, 50 ); // Small delay to ensure all elements are painted.
    });
  }
})( this ); // Execute immediately, passing 'this' (window in browser context)

// Enhanced Navigation Toggle for Smaller Screens
// Utilizes jQuery for DOM manipulation to create a responsive dropdown menu.
jQuery(document).ready(function($) { // Use jQuery in no-conflict mode
  const mainNavigation = $('nav.main-nav'); // Target a specific navigation class
  if (!mainNavigation.length) { // Guard clause: Exit if no navigation found
    console.warn("No main navigation element found with class 'main-nav'. Skipping responsive menu generation.");
    return;
  }

  // Define the default option text for the dropdown
  const defaultOptionText = "Select an Option...";
  const defaultOptionValue = "";

  // Create a new `<select>` element for the mobile menu.
  const mobileMenuDropdown = $('<select />', {
    'class': 'responsive-nav-selector', // Add a class for styling
    'aria-label': 'Mobile navigation menu' // Add ARIA label for accessibility
  });

  // Append the default, unselectable option to the dropdown.
  $('<option />', {
    'value': defaultOptionValue,
    'text': defaultOptionText,
    'selected': true,
    'disabled': true // Make the default option unselectable
  }).appendTo(mobileMenuDropdown);

  // Iterate over each primary navigation link and add it to the dropdown.
  mainNavigation.find('a[href]').each(function() {
    const currentLink = $(this); // Cache the current jQuery object
    const linkHref = currentLink.prop('href'); // Use .prop() for attribute retrieval
    const linkText = currentLink.text();

    // Only add valid links to the dropdown
    if (linkHref && linkText.trim().length > 0) {
      $('<option />', {
        'value': linkHref,
        'text': linkText
      }).appendTo(mobileMenuDropdown);
    }
  });

  // Prepend the generated dropdown to the navigation container.
  mobileMenuDropdown.prependTo(mainNavigation);

  // Attach a change event listener to the dropdown.
  mobileMenuDropdown.on('change', function() {
    const selectedUrl = $(this).val();
    if (selectedUrl && selectedUrl !== defaultOptionValue) {
      window.location.href = selectedUrl; // Navigate to the selected URL
    }
  });
});

// Smooth Scrolling for Anchor Links
// Provides a fluid animation when clicking on internal page anchors.
jQuery(function($){ // jQuery document ready shorthand
  const scrollAnimationDuration = 800; // Animation speed in milliseconds

  $('a[href^="#"]').on('click', function(event) { // Target links starting with '#'
    event.preventDefault(); // Prevent default jump behavior

    const targetHash = this.hash; // Get the hash fragment from the clicked link

    // Ensure the link is an internal anchor and not just a '#'
    if (!targetHash || targetHash === '#') {
      return;
    }

    // Check if the current path matches the link's path, and hostnames match.
    // This confirms it's an internal page anchor rather than an external link.
    const isSamePageLink = (
      window.location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
      window.location.hostname === this.hostname
    );

    if (isSamePageLink) {
      let scrollTarget = $(targetHash); // Find the element by ID
      if (!scrollTarget.length) {
        // Fallback: Try finding by name attribute if ID doesn't exist
        scrollTarget = $('[name="' + targetHash.slice(1) + '"]');
      }

      if (scrollTarget.length) {
        // Calculate the offset, adjusting for any fixed header (e.g., 50px offset)
        const destinationOffset = scrollTarget.offset().top - 50; // Added a 50px offset
        
        $('html, body').stop().animate({ // Use .stop() to prevent animation queuing
          scrollTop: destinationOffset
        }, scrollAnimationDuration, 'swing'); // 'swing' easing is default, but explicit here
      } else {
        console.warn(`Scroll target "${targetHash}" not found on the page.`);
      }
    } else {
      // For links that point to a different page but have a hash,
      // allow default behavior (or handle differently if needed).
      // For this clone, we'll let it proceed.
      window.location.href = this.href;
    }
  });
});

// Dynamic Sticky Header Behavior
// Makes a header element sticky on scroll, but only on larger screens.
jQuery(document).ready(function($) { // Use jQuery in no-conflict mode
  const stickyHeaderElement = $('.site-header-fixed'); // Target the header element to make sticky
  if (!stickyHeaderElement.length) { // Guard clause
    console.info("No sticky header element found with class 'site-header-fixed'. Skipping sticky header logic.");
    return;
  }

  const headerOriginalOffset = stickyHeaderElement.offset().top; // Store initial top position
  const stickyClass = 'is-sticky-header'; // CSS class to apply when sticky
  const mobileBreakpoint = 768; // Define the breakpoint for mobile devices (e.g., tablets)

  // Use a media query listener for more robust breakpoint detection
  const mediaQuery = window.matchMedia(`(min-width: ${mobileBreakpoint}px)`);

  // Function to apply/remove sticky behavior
  const manageStickyHeader = () => {
    const currentScrollPosition = $(window).scrollTop();
    const isDesktop = mediaQuery.matches; // Check if current viewport is desktop-sized

    if (currentScrollPosition > headerOriginalOffset && isDesktop) {
      if (!stickyHeaderElement.hasClass(stickyClass)) { // Prevent redundant class additions
        stickyHeaderElement.addClass(stickyClass);
        // Optionally, add a placeholder to prevent content jump
        // $('<div class="sticky-header-placeholder" style="height:' + stickyHeaderElement.outerHeight() + 'px;"></div>').insertBefore(stickyHeaderElement);
      }
    } else {
      if (stickyHeaderElement.hasClass(stickyClass)) { // Prevent redundant class removals
        stickyHeaderElement.removeClass(stickyClass);
        // $('.sticky-header-placeholder').remove(); // Remove placeholder
      }
    }
  };

  // Attach scroll event listener
  $(window).on('scroll', manageStickyHeader);

  // Also run on page load to check initial scroll position
  manageStickyHeader();

  // Re-evaluate sticky state on window resize or orientation change if media query changes
  mediaQuery.addListener(manageStickyHeader);
});