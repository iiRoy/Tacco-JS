const eventHub = {
    subscribers: {},
    on(channel, handler) {
        if (!this.subscribers[channel]) {
            this.subscribers[channel] = [];
        }
        this.subscribers[channel].push(handler);
    },
    emit(channel, payload) {
        if (this.subscribers[channel]) {
            this.subscribers[channel].forEach(handler => handler(payload));
        }
    }
};

const applicationNexus = {
    config: {
        activeRoute: 'views',
        accessProtocol: '',
        initialQuery: '',
        basePath: ''
    },
    domNodes: {
        searchField: null,
        resultsArea: null,
        displayPane: null,
        codeEditorTarget: null,
        fileReference: null,
        headingTitle: null,
        detailContent: null,
        regexLiteral: null
    },
    dataStores: {
        patternEntities: [],
        templateEntities: []
    },
    activeServices: {
        listController: null,
        mainCodeDisplay: null
    }
};

// --- Utility DOM Functions (replacing jQuery) ---
function retrieveNode(selector) { return document.querySelector(selector); }
function generateNode(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    for (const key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, key)) {
            element.setAttribute(key, attributes[key]);
        }
    }
    element.innerHTML = content;
    return element;
}
function clearNodeChildren(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}
function addCssClass(node, className) { node.classList.add(className); }
function removeCssClass(node, className) { node.classList.remove(className); }
function toggleCssClass(node, className) { node.classList.toggle(className); }

// --- Data Adapters (replacing Backbone Model methods) ---
const recordPatternAdapter = {
    getSearchValue: (record) => `${record.normalized_pattern} ${record.view_module}.${record.view_name}`,
    getMainTitle: (record) => record.annotated_pattern,
    getSubtitle: (record) => `${record.view_module}.${record.view_name}`
};

const recordTemplateAdapter = {
    getSearchValue: (ref) => ref.name,
    getMainTitle: (ref) => ref.name,
    getSubtitle: (ref) => ''
};

// --- Data Fetchers (replacing Backbone Collection.fetch and Model.fetch) ---
async function obtainPatternRecords() {
    const response = await fetch('urlpatterns/');
    return response.json();
}

async function obtainTemplateReferences() {
    const response = await fetch('/_alto/template-paths/');
    return response.json();
}

async function obtainBackendViewSource(modulePath, viewName) {
    const response = await fetch(`views/${modulePath}/${viewName}/`);
    return response.json();
}

async function obtainTemplateSource(templateName) {
    const response = await fetch(`/_alto/templates/${templateName}/`);
    return response.json();
}

// --- UI Component: List Item Renderer (replacing SearchRow) ---
function createListItem(itemData, parentElement, adapter) {
    const itemElement = generateNode('li', {}, `<a href="#">${adapter.getMainTitle(itemData)}<br>${adapter.getSubtitle(itemData)}</a>`);
    itemElement.addEventListener('click', (evt) => {
        evt.preventDefault();
        eventHub.emit('itemActivated', { node: itemElement, data: itemData });
    });
    parentElement.appendChild(itemElement);
    return { node: itemElement, data: itemData };
}

// --- UI Component: Result List Controller (replacing SearchList) ---
const resultListController = (function() {
    let activeSelectedNode = null;
    let renderedItemNodes = []; // Array of { node, data } objects
    let currentAdapter = null;
    let currentDataCollection = [];

    function initialize(containerNodeId) {
        applicationNexus.domNodes.resultsArea = retrieveNode(containerNodeId);
        eventHub.on('itemActivated', handleItemActivation);
        eventHub.on('queryUpdated', refreshDisplay);
    }

    function setCollectionAndAdapter(collection, adapter) {
        currentDataCollection = collection;
        currentAdapter = adapter;
        refreshDisplay();
    }

    function handleItemActivation(payload) {
        if (activeSelectedNode) {
            removeCssClass(activeSelectedNode, 'active');
        }
        addCssClass(payload.node, 'active');
        activeSelectedNode = payload.node;
        eventHub.emit('detailDataReady', payload.data);
    }

    function getFilteredAndRankedItems(query) {
        const results = [];
        let indexCounter = 1.0;
        currentDataCollection.forEach(item => {
            if (query) {
                const candidate = currentAdapter.getSearchValue(item);
                const score = LiquidMetal.score(candidate, query);
                if (score > 0) {
                    results.push([score, item]);
                }
            } else {
                results.push([-indexCounter, item]);
                indexCounter = indexCounter + 1.0;
            }
        });
        return results.sort((a, b) => b[0] - a[0]).map(pair => pair[1]);
    }

    function refreshDisplay() {
        clearNodeChildren(applicationNexus.domNodes.resultsArea);
        renderedItemNodes = [];
        const query = applicationNexus.config.initialQuery;
        const itemsToRender = getFilteredAndRankedItems(query);

        itemsToRender.forEach(item => {
            renderedItemNodes.push(createListItem(item, applicationNexus.domNodes.resultsArea, currentAdapter));
        });

        if (renderedItemNodes.length > 0) {
            // If no item is selected or the selected item is no longer in the list, select the first one
            if (!activeSelectedNode || !renderedItemNodes.some(node => node.node === activeSelectedNode)) {
                handleItemActivation(renderedItemNodes[0]);
            }
        } else {
            activeSelectedNode = null;
            eventHub.emit('detailDataReady', null);
        }
    }

    function changeSelection(direction) { // -1 for previous, 1 for next
        if (renderedItemNodes.length === 0) return;

        let currentIndex = -1;
        if (activeSelectedNode) {
            currentIndex = renderedItemNodes.findIndex(node => node.node === activeSelectedNode);
        }

        let nextIndex;
        if (currentIndex === -1) {
            nextIndex = 0;
        } else {
            nextIndex = currentIndex + direction;
            if (nextIndex < 0) nextIndex = 0;
            if (nextIndex >= renderedItemNodes.length) nextIndex = renderedItemNodes.length - 1;
        }
        if (renderedItemNodes[nextIndex]) {
            handleItemActivation(renderedItemNodes[nextIndex]);
        }
    }

    return { initialize, setCollectionAndAdapter, refreshDisplay, changeSelection };
})();

