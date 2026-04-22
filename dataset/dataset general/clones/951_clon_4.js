const ElementManipulator = (function() {
    function acquireElement(query, context = document) {
        return context.querySelector(query);
    }

    function acquireAllElements(query, context = document) {
        return Array.from(context.querySelectorAll(query));
    }

    function constructElement(tag, properties = {}) {
        const element = document.createElement(tag);
        for (const attribute in properties) {
            if (attribute === 'childComponents') {
                properties[attribute].forEach(child => element.appendChild(child));
            } else if (attribute === 'classNames') {
                properties[attribute].forEach(cls => element.classList.add(cls));
            } else if (attribute === 'dataAttributes') {
                for (const dataKey in properties[attribute]) {
                    element.dataset[dataKey] = properties[attribute][dataKey];
                }
            } else if (attribute === 'inlineStyle') {
                for (const styleKey in properties[attribute]) {
                    element.style[styleKey] = properties[attribute][styleKey];
                }
            } else {
                element[attribute] = properties[attribute];
            }
        }
        return element;
    }

    function attachToParent(childElement, parentQuery) {
        const parent = acquireElement(parentQuery);
        if (parent) {
            parent.appendChild(childElement);
        }
    }

    function insertAtBeginning(childElement, parentQuery) {
        const parent = acquireElement(parentQuery);
        if (parent) {
            parent.prepend(childElement);
        }
    }

    function applyContent(query, content) {
        const element = acquireElement(query);
        if (element) {
            element.innerHTML = content;
        }
    }

    function changeVisibility(query, displayState) {
        const element = acquireElement(query);
        if (element) {
            element.style.display = displayState;
        }
    }

    function hasAssociatedClass(query, className) {
        const element = acquireElement(query);
        return element ? element.classList.contains(className) : false;
    }

    function addAssociatedClass(query, className) {
        const element = acquireElement(query);
        if (element) {
            element.classList.add(className);
        }
    }

    function removeAssociatedClass(query, className) {
        const element = acquireElement(query);
        if (element) {
            element.classList.remove(className);
        }
    }
    
    function setElementStyle(query, styles) {
        const element = acquireElement(query);
        if (element) {
            for (const prop in styles) {
                element.style[prop] = styles[prop];
            }
        }
    }

    return { acquireElement, acquireAllElements, constructElement, attachToParent, insertAtBeginning, applyContent, changeVisibility, hasAssociatedClass, addAssociatedClass, removeAssociatedClass, setElementStyle };
})();


// Global state representation
const WidgetStatus = {
    isOpened: false,
    currentPlacement: null // 'horizontal' or 'vertical'
};

// Manages the animation and positioning of the primary display widget
const WidgetPositioner = (function(domUtils) {
    const mainWidget = domUtils.acquireElement('.auxiliary-display');
    const activatorElement = domUtils.acquireElement('.engagement-trigger');

    const adjustWidgetState = () => {
        WidgetStatus.isOpened = !WidgetStatus.isOpened;
        if (WidgetStatus.isOpened) {
            domUtils.addAssociatedClass('.engagement-trigger', 'expanded');
            if (WidgetStatus.currentPlacement === 'horizontal') {
                domUtils.setElementStyle('.auxiliary-display', { right: '0px' });
                domUtils.setElementStyle('.engagement-trigger', { right: '340px' });
            } else { // vertical
                domUtils.setElementStyle('.auxiliary-display', { bottom: '0px' });
                domUtils.setElementStyle('.engagement-trigger', { bottom: '340px' });
            }
        } else {
            domUtils.removeAssociatedClass('.engagement-trigger', 'expanded');
            if (WidgetStatus.currentPlacement === 'horizontal') {
                domUtils.setElementStyle('.auxiliary-display', { right: '-330px' });
                domUtils.setElementStyle('.engagement-trigger', { right: '10px' });
            } else { // vertical
                domUtils.setElementStyle('.auxiliary-display', { bottom: '-330px' });
                domUtils.setElementStyle('.engagement-trigger', { bottom: '10px' });
            }
        }
    };

    const setupWidgetLayout = (viewportWidth) => {
        domUtils.removeAssociatedClass('.engagement-trigger', 'expanded'); // Always reset on layout change
        if (viewportWidth > 700) {
            WidgetStatus.currentPlacement = 'horizontal';
            domUtils.setElementStyle('.auxiliary-display', { right: '-330px', bottom: '' });
            domUtils.setElementStyle('.engagement-trigger', { right: '10px', bottom: '' });
            domUtils.removeAssociatedClass('.auxiliary-display', 'vertical-mode');
        } else {
            WidgetStatus.currentPlacement = 'vertical';
            domUtils.setElementStyle('.auxiliary-display', { bottom: '-330px', right: '' });
            domUtils.setElementStyle('.engagement-trigger', { bottom: '10px', right: '' });
            domUtils.addAssociatedClass('.auxiliary-display', 'vertical-mode');
        }
        WidgetStatus.isOpened = false; // Ensure it's closed after re-configuration
    };

    return { adjustWidgetState, setupWidgetLayout };
})(ElementManipulator);


