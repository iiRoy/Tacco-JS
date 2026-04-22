const codeEditor = {
    setValue: (content) => { /* CodeMirror simulation: Sets the content of the editor */ },
    autoFormatRange: (start, end) => { /* CodeMirror simulation: Formats a range in the editor */ },
    lastLine: () => 0 // CodeMirror simulation: Returns the last line number
};

class FormArchitect {
    constructor() {
        this.activePiece = null;
        this.transferMethod = "POST";
        this.destinationAction = "";
        this.valueDivider = '=';
        this.blueprintTypeHandlers = new Map();

        this.initBlueprintHandlers();
    }

    initBlueprintHandlers() {
        // Blueprint for 'title' component
        this.blueprintTypeHandlers.set('title', {
            fieldPrefix: 'options_title_',
            extractSettings: (piece) => {
                const legendElement = piece.querySelector('legend');
                document.querySelector(`.${this.fieldPrefix}name`).value = legendElement ? legendElement.textContent : '';
                document.querySelector(`.${this.fieldPrefix}name`).focus();
            },
            applySettings: (piece) => {
                const legendElement = piece.querySelector('legend');
                if (legendElement) {
                    legendElement.textContent = document.querySelector(`.${this.fieldPrefix}name`).value;
                }
            }
        });

        // Blueprint for 'text' component
        this.blueprintTypeHandlers.set('text', {
            fieldPrefix: 'options_text_',
            extractSettings: (piece) => {
                const labelEl = piece.querySelector('label');
                const inputEl = piece.querySelector('input[type=text]');
                document.querySelector(`.${this.fieldPrefix}name`).value = '';
                document.querySelector(`.${this.fieldPrefix}label`).value = labelEl ? labelEl.textContent : '';
                document.querySelector(`.${this.fieldPrefix}placeholder`).value = inputEl ? inputEl.getAttribute('placeholder') : '';
            },
            applySettings: (piece) => {
                const controlInput = piece.querySelector('input[type=text]');
                const elementLabel = piece.querySelector('label');
                const elementIdentifier = myFormArchitect.formatIdentifier(document.querySelector(`.${this.fieldPrefix}name`).value);

                if (controlInput) {
                    controlInput.setAttribute('name', elementIdentifier);
                    controlInput.setAttribute('placeholder', document.querySelector(`.${this.fieldPrefix}placeholder`).value);
                    controlInput.setAttribute('id', elementIdentifier);
                }
                if (elementLabel) {
                    elementLabel.textContent = document.querySelector(`.${this.fieldPrefix}label`).value;
                    elementLabel.setAttribute('for', elementIdentifier);
                }
            }
        });

        // Blueprint for 'textarea' component
        this.blueprintTypeHandlers.set('textarea', {
            fieldPrefix: 'options_textarea_',
            extractSettings: (piece) => {
                const labelEl = piece.querySelector('label');
                const multiLineInput = piece.querySelector('textarea');
                document.querySelector(`.${this.fieldPrefix}name`).value = '';
                document.querySelector(`.${this.fieldPrefix}label`).value = labelEl ? labelEl.textContent : '';
                document.querySelector(`.${this.fieldPrefix}placeholder`).value = multiLineInput ? multiLineInput.getAttribute('placeholder') : '';
            },
            applySettings: (piece) => {
                const multiLineInput = piece.querySelector('textarea');
                const elementLabel = piece.querySelector('label');
                const elementIdentifier = myFormArchitect.formatIdentifier(document.querySelector(`.${this.fieldPrefix}name`).value);

                if (multiLineInput) {
                    multiLineInput.setAttribute('name', elementIdentifier);
                    multiLineInput.setAttribute('placeholder', document.querySelector(`.${this.fieldPrefix}placeholder`).value);
                }
                if (elementLabel) {
                    elementLabel.textContent = document.querySelector(`.${this.fieldPrefix}label`).value;
                }
            }
        });

        // Blueprint for 'select_basic' component
        this.blueprintTypeHandlers.set('select_basic', {
            fieldPrefix: 'options_select_basic_',
            extractSettings: (piece) => {
                const dropdownSelector = piece.querySelector('select');
                const elementLabel = piece.querySelector('label');
                let optionBuffer = '';
                const separator = myFormArchitect.valueDivider;

                if (dropdownSelector) {
                    Array.from(dropdownSelector.querySelectorAll('option')).forEach(optionElement => {
                        const optionText = optionElement.textContent;
                        const optionValue = optionElement.value;
                        const cleanedTextForValue = myFormArchitect.formatIdentifier(optionText);

                        let valueAndSeparator = '';
                        if (cleanedTextForValue !== optionValue) {
                            valueAndSeparator = optionValue + separator;
                        }
                        optionBuffer += valueAndSeparator + optionText + '\n';
                    });
                }

                document.querySelector(`.${this.fieldPrefix}name`).value = '';
                document.querySelector(`.${this.fieldPrefix}label`).value = elementLabel ? elementLabel.textContent : '';
                document.querySelector(`.${this.fieldPrefix}options`).value = optionBuffer;
            },
            applySettings: (piece) => {
                const dropdownSelector = piece.querySelector('select');
                const elementLabel = piece.querySelector('label');
                const separator = myFormArchitect.valueDivider;
                const rawOptionsText = document.querySelector(`.${this.fieldPrefix}options`).value;
                const parsedOptions = rawOptionsText.replace(/\r\n/g, "\n").split("\n");
                let optionBuffer = "\n";

                parsedOptions.forEach(itemValue => {
                    if (itemValue.length > 0) {
                        if (itemValue.includes(separator)) {
                            const optionParts = itemValue.split(separator);
                            optionBuffer += `<option value="${optionParts[0]}">${optionParts[1]}</option>\n`;
                        } else {
                            optionBuffer += `<option value="${myFormArchitect.formatIdentifier(itemValue)}">${itemValue}</option>\n`;
                        }
                    }
                });

                const elementIdentifier = myFormArchitect.formatIdentifier(document.querySelector(`.${this.fieldPrefix}name`).value);
                if (dropdownSelector) {
                    dropdownSelector.setAttribute('name', elementIdentifier);
                    dropdownSelector.innerHTML = optionBuffer;
                }
                if (elementLabel) {
                    elementLabel.textContent = document.querySelector(`.${this.fieldPrefix}label`).value;
                }
            }
        });

        // Blueprint for 'select_multiple' component
        this.blueprintTypeHandlers.set('select_multiple', {
            fieldPrefix: 'options_select_multiple_',
            extractSettings: (piece) => {
                const dropdownSelector = piece.querySelector('select');
                const elementLabel = piece.querySelector('label');
                let optionBuffer = '';
                const separator = myFormArchitect.valueDivider;

                if (dropdownSelector) {
                    Array.from(dropdownSelector.querySelectorAll('option')).forEach(optionElement => {
                        const optionText = optionElement.textContent;
                        const optionValue = optionElement.value;
                        const cleanedTextForValue = myFormArchitect.formatIdentifier(optionText);

                        let valueAndSeparator = '';
                        if (cleanedTextForValue !== optionValue) {
                            valueAndSeparator = optionValue + separator;
                        }
                        optionBuffer += valueAndSeparator + optionText + '\n';
                    });
                }

                document.querySelector(`.${this.fieldPrefix}name`).value = '';
                document.querySelector(`.${this.fieldPrefix}label`).value = elementLabel ? elementLabel.textContent : '';
                document.querySelector(`.${this.fieldPrefix}options`).value = optionBuffer;
            },
            applySettings: (piece) => {
                const dropdownSelector = piece.querySelector('select');
                const elementLabel = piece.querySelector('label');
                const separator = myFormArchitect.valueDivider;
                const rawOptionsText = document.querySelector(`.${this.fieldPrefix}options`).value;
                const parsedOptions = rawOptionsText.replace(/\r\n/g, "\n").split("\n");
                let optionBuffer = "\n";

                parsedOptions.forEach(itemValue => {
                    if (itemValue.length > 0) {
                        if (itemValue.includes(separator)) {
                            const optionParts = itemValue.split(separator);
                            optionBuffer += `<option value="${optionParts[0]}">${optionParts[1]}</option>\n`;
                        } else {
                            optionBuffer += `<option value="${myFormArchitect.formatIdentifier(itemValue)}">${itemValue}</option>\n`;
                        }
                    }
                });

                const elementIdentifier = myFormArchitect.formatIdentifier(document.querySelector(`.${this.fieldPrefix}name`).value);
                if (dropdownSelector) {
                    dropdownSelector.setAttribute('name', elementIdentifier + '[]');
                    dropdownSelector.innerHTML = optionBuffer;
                }
                if (elementLabel) {
                    elementLabel.textContent = document.querySelector(`.${this.fieldPrefix}label`).value;
                }
            }
        });

        // Blueprint for 'checkbox' component
        this.blueprintTypeHandlers.set('checkbox', {
            fieldPrefix: 'options_checkbox_',
            extractSettings: (piece) => {
                const elementLabel = piece.querySelector('label:first-of-type');
                let optionBuffer = '';
                const separator = myFormArchitect.valueDivider;

                Array.from(piece.querySelectorAll('input[type=checkbox]')).forEach(optionElement => {
                    const controlValue = optionElement.value;
                    let valueAndSeparator = '';
                    if (controlValue.length > 0 && controlValue !== 'on') {
                        valueAndSeparator = controlValue + separator;
                    }
                    optionBuffer += valueAndSeparator + optionElement.closest('label').textContent.trim() + '\n';
                });

                document.querySelector(`.${this.fieldPrefix}name`).value = '';
                document.querySelector(`.${this.fieldPrefix}label`).value = elementLabel ? elementLabel.textContent : '';
                document.querySelector(`.${this.fieldPrefix}options`).value = optionBuffer;
            },
            applySettings: (piece) => {
                const elementLabel = piece.querySelector('label:first-of-type');
                const separator = myFormArchitect.valueDivider;
                const rawOptionsText = document.querySelector(`.${this.fieldPrefix}options`).value;
                const parsedCheckboxes = rawOptionsText.replace(/\r\n/g, "\n").split("\n");
                const elementIdentifier = myFormArchitect.formatIdentifier(document.querySelector(`.${this.fieldPrefix}name`).value);
                let optionBuffer = "\n";

                parsedCheckboxes.forEach((itemValue, index) => {
                    const uniqueId = `${elementIdentifier}_${index}`;

                    if (itemValue.length > 0) {
                        if (itemValue.includes(separator)) {
                            const optionParts = itemValue.split(separator);
                            optionBuffer += `<div class="checkbox"><label for="${uniqueId}">\n` +
                                            `<input type="checkbox" name="${elementIdentifier}" id="${uniqueId}" value="${optionParts[0]}">\n` +
                                            `${optionParts[1]}\n</label></div>\n`;
                        } else {
                            optionBuffer += `<div class="checkbox"><label for="${uniqueId}">\n` +
                                            `<input type="checkbox" name="${elementIdentifier}" id="${uniqueId}" value="${myFormArchitect.formatIdentifier(itemValue)}">\n` +
                                            `${itemValue}\n</label></div>\n`;
                        }
                    }
                });

                if (elementLabel) {
                    elementLabel.textContent = document.querySelector(`.${this.fieldPrefix}label`).value;
                }
                const controlsContainer = piece.querySelector('.controls');
                if (controlsContainer) {
                    controlsContainer.innerHTML = optionBuffer;
                }
            }
        });

        // Blueprint for 'radio' component
        this.blueprintTypeHandlers.set('radio', {
            fieldPrefix: 'options_radio_',
            extractSettings: (piece) => {
                const elementLabel = piece.querySelector('label:first-of-type');
                let optionBuffer = '';
                const separator = myFormArchitect.valueDivider;

                Array.from(piece.querySelectorAll('input[type=radio]')).forEach(optionElement => {
                    const controlValue = optionElement.value;
                    let valueAndSeparator = '';
                    if (controlValue.length > 0 && controlValue !== 'on') {
                        valueAndSeparator = controlValue + separator;
                    }
                    optionBuffer += valueAndSeparator + optionElement.closest('label').textContent.trim() + '\n';
                });

                document.querySelector(`.${this.fieldPrefix}name`).value = '';
                document.querySelector(`.${this.fieldPrefix}label`).value = elementLabel ? elementLabel.textContent : '';
                document.querySelector(`.${this.fieldPrefix}options`).value = optionBuffer;
            },
            applySettings: (piece) => {
                const elementLabel = piece.querySelector('label:first-of-type');
                const separator = myFormArchitect.valueDivider;
                const rawOptionsText = document.querySelector(`.${this.fieldPrefix}options`).value;
                const parsedRadios = rawOptionsText.replace(/\r\n/g, "\n").split("\n");
                const elementIdentifier = myFormArchitect.formatIdentifier(document.querySelector(`.${this.fieldPrefix}name`).value);
                let optionBuffer = "\n";

                parsedRadios.forEach((itemValue, index) => {
                    const uniqueId = `${elementIdentifier}_${index}`;

                    if (itemValue.length > 0) {
                        if (itemValue.includes(separator)) {
                            const optionParts = itemValue.split(separator);
                            optionBuffer += `<div class="radio"><label for="${uniqueId}">\n` +
                                            `<input type="radio" name="${elementIdentifier}" id="${uniqueId}" value="${optionParts[0]}">\n` +
                                            `${optionParts[1]}\n</label></div>\n`;
                        } else {
                            optionBuffer += `<div class="radio"><label for="${uniqueId}">\n` +
                                            `<input type="radio" name="${elementIdentifier}" id="${uniqueId}" value="${myFormArchitect.formatIdentifier(itemValue)}">\n` +
                                            `${itemValue}\n</label></div>\n`;
                        }
                    }
                });

                if (elementLabel) {
                    elementLabel.textContent = document.querySelector(`.${this.fieldPrefix}label`).value;
                }
                const controlsContainer = piece.querySelector('.controls');
                if (controlsContainer) {
                    controlsContainer.innerHTML = optionBuffer;
                }
            }
        });
    }