// --- UI Component: Pattern Detail Viewer (replacing ViewPanel) ---
const patternDetailViewer = (function() {
    let currentDisplayModel = null;

    function initialize(containerNodeId, editorNodeId) {
        applicationNexus.domNodes.displayPane = retrieveNode(containerNodeId);
        applicationNexus.domNodes.headingTitle = retrieveNode(`${containerNodeId} h2`);
        applicationNexus.domNodes.detailContent = retrieveNode(`${containerNodeId} #paneldetails`);
        applicationNexus.domNodes.fileReference = retrieveNode('#filename');
        applicationNexus.domNodes.regexLiteral = generateNode('code', { id: 'regex' }); // Recreate element for clarity

        applicationNexus.activeServices.mainCodeDisplay = CodeMirror.fromTextArea(retrieveNode(editorNodeId), {
            mode: "python",
            theme: "elegant",
            lineWrapping: true,
            lineNumbers: true,
            readOnly: true
        });
        eventHub.on('detailDataReady', displayDetails);
    }

    async function displayDetails(modelData) {
        if (!modelData) {
            clearNodeChildren(applicationNexus.domNodes.headingTitle);
            clearNodeChildren(applicationNexus.domNodes.detailContent);
            clearNodeChildren(applicationNexus.domNodes.fileReference);
            applicationNexus.activeServices.mainCodeDisplay.setValue('');
            return;
        }
        currentDisplayModel = modelData;

        applicationNexus.domNodes.headingTitle.textContent = modelData.view_name;
        clearNodeChildren(applicationNexus.domNodes.detailContent);
        applicationNexus.domNodes.detailContent.appendChild(generateNode('p', { id: 'modulename' }, modelData.view_module));
        applicationNexus.domNodes.detailContent.appendChild(applicationNexus.domNodes.regexLiteral);
        applicationNexus.domNodes.regexLiteral.textContent = modelData.raw_pattern;

        const viewInformation = await obtainBackendViewSource(modelData.view_module, modelData.view_name);
        const fileLink = `${applicationNexus.config.accessProtocol}://open?url=file://${viewInformation.file}&line=${viewInformation.line_number}`;
        applicationNexus.domNodes.fileReference.innerHTML = `<a href="${fileLink}">${viewInformation.file}</a>`;
        applicationNexus.activeServices.mainCodeDisplay.setValue(viewInformation.source);
        applicationNexus.activeServices.mainCodeDisplay.setOption('firstLineNumber', viewInformation.line_number);
    }
    return { initialize, displayDetails };
})();

