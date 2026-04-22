function createEnhancedSelectElement(initialElement, customOptions) {
    const defaultSettings = {
        wrapperSuffix: "Container",
        labelSuffix: "Control",
        initialLabelText: "",
        parentSelectorForPosition: "",
        enableTopFlip: false,
        containerClass: "enhanced-selector",
        omitFirstOption: true
    };

    const configurations = { ...defaultSettings, ...customOptions };

    const sourceIdentifier = initialElement.id || `select-${Math.random().toString(36).substring(2, 9)}`;
    const wrapperIdentifier = sourceIdentifier + configurations.wrapperSuffix;
    const labelIdentifier = sourceIdentifier + configurations.labelSuffix;

    let isComponentOpen = false;
    let componentWrapper;
    let toggleButton;
    let optionsList;

    const auxiliaryTools = {
        constructVisualComponent: () => {
            const options = Array.from(initialElement.options);
            const listItems = options.map((opt, idx) => {
                if (configurations.omitFirstOption && idx === 0) {
                    return '';
                }
                return `<li><button type="button" role="option" data-value="${opt.value}" data-text="${opt.text}">${opt.text}</button></li>`;
            }).join('\n');

            const initialText = configurations.initialLabelText || (configurations.omitFirstOption && options.length > 1 ? options[1].text : options[0].text);

            return `
                <div id="${wrapperIdentifier}" class="${configurations.containerClass}">
                    <button type="button" id="${labelIdentifier}" class="selector-toggle" aria-haspopup="listbox" aria-expanded="false">${initialText}</button>
                    <ul class="selector-options" role="listbox" style="display:none; visibility:hidden;">
                        ${listItems}
                    </ul>
                </div>
            `;
        },

        attachHandlers: () => {
            componentWrapper.addEventListener('click', (event) => {
                event.stopPropagation();
                if (componentWrapper.classList.contains('disabled')) {
                    return;
                }

                if (isComponentOpen) {
                    auxiliaryTools.concealComponent();
                } else {
                    document.querySelectorAll(`.${configurations.containerClass}.active`).forEach(otherWrapper => {
                        if (otherWrapper.id !== wrapperIdentifier) {
                            const otherInstance = otherWrapper.customSelectInstance;
                            if (otherInstance && typeof otherInstance.concealComponent === 'function') {
                                otherInstance.concealComponent();
                            }
                        }
                    });
                    auxiliaryTools.revealComponent();
                    document.addEventListener('click', auxiliaryTools.handleDocumentClick);
                }
            });

            optionsList.addEventListener('click', auxiliaryTools.handleOptionSelection);
        },

        handleOptionSelection: (event) => {
            const targetButton = event.target.closest('button[role="option"]');
            if (!targetButton) return;

            event.preventDefault();

            const selectedValue = targetButton.dataset.value;
            const selectedText = targetButton.dataset.text;

            initialElement.value = selectedValue;
            initialElement.dispatchEvent(new Event('change', { bubbles: true }));

            toggleButton.textContent = selectedText;

            auxiliaryTools.concealComponent();
        },

        concealComponent: () => {
            optionsList.style.display = 'none';
            optionsList.style.visibility = 'hidden';
            componentWrapper.classList.remove('active');
            toggleButton.setAttribute('aria-expanded', 'false');
            isComponentOpen = false;
            document.removeEventListener('click', auxiliaryTools.handleDocumentClick);
        },

        revealComponent: () => {
            const selectedOptionIndex = Array.from(initialElement.options).findIndex(opt => opt.selected);
            let scrollOffset = 0;
            if (selectedOptionIndex !== -1) {
                const effectiveIndex = configurations.omitFirstOption ? selectedOptionIndex - 1 : selectedOptionIndex;
                if (effectiveIndex >= 0 && optionsList.children[effectiveIndex]) {
                    scrollOffset = optionsList.children[effectiveIndex].offsetTop;
                }
            }

            if (configurations.enableTopFlip) {
                auxiliaryTools.adjustPositioning();
            }

            optionsList.style.display = '';
            optionsList.style.visibility = 'visible';
            optionsList.scrollTop = scrollOffset;
            componentWrapper.classList.add('active');
            toggleButton.setAttribute('aria-expanded', 'true');
            isComponentOpen = true;
        },

        adjustPositioning: () => {
            optionsList.classList.remove('reverse-direction');
            const listRect = optionsList.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            let parentOffsetTop = 0;
            if (configurations.parentSelectorForPosition) {
                const parentElement = componentWrapper.closest(configurations.parentSelectorForPosition);
                if (parentElement) {
                    parentOffsetTop = parentElement.getBoundingClientRect().top;
                }
            }

            if ((windowHeight - listRect.bottom < 0) && (listRect.top - parentOffsetTop > listRect.height)) {
                optionsList.classList.add('reverse-direction');
            }
        },

        handleDocumentClick: (event) => {
            if (!componentWrapper.contains(event.target)) {
                auxiliaryTools.concealComponent();
            }
        }
    };

    const setupComponent = () => {
        initialElement.style.display = 'none';

        initialElement.insertAdjacentHTML('afterend', auxiliaryTools.constructVisualComponent());

        componentWrapper = document.getElementById(wrapperIdentifier);
        toggleButton = document.getElementById(labelIdentifier);
        optionsList = componentWrapper.querySelector('.selector-options');

        componentWrapper.customSelectInstance = {
            concealComponent: auxiliaryTools.concealComponent
        };

        const currentSelectedOption = initialElement.options[initialElement.selectedIndex];
        if (currentSelectedOption) {
            toggleButton.textContent = currentSelectedOption.text;
        }

        auxiliaryTools.attachHandlers();
    };

    setupComponent();
}

(function () {
    window.enhanceSelectElements = function (selector, options) {
        const targetElements = document.querySelectorAll(selector);
        targetElements.forEach(initialElement => {
            if (initialElement.tagName.toLowerCase() === 'select') {
                createEnhancedSelectElement(initialElement, options);
            }
        });
    };
})();