// Manages the extraction and presentation of page annotations
const PageAnnotationHandler = (function(domUtils) {
    let annotationSequence = 0;
    const collectedAnnotationDetails = []; // Stores text content of annotations

    const processAndMarkElements = () => {
        const markedPoints = domUtils.acquireAllElements('.content-point');
        markedPoints.forEach(point => {
            annotationSequence++;
            const detailValue = point.getAttribute('data-annotation-text');
            if (detailValue) {
                collectedAnnotationDetails.push(detailValue);
            }
            domUtils.insertAtBeginning(
                domUtils.constructElement('span', {
                    classNames: ['visual-indicator'],
                    childComponents: [domUtils.constructElement('figure', { textContent: annotationSequence })]
                }),
                `[data-unique-id="${point.getAttribute('data-unique-id')}"]` // Use a unique identifier if available
            );
        });
    };

    const populateAuxiliaryDisplay = () => {
        const targetDisplay = domUtils.acquireElement('.auxiliary-display');
        if (!targetDisplay) return;

        const currentDocumentTitle = document.title;
        domUtils.applyContent('.auxiliary-display', `<h1>${currentDocumentTitle}</h1>`);

        const staticLayout = [
            '<form><input type="checkbox" id="markerVisibility" checked="checked" >show content markers</form>',
            '<h2>Page Annotations</h2>'
        ].join('');
        domUtils.attachToParent(domUtils.constructElement('div', { innerHTML: staticLayout }), '.auxiliary-display');

        if (collectedAnnotationDetails.length === 0) {
            domUtils.attachToParent(
                domUtils.constructElement('p', { textContent: 'No annotations exist for this page. Relax!' }),
                '.auxiliary-display'
            );
        } else {
            collectedAnnotationDetails.forEach((detail, index) => {
                domUtils.attachToParent(
                    domUtils.constructElement('div', {
                        classNames: ['annotation-entry-wrapper'],
                        childComponents: [
                            domUtils.constructElement('span', { classNames: ['sequence-label'], textContent: index + 1 }),
                            domUtils.constructElement('span', { classNames: ['description-content'], textContent: detail })
                        ]
                    }),
                    '.auxiliary-display'
                );
            });
        }
    };

    return { processAndMarkElements, populateAuxiliaryDisplay };
})(ElementManipulator);


