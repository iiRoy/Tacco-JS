const DomAnimator = {};

DomAnimator.mergeObjects = function(...sources) {
    const target = {};
    for (const source of sources) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof target[key] === 'object' && target[key] !== null &&
                    typeof source[key] === 'object' && source[key] !== null &&
                    !Array.isArray(target[key]) && !Array.isArray(source[key])) {
                    target[key] = DomAnimator.mergeObjects(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
};

DomAnimator.forEach = function(collection, callback) {
    if (!collection) return;
    if (collection.length !== undefined && typeof collection !== 'string') {
        for (let i = 0; i < collection.length; i++) {
            callback.call(collection[i], collection[i], i, collection);
        }
    } else {
        for (const key in collection) {
            if (Object.prototype.hasOwnProperty.call(collection, key)) {
                callback.call(collection[key], collection[key], key, collection);
            }
        }
    }
};

DomAnimator.select = function(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
};

DomAnimator.getAttribute = function(element, name) {
    return element.getAttribute(name);
};
DomAnimator.getData = function(element, name) {
    return element.dataset[DomAnimator.camelCase(name)];
};

DomAnimator.setStyle = function(element, property, value) {
    element.style[DomAnimator.camelCase(property)] = value;
};
DomAnimator.getStyle = function(element, property) {
    return window.getComputedStyle(element)[DomAnimator.camelCase(property)];
};

DomAnimator.getOuterWidth = function(element) {
    return element.offsetWidth;
};
DomAnimator.getInnerWidth = function(element) {
    return element.clientWidth;
};
DomAnimator.getHeight = function(element) {
    return element.offsetHeight;
};

DomAnimator.getOffset = function(element) {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset
    };
};

DomAnimator.getParent = function(element) {
    return element.parentNode;
};

DomAnimator.getSiblings = function(element, selector = null) {
    const siblings = [];
    let sibling = element.parentNode.firstChild;
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== element) {
            if (!selector || sibling.matches(selector)) {
                siblings.push(sibling);
            }
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
};

DomAnimator.findChildren = function(element, selector) {
    return Array.from(element.querySelectorAll(selector));
};

DomAnimator.hasClass = function(element, className) {
    return element.classList.contains(className);
};
DomAnimator.addClass = function(element, className) {
    element.classList.add(className);
};
DomAnimator.removeClass = function(element, className) {
    element.classList.remove(className);
};
DomAnimator.toggleClass = function(element, className) {
    element.classList.toggle(className);
};

DomAnimator.on = function(element, eventType, selector, callback) {
    if (typeof selector === 'function') {
        element.addEventListener(eventType, selector);
    } else {
        element.addEventListener(eventType, function(event) {
            const target = event.target;
            if (target.matches(selector)) {
                callback.call(target, event);
            } else {
                const closestMatch = target.closest(selector);
                if (closestMatch && element.contains(closestMatch)) {
                    callback.call(closestMatch, event);
                }
            }
        });
    }
};
DomAnimator.off = function(element, eventType, callback) {
    element.removeEventListener(eventType, callback);
};

DomAnimator.detachElement = function(element) {
    if (element.parentNode) {
        element.parentNode.removeChild(element);
    }
};
DomAnimator.appendToBody = function(element) {
    document.body.appendChild(element);
};

