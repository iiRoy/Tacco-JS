(function (universalScope) {
    "use strict";

    const outlineStructureClass = "guide-structure";
    const activeEntryClass = "guide-active-entry";
    const hoverEntryClass = "guide-hover-entry";
    const concealedGuideClass = "guide-hidden";
    const sectionIdentifierClass = "section-anchor-point";
    const outlineListItemClass = "guide-item";
    const pageFillerClass = "page-fill-area";

    function retrieveElementContent(targetNode) {
        return targetNode ? targetNode.textContent.trim() : "";
    }

    function manufactureUniqueMarker(rawText, ordinalIndex, generationMethod, existingMarkersCollection) {
        let baseDesignation;
        if (typeof generationMethod === "function") {
            baseDesignation = generationMethod(rawText, null);
        } else if (generationMethod === "pretty") {
            baseDesignation = rawText
                .toLowerCase()
                .replace(/\s/g, "-")
                .replace(/[^\x00-\x7F]/g, "")
                .replace(/--+/g, "-")
                .replace(/:-/g, "-");
        } else {
            baseDesignation = rawText.replace(/\s/g, "");
        }

        let finalDesignation = baseDesignation;
        let iteration = 0;
        while (existingMarkersCollection.has(finalDesignation)) {
            finalDesignation = `${baseDesignation}-${iteration++}`;
        }
        return finalDesignation;
    }

    function animatePageScroll(targetCoord, animationDuration, offsetAdjustment) {
        const initialPosition = universalScope.pageYOffset;
        const finalPosition = targetCoord - offsetAdjustment;
        const travelDistance = finalPosition - initialPosition;
        let animationStart = null;

        function stepFunction(currentTime) {
            if (animationStart === null) animationStart = currentTime;
            const timeElapsed = currentTime - animationStart;
            const progressRatio = Math.min(timeElapsed / animationDuration, 1);
            const easingEffect = progressRatio < 0.5 ? 2 * progressRatio * progressRatio : 1 - Math.pow(-2 * progressRatio + 2, 2) / 2;
            universalScope.scrollTo(0, initialPosition + travelDistance * easingEffect);
            if (timeElapsed < animationDuration) {
                universalScope.requestAnimationFrame(stepFunction);
            }
        }
        universalScope.requestAnimationFrame(stepFunction);
    }

    function obtainScrollPosition() {
        return universalScope.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function obtainElementOffsetTop(targetElement) {
        if (!targetElement) return 0;
        return targetElement.getBoundingClientRect().top + universalScope.pageYOffset;
    }

    class DocumentOutlineManager {
        constructor(outlineContainerElement, configurationSettings) {
            this.config = Object.assign({}, DocumentOutlineManager.standardConfiguration, configurationSettings);

            this.outlineContainer = outlineContainerElement;
            this.processedSections = [];
            this.insertedAnchors = [];
            this.markerToElementMap = new Map();
            this.uniqueMarkerSet = new Set();
            this.isScrollInitiated = false;

            this.prepareOutline();
        }

        prepareOutline() {
            this.outlineContainer.classList.add(outlineStructureClass);

            const contentZone = document.querySelector(this.config.contentBoundary);
            if (!contentZone) {
                this.outlineContainer.classList.add(concealedGuideClass);
                return;
            }

            const allCandidateHeaders = Array.from(contentZone.querySelectorAll(this.config.sectionDesignators.join(',')));
            this.collectSectionData(allCandidateHeaders, contentZone);

            if (this.processedSections.length === 0) {
                this.outlineContainer.classList.add(concealedGuideClass);
                return;
            }

            const rootOutlineList = this.constructNestedOutlineList(this.processedSections);
            if (rootOutlineList.children.length > 0) {
                this.outlineContainer.appendChild(rootOutlineList);
            } else {
                this.outlineContainer.classList.add(concealedGuideClass);
                return;
            }

            this.establishEventHandling();

            universalScope.addEventListener('load', () => {
                this.designateCurrentSection(true);
                setTimeout(() => {
                    this.isScrollInitiated = false;
                }, 0);
            });
        }

        collectSectionData(headersArray, contentZone) {
            let sectionCounter = 0;

            headersArray.forEach((headerElement) => {
                if (this.config.exclusionDesignator && headerElement.matches(this.config.exclusionDesignator)) {
                    return;
                }

                const sectionLevel = parseInt(headerElement.tagName.substring(1));
                const sectionText = retrieveElementContent(headerElement);
                const uniqueId = manufactureUniqueMarker(sectionText, sectionCounter, this.config.markerCreationMethod, this.uniqueMarkerSet);

                const anchorDiv = document.createElement('div');
                anchorDiv.setAttribute('data-target-id', uniqueId);
                anchorDiv.classList.add(sectionIdentifierClass);
                headerElement.parentNode.insertBefore(anchorDiv, headerElement);
                this.insertedAnchors.push(anchorDiv);

                this.processedSections.push({
                    domElement: headerElement,
                    level: sectionLevel,
                    text: sectionText,
                    marker: uniqueId,
                    anchorPoint: anchorDiv
                });
                this.uniqueMarkerSet.add(uniqueId);
                sectionCounter++;
            });
        }

        constructNestedOutlineList(sectionsData) {
            const baseList = document.createElement('ul');
            const levelStack = [{ level: 0, listNode: baseList }];

            sectionsData.forEach(section => {
                const { level, text, marker } = section;

                while (levelStack.length > 1 && levelStack[levelStack.length - 1].level >= level) {
                    levelStack.pop();
                }

                const currentParentList = levelStack[levelStack.length - 1].listNode;

                const listItem = document.createElement('li');
                listItem.classList.add(outlineListItemClass);
                listItem.setAttribute('data-target-id', marker);

                const linkElement = document.createElement('a');
                linkElement.textContent = text;
                linkElement.href = `#${marker}`;
                listItem.appendChild(linkElement);

                currentParentList.appendChild(listItem);
                this.markerToElementMap.set(marker, { outlineItem: listItem, anchorElement: section.anchorPoint });

                const nextLevelList = document.createElement('ul');
                listItem.appendChild(nextLevelList);
                levelStack.push({ level: level, listNode: nextLevelList });
            });

            function removeEmptyContainers(node) {
                if (node.tagName === 'UL' && node.children.length === 0) {
                    node.remove();
                } else {
                    Array.from(node.children).forEach(removeEmptyContainers);
                }
            }
            removeEmptyContainers(baseList);

            return baseList;
        }

        establishEventHandling() {
            this.outlineContainer.addEventListener('click', (event) => {
                const clickedLink = event.target.closest('a');
                if (clickedLink && clickedLink.parentElement.classList.contains(outlineListItemClass)) {
                    event.preventDefault();

                    const targetMarker = clickedLink.parentElement.getAttribute('data-target-id');
                    const associatedElements = this.markerToElementMap.get(targetMarker);
                    if (associatedElements && associatedElements.anchorElement) {
                        this.isScrollInitiated = true;
                        this.designateCurrentSection(false, targetMarker);
                        animatePageScroll(obtainElementOffsetTop(associatedElements.anchorElement), this.config.scrollAnimationDuration, this.config.scrollPadding);

                        if (this.config.preserveHistory) {
                            universalScope.history.pushState(null, '', `#${targetMarker}`);
                        }
                    }
                }
            });

            let scrollTimer;
            universalScope.addEventListener('scroll', () => {
                if (!this.config.trackActiveOnScroll) return;
                if (this.isScrollInitiated) {
                    clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(() => {
                        this.isScrollInitiated = false;
                    }, 150);
                    return;
                }

                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                    this.updateActiveSectionByScroll();
                }, 100);
            });

            if (this.config.autoExtendPage) {
                this.adjustPageHeight();
                universalScope.addEventListener('resize', () => this.adjustPageHeight());
            }
        }

        designateCurrentSection(isInitialLoad, explicitId = null) {
            let activeId = explicitId;

            if (!activeId && this.config.preserveHistory) {
                activeId = universalScope.location.hash.substring(1);
            }

            this.outlineContainer.querySelectorAll(`.${activeEntryClass}`).forEach(el => {
                el.classList.remove(activeEntryClass);
            });

            if (activeId && this.markerToElementMap.has(activeId)) {
                this.markerToElementMap.get(activeId).outlineItem.classList.add(activeEntryClass);
            } else if (isInitialLoad && this.config.highlightFirstByDefault && this.processedSections.length > 0) {
                const firstSectionId = this.processedSections[0].marker;
                if (this.markerToElementMap.has(firstSectionId)) {
                    this.markerToElementMap.get(firstSectionId).outlineItem.classList.add(activeEntryClass);
                }
            }
        }

        updateActiveSectionByScroll() {
            const currentVerticalPosition = obtainScrollPosition();
            let currentActiveMarker = null;

            for (let i = this.processedSections.length - 1; i >= 0; i--) {
                const sectionData = this.processedSections[i];
                const anchorTopPosition = obtainElementOffsetTop(sectionData.anchorPoint);
                if (anchorTopPosition <= currentVerticalPosition + this.config.activeThreshold) {
                    currentActiveMarker = sectionData.marker;
                    break;
                }
            }
            this.designateCurrentSection(false, currentActiveMarker);
        }

        adjustPageHeight() {
            const pageTotalHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight,
                document.body.clientHeight,
                document.documentElement.clientHeight
            );
            const viewportHeight = universalScope.innerHeight || document.documentElement.clientHeight;

            const lastProcessedSection = this.processedSections[this.processedSections.length - 1];
            if (!lastProcessedSection) return;

            const lastSectionAnchorTop = obtainElementOffsetTop(lastProcessedSection.anchorPoint);
            const requiredScrollSpaceBelow = viewportHeight - this.config.activeThreshold - this.config.pageExtensionBuffer;

            if (lastSectionAnchorTop + requiredScrollSpaceBelow > pageTotalHeight) {
                const additionalHeightNeeded = (lastSectionAnchorTop + requiredScrollSpaceBelow) - pageTotalHeight;
                let existingFiller = document.querySelector(`.${pageFillerClass}`);
                if (existingFiller) {
                    existingFiller.style.height = `${additionalHeightNeeded}px`;
                } else {
                    const newFiller = document.createElement('div');
                    newFiller.classList.add(pageFillerClass);
                    newFiller.style.height = `${additionalHeightNeeded}px`;
                    document.body.appendChild(newFiller);
                }
            } else {
                const existingFiller = document.querySelector(`.${pageFillerClass}`);
                if (existingFiller) {
                    existingFiller.remove();
                }
            }
        }
    }

    DocumentOutlineManager.standardConfiguration = {
        contentBoundary: "body",
        exclusionDesignator: null,
        sectionDesignators: ["h1", "h2", "h3"],
        displayAnimation: true,
        showEffectType: "slideDown",
        showEffectDuration: 400,
        hideEffectType: "slideUp",
        hideEffectDuration: 400,
        smoothScroll: true,
        scrollAnimationDuration: 400,
        scrollPadding: 0,
        trackActiveOnScroll: true,
        activeThreshold: 40,
        stylingTheme: "none",
        autoExtendPage: true,
        pageExtensionBuffer: 100,
        preserveHistory: true,
        markerCreationMethod: "compact",
        highlightFirstByDefault: true
    };

    universalScope.createDocumentOutline = function (targetSelector, customOptions) {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            return new DocumentOutlineManager(targetElement, customOptions);
        }
        console.warn("Target element for document outline not found:", targetSelector);
        return null;
    };

})(window);