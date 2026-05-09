function createModalProducer(domApi, timerApi) {
    const standardSettings = {
        uniqueId: null,
        inlineContent: null,
        contentSourceUrl: null,
        captionText: 'Information Panel',
        showOverlay: true,
        affirmativeOption: { caption: 'OK', handler: null },
        negativeOption: { caption: 'Close', handler: null },
        controlFunction: null, // Custom initialization logic for the modal's content
        overlayClass: "modal-backdrop",
        overlayDismiss: true,
        footingContent: null,
        panelClass: "modal",
        visualStyle: {
            top: '100px',
            left: '30%',
            margin: '0 auto'
        }
    };

    const mainContainer = domApi.body;

    return function produceModal(contentSource, userConfiguration, additionalContext) {
        let processedConfiguration = {};
        if (typeof contentSource === 'object' && contentSource !== null) {
            additionalContext = userConfiguration;
            userConfiguration = contentSource;
            contentSource = null;
        }

        processedConfiguration = { ...standardSettings, ...userConfiguration };
        if (contentSource) {
            processedConfiguration.contentSourceUrl = contentSource;
        }

        const panelIdentifierAttribute = processedConfiguration.uniqueId ? ` data-modal-id="${processedConfiguration.uniqueId}" ` : '';
        const defaultFootingMarkup = `
            <button class="action-control" data-modal-action="negative-choice">{{negativeCaption}}</button>
            <button class="action-control primary-action" data-modal-action="affirmative-choice">{{affirmativeCaption}}</button>
        `;
        const footingSectionMarkup = `
            <div class="panel-footing-section">
                ${processedConfiguration.footingContent || defaultFootingMarkup}
            </div>
        `;

        let mainContentBodyMarkup = '';
        if (processedConfiguration.inlineContent) {
            if (typeof processedConfiguration.inlineContent === 'string') {
                mainContentBodyMarkup = `<div class="panel-content-body">${processedConfiguration.inlineContent}</div>`;
            } else {
                mainContentBodyMarkup = `<div class="panel-content-body">${processedConfiguration.inlineContent.innerHTML || processedConfiguration.inlineContent.outerHTML || ''}</div>`;
            }
        } else if (processedConfiguration.contentSourceUrl) {
            mainContentBodyMarkup = `<div class="panel-content-body loading-indicator">Loading content...</div>`;
        } else {
             mainContentBodyMarkup = `<div class="panel-content-body"></div>`;
        }

        const fullPanelMarkup = `
            <div class="${processedConfiguration.panelClass} entrance-animation" ${panelIdentifierAttribute} style="display: block;">
                <div class="modal-dialog-wrapper">
                    <div class="modal-content-area">
                        <div class="modal-header-section">
                            <button type="button" class="close-control" data-modal-action="negative-choice">&times;</button>
                            <h2>{{captionText}}</h2>
                        </div>
                        ${mainContentBodyMarkup}
                        ${footingSectionMarkup}
                    </div>
                </div>
            </div>
        `;

        const tempDiv = domApi.createElement('div');
        tempDiv.innerHTML = fullPanelMarkup;
        const mainPanelElement = tempDiv.firstElementChild;

        for (const styleProp in processedConfiguration.visualStyle) {
            mainPanelElement.style[styleProp] = processedConfiguration.visualStyle[styleProp];
        }

        let overlayElement = null;
        if (processedConfiguration.showOverlay) {
            overlayElement = domApi.createElement('div');
            overlayElement.className = `${processedConfiguration.overlayClass} entrance-animation active-overlay`;
            if (processedConfiguration.overlayDismiss) {
                overlayElement.addEventListener('click', () => modalInstance.negativeChoice());
            }
        }

        const escapeKeyMonitor = (event) => {
            if (event.key === 'Escape' || event.keyCode === 27) {
                modalInstance.negativeChoice();
            }
        };

        const modalInstance = {
            _panelReference: mainPanelElement,
            _overlayReference: overlayElement,
            _currentConfig: processedConfiguration,
            _additionalContextData: additionalContext,

            reveal: function() {
                mainContainer.appendChild(this._panelReference);
                if (this._overlayReference) {
                    mainContainer.appendChild(this._overlayReference);
                }
                domApi.addEventListener('keydown', escapeKeyMonitor);

                if (this._currentConfig.contentSourceUrl && this._panelReference.querySelector('.panel-content-body.loading-indicator')) {
                    fetch(this._currentConfig.contentSourceUrl)
                        .then(response => {
                            if (!response.ok) throw new Error('Network response not found.');
                            return response.text();
                        })
                        .then(htmlContent => {
                            const bodyElement = this._panelReference.querySelector('.panel-content-body');
                            if (bodyElement) {
                                bodyElement.innerHTML = htmlContent;
                                bodyElement.classList.remove('loading-indicator');
                            }
                            this._initializeModalContent();
                        })
                        .catch(error => {
                            console.error('Failed to retrieve content:', error);
                            const bodyElement = this._panelReference.querySelector('.panel-content-body');
                            if (bodyElement) {
                                bodyElement.innerHTML = `<p style="color: red;">Content loading issue: ${error.message}</p>`;
                                bodyElement.classList.remove('loading-indicator');
                            }
                        });
                } else {
                    this._initializeModalContent();
                }

                timerApi(() => {
                    this._panelReference.classList.add('active-state');
                }, 200);
            },

            conceal: function() {
                domApi.removeEventListener('keydown', escapeKeyMonitor);
                this._panelReference.remove();
                if (this._overlayReference) {
                    this._overlayReference.remove();
                }
            },

            negativeChoice: function() {
                const actionHandler = this._currentConfig.negativeOption.handler || this.conceal;
                actionHandler.call(this, this._additionalContextData);
                this.conceal();
            },

            affirmativeChoice: function() {
                const actionHandler = this._currentConfig.affirmativeOption.handler || this.conceal;
                actionHandler.call(this, this._additionalContextData);
                this.conceal();
            },

            _initializeModalContent: function() {
                const elementsWithPlaceholders = this._panelReference.querySelectorAll('h2, .action-control');
                elementsWithPlaceholders.forEach(el => {
                    if (el.textContent.includes('{{captionText}}')) {
                        el.textContent = el.textContent.replace('{{captionText}}', this._currentConfig.captionText);
                    }
                    if (el.textContent.includes('{{negativeCaption}}')) {
                        el.textContent = el.textContent.replace('{{negativeCaption}}', this._currentConfig.negativeOption.caption);
                    }
                    if (el.textContent.includes('{{affirmativeCaption}}')) {
                        el.textContent = el.textContent.replace('{{affirmativeCaption}}', this._currentConfig.affirmativeOption.caption);
                    }
                });

                this._panelReference.querySelectorAll('[data-modal-action]').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const actionType = event.target.dataset.modalAction;
                        if (actionType === 'negative-choice') {
                            this.negativeChoice();
                        } else if (actionType === 'affirmative-choice') {
                            this.affirmativeChoice();
                        }
                    });
                });

                if (this._currentConfig.controlFunction) {
                    this._currentConfig.controlFunction(this, this._additionalContextData);
                }
            }
        };

        return modalInstance;
    };
}