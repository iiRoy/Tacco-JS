let CanvasDesigner = function()
{
    // A robust editor for visual content management, leveraging jQuery.
    // This constructor initializes core components and their default configurations.
    if (typeof jQuery === 'undefined') {
        console.error("Critical Dependency Missing: jQuery is required for CanvasDesigner.");
        return;
    }

    this.assetExplorer = null; // Represents the file/asset management panel.
    this.layoutConfig = '';    // Stores the structural configuration (e.g., component names).
    this.initialMarkup = '';   // Holds the HTML content to be loaded into the design canvas.

    this.assetExplorerContainer = null; // The DOM element wrapping the asset explorer.
    this.controlPanelHost = jQuery('<section></section>'); // Main wrapper for editor controls/menu.
    this.mainControls = null; // The instance of the main menu system.

    // The interactive iframe where the design is rendered.
    this.designCanvas = jQuery('<iframe></iframe>');
    this.canvasAttrs = {
        'width': '100%',
        'height': '100%',
        'frameborder': '0', // Ensures no default border from the browser.
        'scrolling': 'auto' // Allows scrolling within the iframe.
    };

    // The immediate parent wrapper for the design canvas.
    this.canvasHost = jQuery('<div></div>');
    this.canvasHostAttrs = {
        'width': '100%',
        'height': '85%', // Adjusted height.
        'border': '2px solid #ddd', // Changed border style and color.
        'box-sizing': 'border-box', // Added for consistent sizing.
        'overflow': 'hidden'
    };

    // The top-level container for the canvas and breakpoint bar.
    this.mainCanvasContainer = jQuery('<article></article>');
    this.mainCanvasContainerAttrs = {
        'width': '100%',
        'height': '65%', // Modified height.
        'border-bottom': '1px dotted #aaa', // Changed border.
        'display': 'flex', // Changed to flex for layout control.
        'flex-direction': 'column' // Added flex direction.
    };

    // Apply primary styling to the main canvas container.
    this.mainCanvasContainer.css(this.mainCanvasContainerAttrs);

    this.propertyEditor = null; // The UI element for editing properties of selected elements.

    // Apply primary styling to the canvas host.
    this.canvasHost.css(this.canvasHostAttrs);

    // Elements related to responsive design breakpoints.
    this.addBreakpointButton = jQuery('<button type="button" style="background-color:#007bff; color:white; border:none; padding: 4px 10px; cursor:pointer; margin-right: 5px; border-radius: 3px;">Add Viewport</button>');
    this.breakpointBar = jQuery('<nav></nav>'); // Container for breakpoint indicators.
    this.breakpointBarAttrs = {
        'height': '5%', // Adjusted height.
        'width': '100%',
        'background-color': '#212529', // Darker background.
        'display': 'flex',
        'align-items': 'center',
        'padding': '0 10px', // Added padding.
        'box-sizing': 'border-box'
    };
    this.breakpointOptions = []; // Array to store defined breakpoints.

    // Apply primary styling to the breakpoint bar.
    this.breakpointBar.css(this.breakpointBarAttrs);
};

