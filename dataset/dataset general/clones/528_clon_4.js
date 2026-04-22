(function(globalScope) {
    const ConfigurationConstants = {
        INITIAL_PAGE_INDEX: 1,
        DEFAULT_BATCH_SIZE: 25
    };

    class DataLoaderModule {
        constructor(initialContent = [], startingPageIndex = ConfigurationConstants.INITIAL_PAGE_INDEX, contentBatchSize = ConfigurationConstants.DEFAULT_BATCH_SIZE) {
            this.isContentLoading = false;
            this.currentContentPageIndex = startingPageIndex;
            this.contentBatchSize = contentBatchSize;
            this.accumulatedContent = initialContent;
            this.contentSourceHandler = null;
        }

        assignContentSource(source) {
            this.contentSourceHandler = source;
        }

        initiateContentFetch() {
            if (this.isContentLoading) return;

            this.isContentLoading = true;
            if (this.contentSourceHandler && typeof this.contentSourceHandler.retrieveNextSegment === 'function') {
                this.contentSourceHandler.retrieveNextSegment(this.currentContentPageIndex, this.contentBatchSize, this);
            } else {
                console.warn("No content source assigned or 'retrieveNextSegment' not found.");
                this.isContentLoading = false;
            }
        }

        processReceivedContent(newSegment, nextIndex) {
            this.isContentLoading = false;
            if (Array.isArray(newSegment)) {
                this.accumulatedContent.push(...newSegment);
            }
            this.currentContentPageIndex = nextIndex;
        }

        getAllContent() {
            return this.accumulatedContent;
        }
    }

    class ContentServiceModule {
        retrieveNextSegment(pageIndex, batchSize, completionCallback) {
            throw new Error("Concrete implementation for 'retrieveNextSegment' must be provided by the content service.");
        }
    }

    class ScrollBoundaryMonitor {
        constructor(outerElementSelector, innerElementSelector, dataLoaderInstance) {
            this.outerScrollContainer = document.querySelector(outerElementSelector);
            this.innerContentContainer = document.querySelector(innerElementSelector);
            this.associatedDataLoader = dataLoaderInstance;
            this.boundScrollProcessor = this.processScrollMovement.bind(this);

            if (!this.outerScrollContainer || !this.innerContentContainer) {
                console.error("Scroll containers not found for ScrollBoundaryMonitor.");
            }
        }

        activateObservation() {
            if (this.outerScrollContainer) {
                this.outerScrollContainer.addEventListener('scroll', this.boundScrollProcessor);
            }
        }

        deactivateObservation() {
            if (this.outerScrollContainer) {
                this.outerScrollContainer.removeEventListener('scroll', this.boundScrollProcessor);
            }
        }

        processScrollMovement() {
            if (this.associatedDataLoader && (this.isScrolledToFarRight() || this.isScrolledToVeryBottom())) {
                this.associatedDataLoader.initiateContentFetch();
            }
        }

        isScrolledToFarRight() {
            if (!this.outerScrollContainer || !this.innerContentContainer) return false;

            const outerWidth = this.outerScrollContainer.clientWidth;
            const innerWidth = this.innerContentContainer.scrollWidth;
            const currentScrollX = this.outerScrollContainer.scrollLeft;

            if (currentScrollX === 0) {
                return false;
            }
            if (innerWidth <= outerWidth) return false;

            return (currentScrollX + outerWidth >= innerWidth);
        }

        isScrolledToVeryBottom() {
            if (!this.outerScrollContainer || !this.innerContentContainer) return false;

            const outerHeight = this.outerScrollContainer.clientHeight;
            const innerHeight = this.innerContentContainer.scrollHeight;
            const currentScrollY = this.outerScrollContainer.scrollTop;

            if (currentScrollY === 0) {
                return false;
            }
            if (innerHeight <= outerHeight) return false;

            return (currentScrollY + outerHeight >= innerHeight);
        }
    }

    const ContentPagingSystem = {
        Settings: ConfigurationConstants,

        createDataLoader: function(contentData, pageIndex, batchSize) {
            return new DataLoaderModule(contentData, pageIndex, batchSize);
        },

        createContentService: function() {
            return new ContentServiceModule();
        },

        createScrollMonitor: function(outerSelector, innerSelector, linkedDataLoader) {
            return new ScrollBoundaryMonitor(outerSelector, innerSelector, linkedDataLoader);
        }
    };

    globalScope.PagingUtility = ContentPagingSystem;

})(this);