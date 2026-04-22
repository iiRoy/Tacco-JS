(function (jq) {
/*
 * Module: ModalWindow
 * Type: jQuery Plugin
 * Author: (c) Jane Doe - @janedoe
 * Version: 2.0.1
 * Requires: JQuery 1.9.1+
 * Description: A versatile and customizable modal dialog system.
 * Updated: 2023-10-27
 */

// Internal tracking variables for active modal instances
var _activeModalsTracking = [],
    _activeModalCount = 0,
    _totalModalInstances = null,
    _topmostModalId = null;

function ModalWindow(inputSettings){
    var instanceRef = this; // Reference to the current ModalWindow instance

    //////////////////////////////////////
    // CORE CONFIGURATIONS AND DOM REFERENCES
    //////////////////////////////////////
    var domDoc 				= jq(document),
        browserWindow 		= window,
        jqWindow			= jq(browserWindow),
        viewportHeight		= getBrowserHeight(),
        viewportWidth		= getBrowserWidth(),
        modalIdPrefix		= 'modal-win-',
        closeBtnCss			= 'mdl-btn-exit',
        universalCloseCss	= 'mdl-close-trigger',
        actionBtnCss		= 'mdl-action-button',
        overlayCss 			= 'mdl-backdrop',
        modalPanelCss 		= 'mdl-container',
        contentAreaCss 		= 'mdl-body-content',
        actionStripCss 		= 'mdl-footer-actions',
        titleBarCss			= 'mdl-header-title',
        uniqueInstanceId,
        baseZIndex			= 9000;

    //////////////////////////////////////
    // DEFAULT SETTINGS FOR MODAL BEHAVIOR
    //////////////////////////////////////
    var configDefaults = {
        isModal			    : false, // Prevents closing on overlay/escape click if true
        modalTitle		    : false,
        dialogContent	    : '',
        verticalOffset	    : -1, // -1 for auto-center, 0+ for fixed pixels
        showCloseButton	    : true, // Display the 'X' close button
        closeButtonTooltip  : 'Close this dialog',
        fixedWidth		    : 600,
        customCloseClass	: '', // Additional class that can trigger close
        escapeKeyCloses		: true,
        focusElement		: null, // Selector for element to focus inside modal
        contentTypeHint	    : false, // [iframe, ajax, #elementId]
        remoteContentUrl	: false, // URL for iframe/ajax content
        actionButtons		: [], // Array of button configurations
        animationSpeed		: 200, // Fade animation duration
        iframeHeight		: '300px',
        iframeWidth		    : '100%',
        maxContentHeight	: false,
        centerVertically	: true,
        overlayColor		: false, // e.g., '#000000'
        overlayOpacity	    : false // e.g., 0.5
    };
    // Merge user-provided settings with defaults
    var currentOptions = jq.extend({}, configDefaults, inputSettings);

    // Initialize the modal instance
    instanceRef.initialize = function(){
        // Increment total modal instances counter
        _totalModalInstances = (_totalModalInstances || 0) + 1;
        // Generate a unique ID for this modal instance
        uniqueInstanceId = modalIdPrefix + _totalModalInstances + '__';
        // Adjust z-index to stack modals correctly
        baseZIndex += _totalModalInstances;
    };

    // Update the content of the modal
    instanceRef.updateContent = function(newContent){
        currentOptions.dialogContent = newContent;
        return instanceRef;
    };

    // Display the modal dialog
    instanceRef.displayModal = function(){
        // Check if the modal template for this ID already exists in the DOM
        const modalSelector = `.${modalPanelCss}.${uniqueInstanceId}`;
        if(jq(modalSelector).length === 0) {
            // If not, create the modal structure
            let generatedOverlay,
                dialogHeader,
                dialogBody,
                dialogFooter;

            // Create the overlay element
            generatedOverlay = jq('<div>')
                .addClass(overlayCss)
                .addClass(uniqueInstanceId)
                .css('z-index', baseZIndex);

            // Apply custom overlay styles if provided
            if(currentOptions.overlayColor){
                generatedOverlay.css('background-color', currentOptions.overlayColor);
            }
            if(currentOptions.overlayOpacity){
                generatedOverlay.css({
                    'opacity': currentOptions.overlayOpacity,
                    'filter': 'alpha(opacity=' + (currentOptions.overlayOpacity * 100) + ')' // IE fallback
                });
            }

            // Create the content wrapper
            dialogBody = jq('<div>').addClass(contentAreaCss);

            // Add title if specified
            if(currentOptions.modalTitle){
                dialogHeader = jq('<div>')
                    .addClass(titleBarCss)
                    .text(currentOptions.modalTitle);
            }

            // Add initial content
            if(currentOptions.dialogContent){
                dialogBody.append(currentOptions.dialogContent);
            }

            // Add action buttons if any are defined
            if(currentOptions.actionButtons.length > 0){
                dialogFooter = jq('<div>').addClass(actionStripCss);
                jq.each(currentOptions.actionButtons, function(idx, buttonConfig){
                    let buttonClass = buttonConfig.classname,
                        buttonClickHandler = buttonConfig.clickEvent;

                    // Handle case where classname is actually the click handler
                    if( jq.isFunction(buttonClass) ) {
                        buttonClickHandler = buttonClass;
                        buttonClass = '';
                    }

                    const newButton = jq('<button>')
                        .addClass(actionBtnCss)
                        .addClass(buttonClass)
                        .text(buttonConfig.label);

                    if(buttonClickHandler) {
                        newButton.on('click', buttonClickHandler);
                    }
                    dialogFooter.append(newButton);
                });
            }

            // Apply max height to content container if set
            if(currentOptions.maxContentHeight){
                dialogBody.css('max-height', currentOptions.maxContentHeight);
            }

            // Assemble the inner modal block
            const innerModalBlock = jq('<div>').addClass('mdl-main-block');

            // Add the close button 'X' if enabled
            if(currentOptions.showCloseButton !== false) {
                const exitButton = jq('<span>')
                    .addClass(closeBtnCss)
                    .html('&times;');
                if(currentOptions.closeButtonTooltip){
                    exitButton.attr('title', currentOptions.closeButtonTooltip);
                }
                innerModalBlock.append(exitButton);
            }

            // Append header, body, and footer to the main block
            if (dialogHeader) innerModalBlock.append(dialogHeader);
            innerModalBlock.append(dialogBody);
            if (dialogFooter) innerModalBlock.append(dialogFooter);

            // Create the outer frame for width and positioning
            const outerModalFrame = jq('<div>')
                .addClass('mdl-outer-frame')
                .width(currentOptions.fixedWidth)
                .append(innerModalBlock);

            // Apply margin for auto-centering horizontally
            outerModalFrame.css('margin', '0 auto');

            // Apply specific top offset if provided
            if(currentOptions.verticalOffset >= 0){
                outerModalFrame.css('margin-top', currentOptions.verticalOffset);
            }

            // Enable responsive behavior if requested
            if(currentOptions.responsive === true){
                outerModalFrame.css('max-width', '100%');
            }

            // Create the final modal wrapper and append to body
            const finalModalWrapper = jq('<div>')
                .addClass(modalPanelCss)
                .addClass(uniqueInstanceId)
                .css('z-index', baseZIndex + 1) // Ensure modal is above overlay
                .append(outerModalFrame);

            jq('body').append(generatedOverlay);
            jq('body').append(finalModalWrapper);
        }

        // If content needs to be loaded dynamically, fetch and render it
        if( currentOptions.contentTypeHint ||  currentOptions.remoteContentUrl ) {
            fetchAndRenderContent();
        }

        // Show the modal and its overlay
        jq(`.${overlayCss}.${uniqueInstanceId}`).fadeIn(currentOptions.animationSpeed);
        jq(`.${modalPanelCss}.${uniqueInstanceId}`).fadeIn(currentOptions.animationSpeed, function() {
            setInitialFocus(); // Set focus after modal is fully visible
        });

        attachEventListeners(); // Bind all necessary events
        repositionModal();      // Ensure modal is correctly positioned

        // Update global tracking
        _activeModalCount++;
        _activeModalsTracking.push(uniqueInstanceId);
        _topmostModalId = uniqueInstanceId;

        // Add no-scroll class to body if not already present
        if(!jq('body').hasClass('no-body-scroll')){
            jq('body').addClass('no-body-scroll');
        }

        return instanceRef;
    };

    // Helper to add a custom action button
    instanceRef.createActionButton = function(labelTxt, cssClasses, clickHandler){
        const newButton = { label: labelTxt };

        // Handle flexible argument order
        if(jq.isFunction(cssClasses)){
            clickHandler = cssClasses;
            cssClasses = '';
        }

        newButton.classname = cssClasses;

        if(jq.isFunction(clickHandler)){
            newButton.clickEvent = clickHandler;
        } else {
            // Default action is to close the modal
            newButton.clickEvent = instanceRef.dismiss;
        }
        currentOptions.actionButtons.push(newButton);
        return newButton;
    };

    // Pre-defined button types
    instanceRef.addConfirmButton = function(confirmHandler){
        instanceRef.createActionButton('OK', '', confirmHandler);
    };
    instanceRef.addDismissButton = function(){
        instanceRef.createActionButton('Cancel', '', instanceRef.dismiss);
    };
    instanceRef.addExitButton = function(){
        instanceRef.createActionButton('Close', '', instanceRef.dismiss);
    };

    // Close the current or specified modal
    instanceRef.hideModal = function(eventObj){
        // Determine which modal to close (current or specific instance)
        const modalToCloseId = _topmostModalId ? _topmostModalId : uniqueInstanceId;

        if (!modalToCloseId) {
            console.warn("ModalWindow: No active modal ID found to close.");
            return false;
        }

        detachEventListeners(modalToCloseId); // Remove events specific to this modal

        const targetModalWrap = jq(`.${modalPanelCss}.${modalToCloseId}`);
        const targetModalOverlay = jq(`.${overlayCss}.${modalToCloseId}`);

        // Fade out and remove modal elements
        targetModalWrap.fadeOut(currentOptions.animationSpeed, function() {
            jq(this).remove();
        });
        targetModalOverlay.fadeOut(currentOptions.animationSpeed, function() {
            jq(this).remove();
        });

        // Update global tracking
        _activeModalCount--;
        // Remove the closed modal's ID from the tracking array
        const indexToRemove = _activeModalsTracking.indexOf(modalToCloseId);
        if (indexToRemove > -1) {
            _activeModalsTracking.splice(indexToRemove, 1);
        }
        // Set the topmost modal to the new last one in the stack
        _topmostModalId = _activeModalsTracking[_activeModalsTracking.length - 1] || null;

        // If no modals are open, remove the body scroll lock
        if(_activeModalCount === 0) {
            jq('body').removeClass('no-body-scroll');
        }

        if (eventObj && typeof eventObj.preventDefault === 'function') {
            eventObj.preventDefault(); // Prevent default action if this was an event handler
        }
        return false;
    };

    // Aliases for convenience
    instanceRef.present = instanceRef.displayModal;
    instanceRef.dismiss = instanceRef.hideModal;

    // Call the initializer immediately upon construction
    instanceRef.initialize();

    return this;

    //////////////////////////////////////
    // PRIVATE HELPER FUNCTIONS
    //////////////////////////////////////

    // Get the current browser window height
    function getBrowserHeight(){
        return browserWindow.innerHeight || jqWindow.height();
    }

    // Get the current browser window width
    function getBrowserWidth(){
        return browserWindow.innerWidth || jqWindow.width();
    }

    // Attach event listeners for the modal
    function attachEventListeners(){
        const modalContainerSelector = `.${modalPanelCss}.${uniqueInstanceId}`;
        const overlaySelector = `.${overlayCss}.${uniqueInstanceId}`;

        // Bind close triggers within the modal
        jq(modalContainerSelector).on('click', `.${universalCloseCss}`, instanceRef.dismiss);
        if(currentOptions.customCloseClass){
            const cleanCloseClass = currentOptions.customCloseClass.startsWith('.') ? currentOptions.customCloseClass.substring(1) : currentOptions.customCloseClass;
            jq(modalContainerSelector).on('click', `.${cleanCloseClass}`, instanceRef.dismiss);
        }

        // Bind the specific 'X' close button if enabled
        if(currentOptions.showCloseButton === true){
            jq(modalContainerSelector).on('click', `.${closeBtnCss}`, instanceRef.dismiss);
        }

        // Handle closing when clicking outside the modal content (if not a strict modal)
        if(currentOptions.isModal !== true){
            jq('body').on('click', overlaySelector + ', ' + modalContainerSelector, instanceRef.dismiss);
            // Prevent modal close when clicking inside the actual content block
            jq('body').on('click', modalContainerSelector + ' .mdl-main-block', function(e){
                e.stopPropagation(); // Stop event from bubbling up to overlay/container
            });
        }

        // Enable escape key to close if configured
        if (currentOptions.escapeKeyCloses !== false) {
            activateEscapeHandler();
        }
        // Re-center modal on window resize
        jqWindow.on('resize.modal' + uniqueInstanceId, repositionModal);
    }

    // Detach event listeners for a specific modal ID
    function detachEventListeners(targetModalId){
        const modalContainerSelector = `.${modalPanelCss}.${targetModalId}`;
        const overlaySelector = `.${overlayCss}.${targetModalId}`;

        // Remove all click handlers related to this modal's closing
        jq(overlaySelector + ', ' + modalContainerSelector).off('click');
        jq(modalContainerSelector + ' .mdl-main-block').off('click');

        // Remove specific close button handlers
        jq(modalContainerSelector).off('click', `.${universalCloseCss}`);
        if(currentOptions.customCloseClass){
            const cleanCloseClass = currentOptions.customCloseClass.startsWith('.') ? currentOptions.customCloseClass.substring(1) : currentOptions.customCloseClass;
            jq(modalContainerSelector).off('click', `.${cleanCloseClass}`);
        }
        jq(modalContainerSelector).off('click', `.${closeBtnCss}`);

        // Remove escape key handler
        domDoc.off('keydown.modal' + targetModalId);
        // Remove resize handler
        jqWindow.off('resize.modal' + targetModalId);
    }

    // Enable handling of the Escape key
    function activateEscapeHandler(){
        domDoc.on('keydown.modal' + uniqueInstanceId, function(e) {
            if (e.key === 'Escape' || e.which === 27) { // Check for 'Escape' key
                e.stopImmediatePropagation();
                instanceRef.dismiss(); // Close the topmost modal
                return false;
            }
        });
    }

    // Inject content into the modal body and re-center
    function injectDynamicContent(newContent){
        const contentTarget = `.${modalPanelCss}.${uniqueInstanceId} .${contentAreaCss}`;
        instanceRef.updateContent(newContent); // Update stored content
        jq(contentTarget).empty().append(newContent); // Clear existing and add new
        setInitialFocus(); // Attempt to focus
        repositionModal(); // Re-center after content change
    }

    // Fetch and render content based on contentTypeHint
    function fetchAndRenderContent(){
        if(currentOptions.contentTypeHint === 'ajax' && currentOptions.remoteContentUrl){
            jq.get(currentOptions.remoteContentUrl, function(data){
                const ajaxContentWrapper = jq('<div class="mdl-ajax-wrapper"></div>').append(data);
                injectDynamicContent(ajaxContentWrapper);
                return false;
            }).fail(function(jqXHR, textStatus, errorThrown) {
                // Basic error handling for AJAX content
                console.error("ModalWindow: Failed to load AJAX content:", textStatus, errorThrown);
                injectDynamicContent('<p class="mdl-error">Error loading content.</p>');
            });

        } else if (currentOptions.contentTypeHint === 'iframe' && currentOptions.remoteContentUrl){
            const iframeElement = jq('<iframe class="mdl-frame-embed"></iframe>')
                .attr('src', currentOptions.remoteContentUrl)
                .css({
                    'border': 0,
                    'width'	: currentOptions.iframeWidth,
                    'height': currentOptions.iframeHeight
                });
            injectDynamicContent(iframeElement);

        } else if (currentOptions.contentTypeHint && currentOptions.contentTypeHint.startsWith('#')){ // Content from existing DOM element
            const sourceElement = jq(currentOptions.contentTypeHint);
            if (sourceElement.length) {
                const contentFromDom = sourceElement.html();
                injectDynamicContent(contentFromDom);
            } else {
                console.warn(`ModalWindow: Content source ${currentOptions.contentTypeHint} not found.`);
            }
        }
    }

    // Set focus to the first input/textarea within the modal
    function setInitialFocus(){
        if(currentOptions.focusElement === true){
            jq(`.${modalPanelCss}.${uniqueInstanceId} .${contentAreaCss}`).find('input,textarea').first().focus();
        } else if (typeof currentOptions.focusElement === 'string') {
            jq(`.${modalPanelCss}.${uniqueInstanceId}`).find(currentOptions.focusElement).first().focus();
        }
    }

    // Re-calculate and apply vertical centering
    function repositionModal(){
        // Skip re-centering if a fixed offset is given or vertical centering is disabled
        if( (currentOptions.verticalOffset !== -1 && currentOptions.verticalOffset >= 0) || currentOptions.centerVertically === false ){
            return; // No re-centering needed
        }

        // Get current viewport height
        const currentViewportHeight = getBrowserHeight();
        const modalContentBlock =  `.${modalPanelCss}.${uniqueInstanceId} .mdl-main-block`;

        // Calculate content block dimensions
        const contentBlockWidth = jq(modalContentBlock).outerWidth();
        const contentBlockHeight = jq(modalContentBlock).outerHeight();

        // Calculate new top margin for vertical centering, ensuring it's not negative
        let newTopMargin = ((currentViewportHeight - contentBlockHeight) / 2) - 20; // Slight offset from true center
        newTopMargin = Math.max(0, newTopMargin); // Ensure margin is not less than 0

        // Apply the new margin to the outer frame
        jq(`.${modalPanelCss}.${uniqueInstanceId} .mdl-outer-frame`).css('margin-top', newTopMargin);
    }
}
// Expose the ModalWindow constructor globally
window.ModalWindow = ModalWindow;
} (jQuery));