DomAnimator.camelCase = function(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

DomAnimator.Curves = {
    def: 'outQuad',
    swing: function(prog, currTime, beginVal, changeVal, totalDur) {
        return DomAnimator.Curves[DomAnimator.Curves.def](prog, currTime, beginVal, changeVal, totalDur);
    },
    inQuad: function(prog, currTime, beginVal, changeVal, totalDur) {
        return changeVal * (currTime /= totalDur) * currTime + beginVal;
    },
    outQuad: function(prog, currTime, beginVal, changeVal, totalDur) {
        return -changeVal * (currTime /= totalDur) * (currTime - 2) + beginVal;
    },
    easeInOutQuad: function(prog, currTime, beginVal, changeVal, totalDur) {
        if ((currTime /= totalDur / 2) < 1) return changeVal / 2 * currTime * currTime + beginVal;
        return -changeVal / 2 * ((--currTime) * (currTime - 2) - 1) + beginVal;
    },
    inCubic: function(prog, currTime, beginVal, changeVal, totalDur) {
        return changeVal * (currTime /= totalDur) * currTime * currTime + beginVal;
    },
    outCubic: function(prog, currTime, beginVal, changeVal, totalDur) {
        return changeVal * ((currTime = currTime / totalDur - 1) * currTime * currTime + 1) + beginVal;
    },
    easeInOutCubic: function(prog, currTime, beginVal, changeVal, totalDur) {
        if ((currTime /= totalDur / 2) < 1) return changeVal / 2 * currTime * currTime * currTime + beginVal;
        return changeVal / 2 * ((currTime -= 2) * currTime * currTime + 2) + beginVal;
    },
    inQuart: function(prog, currTime, beginVal, changeVal, totalDur) {
        return changeVal * (currTime /= totalDur) * currTime * currTime * currTime + beginVal;
    },
    outQuart: function(prog, currTime, beginVal, changeVal, totalDur) {
        return -changeVal * ((currTime = currTime / totalDur - 1) * currTime * currTime * currTime - 1) + beginVal;
    },
    easeInOutQuart: function(prog, currTime, beginVal, changeVal, totalDur) {
        if ((currTime /= totalDur / 2) < 1) return changeVal / 2 * currTime * currTime * currTime * currTime + beginVal;
        return -changeVal / 2 * ((currTime -= 2) * currTime * currTime * currTime - 2) + beginVal;
    },
    inQuint: function(prog, currTime, beginVal, changeVal, totalDur) {
        return changeVal * (currTime /= totalDur) * currTime * currTime * currTime * currTime + beginVal;
    },
    outQuint: function(prog, currTime, beginVal, changeVal, totalDur) {
        return changeVal * ((currTime = currTime / totalDur - 1) * currTime * currTime * currTime * currTime + 1) + beginVal;
    },
    easeInOutQuint: function(prog, currTime, beginVal, changeVal, totalDur) {
        if ((currTime /= totalDur / 2) < 1) return changeVal / 2 * currTime * currTime * currTime * currTime * currTime + beginVal;
        return changeVal / 2 * ((currTime -= 2) * currTime * currTime * currTime * currTime + 2) + beginVal;
    },
    inSine: function(prog, currTime, beginVal, changeVal, totalDur) {
        return -changeVal * Math.cos(currTime / totalDur * (Math.PI / 2)) + changeVal + beginVal;
    },
    outSine: function(prog, currTime, beginVal, changeVal, totalDur) {
        return changeVal * Math.sin(currTime / totalDur * (Math.PI / 2)) + beginVal;
    },
    easeInOutSine: function(prog, currTime, beginVal, changeVal, totalDur) {
        return -changeVal / 2 * (Math.cos(Math.PI * currTime / totalDur) - 1) + beginVal;
    },
    inExpo: function(prog, currTime, beginVal, changeVal, totalDur) {
        return (currTime == 0) ? beginVal : changeVal * Math.pow(2, 10 * (currTime / totalDur - 1)) + beginVal;
    },
    outExpo: function(prog, currTime, beginVal, changeVal, totalDur) {
        return (currTime == totalDur) ? beginVal + changeVal : changeVal * (-Math.pow(2, -10 * currTime / totalDur) + 1) + beginVal;
    },
    easeInOutExpo: function(prog, currTime, beginVal, changeVal, totalDur) {
        if (currTime == 0) return beginVal;
        if (currTime == totalDur) return beginVal + changeVal;
        if ((currTime /= totalDur / 2) < 1) return changeVal / 2 * Math.pow(2, 10 * (currTime - 1)) + beginVal;
        return changeVal / 2 * (-Math.pow(2, -10 * --currTime) + 2) + beginVal;
    },
    inCirc: function(prog, currTime, beginVal, changeVal, totalDur) {
        return -changeVal * (Math.sqrt(1 - (currTime /= totalDur) * currTime) - 1) + beginVal;
    },
    outCirc: function(prog, currTime, beginVal, changeVal, totalDur) {
        return changeVal * Math.sqrt(1 - (currTime = currTime / totalDur - 1) * currTime) + beginVal;
    },
    easeInOutCirc: function(prog, currTime, beginVal, changeVal, totalDur) {
        if ((currTime /= totalDur / 2) < 1) return -changeVal / 2 * (Math.sqrt(1 - currTime * currTime) - 1) + beginVal;
        return changeVal / 2 * (Math.sqrt(1 - (currTime -= 2) * currTime) + 1) + beginVal;
    },
    inElastic: function(prog, currTime, beginVal, changeVal, totalDur) {
        var s = 1.70158;
        var p = 0;
        var a = changeVal;
        if (currTime == 0) return beginVal;
        if ((currTime /= totalDur) == 1) return beginVal + changeVal;
        if (!p) p = totalDur * .3;
        if (a < Math.abs(changeVal)) {
            a = changeVal;
            var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(changeVal / a);
        return -(a * Math.pow(2, 10 * (currTime -= 1)) * Math.sin((currTime * totalDur - s) * (2 * Math.PI) / p)) + beginVal;
    },
    outElastic: function(prog, currTime, beginVal, changeVal, totalDur) {
        var s = 1.70158;
        var p = 0;
        var a = changeVal;
        if (currTime == 0) return beginVal;
        if ((currTime /= totalDur) == 1) return beginVal + changeVal;
        if (!p) p = totalDur * .3;
        if (a < Math.abs(changeVal)) {
            a = changeVal;
            var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(changeVal / a);
        return a * Math.pow(2, -10 * currTime) * Math.sin((currTime * totalDur - s) * (2 * Math.PI) / p) + changeVal + beginVal;
    },
    easeInOutElastic: function(prog, currTime, beginVal, changeVal, totalDur) {
        var s = 1.70158;
        var p = 0;
        var a = changeVal;
        if (currTime == 0) return beginVal;
        if ((currTime /= totalDur / 2) == 2) return beginVal + changeVal;
        if (!p) p = totalDur * (.3 * 1.5);
        if (a < Math.abs(changeVal)) {
            a = changeVal;
            var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(changeVal / a);
        if (currTime < 1) return -.5 * (a * Math.pow(2, 10 * (currTime -= 1)) * Math.sin((currTime * totalDur - s) * (2 * Math.PI) / p)) + beginVal;
        return a * Math.pow(2, -10 * (currTime -= 1)) * Math.sin((currTime * totalDur - s) * (2 * Math.PI) / p) * .5 + changeVal + beginVal;
    },
    inBack: function(prog, currTime, beginVal, changeVal, totalDur, s) {
        if (s == undefined) s = 1.70158;
        return changeVal * (currTime /= totalDur) * currTime * ((s + 1) * currTime - s) + beginVal;
    },
    outBack: function(prog, currTime, beginVal, changeVal, totalDur, s) {
        if (s == undefined) s = 1.70158;
        return changeVal * ((currTime = currTime / totalDur - 1) * currTime * ((s + 1) * currTime + s) + 1) + beginVal;
    },
    easeInOutBack: function(prog, currTime, beginVal, changeVal, totalDur, s) {
        if (s == undefined) s = 1.70158;
        if ((currTime /= totalDur / 2) < 1) return changeVal / 2 * (currTime * currTime * (((s *= (1.525)) + 1) * currTime - s)) + beginVal;
        return changeVal / 2 * ((currTime -= 2) * currTime * (((s *= (1.525)) + 1) * currTime + s) + 2) + beginVal;
    },
    inBounce: function(prog, currTime, beginVal, changeVal, totalDur) {
        return changeVal - DomAnimator.Curves.outBounce(prog, totalDur - currTime, 0, changeVal, totalDur) + beginVal;
    },
    outBounce: function(prog, currTime, beginVal, changeVal, totalDur) {
        if ((currTime /= totalDur) < (1 / 2.75)) {
            return changeVal * (7.5625 * currTime * currTime) + beginVal;
        } else if (currTime < (2 / 2.75)) {
            return changeVal * (7.5625 * (currTime -= (1.5 / 2.75)) * currTime + .75) + beginVal;
        } else if (currTime < (2.5 / 2.75)) {
            return changeVal * (7.5625 * (currTime -= (2.25 / 2.75)) * currTime + .9375) + beginVal;
        } else {
            return changeVal * (7.5625 * (currTime -= (2.625 / 2.75)) * currTime + .984375) + beginVal;
        }
    },
    easeInOutBounce: function(prog, currTime, beginVal, changeVal, totalDur) {
        if (currTime < totalDur / 2) return DomAnimator.Curves.inBounce(prog, currTime * 2, 0, changeVal, totalDur) * .5 + beginVal;
        return DomAnimator.Curves.outBounce(prog, currTime * 2 - totalDur, 0, changeVal, totalDur) * .5 + changeVal * .5 + beginVal;
    }
};

DomAnimator.animationData = new WeakMap();
DomAnimator.activeAnimations = [];
DomAnimator.isAnimating = false;
DomAnimator.animationFrameId = null;

DomAnimator.startAnimationLoop = function() {
    if (DomAnimator.isAnimating) return;
    DomAnimator.isAnimating = true;
    DomAnimator.animationFrameId = requestAnimationFrame(DomAnimator.animationTick);
};

DomAnimator.stopAnimationLoop = function() {
    if (!DomAnimator.isAnimating) return;
    cancelAnimationFrame(DomAnimator.animationFrameId);
    DomAnimator.isAnimating = false;
    DomAnimator.animationFrameId = null;
};

DomAnimator.dequeueAnimation = function(element) {
    const state = DomAnimator.animationData.get(element);
    if (!state || state.queue.length === 0) {
        return;
    }

    state.queue.shift();
    if (state.queue.length > 0) {
        const nextAnim = state.queue[0];
        nextAnim.started = false;
        DomAnimator.activeAnimations.push(nextAnim);
        DomAnimator.startAnimationLoop();
    }
};

DomAnimator.animationTick = function(currentTime) {
    const animationsToRemove = [];

    for (let i = 0; i < DomAnimator.activeAnimations.length; i++) {
        const anim = DomAnimator.activeAnimations[i];
        const element = anim.element;
        const state = DomAnimator.animationData.get(element);

        if (!state) {
            animationsToRemove.push(anim);
            continue;
        }

        if (!anim.started) {
            anim.startTime = currentTime;
            anim.started = true;
        }

        if (currentTime < anim.startTime + anim.delay) {
            continue;
        }

        const elapsed = currentTime - (anim.startTime + anim.delay);
        const progress = Math.min(elapsed / anim.duration, 1);
        
        const easedValue = DomAnimator.Curves[anim.easing](progress, elapsed, 0, 1, anim.duration);

        for (const prop in anim.properties) {
            const startVal = anim.properties[prop].start;
            const endVal = anim.properties[prop].end;
            let unit = anim.properties[prop].unit || '';

            let currentValue = startVal + (endVal - startVal) * easedValue;
            
            if (prop === 'height') {
                if (startVal === 0 && DomAnimator.getStyle(element, 'display') === 'none') {
                    DomAnimator.setStyle(element, 'display', 'block');
                }
                if (endVal === 0 && progress === 1) {
                    DomAnimator.setStyle(element, 'display', 'none');
                }
            }
            DomAnimator.setStyle(element, prop, currentValue + unit);
        }

        if (progress === 1) {
            if (anim.complete) {
                anim.complete.call(element);
            }
            animationsToRemove.push(anim);
            if (anim.queue === true) {
                DomAnimator.dequeueAnimation(element);
            }
        }
    }

    DomAnimator.activeAnimations = DomAnimator.activeAnimations.filter(anim => !animationsToRemove.includes(anim));

    if (DomAnimator.activeAnimations.length > 0) {
        DomAnimator.animationFrameId = requestAnimationFrame(DomAnimator.animationTick);
    } else {
        DomAnimator.isAnimating = false;
    }
};

DomAnimator.animate = function(elements, properties, options) {
    const defaultOptions = {
        duration: 400,
        easing: 'swing',
        complete: null,
        queue: true,
        delay: 0
    };
    const opts = DomAnimator.mergeObjects(defaultOptions, options);

    DomAnimator.forEach(elements, (element) => {
        let state = DomAnimator.animationData.get(element);
        if (!state) {
            state = { queue: [] };
            DomAnimator.animationData.set(element, state);
        }

        const animationTask = {
            element: element,
            properties: {},
            duration: opts.duration,
            easing: opts.easing,
            complete: opts.complete,
            delay: opts.delay,
            startTime: 0,
            started: false,
            queue: opts.queue
        };

        for (const prop in properties) {
            let startVal = parseFloat(DomAnimator.getStyle(element, prop));
            let endVal = properties[prop];
            let unit = '';

            if (prop === 'height') {
                if (endVal === 'auto') {
                    const originalDisplay = DomAnimator.getStyle(element, 'display');
                    DomAnimator.setStyle(element, 'display', 'block');
                    const measuredHeight = element.scrollHeight;
                    DomAnimator.setStyle(element, 'display', originalDisplay);
                    endVal = measuredHeight;
                    unit = 'px';
                    startVal = (DomAnimator.getStyle(element, 'display') === 'none' || DomAnimator.getStyle(element, 'height') === '0px') ? 0 : parseFloat(DomAnimator.getStyle(element, 'height')) || measuredHeight;
                } else if (typeof endVal === 'string' && endVal.endsWith('px')) {
                    endVal = parseFloat(endVal);
                    unit = 'px';
                } else {
                    endVal = parseFloat(endVal);
                    unit = 'px';
                }
            } else if (prop === 'opacity') {
                unit = '';
                endVal = parseFloat(endVal);
            } else if (typeof endVal === 'string' && (endVal.endsWith('px') || endVal.endsWith('%') || endVal.endsWith('em') || endVal.endsWith('rem'))) {
                unit = endVal.match(/[a-z%]+$/i)?.[0] || '';
                endVal = parseFloat(endVal);
            } else {
                endVal = parseFloat(endVal);
                const currentUnitMatch = DomAnimator.getStyle(element, prop).match(/[a-z%]+$/i);
                unit = currentUnitMatch ? currentUnitMatch[0] : '';
            }

            animationTask.properties[prop] = {
                start: startVal,
                end: endVal,
                unit: unit
            };
        }

        if (opts.queue === false) {
            DomAnimator.activeAnimations = DomAnimator.activeAnimations.filter(
                a => a.element !== element
            );
            state.queue = [];
            
            DomAnimator.activeAnimations.push(animationTask);
            DomAnimator.startAnimationLoop();
        } else {
            state.queue.push(animationTask);
            const isElementCurrentlyAnimating = DomAnimator.activeAnimations.some(a => a.element === element);
            if (!isElementCurrentlyAnimating && state.queue[0] === animationTask) {
                DomAnimator.activeAnimations.push(animationTask);
                DomAnimator.startAnimationLoop();
            }
        }
    });
};

DomAnimator.initCollapsible = function(elements, config) {
    const defaults = {
        accordion: undefined
    };
    const options = DomAnimator.mergeObjects(defaults, config);

    DomAnimator.forEach(elements, (container) => {
        const headerSelector = '.collapsible-header';
        const bodySelector = '.collapsible-body';

        const containerType = DomAnimator.getData(container, 'collapsible');
        const isAccordion = options.accordion || containerType === 'accordion' || containerType === undefined;

        const currentHeaders = DomAnimator.select(headerSelector, container);
        DomAnimator.forEach(currentHeaders, (header) => {
             const clonedHeader = header.cloneNode(true);
             header.parentNode.replaceChild(clonedHeader, header);
        });

        const updatedHeaders = DomAnimator.select(headerSelector, container);

        const handleCollapsibleItem = (headerElement) => {
            const parentItem = DomAnimator.getParent(headerElement);
            const bodyElement = DomAnimator.getSiblings(headerElement, bodySelector)[0];

            if (!bodyElement) return;

            DomAnimator.animate([bodyElement], {}, { duration: 0, queue: false });

            DomAnimator.toggleClass(parentItem, 'active');

            if (DomAnimator.hasClass(parentItem, 'active')) {
                DomAnimator.setStyle(bodyElement, 'display', 'block');
                DomAnimator.animate([bodyElement], { height: 'auto' }, { duration: 350, easing: "outQuart", queue: false, complete: () => {
                    DomAnimator.setStyle(bodyElement, 'height', '');
                    DomAnimator.setStyle(bodyElement, 'overflow', '');
                }});
            } else {
                DomAnimator.animate([bodyElement], { height: 0 }, { duration: 350, easing: "outQuart", queue: false, complete: () => {
                    DomAnimator.setStyle(bodyElement, 'display', 'none');
                    DomAnimator.setStyle(bodyElement, 'height', '');
                    DomAnimator.setStyle(bodyElement, 'overflow', '');
                }});
            }

            if (isAccordion) {
                DomAnimator.forEach(updatedHeaders, (otherHeader) => {
                    if (otherHeader !== headerElement) {
                        const otherParentItem = DomAnimator.getParent(otherHeader);
                        const otherBodyElement = DomAnimator.getSiblings(otherHeader, bodySelector)[0];
                        if (DomAnimator.hasClass(otherParentItem, 'active')) {
                            DomAnimator.animate([otherBodyElement], {}, { duration: 0, queue: false });

                            DomAnimator.removeClass(otherParentItem, 'active');
                            if (otherBodyElement) {
                                DomAnimator.animate([otherBodyElement], { height: 0 }, { duration: 350, easing: "outQuart", queue: false, complete: () => {
                                    DomAnimator.setStyle(otherBodyElement, 'display', 'none');
                                    DomAnimator.setStyle(otherBodyElement, 'height', '');
                                    DomAnimator.setStyle(otherBodyElement, 'overflow', '');
                                }});
                            }
                        }
                    }
                });
            }
        };

        DomAnimator.on(container, 'click', headerSelector, (event) => {
            handleCollapsibleItem(event.currentTarget);
        });

        DomAnimator.forEach(DomAnimator.select(headerSelector, container), (header) => {
            const parentItem = DomAnimator.getParent(header);
            const bodyElement = DomAnimator.getSiblings(header, bodySelector)[0];
            if (bodyElement) {
                if (DomAnimator.hasClass(parentItem, 'active')) {
                    DomAnimator.setStyle(bodyElement, 'display', 'block');
                    DomAnimator.setStyle(bodyElement, 'height', 'auto');
                } else {
                    DomAnimator.setStyle(bodyElement, 'display', 'none');
                    DomAnimator.setStyle(bodyElement, 'height', '0px');
                }
            }
        });
    });
};

DomAnimator.initDropdown = function(elements, config) {
    const defaults = {
        inDuration: 300,
        outDuration: 225,
        constrainWidth: true,
        hover: true,
        alignment: 'left',
        gutter: 0,
    };

    DomAnimator.forEach(elements, (activatorElement) => {
        const options = DomAnimator.mergeObjects(defaults, config);

        const dropdownId = DomAnimator.getAttribute(activatorElement, 'data-activates');
        if (!dropdownId) return;

        const dropdownElement = document.getElementById(dropdownId);
        if (!dropdownElement) return;

        const refreshOptions = () => {
            if (DomAnimator.getData(activatorElement, 'inDuration') !== undefined)
                options.inDuration = parseInt(DomAnimator.getData(activatorElement, 'inDuration'));
            if (DomAnimator.getData(activatorElement, 'outDuration') !== undefined)
                options.outDuration = parseInt(DomAnimator.getData(activatorElement, 'outDuration'));
            if (DomAnimator.getData(activatorElement, 'constrainwidth') !== undefined)
                options.constrainWidth = DomAnimator.getData(activatorElement, 'constrainwidth') === 'true';
            if (DomAnimator.getData(activatorElement, 'hover') !== undefined)
                options.hover = DomAnimator.getData(activatorElement, 'hover') === 'true';
            if (DomAnimator.getData(activatorElement, 'alignment') !== undefined)
                options.alignment = DomAnimator.getData(activatorElement, 'alignment');
            if (DomAnimator.getData(activatorElement, 'gutter') !== undefined)
                options.gutter = parseInt(DomAnimator.getData(activatorElement, 'gutter'));
        };

        refreshOptions();

        if (DomAnimator.getParent(dropdownElement) !== document.body) {
            DomAnimator.detachElement(dropdownElement);
            DomAnimator.appendToBody(dropdownElement);
        }

        const isFixedPositioned = (element) => {
            let current = element;
            while (current && current !== document.body) {
                if (DomAnimator.getStyle(current, 'position') === 'fixed') {
                    return true;
                }
                current = DomAnimator.getParent(current);
            }
            return false;
        };

        const positionDropdown = () => {
            refreshOptions();

            const dropdownRealHeight = dropdownElement.scrollHeight;
            DomAnimator.setStyle(dropdownElement, 'height', '0px');
            DomAnimator.setStyle(dropdownElement, 'opacity', '0');
            DomAnimator.setStyle(dropdownElement, 'display', 'block');

            if (options.constrainWidth) {
                DomAnimator.setStyle(dropdownElement, 'width', DomAnimator.getOuterWidth(activatorElement) + 'px');
            }

            let widthDifference = 0;
            let gutterSpacing = options.gutter;
            if (options.alignment === 'right') {
                widthDifference = DomAnimator.getInnerWidth(activatorElement) - DomAnimator.getInnerWidth(dropdownElement);
                gutterSpacing = gutterSpacing * -1;
            }

            const activatorOffset = DomAnimator.getOffset(activatorElement);

            if (isFixedPositioned(activatorElement)) {
                DomAnimator.setStyle(dropdownElement, 'position', 'fixed');
                DomAnimator.setStyle(dropdownElement, 'top', (activatorOffset.top - window.pageYOffset) + 'px');
                DomAnimator.setStyle(dropdownElement, 'left', (activatorOffset.left + widthDifference + gutterSpacing) + 'px');
            } else {
                DomAnimator.setStyle(dropdownElement, 'position', 'absolute');
                DomAnimator.setStyle(dropdownElement, 'top', activatorOffset.top + 'px');
                DomAnimator.setStyle(dropdownElement, 'left', (activatorOffset.left + widthDifference + gutterSpacing) + 'px');
            }

            DomAnimator.animate([dropdownElement], {}, { duration: 0, queue: false });

            DomAnimator.animate([dropdownElement], { opacity: 1 }, { duration: options.inDuration, queue: false, easing: 'outQuad' });
            DomAnimator.animate([dropdownElement], { height: dropdownRealHeight }, {
                duration: options.inDuration,
                queue: false,
                easing: 'outCubic',
                complete: () => {
                    DomAnimator.setStyle(dropdownElement, 'overflowY', 'auto');
                }
            });
        };

        const hideDropdown = () => {
            DomAnimator.animate([dropdownElement], {}, { duration: 0, queue: false });

            DomAnimator.animate([dropdownElement], { opacity: 0 }, {
                duration: options.outDuration,
                easing: 'outQuad',
                queue: false,
                complete: () => {
                    DomAnimator.setStyle(dropdownElement, 'display', 'none');
                    DomAnimator.setStyle(dropdownElement, 'overflowY', '');
                    DomAnimator.setStyle(dropdownElement, 'height', '0px');
                }
            });
        };

        if (options.hover) {
            DomAnimator.on(activatorElement, 'mouseover', positionDropdown);
            DomAnimator.on(dropdownElement, 'mouseleave', hideDropdown);
        } else {
            let documentClickHandler = null;

            const activatorClickHandler = (event) => {
                event.preventDefault();
                event.stopPropagation();
                positionDropdown();

                if (documentClickHandler) {
                    document.removeEventListener('click', documentClickHandler);
                }

                documentClickHandler = (docEvent) => {
                    if (!dropdownElement.contains(docEvent.target) && !activatorElement.contains(docEvent.target)) {
                        hideDropdown();
                        document.removeEventListener('click', documentClickHandler);
                        documentClickHandler = null;
                    }
                };
                document.addEventListener('click', documentClickHandler);
            };

            DomAnimator.on(activatorElement, 'click', activatorClickHandler);
        }

        DomAnimator.on(window, 'resize', () => {
            if (DomAnimator.getStyle(dropdownElement, 'display') === 'block') {
                positionDropdown();
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    DomAnimator.initCollapsible(DomAnimator.select('.collapsible'));
    DomAnimator.initDropdown(DomAnimator.select('.dropdown-button'));
});