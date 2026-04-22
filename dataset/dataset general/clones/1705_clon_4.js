let currentInstructionalSession = null;

const animateVisibility = (domNode, targetOpacity, durationMs, callback) => {
    let startTimestamp = null;
    const currentOpacity = parseFloat(domNode.style.opacity || 1);
    const opacityDifference = targetOpacity - currentOpacity;

    const stepAnimation = (currentTime) => {
        if (!startTimestamp) startTimestamp = currentTime;
        const progress = (currentTime - startTimestamp) / durationMs;

        if (progress < 1) {
            domNode.style.opacity = currentOpacity + opacityDifference * progress;
            window.requestAnimationFrame(stepAnimation);
        } else {
            domNode.style.opacity = targetOpacity;
            if (callback) callback();
        }
    };
    window.requestAnimationFrame(stepAnimation);
};

const createInstructionalGuide = (guideInformation, outputTargetNode) => {
    let _currentUnitIdentifier = guideInformation.unit;
    let _unitSegments = guideInformation.steps;
    let _activeSegmentOrdinal = 0; // 0-indexed internally, 1-indexed for display
    let _displayContainerNode = outputTargetNode;

    const instructionalMethods = {
        advanceSegment: function () {
            if (this._activeSegmentOrdinal < this._unitSegments.length - 1) {
                this.presentSegmentContent(++this._activeSegmentOrdinal + 1); // +1 to convert to 1-indexed for display
            } else {
                this.transitionToNextUnit();
            }
        },

        recedeSegment: function () {
            if (this._activeSegmentOrdinal > 0) {
                this.presentSegmentContent(--this._activeSegmentOrdinal + 1); // +1 to convert to 1-indexed for display
            }
        },

        presentSegmentContent: function (segmentNumber) { // segmentNumber is 1-indexed for external calls
            this._activeSegmentOrdinal = segmentNumber - 1; // Convert to 0-indexed for internal use
            const segmentData = this._unitSegments[this._activeSegmentOrdinal];

            this._displayContainerNode.innerHTML = ''; // Clear previous content

            const explanationParagraph = document.createElement('p');
            explanationParagraph.className = 'segment_info';
            explanationParagraph.textContent = `(${segmentNumber} of ${this._unitSegments.length}) ${segmentData.explanation}`;
            this._displayContainerNode.appendChild(explanationParagraph);

            const exampleParagraph = document.createElement('p');
            exampleParagraph.className = 'example_snippet';
            exampleParagraph.textContent = 'Demonstration: ';
            
            const exampleCode = document.createElement('samp');
            exampleCode.innerHTML = segmentData.example + "&nbsp;&nbsp;&crarr;";
            exampleParagraph.appendChild(exampleCode);
            this._displayContainerNode.appendChild(exampleParagraph);
        },

        evaluateUserAction: function (userAttempt) {
            let patternDefinition = this._unitSegments[this._activeSegmentOrdinal].match;
            
            const effectivePattern = Array.isArray(patternDefinition) 
                ? patternDefinition.join('\\s*') 
                : patternDefinition;

            const patternMatcher = new RegExp(effectivePattern);
            if (patternMatcher.exec(userAttempt)) {
                this.advanceSegment();
            }
        },

        transitionToNextUnit: function () {
            retrieveUnitInformation(parseInt(this._currentUnitIdentifier) + 1);
        }
    };

    return instructionalMethods;
};

const retrieveUnitInformation = async (unitIdentifier) => {
    const feedbackZone = document.getElementById('feedback');
    animateVisibility(feedbackZone, 0, 500, async () => {
        try {
            const response = await fetch(`js/chapters/${unitIdentifier}.js`);
            const unitPayload = await response.json();
            unitPayload.unit = unitIdentifier;

            const segmentDisplayElement = document.createElement('div');

            currentInstructionalSession = createInstructionalGuide(unitPayload, segmentDisplayElement);
            currentInstructionalSession.presentSegmentContent(1);

            feedbackZone.innerHTML = '';
            const titleHeader = document.createElement('h1');
            titleHeader.textContent = `Instructional Unit ${unitIdentifier}: ${unitPayload.title}`;
            feedbackZone.appendChild(titleHeader);
            feedbackZone.appendChild(segmentDisplayElement);
            animateVisibility(feedbackZone, 1, 500);
        } catch (error) {
            console.error('Failed to retrieve unit:', error);
            feedbackZone.innerHTML = '<p>Error loading instructional unit.</p>';
            animateVisibility(feedbackZone, 1, 500);
        }
    });
};

const presentTableOfContents = async () => {
    const feedbackZone = document.getElementById('feedback');
    animateVisibility(feedbackZone, 0, 500, async () => {
        feedbackZone.innerHTML = '';
        try {
            const response = await fetch('js/chapters/index.js');
            const indexPayload = await response.json();

            const tableOfContentsList = document.createElement('ul');
            tableOfContentsList.id = 'content_overview';

            Object.values(indexPayload.info).forEach(itemData => {
                const listItem = document.createElement('li');
                listItem.textContent = itemData.title;

                if (itemData.details) {
                    const subList = document.createElement('ul');
                    itemData.details.forEach(detailText => {
                        const subListItem = document.createElement('li');
                        subListItem.textContent = detailText;
                        subList.appendChild(subListItem);
                    });
                    listItem.appendChild(subList);
                }
                tableOfContentsList.appendChild(listItem);
            });

            const titleHeader = document.createElement('h1');
            titleHeader.textContent = indexPayload.title;
            feedbackZone.appendChild(titleHeader);

            const helpParagraph = document.createElement('p');
            helpParagraph.textContent = 'Enter "assistance" to view the guidance once more.';
            feedbackZone.appendChild(helpParagraph);

            feedbackZone.appendChild(tableOfContentsList);
            animateVisibility(feedbackZone, 1, 500);
        } catch (error) {
            console.error('Failed to present table of contents:', error);
            feedbackZone.innerHTML = '<p>Error loading table of contents.</p>';
            animateVisibility(feedbackZone, 1, 500);
        }
    });
};