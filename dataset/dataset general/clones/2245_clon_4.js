"use strict";

const elemUtil = {
    toggleCssClass: (element, classNames) => {
        const classes = classNames.split(',').map(c => c.trim());
        let hasOne = false;
        for (const cls of classes) {
            if (element.classList.contains(cls)) {
                hasOne = true;
                break;
            }
        }
        if (hasOne) {
            for (const cls of classes) {
                element.classList.remove(cls);
            }
        } else {
            element.classList.add(classes[0]);
        }
    },
    conceal: (element) => {
        element.style.display = 'none';
    },
    reveal: (element, displayType = 'block') => {
        element.style.display = displayType;
    },
    flipVisibility: (element, speed = 'fast', displayType = 'block') => {
        if (element.style.display === 'none') {
            elemUtil.reveal(element, displayType);
        } else {
            elemUtil.conceal(element);
        }
    }
};

class LogDisplayWidget {
    constructor(configOptions) {
        this.mainTitle = configOptions.mainTitle;
        this.isRawTitle = configOptions.isRawTitle || false;
        this.animationSpeed = configOptions.animationSpeed || 'fast';
        this.hostingPanel = undefined;
        this.maxContentHeight = configOptions.maxContentHeight || '170px';
        this.scrollAutomatically = configOptions.scrollAutomatically || false;
        this.closingStrategy = configOptions.closingStrategy || 'hide';
        this.newestAtTop = configOptions.newestAtTop || false;
        this.placement = configOptions.placement || 'bottom';
        this.itemCollection = [];

        this._rootContainer = this._constructVisualComponent();
        this._initializeComponentState();
    }

    getElement() {
        return this._rootContainer;
    }

    _constructVisualComponent() {
        const root = document.createElement('div');
        root.classList.add('am-panel', 'tool-panel', 'panel-bottom', 'native-key-bindings');
        root.setAttribute('tabindex', '-1');

        this._resizeHandle = document.createElement('div');
        this._resizeHandle.classList.add('panel-resize-handle');
        this._resizeHandle.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; height: 10px; cursor: row-resize; z-index: 3';
        root.appendChild(this._resizeHandle);

        const headerSection = document.createElement('div');
        headerSection.classList.add('panel-heading');
        root.appendChild(headerSection);

        this._titleElement = document.createElement('div');
        this._titleElement.classList.add('heading-title', 'inline-block');
        this._titleElement.style.cursor = 'pointer';
        this._titleElement.addEventListener('click', this.toggleVisibility.bind(this));
        headerSection.appendChild(this._titleElement);

        this._summaryElement = document.createElement('div');
        this._summaryElement.classList.add('heading-summary', 'inline-block');
        headerSection.appendChild(this._summaryElement);

        const headerButtonsSection = document.createElement('div');
        headerButtonsSection.classList.add('heading-buttoms', 'inline-block', 'pull-right');
        headerSection.appendChild(headerButtonsSection);

        this.autoScrollToggleBtn = document.createElement('div');
        this.autoScrollToggleBtn.classList.add('heading-autoScroll', 'inline-block', 'icon-move-down');
        this.autoScrollToggleBtn.style.cursor = 'pointer';
        this.autoScrollToggleBtn.addEventListener('click', this.toggleAutoScrolling.bind(this));
        headerButtonsSection.appendChild(this.autoScrollToggleBtn);

        this.foldToggleBtn = document.createElement('div');
        this.foldToggleBtn.classList.add('heading-fold', 'inline-block', 'icon-fold');
        this.foldToggleBtn.style.cursor = 'pointer';
        this.foldToggleBtn.addEventListener('click', this.toggleVisibility.bind(this));
        headerButtonsSection.appendChild(this.foldToggleBtn);

        this.closeBtn = document.createElement('div');
        this.closeBtn.classList.add('heading-close', 'inline-block', 'icon-x');
        this.closeBtn.style.cursor = 'pointer';
        this.closeBtn.addEventListener('click', this.disposeComponent.bind(this));
        headerButtonsSection.appendChild(this.closeBtn);

        this._contentArea = document.createElement('div');
        this._contentArea.classList.add('panel-body', 'padded');
        this._contentArea.style.overflowY = 'scroll';
        root.appendChild(this._contentArea);

        return root;
    }

