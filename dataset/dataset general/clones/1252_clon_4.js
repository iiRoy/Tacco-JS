const makeElementDraggable = (element) => {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const dragStart = (e) => {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === element) {
            isDragging = true;
        }
    };

    const dragEnd = (e) => {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    };

    const drag = (e) => {
        if (isDragging) {
            e.preventDefault();
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
    };

    element.addEventListener("mousedown", dragStart, false);
    element.addEventListener("mouseup", dragEnd, false);
    element.addEventListener("mousemove", drag, false);

    element.addEventListener("touchstart", dragStart, false);
    element.addEventListener("touchend", dragEnd, false);
    element.addEventListener("touchmove", drag, false);

    element.style.cursor = 'grab';
    console.log('Element made draggable (vanilla JS implementation)');
};

class UserInterfaceManager {
    constructor(frameElement, frameContainerElement, breakpointOptionsArray) {
        this._frame = frameElement;
        this._frameContainer = frameContainerElement;
        this._breakpointOptions = breakpointOptionsArray;
        console.log('UserInterfaceManager instantiated with:', frameElement, frameContainerElement, breakpointOptionsArray);
    }
    initialize() {
        const editorElement = document.createElement('div');
        console.log('UserInterfaceManager.initialize called');
        return {
            element: editorElement,
            setStyle: (styles) => Object.assign(editorElement.style, styles),
            makeDraggable: () => makeElementDraggable(editorElement)
        };
    }
    codeMirror(cmInstance) {
        console.log('UserInterfaceManager.codeMirror called with:', cmInstance);
    }
}

class ScriptEditor {
    constructor(frameElement, frameContainerElement, editorElement, menuInstance) {
        this._frame = frameElement;
        this._frameContainer = frameContainerElement;
        this._editor = editorElement;
        this._menu = menuInstance;
        console.log('ScriptEditor instantiated with:', frameElement, frameContainerElement, editorElement, menuInstance);
    }
    initialize() {
        console.log('ScriptEditor.initialize called');
        return {
            setOption: (option, value) => console.log(`CodeMirror stub: set option ${option} to ${value}`),
            getValue: () => "<html><body>Hello CodeMirror!</body></html>",
            refresh: () => console.log("CodeMirror stub: refresh"),
            on: (event, handler) => console.log(`CodeMirror stub: added event listener for ${event}`)
        };
    }
}

class ContentNavigator {
    constructor(editorElement, frameElement, layoutStructure) {
        this._editor = editorElement;
        this._frame = frameElement;
        this._layout = layoutStructure;
        console.log('ContentNavigator instantiated with:', editorElement, frameElement, layoutStructure);
    }
    initialize() {
        const panelWrapper = document.createElement('div');
        console.log('ContentNavigator.initialize called');
        return panelWrapper;
    }
    codeMirror(cmInstance) {
        console.log('ContentNavigator.codeMirror called with:', cmInstance);
    }
}

class ControlPanel {
    constructor(containerElement) {
        this._container = containerElement;
        console.log('ControlPanel instantiated with:', containerElement);
    }
    addFilePanelContainer(panelContainer) {
        console.log('ControlPanel.addFilePanelContainer called with:', panelContainer);
        this._container.appendChild(panelContainer);
    }
    filePanel(panelInstance) {
        console.log('ControlPanel.filePanel called with:', panelInstance);
    }
}


class InterfaceComposer {
    constructor() {
        this._fileSystemPanel = null;
        this._layoutConfig = '';
        this._documentContent = '';
        this._filePanelContainer = null;

        this._controlPanelContainer = document.createElement('div');
        this._controlPanel = null;

        this._embeddedFrame = document.createElement('iframe');
        this._frameAttrs = { 'width': '100%', 'height': '100%' };
        this._frameContainerAttrs = { 'width': '100%', 'height': '90%', 'border': '1px solid black' };
        this._embeddedFrameContainer = document.createElement('div');

        this._mainFrameWrapper = document.createElement('div');
        this._mainFrameWrapperAttrs = { 'width': '100%', 'height': '50%', 'borderBottom': '1px solid black', 'display': 'inline-block' };
        Object.assign(this._mainFrameWrapper.style, this._mainFrameWrapperAttrs);

        this._toolPalette = null;

        Object.assign(this._embeddedFrameContainer.style, this._frameContainerAttrs);

        this._responsiveBreakpointAdder = document.createElement('span');
        this._responsiveBreakpointAdder.style.backgroundColor = '#2ba6cb';
        this._responsiveBreakpointAdder.style.color = 'white';
        this._responsiveBreakpointAdder.textContent = '+';

        this._breakpointIndicatorBar = document.createElement('div');
        this._breakpointBarAttrs = { 'height': '5%', 'width': '100%', 'backgroundColor': 'green' };
        Object.assign(this._breakpointIndicatorBar.style, this._breakpointBarAttrs);

        this._breakpointRangeSet = [];

        this._addBreakpointOptionHandler = this._handleBreakpointAddition.bind(this);
    }