// --- UI Component: Template Detail Viewer (replacing CodePanel) ---
const templateDetailViewer = (function() {
    let currentDisplayModel = null;

    function initialize(containerNodeId, editorNodeId) {
        applicationNexus.domNodes.displayPane = retrieveNode(containerNodeId);
        applicationNexus.domNodes.headingTitle = retrieveNode(`${containerNodeId} h2`);
        applicationNexus.domNodes.detailContent = retrieveNode(`${containerNodeId} #paneldetails`);
        applicationNexus.domNodes.fileReference = retrieveNode('#filename');

        applicationNexus.activeServices.mainCodeDisplay = CodeMirror.fromTextArea(retrieveNode(editorNodeId), {
            mode: "htmlmixed",
            theme: "elegant",
            lineWrapping: true,
            lineNumbers: true,
            readOnly: true
        });
        eventHub.on('detailDataReady', displayDetails);
    }

    async function displayDetails(modelData) {
        if (!modelData) {
            clearNodeChildren(applicationNexus.domNodes.headingTitle);
            clearNodeChildren(applicationNexus.domNodes.detailContent);
            clearNodeChildren(applicationNexus.domNodes.fileReference);
            applicationNexus.activeServices.mainCodeDisplay.setValue('');
            return;
        }
        currentDisplayModel = modelData;

        applicationNexus.domNodes.headingTitle.textContent = modelData.name;
        clearNodeChildren(applicationNexus.domNodes.detailContent);

        const templateInformation = await obtainTemplateSource(modelData.name);
        const fileLink = `${applicationNexus.config.accessProtocol}://open?url=file://${templateInformation.file}`;
        applicationNexus.domNodes.fileReference.innerHTML = `<a href="${fileLink}">${templateInformation.file}</a>`;
        applicationNexus.activeServices.mainCodeDisplay.setValue(templateInformation.source);

        if (templateInformation.parents && templateInformation.parents.length > 0) {
            const parentList = generateNode('ul');
            templateInformation.parents.forEach(parent => {
                const parentFileLink = `${applicationNexus.config.accessProtocol}://open?url=file://${parent.file}`;
                parentList.appendChild(generateNode('li', {}, `<a href="${parentFileLink}">${parent.name}</a>`));
            });
            applicationNexus.domNodes.detailContent.appendChild(parentList);
        }
    }
    return { initialize, displayDetails };
})();

// --- Routing and View Management (replacing Backbone.Router) ---
const navigationManager = (function() {
    const viewRenderers = {
        'views': renderPatternSection,
        'templates': renderTemplateSection
    };

    function parseAndExecuteRoute(pathSegment) {
        const primaryRoute = pathSegment.split('/')[0];
        if (viewRenderers[primaryRoute]) {
            viewRenderers[primaryRoute]();
        }
    }

    function navigateToPath(segment) {
        const newUrl = `${applicationNexus.config.basePath}${segment}/`;
        window.history.pushState({}, '', newUrl);
        parseAndExecuteRoute(segment);
    }

    window.addEventListener('popstate', () => {
        const currentPath = window.location.pathname.replace(applicationNexus.config.basePath, '');
        parseAndExecuteRoute(currentPath);
    });

    return { parseAndExecuteRoute, navigateToPath };
})();

async function renderPatternSection() {
    applicationNexus.config.activeRoute = 'views';
    const patterns = await obtainPatternRecords();
    applicationNexus.dataStores.patternEntities = patterns;
    resultListController.setCollectionAndAdapter(patterns, recordPatternAdapter);
    patternDetailViewer.initialize('#panel', 'viewcode');
}

async function renderTemplateSection() {
    applicationNexus.config.activeRoute = 'templates';
    const templates = await obtainTemplateReferences();
    applicationNexus.dataStores.templateEntities = templates;
    resultListController.setCollectionAndAdapter(templates, recordTemplateAdapter);
    templateDetailViewer.initialize('#panel', 'viewcode');
}

// --- Main Application Bootstrapping ---
document.addEventListener('DOMContentLoaded', async () => {
    // Initial configuration from a hypothetical global 'appSettings' object
    // mimicking the 'options' passed to alto.initialize
    const appSettings = window.appSettings || {};
    applicationNexus.config.activeRoute = appSettings.mode || 'views';
    applicationNexus.config.accessProtocol = appSettings.url_scheme || 'vscode';
    applicationNexus.config.initialQuery = appSettings.query || '';
    applicationNexus.config.basePath = '/_alto/'; // Hardcoded root path

    // Initialize DOM node references
    applicationNexus.domNodes.searchField = retrieveNode('#search');
    applicationNexus.domNodes.searchField.value = applicationNexus.config.initialQuery;

    // Initialize core components
    resultListController.initialize('#searchlist');
    // Initialize both panel types, the routing logic will ensure the correct one is active via event listeners
    patternDetailViewer.initialize('#panel', 'viewcode');
    templateDetailViewer.initialize('#panel', 'viewcode');

    // Set up initial route and navigate
    navigationManager.parseAndExecuteRoute(applicationNexus.config.activeRoute);
    navigationManager.navigateToPath(applicationNexus.config.activeRoute);

    // Event listeners for search field and global key presses
    applicationNexus.domNodes.searchField.addEventListener('keyup', (evt) => {
        applicationNexus.config.initialQuery = evt.target.value;
        eventHub.emit('queryUpdated');
    });

    document.body.addEventListener('keyup', (evt) => {
        if (evt.keyCode === 27) { // Escape key
            applicationNexus.domNodes.searchField.value = '';
            applicationNexus.config.initialQuery = '';
            eventHub.emit('queryUpdated');
        } else if (evt.keyCode === 38) { // Up arrow
            resultListController.changeSelection(-1);
        } else if (evt.keyCode === 40) { // Down arrow
            resultListController.changeSelection(1);
        }
    });

    applicationNexus.domNodes.searchField.focus();
});