CanvasDesigner.prototype = {
    /**
     * Orchestrates the setup of the entire visual design workspace.
     * This method should be called once after CanvasDesigner instantiation.
     * @param {string|Array<string>} layoutData - Configuration for available components/assets.
     * @param {string} initialContentHtml - HTML string to populate the design canvas initially.
     */
    initializeWorkspace: function(layoutData, initialContentHtml)
    {
        // Pre-initialization checks for essential data.
        if (!layoutData || typeof initialContentHtml !== 'string' || initialContentHtml.trim() === '') {
            console.error("Initialization Failed: Layout data or initial HTML content is invalid or missing.");
            return; // Prevent further execution if critical data is absent.
        }

        // Normalize layout data to an array.
        this.layoutConfig = Array.isArray(layoutData) ? layoutData : layoutData.split(',');
        this.initialMarkup = initialContentHtml;

        // Step 1: Set up the main navigation and control panel.
        this.setupControlPanel();

        // Step 2: Construct the canvas and its surrounding containers.
        this.constructLayoutElements();

        // Step 3: Initialize user interface interactions.
        // Assuming CanvasUserInterface is globally available or passed via a module system.
        const CanvasUserInterface = window.CanvasUserInterface || (typeof VisualEditorUI !== 'undefined' ? VisualEditorUI : null);
        if (!CanvasUserInterface) {
            console.error("Missing UI Component: CanvasUserInterface (or VisualEditorUI) class not found.");
            return;
        }
        this.ui = new CanvasUserInterface(this.designCanvas, this.canvasHost, this.breakpointOptions);
        this.propertyEditor = this.ui.init();
        this.propertyEditor.css({
            'position': 'fixed', // Sticking to fixed for the editor panel.
            'right': '2%', // Positioned from the right.
            'top': '10%',
            'background-color': '#f8f9fa', // Lighter background.
            'border': '1px solid #ced4da', // Subtle border.
            'z-index': '1000', // Higher z-index.
            'padding': '15px',
            'border-radius': '8px',
            'box-shadow': '0 4px 8px rgba(0,0,0,0.1)' // Added shadow for depth.
        });

        // Make the property editor draggable if jQuery UI is loaded.
        if (typeof jQuery.fn.draggable === 'function') {
            this.propertyEditor.draggable({ handle: '.editor-header' }); // Specify a handle for dragging.
        } else {
            console.warn("jQuery UI Draggable extension not found. Property editor will not be movable.");
        }

        // Step 4: Initialize the code editor.
        const MarkupCodeEditor = window.MarkupCodeEditor || (typeof CodeEditor !== 'undefined' ? CodeEditor : null);
        if (!MarkupCodeEditor) {
            console.error("Missing Code Editor: MarkupCodeEditor (or CodeEditor) class not found.");
            return;
        }
        this.markupEditor = new MarkupCodeEditor(this.designCanvas, this.canvasHost, this.propertyEditor, this.mainControls);

        // Step 5: Initialize the asset panel.
        const AssetPanel = window.AssetPanel || (typeof FilePanel !== 'undefined' ? FilePanel : null);
        if (!AssetPanel) {
            console.error("Missing Asset Panel: AssetPanel (or FilePanel) class not found.");
            return;
        }
        this.assetExplorer = new AssetPanel(this.propertyEditor, this.designCanvas, this.layoutConfig);
        this.assetExplorerContainer = this.assetExplorer.init();

        // Step 6: Link all initialized components.
        this.mainControls.addFilePanelWrapper(this.assetExplorerContainer); // Assuming this method exists on mainControls.
        let codeMirrorInstance = this.markupEditor.init(); // Initialize the code editor and get its instance.
        this.ui.codeMirror(codeMirrorInstance);
        this.assetExplorer.codeMirror(codeMirrorInstance);
        this.mainControls.filePanel(this.assetExplorer); // Pass the asset explorer instance to the menu.
    },

    /**
     * Configures and places the main menu/control panel into the document body.
     */
    setupControlPanel: function()
    {
        const targetBody = jQuery('body');
        if (targetBody.length === 0) {
            console.error("Document Body Not Found: Cannot attach control panel.");
            return;
        }
        // Ensure a clean slate for the control panel.
        targetBody.children().not('script').remove(); // Clear all children except scripts.
        targetBody.prepend(this.controlPanelHost); // Prepend to ensure it's at the top.

        const WorkspaceMenu = window.WorkspaceMenu || (typeof Menu !== 'undefined' ? Menu : null);
        if (!WorkspaceMenu) {
            console.error("Missing Menu Component: WorkspaceMenu (or Menu) class not found.");
            return;
        }
        this.mainControls = new WorkspaceMenu(this.controlPanelHost);
    },

    /**
     * Attaches the event listener for the breakpoint addition button.
     * This allows users to add new responsive viewport sizes dynamically.
     */
    attachBreakpointAdder: function()
    {
        // Using an arrow function to preserve 'this' context automatically.
        this.addBreakpointButton.on('click', () => {
            const currentCanvasWidth = this.designCanvas.width();

            // Validate canvas width before adding a breakpoint.
            if (currentCanvasWidth <= 0) {
                console.warn("Invalid Canvas Width: Cannot add breakpoint with zero or negative width.");
                return;
            }

            // Create a visual indicator for the new breakpoint.
            let breakpointLabel = jQuery('<span></span>');
            let labelStyles = {
                'background-color': '#6c757d',
                'color': 'white',
                'padding': '4px 10px',
                'margin-right': '8px', // Changed margin.
                'border-radius': '4px',
                'font-size': '0.75em',
                'cursor': 'pointer',
                'white-space': 'nowrap'
            };
            breakpointLabel.css(labelStyles);
            breakpointLabel.text(`${currentCanvasWidth}px`);

            // Update existing breakpoint's min-width if applicable and add the new one.
            if (this.breakpointOptions.length > 0) {
                this.breakpointOptions[this.breakpointOptions.length - 1]['min-width'] = currentCanvasWidth;
            } else {
                // If this is the very first breakpoint, ensure it covers the full range up to current.
                this.breakpointOptions.push({ 'max-width': currentCanvasWidth, 'min-width': 0 });
            }
            this.breakpointOptions.push({ 'max-width': currentCanvasWidth, 'min-width': 0 }); // Add the new breakpoint range.

            this.breakpointBar.append(breakpointLabel); // Append new labels to the bar.
        });
        // Place the add breakpoint button at the start of the breakpoint bar.
        this.breakpointBar.prepend(this.addBreakpointButton);
    },

    /**
     * Constructs and arranges the primary DOM elements that form the editor's layout,
     * including the iframe, its wrappers, and the breakpoint bar.
     */
    constructLayoutElements: function()
    {
        const targetBody = jQuery('body');
        if (targetBody.length === 0) {
            console.error("Document Body Not Found: Cannot construct layout elements.");
            return;
        }

        // 1. Add the design canvas to the body.
        targetBody.append(this.designCanvas);

        // 2. Apply initial attributes to the canvas.
        this.designCanvas.attr(this.canvasAttrs);

        // 3. Wrap the canvas with its immediate host container.
        this.designCanvas.wrap(this.canvasHost);
        this.canvasHost = this.designCanvas.parent(); // Update reference to the new parent.

        // 4. Wrap the canvas host with the main overall container.
        this.canvasHost.wrap(this.mainCanvasContainer);
        this.mainCanvasContainer = this.canvasHost.parent(); // Update reference.

        // 5. Place the breakpoint bar above the canvas within the main container.
        this.mainCanvasContainer.prepend(this.breakpointBar);

        // 6. Ensure canvas host takes full available width.
        this.canvasHost.css({
            'width': '100%',
            'display': 'flex', // Changed to flex for internal layout if needed.
            'flex-grow': '1' // Allows it to take up remaining vertical space.
        });

        // 7. Initialize the breakpoint options with the current canvas width.
        const initialCanvasWidth = this.designCanvas.width();
        if (this.breakpointOptions.length === 0 && initialCanvasWidth > 0) {
            this.breakpointOptions.push({ 'max-width': initialCanvasWidth, 'min-width': 0 });
        }

        // 8. Attach the breakpoint adder functionality.
        this.attachBreakpointAdder();

        // 9. Inject initial HTML content into the iframe once it's fully loaded.
        this.designCanvas.on('load', () => {
            const iframeDocument = this.designCanvas.contents();
            if (iframeDocument && iframeDocument.length > 0) {
                const htmlElement = iframeDocument.find('html');
                if (htmlElement.length > 0) {
                    htmlElement.html(this.initialMarkup);
                } else {
                    // Fallback if <html> isn't directly accessible, try <body>.
                    iframeDocument.find('body').html(this.initialMarkup);
                }
            } else {
                console.warn("Iframe document not accessible after load event.");
            }
        });

        // Trigger load event for iframes that might load instantly or from cache.
        // This is a common pattern, though 'load' usually fires naturally.
        if (this.designCanvas[0].contentWindow && this.designCanvas[0].contentWindow.document.readyState === 'complete') {
             this.designCanvas.trigger('load');
        }
    }
};