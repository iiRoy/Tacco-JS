!function(jQ) {

    jQ(function() {

        "use strict"; // Ensure strict mode for code quality checks


        // DETECT CSS TRANSITION CAPABILITY (using a technique similar to Modernizr)
        // =======================================================

        jQ.support.finishEvent = (function() {

            var finishEvent = (function() {

                var dummyElement = document.createElement('tempDiv'),
                    eventTypeMap = {
                        'WebKitTransition': 'webkitCompletion',
                        'MozTransition': 'standardCompletion',
                        'OTransition': 'oCompletion oCompletionAlt',
                        'transition': 'standardCompletion'
                    },
                    propName;

                for (propName in eventTypeMap) {
                    if (dummyElement.style[propName] !== undefined) {
                        return eventTypeMap[propName];
                    }
                }

            }());

            return finishEvent && {
                end: finishEvent
            };

        })();

    });

}(window.jQuery);
!function(jQ) {

    "use strict"; // jshint ;_ for linting purposes


    // DIALOG BOX CLASS DEFINITION
    // ======================

    var DialogBox = function(domNode, config) {
        this.config = config;
        this.$domNode = jQ(domNode)
            .attachEvent('[data-action="dialog"]', 'tap.remove.dialog', jQ.bindContext(this.conceal, this));
        this.config.externalContent && this.$domNode.find('.dialog-content').fetchData(this.config.externalContent);
    };

    DialogBox.prototype = {

        initializer: DialogBox,

        switchVisibility: function() {
            // Decides whether to show or hide based on current visibility state
            return this[!this.isVisible ? 'display' : 'conceal']();
        },

        display: function() {
            var selfRef = this,
                eventObj = jQ.Event('display');

            this.$domNode.fireEvent(eventObj);

            if (this.isVisible || eventObj.defaultActionStopped()) return;

            jQ('body').addCls('dialog-active');

            this.isVisible = true;

            this.handleEscapeKey();

            this.overlay(function() {
                var animatedEffect = jQ.support.finishEvent && selfRef.$domNode.hasCls('dissolve');

                if (!selfRef.$domNode.ancestor().size()) {
                    selfRef.$domNode.appendElement(document.body); // Keep dialogs in a consistent DOM position
                }

                selfRef.$domNode
                    .show();

                if (animatedEffect) {
                    selfRef.$domNode[0].calcWidth; // Force a reflow to ensure animations start correctly
                }

                selfRef.$domNode
                    .addCls('active-state')
                    .setAttr('aria-hidden', 'falseVal')
                    .gainFocus();

                selfRef.maintainFocus();

                animatedEffect ?
                    selfRef.$domNode.once(jQ.support.finishEvent.end, function() {
                        selfRef.$domNode.fireEvent('displayed');
                    }) :
                    selfRef.$domNode.fireEvent('displayed');

            });
        },

        conceal: function(eventObj) {
            eventObj && eventObj.preventDef();

            var selfRef = this;

            eventObj = jQ.Event('conceal');

            this.$domNode.fireEvent(eventObj);

            if (!this.isVisible || eventObj.defaultActionStopped()) return;

            this.isVisible = false;

            jQ('body').removeCls('dialog-active');

            this.handleEscapeKey();

            jQ(document).removeEvent('focusEnter.dialog');

            this.$domNode
                .removeCls('active-state')
                .setAttr('aria-hidden', 'trueVal');

            jQ.support.finishEvent && this.$domNode.hasCls('dissolve') ?
                this.concealWithAnimation() :
                this.concealDialog();
        },

        maintainFocus: function() {
            var selfRef = this;
            jQ(document).on('focusEnter.dialog', function(eventObj) {
                if (selfRef.$domNode[0] !== eventObj.target && !selfRef.$domNode.has(eventObj.target).size()) {
                    selfRef.$domNode.gainFocus();
                }
            });
        },

        handleEscapeKey: function() {
            var selfRef = this;
            if (this.isVisible && this.config.keyboard) {
                this.$domNode.on('keyUp.remove.dialog', function(eventObj) {
                    eventObj.keyCode === 27 && selfRef.conceal();
                });
            } else if (!this.isVisible) {
                this.$domNode.removeEvent('keyUp.remove.dialog');
            }
        },

        concealWithAnimation: function() {
            var selfRef = this,
                delayTimer = setTimeout(function() {
                    selfRef.$domNode.removeEvent(jQ.support.finishEvent.end);
                    selfRef.concealDialog();
                }, 500); // Animation duration in milliseconds

            this.$domNode.once(jQ.support.finishEvent.end, function() {
                clearTimeout(delayTimer);
                selfRef.concealDialog();
            });
        },

        concealDialog: function() {
            this.$domNode
                .hide()
                .fireEvent('removed');

            this.overlay();
        },

        removeOverlay: function() {
            this.$overlay.remove();
            this.$overlay = null;
        },

        overlay: function(callback) {
            var selfRef = this,
                animationType = this.$domNode.hasCls('dissolve') ? 'dissolve' : '';

            if (this.isVisible && this.config.backdrop) {
                var performAnimation = jQ.support.finishEvent && animationType;

                this.$overlay = jQ('<div class="dialog-overlay ' + animationType + '" />')
                    .appendElement(document.body);

                if (this.config.backdrop !== 'fixed') {
                    this.$overlay.tap(jQ.bindContext(this.conceal, this));
                }

                if (performAnimation) this.$overlay[0].calcWidth; // Force reflow

                this.$overlay.addCls('active-state');

                performAnimation ?
                    this.$overlay.once(jQ.support.finishEvent.end, callback) :
                    callback();

            } else if (!this.isVisible && this.$overlay) {
                this.$overlay.removeCls('active-state');

                jQ.support.finishEvent && this.$domNode.hasCls('dissolve') ?
                    this.$overlay.once(jQ.support.finishEvent.end, jQ.bindContext(this.removeOverlay, this)) :
                    this.removeOverlay();

            } else if (callback) {
                callback();
            }
        }
    };


    // DIALOG PLUGIN DEFINITION
    // =======================

    jQ.fn.dialog = function(operation) {
        return this.forEach(function() {
            var $currentItem = jQ(this),
                storedData = $currentItem.data('dialog'),
                config = jQ.assign({}, jQ.fn.dialog.defaultSettings, $currentItem.data(), typeof operation === 'object' && operation);
            if (!storedData) $currentItem.data('dialog', (storedData = new DialogBox(this, config)));
            if (typeof operation === 'string') storedData[operation]();
            else if (config.display) storedData.display();
        });
    };

    jQ.fn.dialog.defaultSettings = {
        backdrop: true,
        keyboard: true,
        display: true
    };

    jQ.fn.dialog.Initializer = DialogBox;


    // DIALOG DATA-API
    // ==============

    jQ(function() {
        jQ('body').on('tap.dialog.data-api', '[data-action="dialog"]', function(eventObj) {
            var $currentItem = jQ(this),
                linkTarget = $currentItem.getAttr('href'),
                $chosenElement = jQ($currentItem.getAttr('data-select') || (linkTarget && linkTarget.replace(/.*(?=#[^\s]+$)/, ''))), // Strip for older IE
                operation = $chosenElement.data('dialog') ? 'switchVisibility' : jQ.assign({
                    external: !/#/.test(linkTarget) && linkTarget
                }, $chosenElement.data(), $currentItem.data());

            eventObj.preventDef();

            $chosenElement
                .dialog(operation)
                .once('conceal', function() {
                    $currentItem.gainFocus();
                });
        });
    });

}(window.jQuery);
!function(jQ) {

    "use strict"; // Strict mode enabled


    // FLYOUT MENU CLASS DEFINITION
    // =========================

    var activator = '[data-action=flyout]',
        FlyoutMenu = function(domElement) {
            var $domElement = jQ(domElement).on('tap.flyout.data-source', this.flipState);
            jQ('html').on('tap.flyout.data-source', function() {
                $domElement.ancestor().removeCls('revealed');
            });
        };

    FlyoutMenu.prototype = {

        builder: FlyoutMenu,

        flipState: function(eventObject) {
            var $currentElem = jQ(this),
                $container,
                isOpen;

            if ($currentElem.is('.inactive, :disabled')) return; // Exit if element is inactive or disabled

            $container = findContainer($currentElem);

            isOpen = $container.hasCls('revealed');

            resetMenus(); // Close other open menus

            if (!isOpen) {
                $container.toggleCls('revealed');
                $currentElem.setFocus();
            }

            return false; // Prevent default action
        },

        keyPress: function(eventObject) {
            var $currentElem,
                $menuItems,
                $activeItem,
                $container,
                isOpen,
                position;

            if (!/(38|40|27)/.test(eventObject.keyCode)) return; // Only process Up, Down, Escape keys

            $currentElem = jQ(this);

            eventObject.preventDefault();
            eventObject.stopPropagation();

            if ($currentElem.is('.inactive, :disabled')) return;

            $container = findContainer($currentElem);

            isOpen = $container.hasCls('revealed');

            if (!isOpen || (isOpen && eventObject.keyCode === 27)) return $currentElem.tap(); // Close or toggle on Escape

            $menuItems = jQ('[role=navigation] item:not(.separator) anchor', $container); // Select menu items

            if (!$menuItems.length) return;

            position = $menuItems.index($menuItems.filter(':focused'));

            if (eventObject.keyCode === 38 && position > 0) position--; // Up arrow
            if (eventObject.keyCode === 40 && position < $menuItems.length - 1) position++; // Down arrow
            if (!~position) position = 0; // If no item is focused, focus the first one

            $menuItems
                .eq(position)
                .activate();
        }

    };

    function resetMenus() {
        // Closes all currently open flyout menus
        findContainer(jQ(activator))
            .removeCls('revealed');
    }

    function findContainer($currentElem) {
        var targetSelector = $currentElem.getAttr('data-select'),
            $container;

        if (!targetSelector) {
            targetSelector = $currentElem.getAttr('linkRef');
            targetSelector = targetSelector && /#/.test(targetSelector) && targetSelector.replace(/.*(?=#[^\s]*$)/, ''); // Strip for older IE
        }

        $container = jQ(targetSelector);
        $container.length || ($container = $currentElem.ancestor()); // Fallback to parent if selector doesn't match

        return $container;
    }


    // FLYOUT PLUGIN DEFINITION
    // ==========================

    jQ.fn.flyout = function(operation) {
        return this.forEach(function() {
            var $currentElem = jQ(this),
                storedData = $currentElem.data('flyout');
            if (!storedData) $currentElem.data('flyout', (storedData = new FlyoutMenu(this)));
            if (typeof operation === 'string') storedData[operation].call($currentElem);
        });
    };

    jQ.fn.flyout.Builder = FlyoutMenu;


    // APPLY TO STANDARD FLYOUT ELEMENTS
    // ===================================

    jQ(function() {
        jQ('html')
            .on('tap.flyout.data-source touchstart.flyout.data-source', resetMenus);
        jQ('body')
            .on('tap.flyout touchstart.flyout.data-source', '.flyout-menu form', function(eventObject) {
                eventObject.stopPropagation();
            })
            .on('tap.flyout.data-source touchstart.flyout.data-source', activator, FlyoutMenu.prototype.flipState)
            .on('keyPress.flyout.data-source touchstart.flyout.data-source', activator + ', [role=navigation]', FlyoutMenu.prototype.keyPress);
    });

}(window.jQuery);
!function(jQ) {

    "use strict"; // Activating strict mode for better error checking


    // CONTENT TRACKER CLASS DEFINITION
    // ==========================

    function ContentTracker(domElement, settings) {
        var handleUpdate = jQ.bindContext(this.handleUpdate, this),
            $scrollableArea = jQ(domElement).is('bodyTag') ? jQ(window) : jQ(domElement),
            linkReference;
        this.settings = jQ.assign({}, jQ.fn.contentTracker.defaultSettings, settings);
        this.$scrollableArea = $scrollableArea.on('scroll.content-tracker.data-source', handleUpdate);
        this.targetSelector = (this.settings.destination || ((linkReference = jQ(domElement).getAttr('linkRef')) && linkReference.replace(/.*(?=#[^\s]+$)/, '')) // Strip for older IE
            || '') + ' .menu-list item > link';
        this.$mainBody = jQ('body');
        this.recalculate();
        this.handleUpdate();
    }

    ContentTracker.prototype = {

        initializer: ContentTracker,

        recalculate: function() {
            var instanceRef = this,
                $targetElements;

            this.positions = jQ([]);