    designatePiece(element) {
        this.activePiece = element;
    }

    retrievePiece() {
        return this.activePiece;
    }

    formatIdentifier(label) {
        if (!label || label.length === 0) return '';
        return label
            .trim()
            .replace(/ /g, '_')
            .replace(/\W/g, '')
            .toLowerCase();
    }

    scrubMarkup(markup) {
        return markup
            .replace(/\t/g, '')
            .replace(/\s*ui-draggable|\s*element/gi, '')
            .replace(/<div class="close">.*?<\/div>/g, '')
            .replace(/\s*data-[^=\s]+="[^"]*"/g, '');
    }

    updateCodeViewer() {
        const contentContainer = document.getElementById("content");
        if (!contentContainer) return;

        const generatedMarkup = `<form method="${this.transferMethod}" action="${this.destinationAction}" class="form-horizontal">\n${contentContainer.innerHTML}\n</form>`;
        const cleanedMarkup = this.scrubMarkup(generatedMarkup);

        codeEditor.setValue(cleanedMarkup);
        // Simulate CodeMirror's autoFormatRange if it were available
        if (typeof codeEditor.autoFormatRange === 'function') {
            codeEditor.autoFormatRange({ line: 0, ch: 0 }, { line: codeEditor.lastLine() + 1, ch: 0 });
        }
    }