// Manages external dialogue data (comments)
const DialogueDataService = (function(domUtils) {
    let allDialogueRecords = [];
    let serviceConfiguration = {};
    const fieldIndexMap = { 'entryText': 0, 'author': 1, 'timestampValue': 2, 'pageLocation': 3, 'padding': 4 };

    // Custom CSV parser (simplified)
    const parseCsvString = (inputString) => {
        const lines = inputString.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        return lines.reduce((accumulator, line) => {
            const fields = [];
            let withinQuotes = false;
            let currentSegment = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    withinQuotes = !withinQuotes;
                } else if (char === ',' && !withinQuotes) {
                    fields.push(currentSegment.trim());
                    currentSegment = '';
                } else {
                    currentSegment += char;
                }
            }
            fields.push(currentSegment.trim());

            if (fields.length > 1) {
                accumulator.push(fields);
            }
            return accumulator;
        }, []);
    };

    const processFieldValue = (rawData, fieldPosition) => {
        let processedData = rawData.replace(/^"|"$/g, '');
        processedData = decodeURIComponent(processedData);
        if (fieldPosition === fieldIndexMap['entryText']) {
            processedData = processedData.replace(/\n/g, '<br/>');
        }
        return processedData;
    };

    const transformSingleRecord = (rawRecord) => {
        return rawRecord.map((field, index) => processFieldValue(field, index));
    };

    const checkRecordExistence = (candidateRecord) => {
        return allDialogueRecords.some(existingRecord =>
            existingRecord.join('::') === candidateRecord.join('::')
        );
    };

    const filterAndFormatIncomingEntries = (rawLines) => {
        const newEntries = [];
        const records = parseCsvString(rawLines);
        records.forEach(rawRecord => {
            const transformed = transformSingleRecord(rawRecord);
            if (transformed[fieldIndexMap['pageLocation']] === window.location.pathname && !checkRecordExistence(transformed)) {
                newEntries.push(transformed);
            }
        });
        return newEntries;
    };

    const generateVisualComponents = (entries) => {
        return entries.map(entry => {
            const component = domUtils.constructElement('div', { classNames: ['dialogue-item'] });
            component.innerHTML = `
                <span class="dialogue-body">${entry[fieldIndexMap['entryText']]}</span>
                <span class="dialogue-signer">${entry[fieldIndexMap['author']]}</span>
                <span class="dialogue-time">${entry[fieldIndexMap['timestampValue']]}</span>
            `;
            return component;
        });
    };

    const displayNewComponents = (entries) => {
        const visualComponents = generateVisualComponents(entries);
        visualComponents.forEach(component => domUtils.insertAtBeginning(component, '.dialogue-feed'));
        allDialogueRecords = allDialogueRecords.concat(entries);
    };

    const fetchDialogueData = async () => {
        if (!serviceConfiguration.dataPath) return;
        try {
            const response = await fetch(serviceConfiguration.dataPath);
            if (!response.ok) {
                if (response.status === 404) {
                    console.info("Dialogue data source not found, assuming no existing discussions.");
                    return;
                }
                throw new Error(`Network response error! Status: ${response.status}`);
            }
            const csvData = await response.text();
            const newEntries = filterAndFormatIncomingEntries(csvData);
            displayNewComponents(newEntries);
        } catch (error) {
            console.error('Failed to retrieve dialogue data:', error);
        }
    };

    const addNewDialogueEntry = (data) => {
        const newRecord = [
            data.entryText,
            data.author,
            data.timestampValue,
            data.pageLocation
        ];
        displayNewComponents([transformSingleRecord(newRecord)]);
    };

    const retrieveAllRecords = () => allDialogueRecords;

    const setupService = (options) => {
        serviceConfiguration = options;
        if (!serviceConfiguration.dataPath && !serviceConfiguration.submissionEndpoint) {
            return;
        }
        if (!serviceConfiguration.dataPath) {
            serviceConfiguration.dataPath = 'dialogues.csv';
        }

        const dialogueMarkup = getDialogueSectionMarkup();
        domUtils.attachToParent(domUtils.constructElement('div', { innerHTML: dialogueMarkup }), '.auxiliary-display');

        fetchDialogueData();
        setInterval(fetchDialogueData, 10 * 60 * 1000);

        if (window.location.hash === '#exportentries') {
            initiateDataExport();
        }
    };

    function getDialogueSectionMarkup() {
        let markup = '<h2 class="dialogue-heading">Discussions</h2>';
        if (serviceConfiguration.submissionEndpoint) {
            markup += `
                <form method="post" id="dataSubmissionForm" class="dialogue-input-form">
                    <div id="feedbackMessage"></div>
                    <input id="contributorIdentity" type="text" placeholder="Your Name" />
                    <textarea id="dialogueContent" placeholder="Your Comment"></textarea>
                    <input type="submit" value="Post" />
                    <span class="instructional-text">Press Shift + Enter to Post</span>
                </form>
            `;
        }
        markup += '<div class="dialogue-feed"></div>';
        return markup;
    }

    function initiateDataExport() {
        setTimeout(() => {
            const records = retrieveAllRecords();
            const formattedRecords = records.map(record => {
                const csvRecord = record.map((field, index) => {
                    let val = field.replace(/<br\/>/g, '\n');
                    val = encodeURIComponent(val);
                    return `"${val}"`;
                });
                return csvRecord.join(',');
            });
            const csvString = formattedRecords.join('\n');
            window.location.href = "data:text/csv," + encodeURIComponent(csvString);
        }, 1000);
    }

    return { setupService, addNewDialogueEntry, fetchDialogueData, retrieveAllRecords, config: serviceConfiguration };
})(ElementManipulator);


