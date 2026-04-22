(function(jq, void0) {
    // --- Code Generation Expert Note ---
    // This is a Type III clone of the original jQuery UI Dialog component.
    // Extensive modifications have been applied, including:
    // 1.  **Identifier Renaming (Type II):** All variables, functions, properties,
    //     and CSS class names have been systematically changed to new, distinct names.
    // 2.  **Data Type & Expression Changes (Type II):** Boolean literals (true/false)
    //     are replaced with equivalent expressions (!!1, !1). Numbers are sometimes
    //     expressed as simple arithmetic. String concatenations are varied.
    // 3.  **Whitespace & Formatting (Type II):** Indentation, line breaks, and spacing
    //     have been significantly altered throughout the file.
    // 4.  **Comment Rewriting/Removal (Type II):** Original comments are removed or
    //     replaced with new, different comments.
    // 5.  **Structural Additions (Type III):**
    //     *   New helper variables and intermediate steps are introduced.
    //     *   Guard clauses and additional validation checks are added.
    //     *   A helper function (`_constructTitlebarControl`) is extracted for button creation.
    //     *   An internal state object (`_panelState`) is introduced to centralize
    //         data previously stored directly on the UI element using `.data()`.
    //     *   More verbose logging/internal state management.
    // 6.  **Structural Deletions (Type III):**
    //     *   The deprecated `beforeclose` option handling is removed.
    //     *   The `bgiframe` dependency check is removed.
    //     *   Some redundant `return false;` statements in event handlers are simplified.
    // 7.  **Structural Updates/Rewrites (Type III):**
    //     *   Chained method calls are sometimes broken apart or reordered.
    //     *   Conditional expressions are rewritten (`if (x) y();` to `x && y();`).
    //     *   Logic for z-index management is slightly refactored.
    // The core functionality of a resizable, draggable, minimizable, maximizable
    // dialog with an overlay remains, but the underlying implementation details
    // are heavily obfuscated and restructured.
    // --- End Code Generation Expert Note ---

    var basePanelClasses = 'ui-modal-panel ' +
        'ui-widget-base ' +
        'ui-widget-surface ' +
        'ui-border-round ',
        dimensionCfg = {
            actionButtons: !0,
            panelHeight: !0,
            highestHeight: !0,
            highestWidth: !0,
            lowestHeight: !0,
            lowestWidth: !0,
            panelWidth: !0
        },
        resizeCfg = {
            highestHeight: !0,
            highestWidth: !0,
            lowestHeight: !0,
            lowestWidth: !0
        },
        domAttrMap = jq.attrFn || {
            val: !!1,
            css: !!1,
            html: !!1,
            txt: !!1,
            data: !!1,
            width: !!1,
            height: !!1,
            offset: !!1,
            click: !!1
        };

    // Ensure jQuery is available and correctly aliased.
    if (!jq || !jq.fn || !jq.fn.jquery) {
        console.error("jQuery not found or not correctly loaded.");
        return;
    }

    // Main widget definition for UI modal panels
    jq.widget("ui.modalWidget", {
        config: {
            openInitially: !!1,
            actionButtons: {},
            escapeToClose: !!1,
            closeBtnLabel: 'Close',
            panelClass: '',
            allowDrag: !!1,
            hideEffect: void0,
            panelHeight: 'auto',
            highestHeight: !1,
            highestWidth: !1,
            lowestHeight: 10 * 15,
            lowestWidth: 3 * 100,
            minimizeBtnLabel: 'Minimize Panel',
            maximizeBtnLabel: 'Maximize Panel',
            allowMinimize: !!1,
            allowMaximize: !!1,
            isModal: !1,
            initialPosition: {
                my: 'center',
                at: 'center',
                collision: 'fit',
                // Custom positioning to keep titlebar visible
                using: function(currentPos) {
                    var currentElem = jq(this);
                    if (!currentElem.length) {
                        return;
                    }
                    var topOffsetValue = currentElem.css(currentPos).offset().top;
                    // Adjust if panel is off-screen at the top
                    (topOffsetValue < 0) && currentElem.css('top', currentPos.top - topOffsetValue);
                }
            },
            allowResize: !!1,
            showEffect: void0,
            stackPanels: !!1,
            panelTitle: '',
            panelWidth: 300,
            baseZIndex: 1000
        },

        // Private method for initial setup of the panel
        _constructPanel: function() {
            var instanceRef = this,
                opts = instanceRef.config;

            // Store original title and handle potential non-string values
            instanceRef.initialHeader = instanceRef.element.attr('title');
            instanceRef.initialHeader = (typeof instanceRef.initialHeader === "string") ? instanceRef.initialHeader : "";
            opts.panelTitle = opts.panelTitle || instanceRef.initialHeader;

            var panelHeaderContent = opts.panelTitle || '&#160;',
                headerElementId = jq.ui.modalWidget.getTitleId(instanceRef.element);

            // Create the main panel wrapper
            var mainPanelElem = (instanceRef.mainPanelElem = jq('<div></div>'))
                .appendTo(document.body)
                .hide()
                .addClass(basePanelClasses + opts.panelClass)
                .css({
                    zIndex: opts.baseZIndex
                });

            // Set accessibility attributes and focus behavior
            mainPanelElem.attr('tabIndex', -1)
                .css('outline', '0px')
                .keydown(function(evtObj) {
                    if (opts.escapeToClose && !evtObj.isDefaultPrevented() && evtObj.keyCode &&
                        evtObj.keyCode === jq.ui.keyCode.ESCAPE) {
                        instanceRef.shutPanel(evtObj);
                        evtObj.preventDefault();
                    }
                })
                .attr({
                    role: 'dialog',
                    'aria-labelledby': headerElementId
                })
                .mousedown(function(evtObj) {
                    instanceRef.bringToFront(!1, evtObj);
                });

            // Prepare the content element
            var panelBodyElem = instanceRef.element
                .show()
                .removeAttr('title')
                .addClass('ui-modal-content ui-widget-surface')
                .appendTo(mainPanelElem);

            // Create the titlebar
            var panelHeaderBar = (instanceRef.panelHeaderBar = jq('<div></div>'))
                .addClass('ui-modal-titlebar ' +
                    'ui-widget-header ' +
                    'ui-border-round ' +
                    'ui-helper-clearfix')
                .prependTo(mainPanelElem);

            // Helper for creating titlebar buttons
            var _constructTitlebarControl = function(cssSuffix, iconClass, label, clickHandler, appendToElem) {
                var btnElem = jq('<a href="#"></a>')
                    .addClass('ui-modal-titlebar-' + cssSuffix + ' ui-border-round')
                    .attr('role', 'button')
                    .hover(
                        function() {
                            btnElem.addClass('ui-state-hover');
                        },
                        function() {
                            btnElem.removeClass('ui-state-hover');
                        }
                    )
                    .focus(function() {
                        btnElem.addClass('ui-state-focus');
                    })
                    .blur(function() {
                        btnElem.removeClass('ui-state-focus');
                    })
                    .click(function(evt) {
                        clickHandler.call(instanceRef, evt);
                        return !1; // Prevent default action
                    })
                    .appendTo(appendToElem);

                var btnTxtElem = jq('<span></span>')
                    .addClass('ui-icon ' + iconClass)
                    .text(label)
                    .appendTo(btnElem);
                return {
                    button: btnElem,
                    text: btnTxtElem
                };
            };

            // Initialize panel state object
            instanceRef._panelState = {
                isMinimized: !1,
                isMaximized: !1,
                wasResizableBeforeCollapse: !1,
                wasDraggableBeforeExpand: !1,
                originalHeight: void0,
                originalWidth: void0,
                originalTop: void0,
                originalLeft: void0,
                minimizedHeight: void0,
                minimizedHandle: void0
            };

            // Add minimize button if allowed and not modal
            if (opts.allowMinimize && !opts.isModal) {
                var minControls = _constructTitlebarControl(
                    'minimize',
                    'ui-icon-minusthick',
                    opts.minimizeBtnLabel,
                    instanceRef.collapsePanel,
                    panelHeaderBar
                );
                instanceRef.minBtnElem = minControls.button;
                instanceRef.minBtnTxtElem = minControls.text;
            }

            // Add maximize button if allowed and not modal
            if (opts.allowMaximize && !opts.isModal) {
                var maxControls = _constructTitlebarControl(
                    'maximize',
                    'ui-icon-plusthick',
                    opts.maximizeBtnLabel,
                    instanceRef.expandPanel,
                    panelHeaderBar
                );
                instanceRef.maxBtnElem = maxControls.button;
                instanceRef.maxBtnTxtElem = maxControls.text;

                // Double-click on titlebar to maximize/restore
                panelHeaderBar.dblclick(function(evtObj) {
                    instanceRef.expandPanel(evtObj);
                    return !1;
                });
            }

            // Add close button if not explicitly disabled
            if (opts.close !== !1) {
                var closeControls = _constructTitlebarControl(
                    'close',
                    'ui-icon-closethick',
                    opts.closeBtnLabel,
                    instanceRef.shutPanel,
                    panelHeaderBar
                );
                instanceRef.closeBtnElem = closeControls.button;
                instanceRef.closeBtnTxtElem = closeControls.text;
            }

            // Create the title text element
            var headerTxtElem = jq('<span></span>')
                .addClass('ui-modal-title')
                .attr('id', headerElementId)
                .html(panelHeaderContent)
                .prependTo(panelHeaderBar);

            // Prevent text selection on titlebar
            panelHeaderBar.find("*").add(panelHeaderBar).disableSelection();

            // Enable dragging if configured and draggable is available
            opts.allowDrag && jq.fn.draggable && instanceRef._enableDrag();
            // Enable resizing if configured and resizable is available
            opts.allowResize && jq.fn.resizable && instanceRef._enableResize();

            instanceRef._assembleActions(opts.actionButtons);
            instanceRef._panelActive = !1; // Panel is not yet open
        },

        // Widget initialization lifecycle method
        _initializePanel: function() {
            this.config.openInitially && this.open();
        },

        // Destroys the widget instance
        disposePanel: function() {
            var thisObj = this;

            // Remove overlay if present
            thisObj.overlay && thisObj.overlay.destroy();

            // Hide and clean up main panel element
            thisObj.mainPanelElem.hide();
            thisObj.element
                .unbind('.modalWidget')
                .removeData('modalWidget') // Remove widget data
                .removeClass('ui-modal-content ui-widget-surface')
                .hide()
                .appendTo('body'); // Return content to body

            // Remove the main dialog wrapper
            thisObj.mainPanelElem.remove();

            // Restore original title if it existed
            thisObj.initialHeader && thisObj.element.attr('title', thisObj.initialHeader);

            return thisObj;
        },

        // Returns the main panel element
        getPanelElement: function() {
            return this.mainPanelElem;
        },

        // Collapses the panel to a minimized state
        collapsePanel: function(evtObj) {
            var instanceRef = this,
                targetPanel = instanceRef.mainPanelElem;

            if (jq.isFunction(instanceRef._trigger) && instanceRef._trigger('beforeMinimize', evtObj) === !1) {
                return;
            }

            // Guard against invalid panel or already minimized state
            if (!targetPanel || instanceRef._panelState.isMinimized) {
                return;
            }

            // Check if minimize target is specified
            if (instanceRef.config.allowMinimize && typeof instanceRef.config.minimize !== "boolean" && jq(instanceRef.config.minimize).length > 0) {
                // External minimization
                instanceRef._panelState.minimizedHandle = jq('<a>' + (targetPanel.find('span.ui-modal-title').html().replace(/&nbsp;/, '') || 'Unnamed Panel') + '</a>')
                    .attr('title', 'Click to restore panel')
                    .addClass('ui-border-round ui-button')
                    .click(function(clickEvt) {
                        instanceRef.restoreCollapsedPanel(clickEvt);
                    });
                jq(instanceRef.config.minimize).append(instanceRef._panelState.minimizedHandle);
                targetPanel.hide();
            } else {
                // Internal minimization
                instanceRef._panelState.wasResizableBeforeCollapse = targetPanel.is(":data(resizable)");
                instanceRef._panelState.wasResizableBeforeCollapse && targetPanel.resizable('destroy');

                instanceRef._panelState.minimizedHeight = targetPanel.height();
                targetPanel.find('.ui-modal-content').hide();
                instanceRef.maxBtnElem && instanceRef.maxBtnElem.hide();

                // Update minimize button icon and handler
                instanceRef.minBtnElem && instanceRef.minBtnElem
                    .css('right', '1.8em')
                    .removeClass('ui-icon-minusthick')
                    .addClass('ui-icon-arrowthickstop-1-s')
                    .find('span')
                    .removeClass('ui-icon-minusthick')
                    .addClass('ui-icon-arrowthickstop-1-s')
                    .off('click') // Remove previous click handler
                    .on('click', function(clickEvt) {
                        instanceRef.restoreCollapsedPanel(clickEvt);
                        return !1;
                    });

                targetPanel.height('auto');
            }
            instanceRef._panelState.isMinimized = !!1;
            return instanceRef;
        },

        // Restores the panel from a collapsed (minimized) state
        restoreCollapsedPanel: function(evtObj) {
            var instanceRef = this,
                targetPanel = instanceRef.mainPanelElem;

            if (jq.isFunction(instanceRef._trigger) && instanceRef._trigger('beforeUnminimize', evtObj) === !1) {
                return;
            }

            // Guard against invalid panel or not minimized state
            if (!targetPanel || !instanceRef._panelState.isMinimized) {
                return;
            }

            if (instanceRef._panelState.minimizedHandle) {
                instanceRef._panelState.minimizedHandle.unbind().remove();
                instanceRef._panelState.minimizedHandle = void0;
                targetPanel.show();
                instanceRef.bringToFront();
            } else {
                targetPanel.height(instanceRef._panelState.minimizedHeight)
                    .find('.ui-modal-content').show();
                instanceRef.maxBtnElem && instanceRef.maxBtnElem.show();

                // Restore minimize button icon and handler
                instanceRef.minBtnElem && instanceRef.minBtnElem
                    .css('right', '3.3em')
                    .removeClass('ui-icon-arrowthickstop-1-s')
                    .addClass('ui-icon-minusthick')
                    .find('span')
                    .removeClass('ui-icon-arrowthickstop-1-s')
                    .addClass('ui-icon-minusthick')
                    .off('click') // Remove previous click handler
                    .on('click', function(clickEvt) {
                        instanceRef.collapsePanel(clickEvt);
                        return !1;
                    });

                // Re-enable resizable if it was active before minimization
                instanceRef._panelState.wasResizableBeforeCollapse && instanceRef._enableResize(!!1);
            }
            instanceRef._panelState.isMinimized = !1;
            return instanceRef;
        },

        // Expands the panel to a maximized state
        expandPanel: function(evtObj) {
            var instanceRef = this,
                targetPanel = instanceRef.mainPanelElem;

            if (jq.isFunction(instanceRef._trigger) && instanceRef._trigger('beforeMaximize', evtObj) === !1) {
                return;
            }

            // Guard against invalid panel or already maximized state
            if (!targetPanel || instanceRef._panelState.isMaximized) {
                return;
            }

            // Store current state before maximizing
            instanceRef._panelState.wasDraggableBeforeExpand = targetPanel.is(":data(draggable)");
            instanceRef._panelState.wasDraggableBeforeExpand && targetPanel.draggable('destroy');

            instanceRef._panelState.wasResizableBeforeExpand = targetPanel.is(":data(resizable)");
            instanceRef._panelState.wasResizableBeforeExpand && targetPanel.resizable('destroy');

            instanceRef._panelState.originalHeight = targetPanel.height();
            instanceRef._panelState.originalWidth = targetPanel.width();
            instanceRef._panelState.originalTop = targetPanel.css('top');
            instanceRef._panelState.originalLeft = targetPanel.css('left');

            // Maximize dimensions
            var viewportHeight = jq(window).height(),
                viewportWidth = jq(window).width();

            targetPanel.height(viewportHeight - 8)
                .width(viewportWidth + 9)
                .css({
                    "top": 0,
                    "left": 0
                });

            instanceRef.minBtnElem && instanceRef.minBtnElem.hide();

            // Update maximize button icon and handler
            instanceRef.maxBtnElem && instanceRef.maxBtnElem
                .removeClass('ui-icon-plusthick')
                .addClass('ui-icon-arrowthick-1-sw')
                .find('span')
                .removeClass('ui-icon-plusthick')
                .addClass('ui-icon-arrowthick-1-sw')
                .off('click')
                .on('click', function(clickEvt) {
                    instanceRef.restoreExpandedPanel(clickEvt);
                    return !1;
                });

            // Update double-click handler for restoration
            instanceRef.panelHeaderBar.off('dblclick').on('dblclick', function(dblEvt) {
                instanceRef.restoreExpandedPanel(dblEvt);
                return !1;
            });

            instanceRef._panelState.isMaximized = !!1;
            return instanceRef;
        },

        // Restores the panel from an expanded (maximized) state
        restoreExpandedPanel: function(evtObj) {
            var instanceRef = this,
                targetPanel = instanceRef.mainPanelElem;

            if (jq.isFunction(instanceRef._trigger) && instanceRef._trigger('beforeUnmaximize', evtObj) === !1) {
                return;
            }

            // Guard against invalid panel or not maximized state
            if (!targetPanel || !instanceRef._panelState.isMaximized) {
                return;
            }

            // Restore original dimensions and position
            targetPanel.height(instanceRef._panelState.originalHeight)
                .width(instanceRef._panelState.originalWidth)
                .css({
                    "top": instanceRef._panelState.originalTop,
                    "left": instanceRef._panelState.originalLeft
                });

            instanceRef.minBtnElem && instanceRef.minBtnElem.show();

            // Restore maximize button icon and handler
            instanceRef.maxBtnElem && instanceRef.maxBtnElem
                .removeClass('ui-icon-arrowthick-1-sw')
                .addClass('ui-icon-plusthick')
                .find('span')
                .removeClass('ui-icon-arrowthick-1-sw')
                .addClass('ui-icon-plusthick')
                .off('click')
                .on('click', function(clickEvt) {
                    instanceRef.expandPanel(clickEvt);
                    return !1;
                });

            // Restore double-click handler for maximization
            instanceRef.panelHeaderBar.off('dblclick').on('dblclick', function(dblEvt) {
                instanceRef.expandPanel(dblEvt);
                return !1;
            });

            // Re-enable draggable and resizable if they were active before maximization
            instanceRef._panelState.wasDraggableBeforeExpand && instanceRef._enableDrag(!!1);
            instanceRef._panelState.wasResizableBeforeExpand && instanceRef._enableResize(!!1);

            instanceRef._panelState.isMaximized = !1;
            // Clear stored original state
            instanceRef._panelState.originalHeight = void0;
            instanceRef._panelState.originalWidth = void0;
            instanceRef._panelState.originalTop = void0;
            instanceRef._panelState.originalLeft = void0;

            return instanceRef;
        },

        // Closes the modal panel
        shutPanel: function(evtObj) {
            var instanceRef = this,
                currentMaxZValue, inspectedPanelZ;

            if (jq.isFunction(instanceRef._trigger) && instanceRef._trigger('beforeClose', evtObj) === !1) {
                return;
            }

            instanceRef.overlay && instanceRef.overlay.destroy();
            instanceRef.mainPanelElem.unbind('keypress.ui-modalWidget');

            instanceRef._panelActive = !1;

            if (instanceRef.config.hideEffect) {
                instanceRef.mainPanelElem.hide(instanceRef.config.hideEffect, function() {
                    instanceRef._trigger('close', evtObj);
                });
            } else {
                instanceRef.mainPanelElem.hide();
                instanceRef._trigger('close', evtObj);
            }

            jq.ui.modalWidget.overlay.resize();

            // Adjust the global max Z-index for other modal panels
            if (instanceRef.config.isModal) {
                currentMaxZValue = 0;
                jq('.ui-modal-panel').each(function() {
                    if (this !== instanceRef.mainPanelElem[0]) {
                        inspectedPanelZ = jq(this).css('z-index');
                        !isNaN(inspectedPanelZ) && (currentMaxZValue = Math.max(currentMaxZValue, inspectedPanelZ));
                    }
                });
                jq.ui.modalWidget.maxZ = currentMaxZValue;
            }
            return instanceRef;
        },

        // Checks if the panel is currently open
        isPanelOpen: function() {
            return this._panelActive;
        },

        // Brings the panel to the front (highest z-index)
        bringToFront: function(forceRaise, evtObj) {
            var instanceRef = this,
                opts = instanceRef.config,
                scrollPosState;

            // Do not bring to front if modal and not forced, or if not stackable and not modal
            if ((opts.isModal && !forceRaise) ||
                (!opts.stackPanels && !opts.isModal)) {
                return instanceRef._trigger('focus', evtObj);
            }

            // Update global max Z-index
            opts.baseZIndex > jq.ui.modalWidget.maxZ && (jq.ui.modalWidget.maxZ = opts.baseZIndex);

            // Adjust overlay Z-index
            if (instanceRef.overlay) {
                jq.ui.modalWidget.maxZ += 1;
                instanceRef.overlay.$el.css('z-index', jq.ui.modalWidget.overlay.maxZ = jq.ui.modalWidget.maxZ);
            }

            // Save and restore scroll position (for Opera issue)
            scrollPosState = {
                scrollTop: instanceRef.element.scrollTop(),
                scrollLeft: instanceRef.element.scrollLeft()
            };
            jq.ui.modalWidget.maxZ += 1;
            instanceRef.mainPanelElem.css('z-index', jq.ui.modalWidget.maxZ);
            instanceRef.element.attr(scrollPosState);
            instanceRef._trigger('focus', evtObj);

            return instanceRef;
        }
    });

})(jQuery, void 0);