    _initializeComponentState() {
        this.updateTitleText(this.mainTitle, this.isRawTitle);
        if (this.scrollAutomatically) {
            this.toggleAutoScrolling();
        }
        elemUtil.conceal(this._summaryElement);
    }

    mountComponent() {
        if (this.hostingPanel === undefined) {
            const panelCreationMethod = this.placement === 'bottom' ? atom.workspace.addBottomPanel : atom.workspace.addTopPanel;
            this.hostingPanel = panelCreationMethod({ item: this });

            this._boundStartResizing = this.startResizing.bind(this);
            this._resizeHandle.addEventListener('mousedown', this._boundStartResizing);

            this._contentArea.style.maxHeight = this.maxContentHeight;

            if (this.autoScrollToggleBtn.classList.contains('icon-move-up')) {
                this._contentArea.scrollTop = this._contentArea.scrollHeight;
            }
        } else {
            this.hostingPanel.show();
        }
    }

    disposeComponent() {
        if (this.hostingPanel !== undefined) {
            const methodMap = {
                'hide': () => this.hostingPanel.hide(),
                'destroy': () => this.hostingPanel.destroy()
            };
            const action = methodMap[this.closingStrategy] || methodMap['hide'];
            action();

            if (this.closingStrategy === 'destroy') {
                this.hostingPanel = undefined;
                this._resizeHandle.removeEventListener('mousedown', this._boundStartResizing);
            }
        }
    }

    updateTitleText(newTitle, isRaw = false) {
        if (isRaw) {
            this._titleElement.innerHTML = newTitle;
        } else {
            this._titleElement.textContent = newTitle;
        }
    }

    updateSummaryContent(summaryInfo) {
        this._summaryElement.className = 'heading-summary inline-block';
        if (summaryInfo.rawSummary) {
            this._summaryElement.innerHTML = summaryInfo.summary;
        } else {
            this._summaryElement.textContent = summaryInfo.summary;
        }
        if (summaryInfo.className) {
            this._summaryElement.classList.add(summaryInfo.className);
        }
        if (summaryInfo.handler) {
            summaryInfo.handler(this._summaryElement);
        }
    }

    toggleVisibility() {
        elemUtil.toggleCssClass(this.foldToggleBtn, 'icon-fold, icon-unfold');
        elemUtil.flipVisibility(this._contentArea, this.animationSpeed);

        if (window.getComputedStyle(this._summaryElement).display === 'none') {
            elemUtil.reveal(this._summaryElement, 'inline-block');
        } else {
            elemUtil.conceal(this._summaryElement);
        }
    }

    clearEntries() {
        this.itemCollection = [];
        this._contentArea.innerHTML = '';
    }

    addEntry(entryView) {
        if (this.itemCollection.length === 0 && entryView.getSummary) {
            this.updateSummaryContent(entryView.getSummary());
        }
        if (this.newestAtTop) {
            this._contentArea.prepend(entryView);
        } else {
            this._contentArea.append(entryView);
        }
        this.itemCollection.push(entryView);
    }

    adjustScrollPosition() {
        if (this.autoScrollToggleBtn.classList.contains('icon-move-up')) {
            this._contentArea.scrollTop = this._contentArea.scrollHeight;
        } else {
            this._contentArea.scrollTop = 0;
        }
    }

    toggleAutoScrolling() {
        elemUtil.toggleCssClass(this.autoScrollToggleBtn, 'icon-move-up');
        this.adjustScrollPosition();
    }

    startResizing() {
        this._rootContainer.style.webkitUserSelect = 'none';

        this._boundHandleResizeDrag = this.handleResizeDrag.bind(this);
        this._boundStopResizing = this.stopResizing.bind(this);

        document.addEventListener('mousemove', this._boundHandleResizeDrag);
        document.addEventListener('mouseup', this._boundStopResizing);
    }

    stopResizing() {
        this._rootContainer.style.webkitUserSelect = '';

        document.removeEventListener('mousemove', this._boundHandleResizeDrag);
        document.removeEventListener('mouseup', this._boundStopResizing);

        this._boundHandleResizeDrag = null;
        this._boundStopResizing = null;
    }

    handleResizeDrag(event) {
        const headerHeight = this._contentArea.previousElementSibling.offsetHeight;
        const newHeight = window.innerHeight - event.pageY - headerHeight - 30;
        this._contentArea.style.maxHeight = `${newHeight}px`;
    }
}

module.exports = LogDisplayWidget;