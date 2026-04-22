(function () {
    const defaultLayoutSettings = {
        adaptResponsively: true,
        resizeCooldown: 100,
        enableFlexDisplay: true,
        minimumItemsRequired: 0
    };

    const createResizeObserver = (action, delay) => {
        let timerId;
        window.addEventListener('resize', () => {
            clearTimeout(timerId);
            timerId = setTimeout(action, delay);
        });
    };

    const retrieveContentWidth = (element) => parseFloat(getComputedStyle(element).width);

    class AdaptiveNavigationLayout {
        constructor(domElement, customSettings) {
            this.containerElement = domElement;
            this.configuration = { ...defaultLayoutSettings, ...customSettings };

            this.listElement = null;
            this.allItems = [];
            this.lastItemElement = null;
            this.itemLinkElements = [];
            this.wrapperElement = null;

            if (!this.setupInitialState()) {
                return;
            }
            
            this.applyLayout();

            if (this.configuration.adaptResponsively) {
                createResizeObserver(() => this.applyLayout(), this.configuration.resizeCooldown);
            }
        }

        setupInitialState() {
            this.wrapperElement = this.containerElement.tagName === 'UL' ? this.containerElement.parentElement : this.containerElement;

            this.listElement = this.containerElement.tagName === 'UL' ? this.containerElement : this.wrapperElement.querySelector('ul');
            if (!this.listElement) {
                console.warn('No unordered list found for AdaptiveNavigationLayout.', this.containerElement);
                return false;
            }

            this.allItems = Array.from(this.listElement.children).filter(child => child.tagName === 'LI');
            if (this.allItems.length === 0) {
                 console.warn('No list items found for AdaptiveNavigationLayout.', this.listElement);
                 return false;
            }
            this.lastItemElement = this.allItems[this.allItems.length - 1];
            this.itemLinkElements = this.allItems.map(item => item.querySelector('a')).filter(Boolean);

            if (this.configuration.minimumItemsRequired > 0 && this.allItems.length < this.configuration.minimumItemsRequired) {
                this.containerElement.classList.add('adaptive-nav-layout-skipped');
                return false;
            }

            if (!this.wrapperElement.querySelector('.adaptive-nav-layout-clearer')) {
                const clearerDiv = document.createElement('div');
                clearerDiv.className = 'adaptive-nav-layout-clearer';
                clearerDiv.style.cssText = `
                    display: block;
                    overflow: hidden;
                    visibility: hidden;
                    width: 0;
                    height: 0;
                    clear: both;
                `;
                this.wrapperElement.appendChild(clearerDiv);
            }
            this.wrapperElement.style.zoom = '1';

            return true;
        }

        applyLayout() {
            if (this.containerElement.classList.contains('adaptive-nav-layout-skipped')) {
                return;
            }

            this.itemLinkElements.forEach(link => {
                link.style.paddingLeft = '';
                link.style.paddingRight = '';
            });


            if (!this.configuration.enableFlexDisplay) {
                // Legacy / float-based calculation path
                this.listElement.style.cssText = 'float: left; display: block; width: auto;';
                this.allItems.forEach(item => {
                    item.style.cssText = 'float: left; width: auto; display: block;';
                });
                this.itemLinkElements.forEach(link => {
                    link.style.paddingLeft = '0';
                    link.style.paddingRight = '0';
                });

                const listComputedStyle = getComputedStyle(this.listElement);
                const listContentWidth = retrieveContentWidth(this.listElement);
                const listOffsetWidth = this.listElement.offsetWidth;
                const listMarginLeft = parseFloat(listComputedStyle.marginLeft);
                const listMarginRight = parseFloat(listComputedStyle.marginRight);
                const listExtraSpace = (listOffsetWidth - listContentWidth) + listMarginLeft + listMarginRight;

                const wrapperContentWidth = retrieveContentWidth(this.wrapperElement);

                let currentTotalItemContentWidth = 0;
                this.allItems.forEach(item => {
                    currentTotalItemContentWidth += retrieveContentWidth(item);
                });

                const availableWidthForItems = wrapperContentWidth - listExtraSpace;
                const remainingWidthToDistribute = availableWidthForItems - currentTotalItemContentWidth;
                const additionalWidthPerItem = Math.floor(remainingWidthToDistribute / this.allItems.length);

                this.allItems.forEach(item => {
                    const itemCurrentContentWidth = retrieveContentWidth(item);
                    item.style.width = `${itemCurrentContentWidth + additionalWidthPerItem}px`;
                });

                let finalDistributedWidthSum = 0;
                this.allItems.forEach(item => {
                    finalDistributedWidthSum += retrieveContentWidth(item);
                });

                const leftoverPixels = availableWidthForItems - finalDistributedWidthSum;
                if (this.lastItemElement && leftoverPixels > 0) {
                    const lastItemCurrentContentWidth = retrieveContentWidth(this.lastItemElement);
                    this.lastItemElement.style.width = `${lastItemCurrentContentWidth + leftoverPixels}px`;
                }

            } else {
                // Modern / flexbox path
                this.listElement.style.cssText = 'display: flex; float: none; width: 100%;';
                this.allItems.forEach(item => {
                    item.style.cssText = 'display: flex; flex: 1 1 0%; float: none;';
                });
            }
            this.containerElement.classList.remove('adaptive-nav-layout-skipped');
            this.containerElement.classList.add('adaptive-nav-layout-active');
        }
    }

    window.initializeAdaptiveNav = (selector, userOptions) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            new AdaptiveNavigationLayout(element, userOptions);
        });
    };

    window.AdaptiveNavigationLayoutDefaults = defaultLayoutSettings;

})();