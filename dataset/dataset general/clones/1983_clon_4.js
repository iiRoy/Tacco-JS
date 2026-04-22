function dynamicScreenMenu(selector, options) {
    const targetElements = document.querySelectorAll(selector);
    targetElements.forEach(element => {
        new AdaptiveDisplayNav(element, options).configure();
    });
}

class AdaptiveDisplayNav {
    constructor(navElement, initialSettings) {
        this.navElement = navElement;
        this.dimmerLayer = null;
        this.headerPanel = null;
        this.navOpen = false;
        this.headerVisible = false;
        this.currentViewMode = null; // 'handheld' or 'desktop'

        this.settings = Object.assign({}, AdaptiveDisplayNav.DEFAULTS, initialSettings);

        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.toggleNav = this.toggleNav.bind(this);
        this.concealNav = this.concealNav.bind(this);
        this.onDimmerTransitionEnd = this.onDimmerTransitionEnd.bind(this);
        this.onHeaderTransitionEnd = this.onHeaderTransitionEnd.bind(this);
    }

    static DEFAULTS = {
        viewportBreakpoint: 768,
        navWidth: 250,
        motionDuration: 200,
        backdropOpacity: 0.4,
        buttonLocator: 'nav-toggle-button',
        buttonMarkup: '<div class="nav-toggle-button"><span></span><span></span><span></span></div>',
        displayTitle: '',
        showTitlebar: false,
        titlebarScrollThreshold: 40,
        onNavReveal: (elem) => {},
        onNavConceal: (elem) => {},
        onViewChangeToHandheld: (elem) => {
            elem.parentNode.parentNode.classList.add('vertical');
        },
        onViewChangeToDesktop: (elem) => {
            elem.parentNode.parentNode.classList.remove('vertical');
        },
        onHeaderDisplay: (elem) => {},
        onHeaderHide: (elem) => {}
    };

    configure() {
        this.setupElements();
        this.attachListeners();
        this.adjustLayoutBasedOnWidth();
    }

    setupElements() {
        const container = document.createElement('div');
        container.classList.add('dynamic-nav-container');
        this.navElement.parentNode.insertBefore(container, this.navElement);
        container.appendChild(this.navElement);

        container.style.transition = `left ${this.settings.motionDuration}ms ease-in-out`;

        if (this.settings.showTitlebar) {
            let existingHeader = document.querySelector('.adaptive-header-bar');
            if (!existingHeader) {
                this.headerPanel = document.createElement('div');
                this.headerPanel.classList.add('adaptive-header-bar');
                this.headerPanel.style.cssText = 'display:none;position:fixed;left:0px;top:0px;width:100%;height:55px;background-color:#fff;z-index:999998;opacity:0;';
                this.headerPanel.style.transition = `opacity ${this.settings.motionDuration}ms ease-in-out`;
                document.body.appendChild(this.headerPanel);

                const buttonWrapper = document.createElement('div');
                buttonWrapper.innerHTML = this.settings.buttonMarkup;
                const toggleButton = buttonWrapper.firstElementChild;
                toggleButton.classList.add(this.settings.buttonLocator);
                toggleButton.style.cssText = 'float:left;margin:5px;';
                toggleButton.addEventListener('click', this.toggleNav);
                this.headerPanel.appendChild(toggleButton);

                const titleTextDiv = document.createElement('div');
                titleTextDiv.classList.add('header-text-display');
                titleTextDiv.style.cssText = 'float:left;line-height:55px;height:55px;margin-left:10px;';
                titleTextDiv.textContent = this.settings.displayTitle;
                this.headerPanel.appendChild(titleTextDiv);

                if (this.settings.titlebarScrollThreshold === 0) {
                    this.displayHeader();
                } else {
                    this.hideHeader();
                }
            } else {
                this.headerPanel = existingHeader;
                const existingButton = this.headerPanel.querySelector(`.${this.settings.buttonLocator}`);
                if (existingButton) {
                    existingButton.removeEventListener('click', this.toggleNav);
                    existingButton.addEventListener('click', this.toggleNav);
                }
            }
            this.headerPanel.addEventListener('transitionend', this.onHeaderTransitionEnd);
        }

        let existingDimmer = document.querySelector('.screen-dimmer');
        if (!existingDimmer) {
            this.dimmerLayer = document.createElement('div');
            this.dimmerLayer.classList.add('screen-dimmer');
            this.dimmerLayer.style.cssText = 'display:none;position:fixed;left:0px;top:0px;width:100%;height:100%;z-index:999998;background-color:#000;opacity:0;';
            this.dimmerLayer.style.transition = `opacity ${this.settings.motionDuration}ms ease-in-out`;
            document.body.appendChild(this.dimmerLayer);
        } else {
            this.dimmerLayer = existingDimmer;
        }
        this.dimmerLayer.addEventListener('click', this.concealNav);
        this.dimmerLayer.addEventListener('transitionend', this.onDimmerTransitionEnd);
    }

