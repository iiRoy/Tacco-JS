function createUniqueElementIdentifier() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return 'e' + timestamp + randomPart;
}

function processFileInputElements(selectorInput, userOptions) {
    const defaultOptions = {
        buttonLabel: 'Select File',
        displayFullPath: false
    };

    const combinedOptions = { ...defaultOptions, ...userOptions };

    document.querySelectorAll(selectorInput).forEach(function(baseInput) {
        if (baseInput.hasAttribute('data-custom-styled')) {
            return;
        }

        const componentIdentifier = createUniqueElementIdentifier();

        const initialParentNode = baseInput.parentNode;
        const initialNextNode = baseInput.nextSibling;

        // 1. Construct the main container for the enhanced input
        const mainWrapper = document.createElement('div');
        mainWrapper.classList.add('custom-input-wrapper');
        mainWrapper.id = 'custom-wrapper-' + componentIdentifier;
        mainWrapper.style.cssText = `
            overflow: auto;
            display: inline-block;
            vertical-align: middle;
        `;
        // Transfer classes from original input to the main wrapper
        baseInput.classList.forEach(cls => mainWrapper.classList.add(cls));
        baseInput.className = ''; // Clear original classes

        // 2. Create the display field for the selected file name
        const nameDisplay = document.createElement('input');
        nameDisplay.setAttribute('type', 'text');
        nameDisplay.setAttribute('readonly', 'readonly');
        nameDisplay.setAttribute('tabindex', '-1'); // Make it not focusable
        nameDisplay.classList.add('file-name-field');
        nameDisplay.classList.add('component-' + componentIdentifier);
        nameDisplay.style.cssText = `
            display: block;
            float: left;
            margin: 0;
            padding: 0 5px;
            box-sizing: border-box;
        `;
        mainWrapper.appendChild(nameDisplay);

        // 3. Create the visual button element
        const visualAction = document.createElement('div');
        visualAction.classList.add('file-action-button');
        visualAction.classList.add('component-' + componentIdentifier);
        visualAction.textContent = combinedOptions.buttonLabel;
        visualAction.style.cssText = `
            overflow: hidden;
            position: relative;
            display: block;
            float: left;
            white-space: nowrap;
            text-align: center;
            cursor: pointer;
            line-height: 60px; /* Matches original input's fixed height */
        `;
        mainWrapper.appendChild(visualAction);

        // 4. Insert the main wrapper into the DOM
        if (initialNextNode) {
            initialParentNode.insertBefore(mainWrapper, initialNextNode);
        } else {
            initialParentNode.appendChild(mainWrapper);
        }

        // 5. Configure and move the original file input inside the visual button
        baseInput.style.cssText = `
            opacity: 0;
            position: absolute;
            border: none;
            margin: 0;
            padding: 0;
            top: 0;
            right: 0;
            cursor: inherit;
            height: 100%;
            width: 100%;
            font-size: 999px; /* Ensures full coverage for click */
            box-sizing: border-box;
            z-index: 1;
        `;
        baseInput.classList.add('hidden-control-element');
        visualAction.appendChild(baseInput); // Detaches from original parent

        // 6. Attach the change event listener
        baseInput.addEventListener('change', function() {
            let pathValue = baseInput.value;
            if (combinedOptions.displayFullPath) {
                nameDisplay.value = pathValue;
            } else {
                const parts = pathValue.split(/[/\\]/);
                nameDisplay.value = parts[parts.length - 1];
            }
        });

        // Mark the input as processed
        baseInput.setAttribute('data-custom-styled', 'true');
    });
}

// Global exposure for usage (equivalent to $.fn.pluginName)
window.initializeCustomFileInput = processFileInputElements;