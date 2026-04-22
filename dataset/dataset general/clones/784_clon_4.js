class ContentNavigator {
    #elementHost;
    #currentConfiguration;
    #internalMetrics = {
        dataRetrieved: false,
        interfaceBuilt: false,
        totalPagesCount: 1,
        totalItemCount: 0,
        firstItemIndex: 0,
        lastItemIndex: 0,
        controlPanels: []
    };
    #originalContent;

    #interactionProcessors = {};

    constructor(hostElement, initialOptions) {
        if (!(hostElement instanceof HTMLElement)) {
            console.error("Host element must be a valid DOM element.");
            return;
        }

        this.#elementHost = hostElement;
        this.#originalContent = hostElement.innerHTML;

        this.#currentConfiguration = this.#deepMerge({}, ContentNavigator.defaultPaginatorOptions, initialOptions || {});
        
        this.#setupInteractionProcessors();

        this.#elementHost.classList.add('data-grid-container');

        this.#initializeComponent();
    }

    #initializeComponent() {
        const generatedBars = this.#constructControlPanel(this.#currentConfiguration);
        
        switch (this.#currentConfiguration.placementOption) {
            case "both":
                this.#elementHost.insertAdjacentElement('beforebegin', generatedBars[0]);
                this.#elementHost.insertAdjacentElement('afterend', generatedBars[1]);
                break;
            case "top":
                this.#elementHost.insertAdjacentElement('beforebegin', generatedBars[0]);
                break;
            case "bottom":
                this.#elementHost.insertAdjacentElement('afterend', generatedBars[0]);
                break;
        }
        
        this.#internalMetrics.controlPanels = Array.from(this.#elementHost.parentNode.querySelectorAll('.data-control-bar'));
        
        this.#attachInteractionListeners();

        this.#invokeListener('onInitialize');
        this.#invokeListener('onRender');
        this.#internalMetrics.interfaceBuilt = true;

        this.#processPageNavigation(this.#currentConfiguration.currentPage);
    }

    removeComponent() {
        this.#invokeListener('onDestroy');
        this.#detachInteractionListeners();
        this.#internalMetrics.controlPanels.forEach(panel => panel.remove());
        this.#elementHost.innerHTML = this.#originalContent;
        this.#elementHost.classList.remove('data-grid-container');
        this.#elementHost.removeDataGridPaginatorInstance();
    }

    configureComponent(newSettings) {
        const previousConfig = this.#deepMerge({}, this.#currentConfiguration);

        if (typeof newSettings === 'object') {
            this.#currentConfiguration = this.#deepMerge(this.#currentConfiguration, newSettings);
        } else if (arguments.length === 2) {
            this.#currentConfiguration[arguments[0]] = arguments[1];
        } else {
            return this.#currentConfiguration[arguments[0]];
        }

        for (const key in previousConfig) {
            if (Object.prototype.hasOwnProperty.call(previousConfig, key) && Object.prototype.hasOwnProperty.call(this.#currentConfiguration, key)) {
                if (JSON.stringify(previousConfig[key]) !== JSON.stringify(this.#currentConfiguration[key])) {
                    this.#interactionProcessors.handleConfigChange(key, previousConfig[key], this.#currentConfiguration[key]);
                }
            }
        }
    }

    reacquireData() {
        this.#initiateDataFetch(this.#currentConfiguration.currentPage);
    }

    #deepMerge(target, ...sources) {
        if (!target || typeof target !== 'object') {
            return target;
        }
        for (const source of sources) {
            if (source && typeof source === 'object') {
                for (const key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null) {
                            target[key] = this.#deepMerge(target[key] || {}, source[key]);
                        } else {
                            target[key] = source[key];
                        }
                    }
                }
            }
        }
        return target;
    }

    #setupInteractionProcessors() {
        this.#interactionProcessors.handleConfigChange = (optionKey, oldVal, newVal) => {
            switch (optionKey) {
                case "currentPage":
                    if (newVal > this.#internalMetrics.totalPagesCount && (this.#internalMetrics.interfaceBuilt && this.#internalMetrics.dataRetrieved)) {
                        this.#currentConfiguration.currentPage = oldVal;
                        this.#updateInputPageValue(oldVal);
                        console.error('Paginator: Requested page exceeds total available pages.');
                    } else {
                        this.#interactionProcessors.handlePageUpdateTrigger(newVal);
                    }
                    break;
                case "extraClasses":
                    this.#internalMetrics.controlPanels.forEach(panel => {
                        if (!panel.classList.contains(newVal)) {
                            panel.classList.add(newVal);
                        }
                    });
                    break;
                case "searchQuery":
                    this.#interactionProcessors.handlePageUpdateTrigger(1);
                    break;
            }
        };

        this.#interactionProcessors.handlePageJumpSubmission = (evt) => {
            evt.preventDefault();
            const form = evt.currentTarget;
            const pageInput = form.querySelector('[data-page-input]');
            const requestedPage = parseInt(pageInput.value, 10);
            if (!isNaN(requestedPage) && requestedPage > 0) {
                this.configureComponent('currentPage', requestedPage);
            }
        };

        this.#interactionProcessors.handlePageUpdateTrigger = (pageNumber) => {
            this.#initiateDataFetch(pageNumber);
        };

        this.#interactionProcessors.handleSortPreference = (evt) => {
            evt.preventDefault();
            const clickedLink = evt.currentTarget;
            const sortKey = clickedLink.getAttribute('data-sort-key');
            const currentIcon = clickedLink.querySelector('i');
            let currentDirection = currentIcon ? currentIcon.getAttribute('data-sort-direction') : '';

            this.#internalMetrics.controlPanels.forEach(panel => {
                panel.querySelectorAll('.data-sort-link i').forEach(icon => {
                    icon.className = 'icon-';
                    icon.removeAttribute('data-sort-direction');
                });
            });

            this.#currentConfiguration.sortColumn = sortKey;
            if (currentDirection === 'up') {
                this.#currentConfiguration.sortDirection = 'desc';
                if (currentIcon) {
                    currentIcon.className = 'icon-arrow-down';
                    currentIcon.setAttribute('data-sort-direction', 'down');
                }
            } else if (currentDirection === 'down') {
                this.#currentConfiguration.sortDirection = 'asc';
                if (currentIcon) {
                    currentIcon.className = 'icon-arrow-up';
                    currentIcon.setAttribute('data-sort-direction', 'up');
                }
            } else {
                this.#currentConfiguration.sortDirection = 'desc';
                if (currentIcon) {
                    currentIcon.className = 'icon-arrow-down';
                    currentIcon.setAttribute('data-sort-direction', 'down');
                }
            }
            
            const dropdownParent = clickedLink.closest('.dropdown');
            if (dropdownParent) dropdownParent.classList.remove('open');

            this.reacquireData();
        };

        this.#interactionProcessors.handleDisplayLimit = (evt) => {
            evt.preventDefault();
            const clickedLink = evt.currentTarget;
            const newLimit = parseInt(clickedLink.textContent, 10);

            this.#internalMetrics.controlPanels.forEach(panel => {
                panel.querySelectorAll('.data-limit-link i').forEach(icon => {
                    icon.className = 'icon-';
                });
            });

            this.#currentConfiguration.itemsPerPage = newLimit;
            const icon = clickedLink.querySelector('i');
            if (icon) icon.className = 'icon-chevron-right';

            const dropdownParent = clickedLink.closest('.dropdown');
            if (dropdownParent) dropdownParent.classList.remove('open');

            this.reacquireData();
        };

        this.#interactionProcessors.handleNavigationClick = (evt) => {
            evt.preventDefault();
            const clickedLink = evt.currentTarget;
            const action = clickedLink.getAttribute('data-nav-action');

            if (!clickedLink.classList.contains('disabled')) {
                this.#triggerInternalNavigation(action);
            }
        };

        this.#interactionProcessors.handleKeyEnterSubmit = (evt) => {
            if (evt.which === 13) {
                evt.preventDefault();
                evt.currentTarget.closest('form').dispatchEvent(new Event('submit'));
            }
        };
    }

    #triggerInternalNavigation(action) {
        let newPage = this.#currentConfiguration.currentPage;
        switch (action) {
            case 'first':
                newPage = 1;
                break;
            case 'previous':
                newPage = this.#currentConfiguration.currentPage - 1;
                break;
            case 'next':
                newPage = this.#currentConfiguration.currentPage + 1;
                break;
            case 'last':
                newPage = this.#internalMetrics.totalPagesCount;
                break;
        }
        this.configureComponent('currentPage', newPage);
    }

    #attachInteractionListeners() {
        this.#internalMetrics.controlPanels.forEach(panel => {
            panel.querySelectorAll('.data-nav-link').forEach(link => {
                link.addEventListener('click', this.#interactionProcessors.handleNavigationClick);
            });

            panel.querySelectorAll('.page-jump-form').forEach(form => {
                form.addEventListener('submit', this.#interactionProcessors.handlePageJumpSubmission);
                form.querySelector('[data-page-input]').addEventListener('keypress', this.#interactionProcessors.handleKeyEnterSubmit);
            });

            if (!this.#isObjectEmpty(this.#currentConfiguration.sortOptions)) {
                panel.querySelectorAll('.data-sort-link').forEach(link => {
                    link.addEventListener('click', this.#interactionProcessors.handleSortPreference);
                });
            }

            if (this.#currentConfiguration.showLimitDropdown) {
                panel.querySelectorAll('.data-limit-link').forEach(link => {
                    link.addEventListener('click', this.#interactionProcessors.handleDisplayLimit);
                });
            }
        });
    }

    #detachInteractionListeners() {
        this.#internalMetrics.controlPanels.forEach(panel => {
            panel.querySelectorAll('.data-nav-link').forEach(link => {
                link.removeEventListener('click', this.#interactionProcessors.handleNavigationClick);
            });

            panel.querySelectorAll('.page-jump-form').forEach(form => {
                form.removeEventListener('submit', this.#interactionProcessors.handlePageJumpSubmission);
                form.querySelector('[data-page-input]').removeEventListener('keypress', this.#interactionProcessors.handleKeyEnterSubmit);
            });

            if (!this.#isObjectEmpty(this.#currentConfiguration.sortOptions)) {
                panel.querySelectorAll('.data-sort-link').forEach(link => {
                    link.removeEventListener('click', this.#interactionProcessors.handleSortPreference);
                });
            }

            if (this.#currentConfiguration.showLimitDropdown) {
                panel.querySelectorAll('.data-limit-link').forEach(link => {
                    link.removeEventListener('click', this.#interactionProcessors.handleDisplayLimit);
                });
            }
        });
    }

    #constructControlPanel(config) {
        const createEl = (tag, classes = [], attributes = {}, children = []) => {
            const el = document.createElement(tag);
            if (classes.length) el.className = classes.join(' ');
            for (const key in attributes) {
                if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                    el.setAttribute(key, attributes[key]);
                }
            }
            children.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    el.appendChild(child);
                }
            });
            return el;
        };

        const createIcon = (iconClass, direction = '') => {
            const i = createEl('i', [iconClass]);
            if (direction) i.setAttribute('data-sort-direction', direction);
            return i;
        };

        const buildBar = (barConfig) => {
            const navPillsLeft = createEl('ul', ['nav', 'nav-pills'], {}, [
                createEl('li', [], {}, [createEl('a', ['data-nav-link'], { href: '#first', 'data-nav-action': 'first' }, ['|«'])]),
                createEl('li', ['divider-vertical']),
                createEl('li', [], {}, [createEl('a', ['data-nav-link'], { href: '#previous', 'data-nav-action': 'previous' }, ['«'])]),
                createEl('li', ['divider-vertical'])
            ]);

            const jumpForm = createEl('form', ['page-jump-form', 'navbar-form', 'pull-left'], { name: 'page-jump' }, [
                createEl('strong', [], {}, ['Page']),
                ' ',
                createEl('input', [], { type: 'text', 'data-page-input': '', value: '0', style: 'width:25px;' }),
                ' ',
                createEl('strong', [], {}, ['of ']),
                createEl('span', ['total-pages-display'], {}, ['0'])
            ]);

            const navPillsRightChildren = [
                createEl('li', ['divider-vertical']),
                createEl('li', [], {}, [createEl('a', ['data-nav-link'], { href: '#next', 'data-nav-action': 'next' }, ['»'])]),
                createEl('li', ['divider-vertical']),
                createEl('li', [], {}, [createEl('a', ['data-nav-link'], { href: '#last', 'data-nav-action': 'last' }, ['»|'])]),
                createEl('li', ['divider-vertical'])
            ];

            if (barConfig.showLimitDropdown) {
                const limitMenuChildren = barConfig.itemLimitOptions.map(limit =>
                    createEl('li', [], {}, [
                        createEl('a', ['data-limit-link'], { href: `#limit-${limit}`, 'data-limit-value': limit }, [
                            createIcon((limit === barConfig.itemsPerPage ? 'icon-chevron-right' : '')),
                            String(limit)
                        ])
                    ])
                );
                const limitDropdown = createEl('li', ['dropdown'], {}, [
                    createEl('a', ['dropdown-toggle'], { 'data-toggle': 'dropdown', href: '#' }, ['Limit', createEl('b', ['caret'])]),
                    createEl('ul', ['dropdown-menu'], {}, limitMenuChildren)
                ]);
                navPillsRightChildren.push(limitDropdown, createEl('li', ['divider-vertical']));
            }

            if (!this.#isObjectEmpty(barConfig.sortOptions)) {
                const sortMenuChildren = [];
                for (const key in barConfig.sortOptions) {
                    if (Object.prototype.hasOwnProperty.call(barConfig.sortOptions, key)) {
                        let sortIconClass = 'icon-';
                        let sortDirection = '';
                        if (barConfig.sortColumn && key === barConfig.sortColumn) {
                            if (barConfig.sortDirection === 'asc') {
                                sortIconClass = 'icon-arrow-up';
                                sortDirection = 'up';
                            } else if (barConfig.sortDirection === 'desc') {
                                sortIconClass = 'icon-arrow-down';
                                sortDirection = 'down';
                            }
                        }
                        sortMenuChildren.push(
                            createEl('li', [], {}, [
                                createEl('a', ['data-sort-link'], { href: `#filter-${key}`, 'data-sort-key': key }, [
                                    createIcon(sortIconClass, sortDirection),
                                    barConfig.sortOptions[key]
                                ])
                            ])
                        );
                    }
                }
                const sortDropdown = createEl('li', ['dropdown'], {}, [
                    createEl('a', ['dropdown-toggle'], { 'data-toggle': 'dropdown', href: '#' }, ['Sort By', createEl('b', ['caret'])]),
                    createEl('ul', ['dropdown-menu'], {}, sortMenuChildren)
                ]);
                navPillsRightChildren.push(sortDropdown, createEl('li', ['divider-vertical']));
            }
            const navPillsRight = createEl('ul', ['nav', 'nav-pills'], {}, navPillsRightChildren);

            const countsSpan = createEl('span', ['pull-right', 'navbar-text', 'item-counts-display'], { style: 'margin-right:20px;' }, [
                createEl('strong', [], {}, ['View ']),
                createEl('span', ['first-item-display'], {}, ['0']),
                ' - ',
                createEl('span', ['last-item-display'], {}, ['0']),
                ' of ',
                createEl('span', ['total-item-display'], {}, ['0'])
            ]);
            
            const collapseDiv = createEl('div', ['nav-collapse'], {}, [navPillsLeft, jumpForm, navPillsRight, countsSpan]);
            const containerDiv = createEl('div', ['container'], {}, [collapseDiv]);
            const innerDiv = createEl('div', ['navigator-inner'], {}, [containerDiv]);
            const controlBar = createEl('div', ['data-control-bar', 'grid-navigator', barConfig.extraClasses], {}, [innerDiv]);

            return controlBar;
        };

        const bars = [];
        if (config.placementOption === 'both') {
            bars.push(buildBar(config));
            bars.push(buildBar(config));
        } else {
            bars.push(buildBar(config));
        }
        return bars;
    }

    #insertContentBlocker(message) {
        const blockerBackdrop = document.createElement('div');
        blockerBackdrop.className = 'component-backdrop fade in';
        this.#elementHost.appendChild(blockerBackdrop);
        this.#elementHost.classList.add('blocked-content');

        if (message !== undefined) {
            const messageBox = document.createElement('div');
            messageBox.className = 'blocker-message alert alert-info';
            messageBox.style.display = 'none';
            const messageText = document.createElement('div');
            messageText.textContent = message;
            messageBox.appendChild(messageText);
            this.#elementHost.appendChild(messageBox);

            const hostRect = this.#elementHost.getBoundingClientRect();
            const msgRect = messageBox.getBoundingClientRect();

            messageBox.style.top = `${(hostRect.height - msgRect.height) / 2}px`;
            messageBox.style.left = `${(hostRect.width - msgRect.width) / 2}px`;
            messageBox.style.display = '';
        }
    }

    #removeContentBlocker() {
        this.#elementHost.querySelectorAll('.component-backdrop, .blocker-message').forEach(el => el.remove());
        this.#elementHost.classList.remove('blocked-content');
    }

    #updatePaginationMetrics(page, totalPages, totalRecords) {
        this.#internalMetrics.totalPagesCount = totalPages;
        this.#internalMetrics.totalItemCount = totalRecords;
        
        let newPage = page;
        if (newPage < 1) newPage = 1;
        if (newPage > totalPages) newPage = totalPages;
        
        this.#currentConfiguration.currentPage = newPage;

        this.#internalMetrics.controlPanels.forEach(panel => {
            const firstLink = panel.querySelector('[data-nav-action="first"]');
            const prevLink = panel.querySelector('[data-nav-action="previous"]');
            const nextLink = panel.querySelector('[data-nav-action="next"]');
            const lastLink = panel.querySelector('[data-nav-action="last"]');

            if (firstLink) (newPage === 1) ? firstLink.classList.add('disabled') : firstLink.classList.remove('disabled');
            if (prevLink) (newPage === 1) ? prevLink.classList.add('disabled') : prevLink.classList.remove('disabled');

            if (nextLink) (newPage === totalPages || totalPages === 0) ? nextLink.classList.add('disabled') : nextLink.classList.remove('disabled');
            if (lastLink) (newPage === totalPages || totalPages === 0) ? lastLink.classList.add('disabled') : lastLink.classList.remove('disabled');

            const totalPagesDisplay = panel.querySelector('.total-pages-display');
            if (totalPagesDisplay) totalPagesDisplay.textContent = totalPages;
            const pageInput = panel.querySelector('[data-page-input]');
            if (pageInput) pageInput.value = newPage;

            const count = (newPage * this.#currentConfiguration.itemsPerPage);
            this.#internalMetrics.firstItemIndex = ((this.#currentConfiguration.itemsPerPage * (newPage - 1)) + 1);
            this.#internalMetrics.lastItemIndex = (count > totalRecords) ? totalRecords : count;
            
            const firstItemDisplay = panel.querySelector('.first-item-display');
            if (firstItemDisplay) firstItemDisplay.textContent = this.#internalMetrics.firstItemIndex;
            const lastItemDisplay = panel.querySelector('.last-item-display');
            if (lastItemDisplay) lastItemDisplay.textContent = this.#internalMetrics.lastItemIndex;
            const totalItemDisplay = panel.querySelector('.total-item-display');
            if (totalItemDisplay) totalItemDisplay.textContent = totalRecords;
        });
    }

    #initiateDataFetch(pageNumber) {
        this.#invokeListener('onBeforeLoad');
        this.#insertContentBlocker(this.#currentConfiguration.loadingMessage);

        const requestPayload = this.#deepMerge({}, this.#currentConfiguration.ajaxRequest.data);
        requestPayload[this.#currentConfiguration.paramKeys.page] = pageNumber;
        requestPayload[this.#currentConfiguration.paramKeys.limit] = this.#currentConfiguration.itemsPerPage;
        if (this.#currentConfiguration.sortColumn) {
            requestPayload[this.#currentConfiguration.paramKeys.sort] = this.#currentConfiguration.sortColumn;
            requestPayload[this.#currentConfiguration.paramKeys.direction] = this.#currentConfiguration.sortDirection;
        }
        if (this.#currentConfiguration.searchQuery) {
            requestPayload[this.#currentConfiguration.paramKeys.search] = this.#currentConfiguration.searchQuery;
        }

        const requestOptions = {
            method: this.#currentConfiguration.ajaxRequest.method,
        };

        let requestEndpoint = this.#currentConfiguration.ajaxRequest.endpoint;

        if (this.#currentConfiguration.ajaxRequest.method.toUpperCase() === 'POST') {
            requestOptions.headers = { 'Content-Type': 'application/json' };
            requestOptions.body = JSON.stringify(requestPayload);
        } else {
            const url = new URL(requestEndpoint);
            for (const key in requestPayload) {
                if (Object.prototype.hasOwnProperty.call(requestPayload, key)) {
                    url.searchParams.append(key, requestPayload[key]);
                }
            }
            requestEndpoint = url.toString();
        }

        fetch(requestEndpoint, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const dataType = this.#currentConfiguration.ajaxRequest.dataType;
                if (typeof response[dataType] === 'function') {
                    return response[dataType]();
                } else {
                    return response.text(); // Fallback
                }
            })
            .then(data => {
                this.#removeContentBlocker();
                this.#invokeListener('onPreprocess', data);

                const dataReader = this.#currentConfiguration.responseReader;
                const success = this.#getPropertyByPath(data, dataReader.successKey);
                const message = this.#getPropertyByPath(data, dataReader.messageKey);
                const totalPages = this.#getPropertyByPath(data, dataReader.totalPagesKey);
                const totalRecords = this.#getPropertyByPath(data, dataReader.totalRecordsKey);
                const rootData = dataReader.rootPath ? this.#getPropertyByPath(data, dataReader.rootPath) : data;

                if (success) {
                    this.#updatePaginationMetrics(pageNumber, totalPages, totalRecords);
                    this.#currentConfiguration.currentPage = pageNumber;
                    this.#internalMetrics.dataRetrieved = true;

                    if (typeof this.#currentConfiguration.outputRenderer === 'function') {
                        this.#currentConfiguration.outputRenderer.call(this.#elementHost, rootData);
                    }
                    this.#invokeListener('onLoad', rootData);
                } else {
                    console.error('Data fetch failed:', message);
                }
            })
            .catch(error => {
                this.#removeContentBlocker();
                console.error('Fetch error:', error);
            });
    }

    #getPropertyByPath(obj, path) {
        if (!path) return obj;
        return path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);
    }
    
    #isObjectEmpty(obj) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
        }
        return true;
    }

    #updateInputPageValue(value) {
        this.#internalMetrics.controlPanels.forEach(panel => {
            const pageInput = panel.querySelector('[data-page-input]');
            if (pageInput) pageInput.value = value;
        });
    }

    #invokeListener(listenerName, ...args) {
        const listener = this.#currentConfiguration.eventListeners[listenerName];
        if (typeof listener === 'function') {
            listener.call(this.#elementHost, listenerName, ...args);
        }
    }
}

