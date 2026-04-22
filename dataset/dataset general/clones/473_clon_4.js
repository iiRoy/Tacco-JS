class NavigationSystemManager {
    #mainDisplayArea;
    #contentRegion;
    #sideAccessPanel;
    #accessPanelContent;
    #isPanelVisible = false;
    #offsetFromEdge = 55;
    #maxAllowedPanelExtent = 500;
    #loadingIndicatorHTML = '<center style="margin-top: 30px;"><img src="img/preloader.gif" alt="loading..." /></center>';
    #currentViewMetrics = {
        width: 0,
        height: 0
    };

    constructor() {
        this.#gatherDomReferences();
        this.#updateViewMetrics();
        this.#installEventHandlers();
        this.#processInitialLocationHash();
    }

    #gatherDomReferences() {
        this.#mainDisplayArea = document.getElementById("page");
        this.#contentRegion = document.getElementById("pageContent");
        this.#sideAccessPanel = document.getElementById("slidingMenu");
        this.#accessPanelContent = document.getElementById("slidingMenuContent");
    }

    #updateViewMetrics() {
        this.#currentViewMetrics.width = window.innerWidth;
        this.#currentViewMetrics.height = window.innerHeight;
    }

    #showAccessPanel() {
        this.#isPanelVisible = true;
        let calculatedPanelExtent = this.#currentViewMetrics.width - this.#offsetFromEdge;

        if (this.#currentViewMetrics.width > (this.#maxAllowedPanelExtent + this.#offsetFromEdge)) {
            calculatedPanelExtent = this.#maxAllowedPanelExtent;
        }

        this.#sideAccessPanel.classList.add('active-panel'); // Controls visibility via CSS
        this.#mainDisplayArea.style.transition = 'transform 300ms ease-out';
        this.#mainDisplayArea.style.transform = `translateX(${calculatedPanelExtent}px)`;

        this.#synchronizeElementHeights();
    }

    #hideAccessPanel() {
        this.#isPanelVisible = false;

        this.#mainDisplayArea.style.transition = 'transform 180ms ease-in';
        this.#mainDisplayArea.style.transform = 'translateX(0px)';

        const transitionComplete = () => {
            this.#sideAccessPanel.classList.remove('active-panel');
            this.#mainDisplayArea.style.transition = ''; // Reset transition property
            this.#mainDisplayArea.removeEventListener('transitionend', transitionComplete);
            this.#mainDisplayArea.style.height = '100%'; // Replicates original behavior
        };
        this.#mainDisplayArea.addEventListener('transitionend', transitionComplete, { once: true });
    }

    #synchronizeElementHeights() {
        const panelCurrentHeight = this.#sideAccessPanel.offsetHeight;
        const displayAreaCurrentHeight = this.#mainDisplayArea.offsetHeight;
        const panelInnerContentHeight = this.#accessPanelContent.offsetHeight;

        if (displayAreaCurrentHeight < panelCurrentHeight) {
            this.#sideAccessPanel.style.height = `${panelInnerContentHeight}px`;
            this.#mainDisplayArea.style.height = `${panelInnerContentHeight}px`;
        } else {
            this.#sideAccessPanel.style.height = `${displayAreaCurrentHeight}px`;
        }
    }

    async #retrieveAndRenderContent(contentSourceUrl) {
        this.#hideAccessPanel();
        this.#contentRegion.innerHTML = this.#loadingIndicatorHTML;

        // Mimic the original's demo delay for the loader
        await new Promise(resolve => setTimeout(resolve, 1200));

        try {
            const response = await fetch(contentSourceUrl);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const data = await response.text();
            this.#contentRegion.innerHTML = data;
        } catch (error) {
            console.error("Content retrieval failed:", error);
            this.#contentRegion.innerHTML = `<p>Error fetching content: ${error.message}</p>`;
        }
    }

    #handleViewportAlteration() {
        // Delay recalculation to ensure accurate new dimensions
        window.setTimeout(() => {
            this.#updateViewMetrics();
            if (this.#isPanelVisible) {
                this.#showAccessPanel();
            } else {
                this.#hideAccessPanel();
            }
        }, 500);
    }

    #installEventHandlers() {
        document.body.addEventListener('click', (evt) => {
            if (evt.target.matches('a.show-menu-button')) {
                evt.preventDefault();
                const computedStyle = getComputedStyle(this.#mainDisplayArea);
                const transformMatrix = new DOMMatrixReadOnly(computedStyle.transform);
                if (transformMatrix.m41 === 0) { // Check translateX value
                    this.#showAccessPanel();
                } else {
                    this.#hideAccessPanel();
                }
            }
        });

        window.addEventListener("resize", this.#handleViewportAlteration.bind(this), false);
        window.addEventListener("orientationchange", this.#handleViewportAlteration.bind(this), false);

        window.addEventListener('hashchange', () => {
            const currentHashString = location.hash;
            let destinationUrl = "";

            window.scrollTo(0, 1); // Scroll to top for WP7.5 compatibility

            if (currentHashString === '') {
                destinationUrl = "short.php";
            } else {
                destinationUrl = currentHashString.substring(1);
            }
            this.#retrieveAndRenderContent(destinationUrl);
        });
    }

    #processInitialLocationHash() {
        const initialHashString = location.hash;
        let initialContentUrl = "";
        if (initialHashString === '') {
            initialContentUrl = "short.php";
        } else {
            initialContentUrl = initialHashString.substring(1);
        }
        this.#retrieveAndRenderContent(initialContentUrl);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NavigationSystemManager();
});