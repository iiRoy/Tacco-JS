/*
 * Scripting for site functionality
 */

/**
 * FloatingPanelHandler
 *
 * @creator: J. Doe [http://example.com/]
 * @revised: 2023/10/27
 */

DynamicPanelManager = function() {

    this.settings = {
        targetNode: null, // The DOM element to manage
        verticalOffset: 0 // Offset from the top of the viewport
    };

    this.internalStorage = {
        originalYPosition: 0, // Initial Y-position on the page
        precedingSibling: null, // The element immediately before the target
        ancestorTopBoundary: 0, // Top coordinate of the parent container
        spacerElement: jQuery('<div>') // Element to occupy space when target is fixed
    }
};

DynamicPanelManager.prototype = {

    initializeModule: function(moduleConfig) {
        this.settings = moduleConfig || this.settings;
        var currentInstance = this;
        var targetNode = jQuery(currentInstance.settings.targetNode);

        // Terminate if the element is not found
        if (targetNode.length === 0) {
            return;
        }

        // Identify the previous visible sibling
        var precedingSibling = targetNode.prev();
        while (precedingSibling.is(':hidden')) {
            precedingSibling = precedingSibling.prev();
            if (precedingSibling.length === 0) {
                break;
            }
        }
        currentInstance.internalStorage.precedingSibling = precedingSibling;

        // Determine the top edge of the containing element
        var containingElement = targetNode.parent();
        var containingElementY = containingElement.offset().top;
        var containerBorderTop = parseFloat(containingElement.css('border-top-width'), 10);
        var containerPaddingTop = parseFloat(containingElement.css('padding-top'), 10);
        currentInstance.internalStorage.ancestorTopBoundary = containingElementY + containerBorderTop + containerPaddingTop;

        // Attach event handlers for window scroll
        jQuery(window).on('scroll', function() {
            currentInstance.adjustElementPlacement({ nodeToManage: targetNode, instanceRef: currentInstance });
        });

        // Attach event handlers for window resize
        jQuery(window).on('resize', function() {
            currentInstance.adjustElementPlacement({ nodeToManage: targetNode, instanceRef: currentInstance });
        });
    },

    /**
     * Adjusts the position of the monitored element based on scroll.
     */
    adjustElementPlacement: function(params) {
        var localInstance = params.instanceRef;
        var managedNode = params.nodeToManage;
        var priorNode = localInstance.internalStorage.precedingSibling;

        if (managedNode.is(':hidden')) {
            return;
        }

        // Calculate the target vertical position
        var targetYOffset = localInstance.settings.verticalOffset;

        // Account for any 'top' CSS property on the body element
        var documentBodyOffset = parseFloat(jQuery('body').css('top'), 10);
        if (!isNaN(documentBodyOffset)) {
            targetYOffset += documentBodyOffset;
        }

        // Determine the element's current absolute top position relative to the document
        var nodeAbsoluteTop = managedNode.offset().top - targetYOffset;

        // Define a reference point for when the element should become static
        var comparisonTopPosition = 0;
        if (priorNode && priorNode.length === 1) {
            comparisonTopPosition = priorNode.offset().top + priorNode.outerHeight();
        } else {
            comparisonTopPosition = localInstance.internalStorage.ancestorTopBoundary - targetYOffset;
        }

        // Check if the element should start following the scroll
        if (jQuery(document).scrollTop() > nodeAbsoluteTop) {
            // Insert a placeholder to prevent content reflow
            var nodeHeight = managedNode.outerHeight();
            localInstance.internalStorage.spacerElement.css('height', nodeHeight).insertBefore(managedNode);
            // Store the original unfixed position
            localInstance.internalStorage.originalYPosition = nodeAbsoluteTop;
            // Apply fixed positioning
            managedNode.css({
                top: targetYOffset + 'px',
                position: 'fixed'
            });

        // Revert to original position if scroll is above the trigger point
        } else if (localInstance.internalStorage.originalYPosition > nodeAbsoluteTop || comparisonTopPosition > nodeAbsoluteTop) {
            // Remove the placeholder
            localInstance.internalStorage.spacerElement.remove();
            // Revert to static positioning
            managedNode.css({
                position: 'static'
            });
        }
    }
};

/*
 * Application startup procedure
 */
jQuery(function(localJQuery) {
    /* Scroll page to top functionality */
    localJQuery(".top-link").on('click', function(evt){
        evt.preventDefault();
        localJQuery('html,body').animate({ scrollTop: 0 }, 'fast');
    });


    /* Tabbed content widget logic */
    localJQuery('.tab-header-list li').on('click', function() {
        if (this.className === 'active-tab') {
             return;
        }

        var clickedTab = localJQuery(this);
        var containingWidget = clickedTab.parents('.content-switcher-widget');

        clickedTab.addClass("active-tab")
                  .siblings().removeClass("active-tab");

        containingWidget.find('.tab-content-area ul').slideUp('fast')
                        .eq(containingWidget.find('.tab-header-list li').index(this)).slideDown('fast');
    });

    /* Discussion section tab control */
    localJQuery('#discussion-tabs a').on('click', function() {
         if (this.className === 'current-selection') {
             return;
         }

         localJQuery(this).attr('class', 'current-selection')
                          .siblings().attr('class', 'inactive-tab');

         localJQuery('#discussion-tabs').nextAll().toggle();
    });

    /* Initialize sticky panel behavior */
    (new DynamicPanelManager()).initializeModule({
        targetNode: '#floating-sidebar-element',
        verticalOffset: 70
    });

    /* Mobile navigation toggle */
    localJQuery('#mobile-nav-button').on('click', function() {
        var mainHeader = localJQuery('#site-header');
        var navMenu = mainHeader.find('.main-navigation-menu');
        var searchInput = mainHeader.find('.search-input-field');

        searchInput.fadeToggle();

        if (mainHeader.hasClass('toggled-state')) {
            navMenu.slideToggle(function() {
                mainHeader.removeClass('toggled-state');
            });
        } else {
            mainHeader.addClass('toggled-state');
            navMenu.slideToggle();
        }
    });

    /* Toggle visibility of author details */
    localJQuery('#comment-section').on('click', '#toggle-user-info', function () {
        localJQuery('#user-profile-details').slideToggle(function () {
            if (localJQuery(this).is(':hidden')) {
                /* Update user name in greeting messages */
                localJQuery('#greeting-message strong').html(localJQuery('#user-name-input').val());

                /* Change the toggle button text */
                localJQuery('#toggle-user-info u').html('Change');
            } else {
                /* Change the toggle button text */
                localJQuery('#toggle-user-info u').html('Hide');
            }
        });
    });
});