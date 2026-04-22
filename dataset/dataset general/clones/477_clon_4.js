function smoothScroll(targetElement, scrollGoal, durationMs) {
    const initialScrollPosition = targetElement.scrollLeft;
    const distanceToScroll = scrollGoal - initialScrollPosition;
    const startTime = performance.now();

    function stepAnimation(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progressRatio = Math.min(timeElapsed / durationMs, 1);
        const easedProgress = 0.5 - 0.5 * Math.cos(Math.PI * progressRatio);

        targetElement.scrollLeft = initialScrollPosition + distanceToScroll * easedProgress;

        if (progressRatio < 1) {
            requestAnimationFrame(stepAnimation);
        }
    }
    requestAnimationFrame(stepAnimation);
}

function getElementOuterDimensions(element) {
    if (!element) return { height: 0, width: 0 };
    const styles = window.getComputedStyle(element);
    const height = element.offsetHeight + parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
    const width = element.offsetWidth + parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
    return { height, width };
}

Object.defineProperty(Date.prototype, 'retrieveDayIndex', {
    value: function() {
        const beginningOfYear = new Date(this.getFullYear(), 0, 1);
        const millisecondDifference = this.getTime() - beginningOfYear.getTime();
        const dayDifference = millisecondDifference / (1000 * 60 * 60 * 24);
        return Math.ceil(dayDifference);
    },
    writable: true,
    configurable: true
});

class ChronosDisplay {
    static APPROX_SECONDS_PER_YEAR = 31557032762;

    static defaultPrimaryFormatter(entry) {
        if (!entry.content) {
            alert("Entry " + entry + " lacks a content attribute!");
            return null;
        }
        return "<div><img class='defaultMainEvent' src='timeliner/mainEvent.gif'>" + entry.content + "</div>";
    }

    static defaultSummaryFormatter(entry) {
        return "<div><img src='timeliner/overviewEvent.png'></div>";
    }

    static defaultDateToPixelConversion(currentConfigurations, startYear, dateObject) {
        const fractionalYear = dateObject.getFullYear() - startYear + (dateObject.retrieveDayIndex() / 365);
        return Math.ceil(fractionalYear * currentConfigurations.annualPixelWidth);
    }

    static defaultPixelToDateConversion(currentConfigurations, startYear, pixelMeasurement) {
        const fractionalYear = startYear + (pixelMeasurement / currentConfigurations.annualPixelWidth);
        const totalSeconds = (fractionalYear - 1970) * ChronosDisplay.APPROX_SECONDS_PER_YEAR;
        return new Date(totalSeconds);
    }

    static defaultYearPixelCount(currentConfigurations, currentYear) {
        return currentConfigurations.annualPixelWidth;
    }

    static preventOverlap(currentRegion, regionHeight, occupiedRegions) {
        for (const comparedRegion of occupiedRegions) {
            const horizontalOverlap =
                ((comparedRegion.left <= currentRegion.left) && (currentRegion.left <= comparedRegion.right)) ||
                ((comparedRegion.left <= currentRegion.right) && (currentRegion.right <= comparedRegion.right)) ||
                ((currentRegion.left >= comparedRegion.left) && (currentRegion.right <= comparedRegion.right));

            if (horizontalOverlap) {
                const verticalOverlap =
                    ((comparedRegion.top <= currentRegion.top) && (currentRegion.top <= comparedRegion.bottom)) ||
                    ((comparedRegion.top <= currentRegion.bottom) && (currentRegion.bottom <= comparedRegion.bottom)) ||
                    ((currentRegion.top >= comparedRegion.top) && (currentRegion.bottom <= comparedRegion.bottom));

                if (verticalOverlap) {
                    currentRegion.top = Math.max(currentRegion.top, comparedRegion.bottom);
                    currentRegion.bottom = currentRegion.top + regionHeight;
                }
            }
        }
    }

