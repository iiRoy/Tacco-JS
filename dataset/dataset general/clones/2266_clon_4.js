const createVisualAssetBlock = function() {
    const visualStructure = `
        <div class="visual-metadata-container">
            <input maxlength="140" data-prop="visualWidth" placeholder="Asset width" class="component-input-text component-width-setting" type="text" />
            <input maxlength="140" data-prop="visualHeight" placeholder="Asset height" class="component-input-text component-height-setting" type="text" />
            <select data-prop="layoutPosition" class="component-alignment-setting">
                <option value="">Placement</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
            </select>
        </div>
        <div class="visual-content-wrapper">
            <img class="content-display-image">
        </div>
    `;

    const VisualAssetHandler = SirTrevor.Blocks.Image.extend({
        category: "visualasset",
        
        editViewMarkup: function() {
            return visualStructure;
        },

        updateVisualsWithContent: function(contentPayload) {
            const blockRoot = this.element;
            
            const mainImage = blockRoot.querySelector('.content-display-image');
            if (mainImage) {
                mainImage.setAttribute('src', contentPayload.assetFile.resourceLocator);
                mainImage.setAttribute('width', contentPayload.visualWidth);
                mainImage.setAttribute('height', contentPayload.visualHeight);
            }

            const widthInput = blockRoot.querySelector('.component-width-setting');
            if (widthInput) {
                widthInput.value = contentPayload.visualWidth;
            }

            const heightInput = blockRoot.querySelector('.component-height-setting');
            if (heightInput) {
                heightInput.value = contentPayload.visualHeight;
            }

            const alignSelect = blockRoot.querySelector('.component-alignment-setting');
            if (alignSelect) {
                alignSelect.value = contentPayload.layoutPosition;
            }

            const imageWrapper = blockRoot.querySelector('.visual-content-wrapper');
            if (imageWrapper) {
                imageWrapper.style.textAlign = contentPayload.layoutPosition;
            }
        },
        
        activateComponent: function() {
            const currentContext = this;
            const currentDetails = currentContext.getData(); // Kept for strict equivalence, even if its return value isn't used.

            const inputElementsContainer = currentContext.element.querySelector('.st-block__inputs');
            
            if (inputElementsContainer) {
                const actionButton = inputElementsContainer.querySelector('button');
                if (actionButton && actionButton.previousElementSibling) {
                    actionButton.previousElementSibling.remove();
                }

                if (actionButton) {
                    actionButton.addEventListener('click', (eventObject) => {
                        eventObject.preventDefault();

                        mediaLibrary.open((resourceLocator) => {
                            if (resourceLocator) {
                                const assetSpecification = {
                                    assetFile: {
                                        resourceLocator: resourceLocator,
                                    }
                                };
                                currentContext.setAndLoadData(assetSpecification);
                                currentContext.ready();
                            }
                        }, 'image');
                    });
                }

                const allInputFields = inputElementsContainer.querySelectorAll('input');
                allInputFields.forEach(singleInput => {
                    singleInput.addEventListener('change', (eventObject) => {
                        currentContext.onDrop(eventObject.currentTarget);
                    });
                });
            }
        },
    });

    return VisualAssetHandler;
};

SirTrevor.Blocks.CustomVisualAsset = createVisualAssetBlock();