/*global Rontgen MathJax Becquerel */

// Global aliases/wrappers for external libraries
const XRayMachine = Rontgen;
const GeigerCounter = Becquerel;

const RadiationProcessor = {
    Core: {
        registerEvent: (eventName, callback) => {
            // This assumes MathJax.Hub.Register.StartupHook exists and 'End' is the relevant event.
            // This is functionally equivalent to the original's MathJax.Hub.Register.StartupHook("End", ...)
            if (eventName === "completion" && typeof MathJax !== 'undefined' && MathJax.Hub && MathJax.Hub.Register && MathJax.Hub.Register.StartupHook) {
                MathJax.Hub.Register.StartupHook("End", callback);
            }
        }
    }
};

// Configuration object for selectors, styles, and timings
const systemConfiguration = {
    domIdentifiers: {
        closeFullDisplayButton: 'close-fullscreen',
        fullDisplayButton: 'fullscreen',
        displayArea: 'render',
        editZone: 'write',
        sourceEditor: 'editor',
        readingPane: 'read',
        loadingCurtain: 'overlay'
    },
    classIdentifiers: {
        actionControls: 'buttons-render',
        progressIndicator: 'bar',
        outputPending: 'output-show',
        outputReady: 'output-hide'
    },
    styleValues: {
        marginTopFullDisplay: '50px',
        marginTopNormalDisplay: '20px',
        progressHalf: '50%',
        progressFull: '100%'
    },
    animationTimings: {
        fadeDuration: 100,
        initialDelay: 500
    }
};

// Custom utility for DOM manipulation, replacing jQuery's core functionalities
const DomManipulator = (selectorInput, contextElement = document) => {
    let selectedNodes = [];

    // Determine selection method based on selector prefix
    if (selectorInput.startsWith('#')) {
        const node = contextElement.getElementById(selectorInput.substring(1));
        if (node) selectedNodes.push(node);
    } else if (selectorInput.startsWith('.')) {
        selectedNodes = Array.from(contextElement.getElementsByClassName(selectorInput.substring(1)));
    } else {
        selectedNodes = Array.from(contextElement.querySelectorAll(selectorInput));
    }

    const manipulatorInstance = {
        // Internal collection of elements
        nodes: selectedNodes,

        // Hide elements by setting display to 'none'
        conceal: function() {
            this.nodes.forEach(node => node.style.display = 'none');
            return this;
        },

        // Show elements by clearing the display style (reverts to default)
        reveal: function() {
            this.nodes.forEach(node => node.style.display = '');
            return this;
        },

        // Apply multiple CSS styles
        setStyles: function(stylesObject) {
            this.nodes.forEach(node => {
                for (const property in stylesObject) {
                    node.style[property] = stylesObject[property];
                }
            });
            return this;
        },

        // Attach an event listener
        attachHandler: function(eventKind, callbackFunction) {
            this.nodes.forEach(node => node.addEventListener(eventKind, callbackFunction));
            return this;
        },

        // Get a dimension (width or height) of the first element
        measureDimension: function(dimensionType) {
            if (this.nodes.length > 0) {
                return dimensionType === 'width' ? this.nodes[0].offsetWidth : this.nodes[0].offsetHeight;
            }
            return 0;
        },

        // Set the scroll position of elements
        adjustScrollPosition: function(positionValue) {
            this.nodes.forEach(node => node.scrollTop = positionValue);
            return this;
        }
    };
    return manipulatorInstance;
};

// Custom fade-out animation using setTimeout for opacity manipulation
function triggerSmoothFadeOut(targetElement, animationDuration) {
    let currentOpacity = 1;
    const updateInterval = 10; // milliseconds
    const opacityStep = currentOpacity / (animationDuration / updateInterval);

    function performFade() {
        if ((currentOpacity - opacityStep) <= 0) {
            targetElement.style.opacity = '0';
            targetElement.style.display = 'none'; // Finally hide the element
        } else {
            currentOpacity -= opacityStep;
            targetElement.style.opacity = currentOpacity.toString();
            setTimeout(performFade, updateInterval);
        }
    }
    performFade();
}

