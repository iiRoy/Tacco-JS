const $$ = (selectorOrElement, context = document) => {
    let elements;
    if (typeof selectorOrElement === 'string') {
        elements = Array.from(context.querySelectorAll(selectorOrElement));
    } else if (selectorOrElement instanceof Element || selectorOrElement === window) {
        elements = [selectorOrElement];
    } else if (Array.isArray(selectorOrElement)) {
        elements = selectorOrElement;
    } else {
        elements = [];
    }

    const api = {
        elements,
        first: elements[0],
        on: (event, handler) => {
            elements.forEach(el => el.addEventListener(event, handler));
            return api;
        },
        off: (event, handler) => {
            elements.forEach(el => el.removeEventListener(event, handler));
            return api;
        },
        addClass: (className) => {
            elements.forEach(el => el.classList.add(className));
            return api;
        },
        removeClass: (className) => {
            elements.forEach(el => el.classList.remove(className));
            return api;
        },
        toggleClass: (className) => {
            elements.forEach(el => el.classList.toggle(className));
            return api;
        },
        css: (styles) => {
            elements.forEach(el => {
                for (const prop in styles) {
                    el.style[prop] = styles[prop];
                }
            });
            return api;
        },
        attr: (name, value) => {
            if (value === undefined) {
                return elements[0] ? elements[0].getAttribute(name) : null;
            }
            elements.forEach(el => el.setAttribute(name, value));
            return api;
        },
        append: (content) => {
            elements.forEach(el => {
                if (typeof content === 'string') {
                    el.insertAdjacentHTML('beforeend', content);
                } else if (content instanceof Element) {
                    el.appendChild(content.cloneNode(true));
                } else if (content && content.elements) {
                    content.elements.forEach(child => el.appendChild(child.cloneNode(true)));
                } else if (content) {
                    el.appendChild(content);
                }
            });
            return api;
        },
        find: (selector) => {
            const children = [];
            elements.forEach(el => {
                if (el.querySelectorAll) {
                    children.push(...Array.from(el.querySelectorAll(selector)));
                }
            });
            return $$(children);
        },
        is: (selector) => elements[0] ? elements[0].matches(selector) : false,
        get: (index) => elements[index],
        each: (callback) => {
            elements.forEach(callback);
            return api;
        },
        clone: () => {
            const clones = elements.map(el => el.cloneNode(true));
            return $$(clones);
        },
        after: (target) => {
            elements.forEach(el => {
                if (target.elements) {
                    target.elements.forEach(tEl => tEl.parentNode.insertBefore(el.cloneNode(true), tEl.nextSibling));
                } else if (target instanceof Element) {
                    target.parentNode.insertBefore(el.cloneNode(true), target.nextSibling);
                }
            });
            return api;
        },
        remove: () => {
            elements.forEach(el => el.parentNode && el.parentNode.removeChild(el));
            return api;
        },
        outerWidth: (includeMargin = false) => {
            if (!elements[0]) return 0;
            const computedStyle = getComputedStyle(elements[0]);
            let width = elements[0].offsetWidth;
            if (includeMargin) {
                width += parseFloat(computedStyle.marginLeft) + parseFloat(computedStyle.marginRight);
            }
            return width;
        },
        outerHeight: (includeMargin = false) => {
            if (!elements[0]) return 0;
            const computedStyle = getComputedStyle(elements[0]);
            let height = elements[0].offsetHeight;
            if (includeMargin) {
                height += parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom);
            }
            return height;
        },
        offset: () => {
            if (!elements[0] || elements[0] === window) return { top: 0, left: 0 };
            const rect = elements[0].getBoundingClientRect();
            return {
                top: rect.top + window.pageYOffset,
                left: rect.left + window.pageXOffset
            };
        },
        position: () => {
            if (!elements[0] || elements[0] === window) return { top: 0, left: 0 };
            return {
                top: elements[0].offsetTop,
                left: elements[0].offsetLeft
            };
        },
        scrollTop: (value) => {
            if (value !== undefined) {
                elements.forEach(el => {
                    if (el === window) {
                        window.scrollTo(window.pageXOffset, value);
                    } else {
                        el.scrollTop = value;
                    }
                });
                return api;
            }
            if (elements[0] === window) {
                return window.pageYOffset || document.documentElement.scrollTop;
            }
            return elements[0] ? elements[0].scrollTop : 0;
        },
        height: () => {
            if (elements[0] === window) {
                return window.innerHeight;
            }
            return elements[0] ? elements[0].clientHeight : 0;
        },
    };
    return api;
};


class HeaderAdhesionManager {
    constructor(cfgElement, dataBodySel, thresholdVal, containerSel) {
        this.originalElement = $$(cfgElement);
        this.dataContentElement = $$(dataBodySel);
        this.adhesionThreshold = thresholdVal;
        this.scrollHost = containerSel ? $$(containerSel) : $$(window);

        this.shadowElement = null;
        this.scrollFrameReq = null;

        this.initializeAdhesion();
    }