    attachListeners() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll);
    }

    handleResize() {
        this.adjustLayoutBasedOnWidth();
    }

    handleScroll() {
        if (this.settings.showTitlebar && this.headerPanel && this.currentViewMode === 'handheld') {
            if (window.scrollY >= this.settings.titlebarScrollThreshold) {
                this.displayHeader();
            } else {
                this.hideHeader();
            }
        }
    }

    adjustLayoutBasedOnWidth() {
        if (this.fetchViewportWidth() <= this.settings.viewportBreakpoint) {
            this.transitionToHandheldMode();
        } else {
            this.transitionToDesktopMode();
        }

        if (this.navOpen) {
            this.concealNav();
        }
    }

    transitionToHandheldMode() {
        if (this.currentViewMode === 'handheld') return;

        const container = this.navElement.parentNode;
        container.classList.remove('desktop-layout-active');
        container.classList.add('handheld-layout-active');
        container.style.cssText = `
            display: block;
            position: fixed;
            top: 0px;
            z-index: 999999;
            overflow: auto;
            height: 100%;
            width: ${this.retrieveNavDimension()}px;
            left: -${this.retrieveNavDimension()}px;
            transition: left ${this.settings.motionDuration}ms ease-in-out;
        `;
        
        if (this.settings.showTitlebar && this.headerPanel) {
            this.headerPanel.style.display = 'block';
        }

        this.currentViewMode = 'handheld';
        this.settings.onViewChangeToHandheld(this.navElement);
    }

    transitionToDesktopMode() {
        if (this.currentViewMode === 'desktop') return;

        const container = this.navElement.parentNode;
        container.classList.remove('handheld-layout-active');
        container.classList.add('desktop-layout-active');
        container.style.cssText = `
            display: block;
            position: static;
            top: auto;
            z-index: auto;
            overflow: visible;
            height: auto;
            width: auto;
            left: auto;
            transition: none;
        `;

        if (this.settings.showTitlebar && this.headerPanel) {
            this.headerPanel.style.display = 'none';
            this.headerPanel.style.opacity = '0';
            this.headerVisible = false;
        }

        this.currentViewMode = 'desktop';
        this.settings.onViewChangeToDesktop(this.navElement);
    }

    toggleNav() {
        if (this.navOpen) {
            this.concealNav();
        } else {
            this.revealNav();
        }
    }

    revealNav() {
        if (this.navOpen || this.currentViewMode !== 'handheld') return;

        this.navOpen = true;
        const container = this.navElement.parentNode;
        container.style.left = '0px';

        this.dimmerLayer.style.display = 'block';
        this.dimmerLayer.offsetWidth; // Force reflow
        this.dimmerLayer.style.opacity = this.settings.backdropOpacity;

        document.body.style.overflow = 'hidden';
        this.settings.onNavReveal(this.navElement);
    }

    concealNav() {
        if (!this.navOpen) return;

        this.navOpen = false;
        const container = this.navElement.parentNode;
        container.style.left = `-${this.retrieveNavDimension()}px`;

        this.dimmerLayer.style.opacity = '0';

        document.body.style.overflow = 'auto';
    }

    onDimmerTransitionEnd(event) {
        if (event.propertyName === 'opacity' && !this.navOpen && this.dimmerLayer.style.opacity === '0') {
            this.dimmerLayer.style.display = 'none';
            this.settings.onNavConceal(this.navElement);
        }
    }

    displayHeader() {
        if (this.headerVisible || !this.settings.showTitlebar || !this.headerPanel || this.currentViewMode !== 'handheld') return;

        this.headerVisible = true;
        this.headerPanel.style.display = 'block';
        this.headerPanel.offsetWidth; // Force reflow
        this.headerPanel.style.opacity = '1';
        this.settings.onHeaderDisplay(this.headerPanel);
    }

    hideHeader() {
        if (!this.headerVisible || !this.settings.showTitlebar || !this.headerPanel) return;

        this.headerVisible = false;
        this.headerPanel.style.opacity = '0';
    }

    onHeaderTransitionEnd(event) {
        if (event.propertyName === 'opacity' && !this.headerVisible && this.headerPanel.style.opacity === '0') {
            this.headerPanel.style.display = 'none';
            this.settings.onHeaderHide(this.headerPanel);
        }
    }

    retrieveNavDimension() {
        return this.settings.navWidth;
    }

    fetchViewportWidth() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }
}