    constructor(configSettings) {
        if (!configSettings.occasionList) {
            alert("No occasionList in the configurations!");
            return;
        }
        const occasionList = configSettings.occasionList;

        if (!configSettings.primaryTimelineSelector) {
            alert("No primaryTimelineSelector in the configurations!");
            return;
        }

        const primaryCanvas = document.querySelector(configSettings.primaryTimelineSelector);
        if (!primaryCanvas) {
            alert("Primary timeline selector \"" + configSettings.primaryTimelineSelector + "\" found no element.");
            return;
        }

        let summaryCanvas = null;
        if (configSettings.summaryTimelineSelector) {
            summaryCanvas = document.querySelector(configSettings.summaryTimelineSelector);
            if (!summaryCanvas) {
                alert("Summary timeline selector \"" + configSettings.summaryTimelineSelector + "\" found no element.");
                return;
            }
        }

        const baseConfigurations = {
            "primaryContentRenderer": ChronosDisplay.defaultPrimaryFormatter,
            "occurrenceOffset": 2,
            "annualPixelWidth": 200,
            "dateToPixelConverter": ChronosDisplay.defaultDateToPixelConversion,
            "pixelToDateConverter": ChronosDisplay.defaultPixelToDateConversion,
            "annualPixelCalculator": ChronosDisplay.defaultYearPixelCount,
            "summaryContentRenderer": ChronosDisplay.defaultSummaryFormatter,
            "summaryInitialPadding": 3,
            "layoutOverlapEnabled": true,
            "scrollStepPixels": 800
        };

        const currentConfigurations = Object.assign({}, baseConfigurations, configSettings);

        occasionList.forEach(entry => {
            if (!entry.date) {
                alert("Entry \"" + entry + "\" has no date.");
            }
        });

        const primaryContainer = document.createElement('div');
        primaryContainer.className = 'tlMain';
        primaryContainer.style.height = primaryCanvas.clientHeight + "px";
        primaryCanvas.appendChild(primaryContainer);

        const earliestYear = occasionList[0].date.getFullYear();
        const latestYear = occasionList[occasionList.length - 1].date.getFullYear();

        let horizontalCursor = 0;
        for (let yearIndex = 0; yearIndex <= (latestYear - earliestYear) + 1; yearIndex++) {
            const currentYearValue = earliestYear + yearIndex;
            const yearWidth = currentConfigurations.annualPixelCalculator(currentConfigurations, currentYearValue);

            const yearlyLabel = document.createElement('div');
            yearlyLabel.className = 'tlMainDate';
            yearlyLabel.style.width = yearWidth + "px";
            yearlyLabel.style.left = horizontalCursor + "px";
            yearlyLabel.textContent = currentYearValue;
            primaryContainer.appendChild(yearlyLabel);

            const { height: labelOuterHeight } = getElementOuterDimensions(yearlyLabel);
            const blockHeightStyle = primaryCanvas.clientHeight - (currentConfigurations.layoutOverlapEnabled ? 0 : labelOuterHeight);

            const timeBlock = document.createElement('div');
            timeBlock.className = 'tlMainTimeBlock';
            timeBlock.style.width = yearWidth + "px";
            timeBlock.style.left = horizontalCursor + "px";
            timeBlock.style.height = blockHeightStyle + "px";
            primaryContainer.appendChild(timeBlock);

            horizontalCursor += yearWidth;
        }

        const occupiedRegions = [];
        for (const entry of occasionList) {
            const leftPosition = currentConfigurations.dateToPixelConverter(currentConfigurations, earliestYear, entry.date) - currentConfigurations.occurrenceOffset;

            const entryHtml = currentConfigurations.primaryContentRenderer(entry);
            const renderedEntry = document.createElement('div');
            renderedEntry.className = 'tlMainEvent';
            renderedEntry.innerHTML = entryHtml;
            primaryContainer.appendChild(renderedEntry);

            const { width: entryOuterWidth, height: entryOuterHeight } = getElementOuterDimensions(renderedEntry);
            const minAllowedWidth = entryOuterWidth + 10;
            renderedEntry.style.minWidth = minAllowedWidth + "px";
            renderedEntry.style.left = leftPosition + "px";

            if (currentConfigurations.onOccurrenceClick) {
                renderedEntry.addEventListener('click', () => {
                    currentConfigurations.onOccurrenceClick(entry);
                });
                renderedEntry.classList.add('tlClickable');
            }

            const currentRegion = { top: 0, left: leftPosition, right: leftPosition + minAllowedWidth, bottom: entryOuterHeight };
            ChronosDisplay.preventOverlap(currentRegion, entryOuterHeight, occupiedRegions);

            if (currentRegion.top !== 0) {
                renderedEntry.style.top = currentRegion.top + "px";
            }
            occupiedRegions.push(currentRegion);
            occupiedRegions.sort((a, b) => a.top - b.top);
        }

        if (currentConfigurations.backwardControlSelector) {
            const leftArrow = document.querySelector(currentConfigurations.backwardControlSelector);
            if (leftArrow) {
                leftArrow.addEventListener('click', () => {
                    const targetScroll = primaryContainer.scrollLeft - currentConfigurations.scrollStepPixels;
                    smoothScroll(primaryContainer, targetScroll, 800);
                });
                leftArrow.classList.add('tlClickable');
            }
        }
        if (currentConfigurations.forwardControlSelector) {
            const rightArrow = document.querySelector(currentConfigurations.forwardControlSelector);
            if (rightArrow) {
                rightArrow.addEventListener('click', () => {
                    const targetScroll = primaryContainer.scrollLeft + currentConfigurations.scrollStepPixels;
                    smoothScroll(primaryContainer, targetScroll, 800);
                });
                rightArrow.classList.add('tlClickable');
            }
        }

        if (summaryCanvas) {
            const overviewContainer = document.createElement('div');
            overviewContainer.className = 'tlOverview tlClickable';
            overviewContainer.style.height = summaryCanvas.clientHeight + "px";
            summaryCanvas.appendChild(overviewContainer);

            let totalYearCount = (latestYear - earliestYear) + 1;
            let yearlySegmentWidth = Math.ceil((summaryCanvas.offsetWidth - (15 + currentConfigurations.summaryInitialPadding)) / totalYearCount);
            if ((yearlySegmentWidth * totalYearCount) < summaryCanvas.offsetWidth) {
                totalYearCount++;
            }

            const summaryDateToPosition = (dateObject) => {
                const fractionalYear = dateObject.getFullYear() - earliestYear + (dateObject.retrieveDayIndex() / 365);
                return Math.ceil(fractionalYear * yearlySegmentWidth);
            };

            const visibleRangeIndicator = document.createElement('div');
            visibleRangeIndicator.className = 'tlDisplayedZone';
            overviewContainer.appendChild(visibleRangeIndicator);

            primaryContainer.addEventListener('scroll', () => {
                const startMoment = currentConfigurations.pixelToDateConverter(currentConfigurations, earliestYear, primaryContainer.scrollLeft);
                const startX = summaryDateToPosition(startMoment);
                const endMoment = currentConfigurations.pixelToDateConverter(currentConfigurations, earliestYear, primaryContainer.scrollLeft + primaryCanvas.clientWidth);
                const endX = summaryDateToPosition(endMoment);

                visibleRangeIndicator.style.left = startX + "px";
                visibleRangeIndicator.style.width = (endX - startX) + "px";
            });
            primaryContainer.dispatchEvent(new Event('scroll'));

            for (let i = 0; i <= totalYearCount; i++) {
                const leftOffset = currentConfigurations.summaryInitialPadding + (i * yearlySegmentWidth);

                const overviewBlock = document.createElement('div');
                overviewBlock.className = 'tlOverviewTimeBlock';
                overviewBlock.style.width = yearlySegmentWidth + "px";
                overviewBlock.style.left = leftOffset + "px";
                overviewContainer.appendChild(overviewBlock);

                const overviewYearLabel = document.createElement('div');
                overviewYearLabel.className = 'tlOverviewDate';
                overviewYearLabel.style.width = yearlySegmentWidth + "px";
                overviewYearLabel.style.left = leftOffset + "px";
                overviewYearLabel.textContent = earliestYear + i;
                overviewContainer.appendChild(overviewYearLabel);
            }

            const overviewOccupiedRegions = [];
            for (const entry of occasionList) {
                const entryDate = entry.date;
                const leftPosition = currentConfigurations.summaryInitialPadding + summaryDateToPosition(entryDate);
                const entryHtml = currentConfigurations.summaryContentRenderer(entry);

                const renderedEntry = document.createElement('div');
                renderedEntry.className = 'tlOverviewEvent';
                renderedEntry.innerHTML = entryHtml;
                overviewContainer.appendChild(renderedEntry);

                const { width: entryOuterWidth, height: entryOuterHeight } = getElementOuterDimensions(renderedEntry);
                renderedEntry.style.minWidth = entryOuterWidth + "px";
                renderedEntry.style.left = leftPosition + "px";

                if (currentConfigurations.onOccurrenceClick) {
                    renderedEntry.addEventListener('click', () => {
                        currentConfigurations.onOccurrenceClick(entry);
                    });
                    renderedEntry.classList.add('tlClickable');
                }

                const currentRegion = { top: 0, left: leftPosition, right: leftPosition + entryOuterWidth, bottom: entryOuterHeight };
                ChronosDisplay.preventOverlap(currentRegion, entryOuterHeight, overviewOccupiedRegions);

                if (currentRegion.top !== 0) {
                    renderedEntry.style.top = currentRegion.top + "px";
                }
                overviewOccupiedRegions.push(currentRegion);
                overviewOccupiedRegions.sort((a, b) => a.top - b.top);
            }

            overviewContainer.addEventListener('click', (eventPayload) => {
                const clickXRelativeToOverview = eventPayload.pageX - overviewContainer.getBoundingClientRect().left;
                const fractionalYearsFromStart = (clickXRelativeToOverview - currentConfigurations.summaryInitialPadding) / yearlySegmentWidth;
                const clickedDate = new Date((earliestYear + fractionalYearsFromStart - 1970) * ChronosDisplay.APPROX_SECONDS_PER_YEAR);
                
                let mainScrollTarget = currentConfigurations.dateToPixelConverter(currentConfigurations, earliestYear, clickedDate);
                mainScrollTarget -= primaryCanvas.clientWidth / 2;

                if (mainScrollTarget < 0) {
                    smoothScroll(primaryContainer, 0, 800);
                } else {
                    smoothScroll(primaryContainer, mainScrollTarget, 800);
                }
            });
        }

        primaryContainer.draggableState = {
            isDown: false,
            startX: 0,
            scrollStartLeft: 0
        };

        primaryContainer.addEventListener('mousedown', (eventPayload) => {
            primaryContainer.draggableState.isDown = true;
            primaryContainer.draggableState.startX = eventPayload.clientX;
            primaryContainer.draggableState.scrollStartLeft = primaryContainer.scrollLeft;
            primaryContainer.style.cursor = '-moz-grabbing';
            primaryContainer.style.cursor = 'grabbing';
            eventPayload.preventDefault();
        });

        primaryContainer.addEventListener('mouseup', () => {
            primaryContainer.draggableState.isDown = false;
            primaryContainer.style.cursor = '-moz-grab';
            primaryContainer.style.cursor = 'grab';
        });

        primaryContainer.addEventListener('mousemove', (eventPayload) => {
            if (primaryContainer.draggableState.isDown) {
                const scrollDifference = primaryContainer.draggableState.startX - eventPayload.clientX;
                primaryContainer.scrollLeft = primaryContainer.draggableState.scrollStartLeft + scrollDifference;
            }
        });

        primaryContainer.addEventListener('wheel', (eventPayload) => {
            eventPayload.preventDefault();
            primaryContainer.scrollLeft += eventPayload.deltaY;
        }, { passive: false }); // Use passive: false to allow preventDefault

        primaryContainer.style.overflow = 'hidden';
        primaryContainer.style.cursor = '-moz-grab';
        primaryContainer.style.cursor = 'grab';

        window.addEventListener('mouseout', (eventPayload) => {
            if (primaryContainer.draggableState.isDown) {
                if (eventPayload.relatedTarget === null || eventPayload.relatedTarget.nodeName === 'HTML' || eventPayload.relatedTarget.nodeName === 'BODY') {
                    primaryContainer.draggableState.isDown = false;
                    primaryContainer.style.cursor = '-moz-grab';
                    primaryContainer.style.cursor = 'grab';
                }
            }
        });
    }
}