    initializeAdhesion() {
        this.scrollHost.on('scroll', this.handleHostScroll.bind(this));
        this.scrollHost.on('resize', this.handleHostResize.bind(this));
        this.handleHostScroll();
    }

    createShadow() {
        if (this.shadowElement) return;

        this.shadowElement = this.originalElement.clone();
        this.originalElement.after(this.shadowElement);
        this.originalElement.css({
            position: 'relative',
            visibility: 'hidden',
            'z-index': 0,
            left: '0px',
            top: '0px',
            width: 'auto'
        });

        this.shadowElement.addClass('adhesion-fixed-header');
        this.shadowElement.css({
            position: 'fixed',
            'z-index': 10000,
            visibility: 'hidden'
        });

        this.updateShadowDimensions();
    }

    updateShadowDimensions() {
        if (!this.shadowElement) return;

        const originalRect = this.originalElement.first.getBoundingClientRect();
        const originalOffset = this.originalElement.offset();

        this.shadowElement.css({
            top: `${this.adhesionThreshold}px`,
            width: `${originalRect.width}px`,
            left: `${originalOffset.left}px`
        });

        this.synchronizeColumnDimensions();
    }

    synchronizeColumnDimensions() {
        if (!this.shadowElement || !this.shadowElement.is('tr')) return;

        const shadowColumns = this.shadowElement.find('th');
        this.originalElement.find('th').each((idx, col) => {
            const currentColumn = $$(shadowColumns.get(idx));
            currentColumn.css('width', `${col.offsetWidth}px`);
        });
    }

    removeShadow() {
        if (!this.shadowElement) return;

        this.shadowElement.remove();
        this.shadowElement = null;

        this.originalElement.removeClass('adhesion-fixed-header'); // original had this class, not original-hidden
        this.originalElement.css({
            position: 'relative',
            left: '0px',
            top: '0px',
            width: 'auto',
            'z-index': 0,
            visibility: 'visible'
        });
    }

    handleHostScroll() {
        if (this.scrollFrameReq) {
            cancelAnimationFrame(this.scrollFrameReq);
        }
        this.scrollFrameReq = requestAnimationFrame(() => this.processScrollState());
    }

    handleHostResize() {
        this.processScrollState();
    }

    processScrollState() {
        const currentScrollPosition = this.scrollHost.scrollTop();
        const contentAreaRect = this.dataContentElement.first.getBoundingClientRect();
        const originalHeaderRect = this.originalElement.first.getBoundingClientRect();

        const contentAreaTopAbsolute = contentAreaRect.top + currentScrollPosition;
        const contentAreaBottomAbsolute = contentAreaRect.bottom + currentScrollPosition;

        const pointToActivateSticky = contentAreaTopAbsolute - this.adhesionThreshold;

        const currentStickyHeight = this.shadowElement ? this.shadowElement.outerHeight(false) : originalHeaderRect.height;
        const potentialFixedHeaderBottom = currentScrollPosition + this.adhesionThreshold + currentStickyHeight;

        const shouldCurrentlyBeSticky = (currentScrollPosition >= pointToActivateSticky) && (potentialFixedHeaderBottom < contentAreaBottomAbsolute);

        if (shouldCurrentlyBeSticky) {
            if (!this.shadowElement) {
                this.createShadow();
            }
            this.shadowElement.css({ "visibility": "visible" });

            const remainingDistanceToContentBottom = contentAreaBottomAbsolute - currentScrollPosition;

            if (remainingDistanceToContentBottom < (currentStickyHeight + this.adhesionThreshold)) {
                const calculatedOffsetTop = remainingDistanceToContentBottom - currentStickyHeight;
                this.shadowElement.css('top', `${calculatedOffsetTop}px`);
            } else {
                this.updateShadowDimensions();
            }
        } else {
            if (this.shadowElement) {
                this.removeShadow();
            }
        }
        this.scrollFrameReq = null;
    }
}


class InteractionToggleController {
    constructor(triggerElementSel) {
        this.triggerButton = $$(triggerElementSel);
        this.spinnerOpen = this.triggerButton.find('.fsm-menu-button-open');
        this.spinnerClosed = this.triggerButton.find('.fsm-menu-button-closed');

        this.setupToggle();
    }

    setupToggle() {
        this.triggerButton.addClass('interaction-toggle-button');
        this.triggerButton.on('click', this.handleButtonActivation.bind(this));
    }

    handleButtonActivation() {
        $$('body').toggleClass('interaction-body-state');
        this.applySpinnerRotation();
        setTimeout(() => this.applySpinnerRotation(), 50);
    }

    applySpinnerRotation() {
        this.spinnerOpen.toggleClass('interaction-spin-forward');
        this.spinnerClosed.toggleClass('interaction-spin-backward');
    }
}


class DynamicDataDisplayManager {
    constructor(displayContainer, dataConfig, dataRenderer) {
        this.displayHost = $$(displayContainer);
        this.dataConfiguration = dataConfig;
        this.itemRendererFunction = dataRenderer;

        this.fullDataset = [];
        this.filteredSortedDataset = [];
        this.displayedChunks = [];
        this.currentChunkIndex = 0;
        this.activeSortSpecifications = [];
        this.scrollObserver = $$(window);
        this.scrollAnimationRequest = null;

        this.initializeDisplayLogic();
    }