ContentNavigator.defaultPaginatorOptions = {
    placementOption: 'top',
    extraClasses: '',
    stripeRows: false,
    loadingMessage: 'Fetching data...',
    currentPage: 1,
    itemsPerPage: 25,
    showLimitDropdown: true,
    itemLimitOptions: [25, 50, 75, 100],
    sortColumn: null,
    sortDirection: 'asc',
    sortOptions: {},
    searchQuery: null,
    ajaxRequest: {
        endpoint: '',
        method: 'POST',
        data: {},
        dataType: 'json'
    },
    responseReader: {
        successKey: 'success',
        messageKey: 'message',
        totalPagesKey: 'totalpages',
        totalRecordsKey: 'totalrecords',
        rootPath: ''
    },
    paramKeys: {
        start: 'start',
        limit: 'limit',
        page: 'page',
        sort: 'sort',
        direction: 'dir',
        search: 'search'
    },
    outputRenderer: null,
    eventListeners: {
        onInitialize: null,
        onRender: null,
        onPreprocess: null,
        onBeforeLoad: null,
        onLoad: null,
        onDestroy: null
    }
};

const _paginatorInstances = new WeakMap();

if (!Element.prototype.attachDataGridPaginator) {
    Element.prototype.attachDataGridPaginator = function(commandOrOptions, ...args) {
        let instance = _paginatorInstances.get(this);

        if (typeof commandOrOptions === 'string') {
            if (!instance) {
                console.error(`Paginator not initialized on this element.`);
                return;
            }
            if (typeof instance[commandOrOptions] === 'function') {
                return instance[commandOrOptions](...args);
            } else {
                console.error(`Method "${commandOrOptions}" does not exist on DataGridPaginator.`);
                return;
            }
        } else {
            if (instance) {
                instance.configureComponent(commandOrOptions);
            } else {
                instance = new ContentNavigator(this, commandOrOptions);
                _paginatorInstances.set(this, instance);
            }
            return instance;
        }
    };
}

if (!Element.prototype.removeDataGridPaginatorInstance) {
    Element.prototype.removeDataGridPaginatorInstance = function() {
        _paginatorInstances.delete(this);
    };
}