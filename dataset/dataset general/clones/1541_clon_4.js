const domSculptor = {
    imposeStyle: (targetNode, styleMap) => {
        for (const attribute in styleMap) {
            if (Object.prototype.hasOwnProperty.call(styleMap, attribute)) {
                targetNode.style[attribute] = styleMap[attribute];
            }
        }
    },
    addMark: (targetNode, markName) => {
        targetNode.classList.add(markName);
    },
    removeMark: (targetNode, markName) => {
        targetNode.classList.remove(markName);
    },
    findNearestAncestor: (startNode, query) => {
        if (!startNode || !startNode.closest) {
            return null;
        }
        return startNode.closest(query);
    },
    getAbsoluteTop: (targetNode) => {
        if (!targetNode) return 0;
        return targetNode.getBoundingClientRect().top + window.scrollY;
    },
    getTotalHeight: (targetNode) => {
        if (!targetNode) return 0;
        const computed = getComputedStyle(targetNode);
        const margins = parseInt(computed.marginTop, 10) + parseInt(computed.marginBottom, 10);
        return targetNode.offsetHeight + margins;
    },
    getTotalWidth: (targetNode) => {
        if (!targetNode) return 0;
        const computed = getComputedStyle(targetNode);
        const margins = parseInt(computed.marginLeft, 10) + parseInt(computed.marginRight, 10);
        return targetNode.offsetWidth + margins;
    },
    getInnerWidth: (targetNode) => {
        if (!targetNode) return 0;
        return targetNode.offsetWidth;
    },
    insertAfterElement: (newNode, referenceNode) => {
        if (referenceNode && referenceNode.parentNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    },
    appendNode: (parentNode, childNode) => {
        if (parentNode) {
            parentNode.appendChild(childNode);
        }
    },
    removeNode: (targetNode) => {
        if (targetNode && targetNode.parentNode) {
            targetNode.parentNode.removeChild(targetNode);
        }
    },
    storeData: (targetNode, key, value) => {
        targetNode._adhesionData = targetNode._adhesionData || {};
        targetNode._adhesionData[key] = value;
    },
    retrieveData: (targetNode, key) => {
        return targetNode._adhesionData ? targetNode._adhesionData[key] : undefined;
    },
    deleteData: (targetNode, key) => {
        if (targetNode._adhesionData) {
            delete targetNode._adhesionData[key];
        }
    },
    dispatchCustomEvent: (targetNode, eventName, detail = {}) => {
        targetNode.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
};

class AdhesionManager {
    constructor(subjectElement, configuration) {
        if (domSculptor.retrieveData(subjectElement, 'adhesion_state')) {
            return;
        }
        domSculptor.storeData(subjectElement, 'adhesion_state', this);

        this.subjectElement = subjectElement;

        this.config = {
            affixClass: configuration.affixClass || "is_anchored",
            allowScrollWithin: configuration.allowScrollWithin !== undefined ? configuration.allowScrollWithin : true,
            recalcInterval: configuration.recalcInterval || undefined,
            containerSelector: configuration.containerSelector || undefined,
            verticalPad: configuration.verticalPad || 0,
            customSpacer: configuration.customSpacer || undefined,
            allowPinToBottom: configuration.allowPinToBottom !== undefined ? configuration.allowPinToBottom : true
        };

        this.containerNode = this.config.containerSelector
            ? domSculptor.findNearestAncestor(subjectElement.parentNode, this.config.containerSelector)
            : subjectElement.parentNode;

        if (!this.containerNode) {
            throw new Error("Failed to locate adherence container.");
        }

        this.isAffixed = false;
        this.isPinnedToBottom = false;
        this.isReleased = false;

        this.shimElement = this.config.customSpacer
            ? (this.subjectElement.closest(this.config.customSpacer) || null)
            : document.createElement('div');
        
        if (this.shimElement && !this.config.customSpacer) {
             domSculptor.imposeStyle(this.shimElement, { position: getComputedStyle(this.subjectElement).position });
        }

        this.containerAbsoluteTop = 0;
        this.containerInnerHeight = 0;
        this.containerBottomPad = 0;
        this.originalTopPosition = 0;
        this.targetHeight = 0;
        this.targetFloatStyle = '';

        this.lastScrollYPosition = undefined;
        this.currentVerticalOffset = this.config.verticalPad;
        this.recalcTracker = this.config.recalcInterval;

        this.bindHandlers();
        this.measureDimensions();
        if (this.targetHeight === this.containerInnerHeight) {
            this.releaseBehavior();
            return;
        }
        this.activateListeners();
        setTimeout(() => this.evaluatePosition(), 0);
    }

    bindHandlers() {
        this.evaluatePosition = this.evaluatePosition.bind(this);
        this.measureAndAdjustPosition = this.measureAndAdjustPosition.bind(this);
        this.releaseBehavior = this.releaseBehavior.bind(this);
    }

    getStyleValue(propertyName) {
        return getComputedStyle(this.subjectElement)[propertyName];
    }

    measureDimensions() {
        if (this.isReleased) return;

        const containerComputedStyle = getComputedStyle(this.containerNode);
        const containerBorderTop = parseInt(containerComputedStyle.borderTopWidth, 10);
        const containerPaddingTop = parseInt(containerComputedStyle.paddingTop, 10);
        this.containerBottomPad = parseInt(containerComputedStyle.paddingBottom, 10);

        let wasAffixed = this.isAffixed;
        let wasPinned = this.isPinnedToBottom;
        let originalStyles = {};
        if (wasAffixed || wasPinned) {
            originalStyles = {
                position: this.subjectElement.style.position,
                top: this.subjectElement.style.top,
                width: this.subjectElement.style.width,
                bottom: this.subjectElement.style.bottom
            };
            this.unfixElement(); // Temporarily unfix to get true original position.
            this.isAffixed = false;
            this.isPinnedToBottom = false;
        }

        this.containerAbsoluteTop = domSculptor.getAbsoluteTop(this.containerNode) + containerBorderTop + containerPaddingTop;
        this.containerInnerHeight = this.containerNode.clientHeight;
        
        this.originalTopPosition = domSculptor.getAbsoluteTop(this.subjectElement) - parseInt(this.getStyleValue("marginTop"), 10) - this.config.verticalPad;
        this.targetHeight = domSculptor.getTotalHeight(this.subjectElement);
        this.targetFloatStyle = this.getStyleValue("float");

        if (this.shimElement && !this.config.customSpacer) {
            domSculptor.imposeStyle(this.shimElement, {
                width: domSculptor.getTotalWidth(this.subjectElement) + "px",
                height: this.targetHeight + "px",
                display: this.getStyleValue("display"),
                verticalAlign: this.getStyleValue("verticalAlign"),
                "float": this.targetFloatStyle
            });
        }

        if (wasAffixed || wasPinned) {
            domSculptor.imposeStyle(this.subjectElement, originalStyles);
        }
    }

    measureAndAdjustPosition() {
        this.measureDimensions();
        this.evaluatePosition();
    }

    evaluatePosition() {
        if (this.isReleased) return;

        if (this.config.recalcInterval !== undefined) {
            this.recalcTracker--;
            if (this.recalcTracker <= 0) {
                this.recalcTracker = this.config.recalcInterval;
                this.measureDimensions();
            }
        }

        const currentScrollY = window.scrollY;
        let scrollDelta = 0;
        if (this.lastScrollYPosition !== undefined) {
            scrollDelta = currentScrollY - this.lastScrollYPosition;
        }
        this.lastScrollYPosition = currentScrollY;

        let shouldPinToBottom = false;
        if (this.isAffixed) {
            if (this.config.allowPinToBottom) {
                shouldPinToBottom = currentScrollY + this.targetHeight + this.currentVerticalOffset > this.containerInnerHeight + this.containerAbsoluteTop;
                if (this.isPinnedToBottom && !shouldPinToBottom) {
                    this.isPinnedToBottom = false;
                    domSculptor.imposeStyle(this.subjectElement, {
                        position: "fixed",
                        bottom: "",
                        top: this.currentVerticalOffset + "px"
                    });
                    domSculptor.dispatchCustomEvent(this.subjectElement, "adhesion:unpinned");
                }
            }

            if (currentScrollY < this.originalTopPosition) {
                this.unfixElement();
                this.isAffixed = false;
                this.currentVerticalOffset = this.config.verticalPad;
                domSculptor.dispatchCustomEvent(this.subjectElement, "adhesion:unstuck");
            }

            if (this.config.allowScrollWithin) {
                const viewportHeight = window.innerHeight;
                if (this.targetHeight + this.config.verticalPad > viewportHeight) {
                    if (!this.isPinnedToBottom) {
                        this.currentVerticalOffset -= scrollDelta;
                        this.currentVerticalOffset = Math.max(viewportHeight - this.targetHeight, this.currentVerticalOffset);
                        this.currentVerticalOffset = Math.min(this.config.verticalPad, this.currentVerticalOffset);
                        if (this.isAffixed) {
                            domSculptor.imposeStyle(this.subjectElement, { top: this.currentVerticalOffset + "px" });
                        }
                    }
                }
            }
        } else {
            if (currentScrollY > this.originalTopPosition) {
                this.isAffixed = true;
                this.currentVerticalOffset = this.config.verticalPad;
                const newStyles = {
                    position: "fixed",
                    top: this.currentVerticalOffset + "px"
                };
                newStyles.width = this.getStyleValue("boxSizing") === "border-box"
                    ? domSculptor.getTotalWidth(this.subjectElement) + "px"
                    : domSculptor.getInnerWidth(this.subjectElement) + "px";

                domSculptor.imposeStyle(this.subjectElement, newStyles);
                domSculptor.addMark(this.subjectElement, this.config.affixClass);

                if (this.shimElement && !this.config.customSpacer) {
                    domSculptor.insertAfterElement(this.shimElement, this.subjectElement);
                    if (this.targetFloatStyle === "left" || this.targetFloatStyle === "right") {
                        domSculptor.appendNode(this.shimElement, this.subjectElement);
                    }
                }
                domSculptor.dispatchCustomEvent(this.subjectElement, "adhesion:stuck");
            }
        }

        if (this.isAffixed && this.config.allowPinToBottom) {
            if (shouldPinToBottom === false) {
                shouldPinToBottom = currentScrollY + this.targetHeight + this.currentVerticalOffset > this.containerInnerHeight + this.containerAbsoluteTop;
            }
            if (!this.isPinnedToBottom && shouldPinToBottom) {
                this.isPinnedToBottom = true;
                if (getComputedStyle(this.containerNode).position === "static") {
                    domSculptor.imposeStyle(this.containerNode, { position: "relative" });
                }
                domSculptor.imposeStyle(this.subjectElement, {
                    position: "absolute",
                    bottom: this.containerBottomPad + "px",
                    top: "auto"
                });
                domSculptor.dispatchCustomEvent(this.subjectElement, "adhesion:pinned");
            }
        }
    }

    unfixElement() {
        this.isAffixed = false;
        this.isPinnedToBottom = false;

        if (this.shimElement && !this.config.customSpacer) {
            if (this.targetFloatStyle === "left" || this.targetFloatStyle === "right") {
                 domSculptor.insertAfterElement(this.subjectElement, this.shimElement);
            }
            domSculptor.removeNode(this.shimElement);
        }

        domSculptor.imposeStyle(this.subjectElement, {
            position: "",
            top: "",
            width: "",
            bottom: ""
        });
        domSculptor.removeMark(this.subjectElement, this.config.affixClass);
    }

    releaseBehavior() {
        if (this.isReleased) return;
        this.isReleased = true;

        this.deactivateListeners();
        this.unfixElement();

        domSculptor.imposeStyle(this.subjectElement, {
            position: "",
            bottom: "",
            top: "",
            width: ""
        });
        
        domSculptor.deleteData(this.subjectElement, 'adhesion_state');
    }

    activateListeners() {
        window.addEventListener("touchmove", this.evaluatePosition, { passive: true });
        window.addEventListener("scroll", this.evaluatePosition, { passive: true });
        window.addEventListener("resize", this.measureAndAdjustPosition);
        document.body.addEventListener("adhesion:recalculate", this.measureAndAdjustPosition);
        this.subjectElement.addEventListener("adhesion:release", this.releaseBehavior);
    }

    deactivateListeners() {
        window.removeEventListener("touchmove", this.evaluatePosition);
        window.removeEventListener("scroll", this.evaluatePosition);
        window.removeEventListener("resize", this.measureAndAdjustPosition);
        document.body.removeEventListener("adhesion:recalculate", this.measureAndAdjustPosition);
        this.subjectElement.removeEventListener("adhesion:release", this.releaseBehavior);
    }
}

function activateAdhesion(elements, options = {}) {
    const elementCollection = elements instanceof NodeList || elements instanceof HTMLCollection
        ? Array.from(elements)
        : (Array.isArray(elements) ? elements : [elements]);

    elementCollection.forEach(item => {
        if (item instanceof HTMLElement) {
            new AdhesionManager(item, options);
        }
    });

    return elements;
}