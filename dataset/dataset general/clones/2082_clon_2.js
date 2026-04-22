(function (jqHandle) {
    'use strict';

    // Defines various interaction events for drag and drop operations
    var motionEvents = {
        move: 'pointermove touchmove',
        moveBegin: 'pointerdown touchstart',
        moveEnd: 'pointerup touchend',
        selectionStart: 'selectionstart'
    };

    // CSS class names used for styling different states and components
    var visualTags = {
        reorderingActive: 'reorder-active',
        draggableUnit: 'draggable-unit',
        grabber: 'grab-handle',
        phantomCopy: 'ghost-copy',
        currentlyActive: 'active-draggable'
    };

    var docBodyEl = jqHandle(document.body);
    var throttleDelayMs = 3;

    /**
     * Prevents a function from being called too frequently.
     * @param {Function} callbackFn The function to debounce.
     * @param {number} delayTime The delay in milliseconds.
     * @param {boolean} executeImmediately If true, call the function immediately, otherwise after the delay.
     * @returns {Function} The debounced function.
     */
    function rateLimit(callbackFn, delayTime, executeImmediately) {
        var timerId;
        return function () {
            var thisContext = this, functionArguments = arguments;
            var deferredExecution = function () {
                timerId = null;
                if (!executeImmediately) {
                    callbackFn.apply(thisContext, functionArguments);
                }
            };
            var shouldCallNow = executeImmediately && !timerId;
            clearTimeout(timerId);
            timerId = setTimeout(deferredExecution, delayTime);
            if (shouldCallNow) {
                callbackFn.apply(thisContext, functionArguments);
            }
        };
    }

    /**
     * Constructor for the DraggableList component.
     * @param {jQuery} targetElement The jQuery element representing the container.
     * @param {Object} configuration Options for the draggable list.
     */
    function DraggableList(targetElement, configuration) {
        this.config = jqHandle.extend({
            components: '.draggable',
            grips: null,
            zOrder: '9000',
            allowHorizontal: true,
            allowVertical: true,
            onItemReordered: null,
            onMoveBegin: null,
            onItemMoving: null,
            onMoveEnd: null
        }, configuration);

        var uniqueId = targetElement.scope().$id;

        this.styleClasses = {};
        for (var classNameKey in visualTags) {
            this.styleClasses[classNameKey] = visualTags[classNameKey] + '-' + uniqueId;
        }

        this.offsetXChange = 0;
        this.offsetYChange = 0;

        this.isActivated = null;
        this.currentEventState = null;
        this.mainContainer = jqHandle(targetElement);
        this.activeDraggable = null;

        this.updateLayout();
    }

    DraggableList.prototype.toggleActivation = function (activatedState) {
        this.isActivated = activatedState;
    };

    DraggableList.prototype.disposeHandlers = function () {
        docBodyEl.attr('user-select-disabled', this.initialBodyUnselectable)
            .off(motionEvents.moveEnd)
            .off(motionEvents.move)
            .off(motionEvents.selectionStart);

        this.getDraggableUnits().off(motionEvents.moveBegin);
    };

    DraggableList.prototype.getDraggableUnits = function () {
        return jqHandle(this.config.components, this.mainContainer);
    };

    DraggableList.prototype.updateLayout = function () {
        this.disposeHandlers();

        var instanceRef = this;
        var draggableElements = this.getDraggableUnits();

        draggableElements.addClass(instanceRef.styleClasses.draggableUnit);
        draggableElements.attr('user-select-disabled', 'true');

        if (this.isActivated) {
            if (!this.activeDraggable) {
                draggableElements.bind(motionEvents.moveBegin, function (evt) {
                    draggableElements.unbind(evt);
                    instanceRef.handleMoveBegin(evt);
                });
            }
        }
    };

    // Function to check for overlap and trigger reordering
    var assessOverlap = rateLimit(function (listContext, triggerEvent) {
        var draggableElements = listContext.getDraggableUnits();

        var startIndex = 0, endIndex = draggableElements.length;
        var currentItem;

        var currentTop = parseInt(listContext.movingElement.css('y-pos'), 10);
        var currentLeft = parseInt(listContext.movingElement.css('x-pos'), 10);
        var horizontalDelta = currentLeft - listContext.lastLeft;
        var verticalDelta = currentTop - listContext.lastTop;

        if (!listContext.config.allowHorizontal) {
            if (verticalDelta > 0) {
                startIndex = listContext.movingItemIndex + 1;
            } else if (verticalDelta < 0) {
                endIndex = listContext.movingItemIndex;
            } else {
                return;
            }
        } else if (!listContext.config.allowVertical) {
            if (horizontalDelta > 0) {
                startIndex = listContext.movingItemIndex + 1;
            } else if (horizontalDelta < 0) {
                endIndex = listContext.movingItemIndex;
            } else {
                return;
            }
        }

        for (; startIndex < endIndex; startIndex++) {
            currentItem = draggableElements[startIndex];
            if (startIndex === listContext.movingItemIndex) {
                continue;
            }

            if ((listContext.config.allowVertical &&
                currentTop > currentItem.offsetTop &&
                currentTop < currentItem.offsetTop + currentItem.offsetHeight) ||
                (listContext.config.allowHorizontal &&
                currentLeft > currentItem.offsetLeft &&
                currentLeft < currentItem.offsetLeft + currentItem.offsetWidth)) {
                listContext.config.onItemReordered(listContext.movingItemIndex, startIndex);
                listContext.movingItemIndex = startIndex;
                listContext.hasMoved = true;
                listContext.lastLeft = currentLeft;
                listContext.lastTop = currentTop;
                break;
            }
        }

    }, throttleDelayMs);

    DraggableList.prototype.handleMove = function (motionEvent) {
        if (motionEvent.isPropagationStopped()) {
            return;
        }

        this.config.onItemMoving(motionEvent);

        if (this.config.allowVertical) {
            this.movingElement.css('y-pos', '+=' + (motionEvent.clientY - this.currentEventState.clientY));
        }
        if (this.config.allowHorizontal) {
            this.movingElement.css('x-pos', '+=' + (motionEvent.clientX - this.currentEventState.clientX));
        }

        assessOverlap(this, motionEvent);

        this.currentEventState = motionEvent;
    };

    DraggableList.prototype.handleMoveBegin = function (startEvent) {
        if (startEvent.which !== 1 || startEvent.isPropagationStopped()) {
            return;
        }

        var instanceRef = this;
        this.hasMoved = false;
        var eventTarget = jqHandle(startEvent.target);
        var draggableElements = this.getDraggableUnits();

        if (this.config.grips) {
            draggableElements.find(this.config.grips).addClass(this.styleClasses.grabber);
            if (!eventTarget.closest('.' + this.styleClasses.grabber).length) {
                return;
            }
        }

        this.config.onMoveBegin(startEvent);

        startEvent.target = (function () {
            if (eventTarget.hasClass(instanceRef.styleClasses.draggableUnit)) {
                return startEvent.target;
            }
            else {
                return eventTarget.closest('.' + instanceRef.styleClasses.draggableUnit)[0];
            }
        })();

        instanceRef.initialBodyUnselectable = docBodyEl.attr('user-select-disabled');
        docBodyEl.attr('user-select-disabled', 'true');

        this.activeDraggable = jqHandle(startEvent.target).addClass(instanceRef.styleClasses.currentlyActive);
        var itemPosition = this.activeDraggable.position();

        instanceRef.movingItemIndex = Array.prototype.indexOf.call(draggableElements, instanceRef.activeDraggable[0]);

        this.initialTop = itemPosition.top;
        this.initialLeft = itemPosition.left;

        this.movingElement = jqHandle(startEvent.target).clone()
            .css({
                'z-order': this.config.zOrder,
                'elem-width': this.activeDraggable[0].offsetWidth,
                'elem-height': this.activeDraggable[0].offsetHeight,
                'y-pos': itemPosition.top,
                'x-pos': itemPosition.left
            })
            .removeClass(instanceRef.styleClasses.draggableUnit)
            .addClass(instanceRef.styleClasses.phantomCopy)
            .appendTo(startEvent.target.parentNode);

        this.mainContainer.addClass(instanceRef.styleClasses.reorderingActive);

        this.getDraggableUnits().off(motionEvents.moveBegin);

        docBodyEl.bind(motionEvents.move, function (e) {
            instanceRef.handleMove(e);
        })
            .bind(motionEvents.moveEnd, function (e) {
                docBodyEl.unbind(e);
                instanceRef.handleMoveEnd(e);
            })
            .bind(motionEvents.selectionStart, function (e) {
                e.preventDefault();
                return false;
            });

        this.currentEventState = startEvent;
    };

    DraggableList.prototype.handleMoveEnd = function (endEvent) {
        if (endEvent.isPropagationStopped()) {
            return;
        }

        var instanceRef = this;
        instanceRef.movingItemIndex = null;
        var draggableElements = this.getDraggableUnits();

        docBodyEl.attr('user-select-disabled', instanceRef.initialBodyUnselectable)
            .off(motionEvents.move)
            .off(motionEvents.moveEnd)
            .off(motionEvents.selectionStart);


        draggableElements.bind(motionEvents.moveBegin, function (evt) {
            draggableElements.unbind(evt);
            return instanceRef.handleMoveBegin(evt);
        });

        if (!this.hasMoved) {
            this.currentEventState.originalEvent.target.click();
        } else {
            this.config.onMoveEnd(endEvent);
        }

        this.activeDraggable.removeClass(this.styleClasses.currentlyActive);
        this.activeDraggable = null;

        this.mainContainer.removeClass(this.styleClasses.reorderingActive);

        this.movingElement.remove();
    };

    /**
     * Safely applies changes within an AngularJS scope.
     * @param {Object} angularScope The AngularJS scope.
     * @param {Function} updateFunction The function to execute within the scope.
     */
    var executeAngularScopeUpdate = function (angularScope, updateFunction) {
        var currentPhase = angularScope.$root.$$phase;
        if (currentPhase === '$apply' || currentPhase === '$digest') {
            if (updateFunction && (typeof (updateFunction) === 'function')) {
                updateFunction();
            }
        } else {
            angularScope.$root.$apply(updateFunction);
        }
    };

    // AngularJS module definition for reorderable widgets
    angular.module('reorderableWidgets', [])
        .factory('dragDropConfiguration', function () {
            return {};
        })
        .directive('reorderableList', ['dragDropConfiguration', function (dragDropConfiguration) {
            return {
                restrictionType: 'A',
                isolatedScope: {
                    reorderableList: '=',
                    motionOrientation: '@',
                    componentSelectors: '@',
                    grabPointSelectors: '@',
                    layerDepth: '@',
                    preventSorting: '=',
                    itemMovedCallback: '=',
                    onItemDrag: '=',
                    onDragInitiated: '=',
                    onDragFinished: '='
                },
                linkingFunction: function (scopeRef, elementRef, attributesRef) {
                    var dataItems = scopeRef.reorderableList;

                    if (!dataItems) {
                        dataItems = [];
                    }

                    function handleItemChange(sourceIndex, destinationIndex) {
                        executeAngularScopeUpdate(scopeRef, function () {
                            var removedItem = dataItems.splice(sourceIndex, 1);
                            dataItems.splice(destinationIndex, 0, removedItem[0]);
                            if (scopeRef.itemMovedCallback) {
                                scopeRef.itemMovedCallback(sourceIndex, destinationIndex);
                            } else if (dragDropConfiguration.onItemReordered) {
                                dragDropConfiguration.onItemReordered(sourceIndex, destinationIndex);
                            }
                        });
                    }

                    var movementDirection = scopeRef.motionOrientation || dragDropConfiguration.direction;
                    var widgetConfig = {
                        components: scopeRef.componentSelectors || dragDropConfiguration.components,
                        grips: scopeRef.grabPointSelectors || dragDropConfiguration.grips,
                        zOrder: scopeRef.layerDepth || dragDropConfiguration.zOrder,
                        onItemReordered: handleItemChange,
                        onItemMoving: scopeRef.onItemDrag || dragDropConfiguration.onItemMoving || jqHandle.noop,
                        onMoveBegin: scopeRef.onDragInitiated || dragDropConfiguration.onMoveBegin || jqHandle.noop,
                        onMoveEnd: scopeRef.onDragFinished || dragDropConfiguration.onMoveEnd || jqHandle.noop,
                        allowHorizontal: movementDirection !== 'vertical',
                        allowVertical: movementDirection !== 'horizontal'
                    };

                    var draggableInstance = new DraggableList(elementRef, widgetConfig);

                    scopeRef.$watch('preventSorting', function () {
                        draggableInstance.toggleActivation(!scopeRef.preventSorting);
                    });

                    scopeRef.$watch(function () {
                        return jqHandle('.' + draggableInstance.styleClasses.draggableUnit, elementRef).length;
                    }, function () {
                        draggableInstance.updateLayout();
                    });

                    elementRef.on('$destroy', function () {
                        console.log('reorderable-widget: cleanup');
                        draggableInstance.disposeHandlers();
                    });
                }
            };
        }]);

}(jQuery));