// Main application initialization function
const initializeInterfaceLogic = () => {
    // Initial UI State Setup
    DomManipulator(`#${systemConfiguration.domIdentifiers.closeFullDisplayButton}`).conceal();
    DomManipulator(`.${systemConfiguration.classIdentifiers.actionControls}`).conceal();

    // Variable corresponding to originalWidth, declared but not used.
    const initialDisplayAreaSize = DomManipulator(`#${systemConfiguration.domIdentifiers.displayArea}`).measureDimension('width');

    // Centralized Event Delegation for UI interactions
    document.body.addEventListener('click', (interactionEvent) => {
        interactionEvent.preventDefault(); // Prevent default browser actions for interactive elements

        const clickedElementId = interactionEvent.target.id;

        if (clickedElementId === systemConfiguration.domIdentifiers.fullDisplayButton) {
            DomManipulator(`#${systemConfiguration.domIdentifiers.editZone}`).conceal();
            DomManipulator(`#${systemConfiguration.domIdentifiers.fullDisplayButton}`).conceal();
            DomManipulator(`#${systemConfiguration.domIdentifiers.displayArea}`).setStyles({ 'margin-top': systemConfiguration.styleValues.marginTopFullDisplay });
            DomManipulator(`#${systemConfiguration.domIdentifiers.closeFullDisplayButton}`).reveal();
            DomManipulator(`.${systemConfiguration.classIdentifiers.actionControls}`).reveal();
        } else if (clickedElementId === systemConfiguration.domIdentifiers.closeFullDisplayButton) {
            DomManipulator(`#${systemConfiguration.domIdentifiers.editZone}`).reveal();
            DomManipulator(`#${systemConfiguration.domIdentifiers.displayArea}`).setStyles({ 'margin-top': systemConfiguration.styleValues.marginTopNormalDisplay });
            DomManipulator(`#${systemConfiguration.domIdentifiers.fullDisplayButton}`).reveal();
            DomManipulator(`#${systemConfiguration.domIdentifiers.closeFullDisplayButton}`).conceal();
            DomManipulator(`.${systemConfiguration.classIdentifiers.actionControls}`).conceal();
        }
    });

    // Progress Bar Initialization
    DomManipulator(`.${systemConfiguration.classIdentifiers.progressIndicator}`).setStyles({ 'width': systemConfiguration.styleValues.progressHalf });

    // Core Processing Engine and Related Component Instantiation
    const xRayMachineInstance = new XRayMachine();
    xRayMachineInstance.activate(); // Renamed from 'start'
    xRayMachineInstance.initializeDataStorage(initialContent); // Renamed from 'initLocalStorage'

    new GeigerCounter(xRayMachineInstance.textEditor); // Renamed 'rontgen.editor' to 'xRayMachineInstance.textEditor'

    // Progress Bar Completion
    DomManipulator(`.${systemConfiguration.classIdentifiers.progressIndicator}`).setStyles({ 'width': systemConfiguration.styleValues.progressFull });

    // Delayed Overlay Fade-Out
    setTimeout(() => {
        const curtainElement = DomManipulator(`#${systemConfiguration.domIdentifiers.loadingCurtain}`).nodes[0];
        if (curtainElement) {
            triggerSmoothFadeOut(curtainElement, systemConfiguration.animationTimings.fadeDuration);
        }
    }, systemConfiguration.animationTimings.initialDelay);

    // Mathematical Rendering Engine Integration (MathJax Hook)
    RadiationProcessor.Core.registerEvent("completion", () => {
        DomManipulator(`.${systemConfiguration.classIdentifiers.outputPending}`).conceal();
        DomManipulator(`.${systemConfiguration.classIdentifiers.outputReady}`).reveal(); // Replaced fadeIn() with reveal() for visibility
    });

    // Editor Scroll Synchronization Logic
    // This assumes the Rontgen editor object structure and event emission.
    if (xRayMachineInstance.textEditor && xRayMachineInstance.textEditor.getSession) {
        xRayMachineInstance.textEditor.getSession().on('changeScrollTop', (verticalPosition) => {
            const displayAreaHeight = DomManipulator(`#${systemConfiguration.domIdentifiers.displayArea}`).measureDimension('height');
            const editorHeight = DomManipulator(`#${systemConfiguration.domIdentifiers.sourceEditor}`).measureDimension('height');
            const scrollRatio = editorHeight > 0 ? displayAreaHeight / editorHeight : 0;
            DomManipulator(`#${systemConfiguration.domIdentifiers.readingPane}`).adjustScrollPosition(scrollRatio * verticalPosition);
        });
    }
};

// Ensure the DOM is fully loaded before executing the application logic
document.addEventListener('DOMContentLoaded', initializeInterfaceLogic);

// The initial content string, renamed and with modified text
const initialContent = [
    "# Some Sample narrative.",
    "> Jane Doe",
    "**Consectetur adipiscing elit**, eius tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "$$\\frac{-x \\pm \\sqrt{x^2 - 4yz} + \\int_{p_1}^{p_2}[\\beta + b_m p^{m+\\epsilon}]dp}{2y}$$",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    "- Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
    "- Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?",
    "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
    "<hr>",
    "![](http://www.technologyreview.com/sites/default/files/images/ge.engine.innovationx299.jpg)",
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
    "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
    "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
    "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
    "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
    "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
].join('\n\n');