    initializeDisplayLogic() {
        this.scrollObserver.on('scroll', this.handleViewportScroll.bind(this));
    }

    updateFullDataset(newData) {
        if (!newData || !Array.isArray(newData)) {
            this.fullDataset = [];
        } else {
            this.fullDataset = [...newData];
        }
        this.refreshAndRebuild();
    }

    configureSortCriteria(criteriaList) {
        this.activeSortSpecifications = criteriaList;
        this.refreshAndRebuild();
    }

    refreshAndRebuild() {
        this.filteredSortedDataset = this.applySortingToData(this.fullDataset, this.activeSortSpecifications);
        this.displayedChunks.length = 0;
        this.currentChunkIndex = 0;
        this.displayHost.elements[0].innerHTML = '';

        this.retrieveNextDataChunk();
    }

    applySortingToData(data, specifications) {
        if (!specifications || specifications.length === 0) {
            return [...data];
        }

        return [...data].sort((recordA, recordB) => {
            for (const spec of specifications) {
                const valueA = recordA[spec.field];
                const valueB = recordB[spec.field];

                let comparisonResult = 0;
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    comparisonResult = valueA.localeCompare(valueB);
                } else {
                    comparisonResult = (valueA < valueB) ? -1 : (valueA > valueB) ? 1 : 0;
                }

                if (comparisonResult !== 0) {
                    return spec.direction === 'desc' ? -comparisonResult : comparisonResult;
                }
            }
            return 0;
        });
    }

    retrieveNextDataChunk() {
        const startIdx = this.dataConfiguration.pageSize * this.currentChunkIndex;
        const endIdx = startIdx + this.dataConfiguration.pageSize;
        const nextSet = this.filteredSortedDataset.slice(startIdx, endIdx);

        if (nextSet.length > 0) {
            nextSet.forEach((record, idxInChunk) => {
                const itemDomElement = this.itemRendererFunction(record, startIdx + idxInChunk);
                this.displayHost.elements[0].appendChild(itemDomElement);
            });
            this.displayedChunks.push(...nextSet);
            this.currentChunkIndex++;
        }
    }

    handleViewportScroll() {
        if (this.scrollAnimationRequest) {
            cancelAnimationFrame(this.scrollAnimationRequest);
        }
        this.scrollAnimationRequest = requestAnimationFrame(() => this.evaluateScrollPosition());
    }

    evaluateScrollPosition() {
        const currentViewportScroll = this.scrollObserver.scrollTop();
        const totalDocumentHeight = document.documentElement.scrollHeight;
        const currentViewportHeight = this.scrollObserver.height();

        const remainingHeightFromBottom = totalDocumentHeight - (currentViewportScroll + currentViewportHeight);

        const loadingTriggerPoint = (totalDocumentHeight - currentViewportHeight) * 0.02;

        if (remainingHeightFromBottom <= loadingTriggerPoint) {
            this.retrieveNextDataChunk();
        }
        this.scrollAnimationRequest = null;
    }
}


class ColumnSortIndicator {
    constructor(headerElement, fieldName, onSortRequestedCallback) {
        this.headerContainer = $$(headerElement);
        this.dataColumnName = fieldName;
        this.sortChangeNotifier = onSortRequestedCallback;

        this.sortCycleStates = ['none', 'asc', 'desc'];
        this.currentSortStateIndex = 0;
        this.indicatorIcon = null;

        this.setupSortingControl();
    }

    setupSortingControl() {
        this.headerContainer.css({ cursor: 'pointer' });
        this.indicatorIcon = document.createElement('i');
        this.indicatorIcon.className = 'fa fa-sort';
        this.headerContainer.append('&nbsp;');
        this.headerContainer.elements[0].appendChild(this.indicatorIcon);

        this.headerContainer.on('click', this.handleHeaderClick.bind(this));
    }

    handleHeaderClick() {
        this.currentSortStateIndex = (this.currentSortStateIndex + 1) % this.sortCycleStates.length;
        const nextDirection = this.sortCycleStates[this.currentSortStateIndex];

        this.sortChangeNotifier(this.dataColumnName, nextDirection);

        this.updateIconAppearance();
    }

    updateIconAppearance() {
        this.indicatorIcon.classList.remove('fa-sort-desc', 'fa-sort-asc', 'fa-sort');

        const stateDirection = this.sortCycleStates[this.currentSortStateIndex];
        let iconClassName = 'fa-sort';

        if (stateDirection === 'asc') {
            iconClassName = 'fa-sort-asc';
        } else if (stateDirection === 'desc') {
            iconClassName = 'fa-sort-desc';
        }

        this.indicatorIcon.classList.add(iconClassName);
    }

    setExternalSortState(direction) {
        this.currentSortStateIndex = this.sortCycleStates.indexOf(direction);
        if (this.currentSortStateIndex === -1) {
            this.currentSortStateIndex = 0;
        }
        this.updateIconAppearance();
    }
}