    bootstrap(layoutDescriptor, contentMarkup) {
        this._layoutConfig = layoutDescriptor.split(',');
        this._documentContent = contentMarkup;
        this._setupControlPanel();
        this._establishContainers();

        this._uiManager = new UserInterfaceManager(this._embeddedFrame, this._embeddedFrameContainer, this._breakpointRangeSet);
        const editorResult = this._uiManager.initialize();
        this._toolPalette = editorResult.element;
        editorResult.setStyle({ 'position': 'fixed', 'left': '80%', 'backgroundColor': '#b4b4b4', 'zIndex': '100' });
        editorResult.makeDraggable();

        this._sourceCodeEditor = new ScriptEditor(this._embeddedFrame, this._embeddedFrameContainer, this._toolPalette, this._controlPanel);
        this._fileSystemPanel = new ContentNavigator(this._toolPalette, this._embeddedFrame, this._layoutConfig);
        this._filePanelContainer = this._fileSystemPanel.initialize();

        this._controlPanel.addFilePanelContainer(this._filePanelContainer);
        const codeMirrorInstance = this._sourceCodeEditor.initialize();
        this._uiManager.codeMirror(codeMirrorInstance);
        this._fileSystemPanel.codeMirror(codeMirrorInstance);
        this._controlPanel.filePanel(this._fileSystemPanel);
    }

    _setupControlPanel() {
        document.body.innerHTML = '';
        document.body.appendChild(this._controlPanelContainer);
        this._controlPanel = new ControlPanel(this._controlPanelContainer);
    }

    _addResponsiveBreakpointOption() {
        this._responsiveBreakpointAdder.addEventListener('click', this._addBreakpointOptionHandler);
        this._mainFrameWrapper.prepend(this._responsiveBreakpointAdder);
    }

    _handleBreakpointAddition() {
        console.log('Initiating addition of a new media query breakpoint.');
        console.log('Current iframe width:', this._embeddedFrame.offsetWidth);

        const newBreakpointElement = document.createElement('div');
        Object.assign(newBreakpointElement.style, {
            'backgroundColor': 'yellow',
            'height': '100%',
            'width': `${this._embeddedFrame.offsetWidth}px`,
            'border': '1px solid white'
        });

        console.log('Current breakpoint ranges:', this._breakpointRangeSet);

        const currentFrameWidth = this._embeddedFrame.offsetWidth;
        if (this._breakpointRangeSet.length > 0) {
            this._breakpointRangeSet[this._breakpointRangeSet.length - 1]['min-width'] = currentFrameWidth;
        }
        this._breakpointRangeSet.push({ 'max-width': currentFrameWidth, 'min-width': 0 });

        console.log('Updated breakpoint ranges:', this._breakpointRangeSet);
        this._breakpointIndicatorBar.prepend(newBreakpointElement);
    }

    _establishContainers() {
        console.log('The value of the cotent is ' + this._documentContent);

        document.body.appendChild(this._embeddedFrame);

        let initialIframeHtml = '';
        try {
            if (this._embeddedFrame.contentDocument && this._embeddedFrame.contentDocument.documentElement) {
                initialIframeHtml = this._embeddedFrame.contentDocument.documentElement.innerHTML;
            }
        } catch (e) {
            console.warn("Could not access iframe contentDocument for initial log:", e);
        }
        console.log('Initial HTML content of the embedded frame is: ' + initialIframeHtml);

        for (const key in this._frameAttrs) {
            this._embeddedFrame.setAttribute(key, this._frameAttrs[key]);
        }

        const frameParent = this._embeddedFrame.parentNode;
        if (frameParent) {
            frameParent.insertBefore(this._embeddedFrameContainer, this._embeddedFrame);
            this._embeddedFrameContainer.appendChild(this._embeddedFrame);
        } else {
            this._embeddedFrameContainer.appendChild(this._embeddedFrame);
            document.body.appendChild(this._embeddedFrameContainer);
        }
        this._embeddedFrameContainer.style.width = '100%';

        const wrapperParent = this._embeddedFrameContainer.parentNode;
        if (wrapperParent) {
            wrapperParent.insertBefore(this._mainFrameWrapper, this._embeddedFrameContainer);
            this._mainFrameWrapper.appendChild(this._embeddedFrameContainer);
        } else {
            this._mainFrameWrapper.appendChild(this._embeddedFrameContainer);
            document.body.appendChild(this._mainFrameWrapper);
        }

        this._mainFrameWrapper.prepend(this._breakpointIndicatorBar);
        this._embeddedFrameContainer.style.display = 'inline-block';

        const currentMaxWidth = this._embeddedFrame.offsetWidth;

        if (this._embeddedFrame.contentDocument) {
            this._embeddedFrame.contentDocument.documentElement.innerHTML = this._documentContent;
            console.log('The value of the editor content (iframe html) is ' + this._embeddedFrame.contentDocument.documentElement.innerHTML);
        } else {
            console.warn('Cannot access iframe contentDocument. Content might not be set immediately. Setting on load.');
            this._embeddedFrame.onload = () => {
                if (this._embeddedFrame.contentDocument) {
                    this._embeddedFrame.contentDocument.documentElement.innerHTML = this._documentContent;
                    console.log('The value of the editor content (iframe html) is ' + this._embeddedFrame.contentDocument.documentElement.innerHTML);
                }
            };
        }

        this._breakpointRangeSet[0] = { 'max-width': currentMaxWidth, 'min-width': 0 };
        this._addResponsiveBreakpointOption();
    }
}