    incorporateComponent(componentTemplate) {
        const newPiece = componentTemplate.cloneNode(true);

        newPiece.classList.remove('component');
        newPiece.classList.add('element');
        newPiece.removeAttribute('id');

        const closeButton = document.createElement('div');
        closeButton.className = 'close';
        closeButton.innerHTML = '&times;';
        newPiece.prepend(closeButton);

        document.getElementById("content").appendChild(newPiece);

        const settingsModal = document.getElementById("options_modal");
        if (settingsModal) {
            settingsModal.style.display = 'none';
            settingsModal.classList.remove('show'); // For Bootstrap 5+
        }

        this.updateCodeViewer();
    }

    async configureComponent(pieceType, clickedElement) {
        if (!pieceType) return false;

        const settingsModal = document.getElementById("options_modal");
        const modalBodyContent = settingsModal ? settingsModal.querySelector('.modal-body') : null;

        if (!settingsModal || !modalBodyContent) {
            console.error("Options modal or body not found.");
            return false;
        }

        try {
            const response = await fetch(`options/${pieceType}.html`);
            if (!response.ok) {
                console.error(`Failed to fetch options for ${pieceType}: ${response.statusText}`);
                return false;
            }
            const payload = await response.text();

            settingsModal.dataset.type = pieceType;
            modalBodyContent.innerHTML = payload;

            this.designatePiece(clickedElement);

            const blueprint = this.blueprintTypeHandlers.get(pieceType);
            if (blueprint && blueprint.extractSettings) {
                blueprint.extractSettings(this.retrievePiece());
            }

            settingsModal.style.display = 'block';
            settingsModal.classList.add('show'); // For Bootstrap 5+
            return true;

        } catch (error) {
            console.error('Error loading options:', error);
            return false;
        }
    }
}

