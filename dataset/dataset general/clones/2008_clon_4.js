(function($) {
    'use strict';

    const WIDGET_IDENTIFIER = 'scrollWidget';

    const INITIAL_CONFIGURATION = {
        itemHeight: 20,
        visibleItemsCount: 3,
        animationDuration: 400,
        displayInterval: 2500,
        scrollDirection: 'up',
        autoActivate: true,
        pauseOnMouseOver: true,
        nextControl: null,
        previousControl: null,
        startControl: null,
        stopControl: null,
        onItemMoved: $.noop,
        onMovingUp: $.noop,
        onMovingDown: $.noop,
        onStarted: $.noop,
        onStopped: $.noop,
        onPaused: $.noop,
        onResumed: $.noop
    };

    class ContentScroller {
        constructor(domElement, customSettings) {
            this.targetNode = domElement;
            this.targetJQueryElement = $(domElement);
            this.settings = { ...INITIAL_CONFIGURATION, ...customSettings };
            this.animationTimer = null;
            this.currentStatus = 0; // 0: stopped, 1: running
            this.isPaused = false;
            this.isAnimating = false;

            this.scrollDirectionMap = {
                'up': {
                    next: this.scrollUp,
                    previous: this.scrollDown
                },
                'down': {
                    next: this.scrollDown,
                    previous: this.scrollUp
                }
            };

            if (this.targetJQueryElement.is('ul')) {
                this.initialize();
            }
        }

        initialize() {
            this.targetJQueryElement.height(this.settings.itemHeight * this.settings.visibleItemsCount)
                                    .css({ overflow: 'hidden' });

            this.validateTimings();

            if (this.settings.nextControl && this.settings.nextControl.length) {
                this.settings.nextControl.on('click', () => {
                    this.shiftNext();
                    this.refreshTimer();
                });
            }
            if (this.settings.previousControl && this.settings.previousControl.length) {
                this.settings.previousControl.on('click', () => {
                    this.shiftPrevious();
                    this.refreshTimer();
                });
            }
            if (this.settings.stopControl && this.settings.stopControl.length) {
                this.settings.stopControl.on('click', () => this.haltMotion());
            }
            if (this.settings.startControl && this.settings.startControl.length) {
                this.settings.startControl.on('click', () => this.beginMotion());
            }

            if (this.settings.pauseOnMouseOver) {
                this.targetJQueryElement.hover(
                    () => { if (this.currentStatus) this.suspendMotion(); },
                    () => { if (this.currentStatus) this.resumeMotion(); }
                );
            }

            if (this.settings.autoActivate) {
                this.beginMotion();
            }
        }

        beginMotion() {
            if (!this.currentStatus) {
                this.currentStatus = 1;
                this.refreshTimer();
                this.settings.onStarted();
            }
        }

        haltMotion() {
            if (this.currentStatus) {
                clearInterval(this.animationTimer);
                this.currentStatus = 0;
                this.settings.onStopped();
            }
        }

        refreshTimer() {
            if (this.currentStatus) {
                clearInterval(this.animationTimer);
                this.animationTimer = setInterval(() => this.advanceContent(), this.settings.displayInterval);
            }
        }

        advanceContent() {
            if (!this.isPaused) this.shiftNext();
        }

        shiftNext() {
            this.scrollDirectionMap[this.settings.scrollDirection].next.call(this);
        }

        shiftPrevious() {
            this.scrollDirectionMap[this.settings.scrollDirection].previous.call(this);
        }

        suspendMotion() {
            if (!this.isPaused) this.isPaused = true;
            this.settings.onPaused();
        }

        resumeMotion() {
            if (this.isPaused) this.isPaused = false;
            this.settings.onResumed();
        }

        scrollDown() {
            if (!this.isAnimating) {
                this.isAnimating = true;
                this.settings.onMovingDown();
                const lastItem = this.targetJQueryElement.children('li:last');
                lastItem.detach().prependTo(this.targetJQueryElement).css('marginTop', '-' + this.settings.itemHeight + 'px')
                    .animate({ marginTop: '0px' }, this.settings.animationDuration, () => {
                        this.isAnimating = false;
                        this.settings.onItemMoved();
                    });
            }
        }

        scrollUp() {
            if (!this.isAnimating) {
                this.isAnimating = true;
                this.settings.onMovingUp();
                const firstItem = this.targetJQueryElement.children('li:first');
                firstItem.animate({ marginTop: '-' + this.settings.itemHeight + 'px' }, this.settings.animationDuration,
                    () => {
                        firstItem.detach().css('marginTop', '0').appendTo(this.targetJQueryElement);
                        this.isAnimating = false;
                        this.settings.onItemMoved();
                    });
            }
        }

        modifySetting(property, value) {
            if (Object.prototype.hasOwnProperty.call(this.settings, property)) {
                this.settings[property] = value;
                if (property === 'displayInterval' || property === 'animationDuration') {
                    this.validateTimings();
                    this.refreshTimer();
                }
            }
        }

        fetchStatus() {
            return this.isPaused ? 2 : this.currentStatus;
        }

        validateTimings() {
            if (this.settings.displayInterval < (this.settings.animationDuration + 25)) {
                this.settings.animationDuration = this.settings.displayInterval - 25;
            }
        }

        dispose() {
            if (this.settings.nextControl && this.settings.nextControl.length) {
                this.settings.nextControl.off('click');
            }
            if (this.settings.previousControl && this.settings.previousControl.length) {
                this.settings.previousControl.off('click');
            }
            if (this.settings.stopControl && this.settings.stopControl.length) {
                this.settings.stopControl.off('click');
            }
            if (this.settings.startControl && this.settings.startControl.length) {
                this.settings.startControl.off('click');
            }
            if (this.settings.pauseOnMouseOver) {
                this.targetJQueryElement.off('mouseenter mouseleave');
            }
            clearInterval(this.animationTimer);
            this.targetJQueryElement.removeData(`widget_${WIDGET_IDENTIFIER}`);
        }
    }

    $.fn[WIDGET_IDENTIFIER] = function(operation) {
        const suppliedArgs = arguments;

        return this.each(function() {
            let instance = $.data(this, `widget_${WIDGET_IDENTIFIER}`);
            const operationType = typeof operation;

            if (!instance) {
                if (operationType === 'object' || !operation) {
                    instance = new ContentScroller(this, operation);
                    $.data(this, `widget_${WIDGET_IDENTIFIER}`, instance);
                } else {
                    $.error(`Widget "${WIDGET_IDENTIFIER}" has not been initialized on this element.`);
                    return;
                }
            }

            if (operationType === 'string' && typeof instance[operation] === 'function' && operation[0] !== '_') {
                instance[operation].apply(instance, Array.prototype.slice.call(suppliedArgs, 1));
            } else if (operationType === 'string' && operation[0] === '_') {
                $.error(`Access to private method '${operation}' is not allowed.`);
            } else if (operationType === 'string') {
                $.error(`Method '${operation}' does not exist on jQuery.${WIDGET_IDENTIFIER}`);
            }
        });
    };

})(jQuery);