// Handles the submission of new dialogue entries
const SubmissionTransmitter = (function(domUtils, dialogueService) {
    const handleEntryTransmission = async (event) => {
        event.preventDefault();
        const formElement = domUtils.acquireElement('#dataSubmissionForm');
        const identityField = domUtils.acquireElement('#contributorIdentity');
        const contentField = domUtils.acquireElement('#dialogueContent');
        const feedbackDisplay = domUtils.acquireElement('#feedbackMessage');

        const identityValue = identityField.value.trim();
        const contentValue = contentField.value.trim();

        if (!identityValue || !contentValue) {
            feedbackDisplay.textContent = "Please complete all fields.";
            domUtils.addAssociatedClass('#dataSubmissionForm', 'incomplete');
            return;
        } else {
            feedbackDisplay.textContent = "";
            domUtils.removeAssociatedClass('#dataSubmissionForm', 'incomplete');
        }

        identityField.value = '';
        contentField.value = '';
        identityField.focus();

        const now = new Date();
        const currentMinutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
        const formattedTime = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${currentMinutes} GMT${now.getTimezoneOffset() / 60 * -1}`;

        const transmissionData = {
            author: encodeURIComponent(identityValue),
            entryText: encodeURIComponent(contentValue),
            timestampValue: formattedTime,
            pageLocation: window.location.pathname
        };

        dialogueService.addNewDialogueEntry(transmissionData);

        try {
            const response = await fetch(dialogueService.config.submissionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(transmissionData).toString()
            });
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            sessionStorage.setItem("persistedIdentity", identityValue);
        } catch (error) {
            console.error('Dialogue transmission failed:', error);
            feedbackDisplay.textContent = `Transmission failed: ${error.message}`;
        }
    };

    const configureInputListeners = (endpoint) => {
        if (endpoint) {
            const form = domUtils.acquireElement('#dataSubmissionForm');
            if (form) {
                form.addEventListener('submit', handleEntryTransmission);
                form.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        form.dispatchEvent(new Event('submit'));
                    }
                });
            }
            const savedIdentity = sessionStorage.getItem("persistedIdentity");
            if (savedIdentity) {
                const identityField = domUtils.acquireElement('#contributorIdentity');
                if (identityField) identityField.value = decodeURIComponent(savedIdentity);
            }
        }
    };

    return { configureInputListeners };
})(ElementManipulator, DialogueDataService);


// Orchestrates all application components
const ApplicationManager = (function(domUtils, widgetAnimator, annotationHandler, dialogueService, submissionTransmitter) {

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    const initializeApplication = () => {
        // 1. Core DOM elements creation
        domUtils.attachToParent(domUtils.constructElement('a', { classNames: ['engagement-trigger'], href: '#' }), 'body');
        domUtils.attachToParent(domUtils.constructElement('div', { classNames: ['auxiliary-display', 'scroll-zone'] }), 'body');

        // 2. Annotation processing and display
        annotationHandler.processAndMarkElements();
        annotationHandler.populateAuxiliaryDisplay();

        // 3. External dialogue module setup
        const dialogueSourceMeta = domUtils.acquireElement('meta[name="dialogue-source-path"]')?.getAttribute('content');
        const submissionActionMeta = domUtils.acquireElement('meta[name="submission-action-url"]')?.getAttribute('content');
        dialogueService.setupService({ dataPath: dialogueSourceMeta, submissionEndpoint: submissionActionMeta });
        submissionTransmitter.configureInputListeners(submissionActionMeta);

        // 4. Widget interaction logic initialization
        const currentViewportWidth = window.innerWidth;
        widgetAnimator.setupWidgetLayout(currentViewportWidth);

        // 5. Event binding
        domUtils.acquireElement('.engagement-trigger').addEventListener('click', (e) => {
            e.preventDefault();
            widgetAnimator.adjustWidgetState();
        });
        domUtils.acquireAllElements('.visual-indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                widgetAnimator.adjustWidgetState();
            });
        });

        domUtils.acquireElement('#markerVisibility').addEventListener('change', () => {
            domUtils.acquireAllElements('.visual-indicator').forEach(indicator => {
                domUtils.changeVisibility(`[data-unique-id="${indicator.parentElement.getAttribute('data-unique-id')}"] .visual-indicator`, domUtils.acquireElement('#markerVisibility').checked ? '' : 'none');
            });
        });

        window.addEventListener('resize', throttle(() => {
            widgetAnimator.setupWidgetLayout(window.innerWidth);
        }, 200));

        // Custom scroll behavior for the scroll zone
        domUtils.acquireElement('.scroll-zone').addEventListener('wheel', (ev) => {
            const target = ev.currentTarget;
            const scrollingUp = ev.deltaY < 0;
            const isAtTop = target.scrollTop === 0;
            const isAtBottom = target.scrollHeight - target.clientHeight <= target.scrollTop + 1;

            if ((scrollingUp && isAtTop) || (!scrollingUp && isAtBottom)) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        }, { passive: false });
    };

    return { initializeApplication };
})(ElementManipulator, WidgetPositioner, PageAnnotationHandler, DialogueDataService, SubmissionTransmitter);


window.addEventListener('DOMContentLoaded', ApplicationManager.initializeApplication);