let myFormArchitect;
document.addEventListener('DOMContentLoaded', () => {
    myFormArchitect = new FormArchitect();

    // Event listeners for component templates (sidebar items)
    document.querySelectorAll('.component').forEach(componentEl => {
        componentEl.addEventListener('click', (event) => {
            myFormArchitect.incorporateComponent(event.currentTarget);
        });
    });

    // Event delegation for dynamically added elements in the content area
    document.getElementById('content').addEventListener('click', async (event) => {
        const target = event.target;
        const element = target.closest('.element');

        if (element) {
            event.stopPropagation(); // Prevent event from bubbling further up if handled

            if (target.classList.contains('close')) {
                // Handle close button click
                element.remove();
                myFormArchitect.updateCodeViewer();
                return;
            }

            let pieceType;
            if (element.classList.contains('title')) pieceType = 'title';
            else if (element.classList.contains('text')) pieceType = 'text';
            else if (element.classList.contains('textarea')) pieceType = 'textarea';
            else if (element.classList.contains('select_basic')) pieceType = 'select_basic';
            else if (element.classList.contains('select_multiple')) pieceType = 'select_multiple';
            else if (element.classList.contains('checkbox')) pieceType = 'checkbox';
            else if (element.classList.contains('radio')) pieceType = 'radio';
            // Add other types as needed based on your HTML structure

            if (pieceType) {
                await myFormArchitect.configureComponent(pieceType, element);
            }
        }
    });

    // Event listener for the modal's save button
    const saveOptionsButton = document.getElementById('save_options');
    if (saveOptionsButton) {
        saveOptionsButton.addEventListener('click', (event) => {
            event.preventDefault();
            const settingsModal = document.getElementById("options_modal");
            const pieceType = settingsModal ? settingsModal.dataset.type : null;
            const blueprint = myFormArchitect.blueprintTypeHandlers.get(pieceType);

            if (blueprint && blueprint.applySettings) {
                blueprint.applySettings(myFormArchitect.retrievePiece());
                settingsModal.style.display = 'none';
                settingsModal.classList.remove('show');
                myFormArchitect.updateCodeViewer();
            }
        });
    }

    // Event listener for the modal's close button (if present)
    const modalCloseButton = document.querySelector('#options_modal .close');
    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', () => {
            const settingsModal = document.getElementById("options_modal");
            settingsModal.style.display = 'none';
            settingsModal.classList.remove('show');
        });
    }

    // Event listeners for form properties (method, action)
    const formMethodSelect = document.getElementById('form_method');
    if (formMethodSelect) {
        formMethodSelect.addEventListener('change', (event) => {
            myFormArchitect.transferMethod = event.target.value;
            myFormArchitect.updateCodeViewer();
        });
    }

    const formActionInput = document.getElementById('form_action');
    if (formActionInput) {
        formActionInput.addEventListener('input', (event) => {
            myFormArchitect.destinationAction = event.target.value;
            myFormArchitect.updateCodeViewer();
        });
    }

    // Initial update of the code viewer
    myFormArchitect.updateCodeViewer();
});