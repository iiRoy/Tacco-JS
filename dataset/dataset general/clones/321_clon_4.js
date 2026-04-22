(function() {
    window.addEventListener('DOMContentLoaded', function() {
        window.alert('test');

        let dragOperationState = {
            activeDraggableElement: null,
            componentOriginCategory: '',
            dragActivationTimer: null,
            dragVisualElement: null,
            visualElementHalfHeight: 0,
            visualElementHalfWidth: 0,
            dropTargetAreaPosition: null,
            currentDropAreaComponents: [],
            potentialInsertionPoints: [],
            isDragInProgress: false
        };

        const getSingleElement = (selector, parent = document) => parent.querySelector(selector);
        const getAllElements = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

        const determineComponentSource = (element) => {
            let ancestor = element.parentElement;
            while (ancestor) {
                if (ancestor.id === 'components') {
                    return 'sourceMain';
                }
                ancestor = ancestor.parentElement;
            }
            return 'sourceForm';
        };

        const adjustVisualInsertionFeedback = (mouseCurrentY, dropTargetElement, existingElements, visualHeight) => {
            const clearElementBorders = () => {
                existingElements.forEach(comp => {
                    comp.style.borderTop = '1px solid white';
                    comp.style.borderBottom = 'none';
                });
            };
            clearElementBorders();

            dragOperationState.potentialInsertionPoints = existingElements.filter(comp => {
                const componentBoundingRect = comp.getBoundingClientRect();
                return (componentBoundingRect.top - (mouseCurrentY - visualHeight / 2) > 0) && comp.id !== 'legend';
            });

            if (dragOperationState.potentialInsertionPoints.length > 0) {
                dragOperationState.potentialInsertionPoints[0].style.borderTop = '1px solid #22aaff';
            } else {
                if (existingElements.length > 0) {
                    existingElements[existingElements.length - 1].style.borderBottom = '1px solid #22aaff';
                }
            }
        };

        const restoreDropAreaStyles = (dropTargetElement, existingElements) => {
            dropTargetElement.style.backgroundColor = '#fff';
            existingElements.forEach(comp => {
                comp.style.borderTop = '1px solid white';
                comp.style.borderBottom = 'none';
            });
        };

        // Event listener for mouse down on draggable components
        getAllElements('form').forEach(containerElement => {
            containerElement.addEventListener('mousedown', function(initialMouseEvent) {
                const clickedComponent = initialMouseEvent.target.closest('.component');
                if (!clickedComponent) return;

                initialMouseEvent.preventDefault();

                getAllElements('.popover').forEach(p => p.style.display = 'none');

                dragOperationState.activeDraggableElement = clickedComponent;
                dragOperationState.componentOriginCategory = determineComponentSource(clickedComponent);

                const activationDelayPeriods = {
                    sourceMain: 0,
                    sourceForm: 120
                };

                // Start a timer for delayed drag initiation
                dragOperationState.dragActivationTimer = setTimeout(() => {
                    dragOperationState.isDragInProgress = true;

                    let generatedVisual;
                    if (dragOperationState.componentOriginCategory === 'sourceMain') {
                        generatedVisual = document.createElement('form');
                        generatedVisual.className = 'form-horizontal span6';
                        generatedVisual.id = 'draggedTemporaryVisual';
                        generatedVisual.appendChild(clickedComponent.cloneNode(true));
                    } else {
                        if (clickedComponent.id !== 'legend') {
                            generatedVisual = document.createElement('form');
                            generatedVisual.className = 'form-horizontal span6';
                            generatedVisual.id = 'draggedTemporaryVisual';
                            // Move the original element directly for 'form' components
                            generatedVisual.appendChild(clickedComponent);
                        }
                    }

                    if (generatedVisual) {
                        document.body.appendChild(generatedVisual);
                        dragOperationState.dragVisualElement = generatedVisual;

                        const initialMouseX = initialMouseEvent.pageX;
                        const initialMouseY = initialMouseEvent.pageY;

                        generatedVisual.style.position = 'absolute';
                        generatedVisual.style.opacity = '0.9';
                        generatedVisual.style.zIndex = '9999';

                        dragOperationState.visualElementHalfHeight = generatedVisual.offsetHeight / 2;
                        dragOperationState.visualElementHalfWidth = generatedVisual.offsetWidth / 2;

                        generatedVisual.style.top = (initialMouseY - dragOperationState.visualElementHalfHeight) + 'px';
                        generatedVisual.style.left = (initialMouseX - dragOperationState.visualElementHalfWidth) + 'px';
                        generatedVisual.style.display = 'block';

                        document.body.addEventListener('mousemove', handleVisualMovement);
                    }
                }, activationDelayPeriods[dragOperationState.componentOriginCategory]);

                // Clear delay if mouse up or mouse out occurs before drag officially starts
                const cancelPendingDrag = () => {
                    clearTimeout(dragOperationState.dragActivationTimer);
                    dragOperationState.dragActivationTimer = null;
                    document.removeEventListener('mouseup', cancelPendingDrag);
                    clickedComponent.removeEventListener('mouseout', cancelPendingDrag);
                };
                document.addEventListener('mouseup', cancelPendingDrag);
                clickedComponent.addEventListener('mouseout', cancelPendingDrag);
            });
        });

        const mainDropTarget = getSingleElement('#target');

        const handleVisualMovement = (moveEvent) => {
            if (!dragOperationState.isDragInProgress || !dragOperationState.dragVisualElement) return;

            const currentPointerX = moveEvent.pageX;
            const currentPointerY = moveEvent.pageY;

            dragOperationState.dragVisualElement.style.top = (currentPointerY - dragOperationState.visualElementHalfHeight) + 'px';
            dragOperationState.dragVisualElement.style.left = (currentPointerX - dragOperationState.visualElementHalfWidth) + 'px';

            dragOperationState.dropTargetAreaPosition = mainDropTarget.getBoundingClientRect();
            dragOperationState.currentDropAreaComponents = getAllElements('.component', mainDropTarget);

            const isOverDropZone = (
                currentPointerX > dragOperationState.dropTargetAreaPosition.left &&
                currentPointerX < dragOperationState.dropTargetAreaPosition.right + dragOperationState.visualElementHalfWidth &&
                currentPointerY > dragOperationState.dropTargetAreaPosition.top &&
                currentPointerY < dragOperationState.dropTargetAreaPosition.bottom + dragOperationState.visualElementHalfHeight
            );

            if (isOverDropZone) {
                mainDropTarget.style.backgroundColor = '#fafdff';
                adjustVisualInsertionFeedback(currentPointerY, mainDropTarget, dragOperationState.currentDropAreaComponents, dragOperationState.dragVisualElement.offsetHeight);
            } else {
                restoreDropAreaStyles(mainDropTarget, dragOperationState.currentDropAreaComponents);
            }
        };

        // Global mouseup to finalize drop and clean up
        document.body.addEventListener('mouseup', function(releaseEvent) {
            if (!dragOperationState.isDragInProgress) {
                clearTimeout(dragOperationState.dragActivationTimer);
                dragOperationState.dragActivationTimer = null;
                return;
            }

            releaseEvent.preventDefault();

            document.body.removeEventListener('mousemove', handleVisualMovement);

            const dropFinalX = releaseEvent.pageX;
            const dropFinalY = releaseEvent.pageY;

            restoreDropAreaStyles(mainDropTarget, dragOperationState.currentDropAreaComponents);

            const dropZoneRect = mainDropTarget.getBoundingClientRect();

            const isComponentDroppedInZone = (
                dropFinalX + dragOperationState.visualElementHalfWidth > dropZoneRect.left &&
                dropFinalX - dragOperationState.visualElementHalfWidth < dropZoneRect.right &&
                dropFinalY + dragOperationState.visualElementHalfHeight > dropZoneRect.top &&
                dropFinalY - dragOperationState.visualElementHalfHeight < dropZoneRect.bottom
            );

            if (isComponentDroppedInZone) {
                const componentToEmbed = dragOperationState.dragVisualElement.firstElementChild;
                if (componentToEmbed) {
                    componentToEmbed.removeAttribute('style');

                    if (dragOperationState.potentialInsertionPoints.length > 0) {
                        mainDropTarget.insertBefore(componentToEmbed, dragOperationState.potentialInsertionPoints[0]);
                    } else {
                        const targetFieldset = getSingleElement('fieldset', mainDropTarget);
                        if (targetFieldset) {
                            targetFieldset.appendChild(componentToEmbed);
                        } else {
                            mainDropTarget.appendChild(componentToEmbed);
                        }
                    }
                }
            }

            if (dragOperationState.dragVisualElement) {
                dragOperationState.dragVisualElement.remove();
                dragOperationState.dragVisualElement = null;
            }

            dragOperationState.isDragInProgress = false;
            dragOperationState.activeDraggableElement = null;
            dragOperationState.potentialInsertionPoints = [];

            getAllElements('.component', mainDropTarget).forEach(comp => {
                if (typeof jQuery !== 'undefined' && typeof jQuery.fn.popover === 'function') {
                    jQuery(comp).popover({ trigger: 'manual' });
                }
            });

            produceCleanedSourceMarkup();
        });


        // --- Source Markup Generation ---
        const produceCleanedSourceMarkup = () => {
            const temporaryMarkupHolder = document.createElement('div');
            const buildContainer = getSingleElement('#build');
            if (!buildContainer) return;

            temporaryMarkupHolder.innerHTML = buildContainer.innerHTML;

            getAllElements('.component', temporaryMarkupHolder).forEach(el => {
                el.removeAttribute('title');
                el.removeAttribute('data-original-title');
                el.removeAttribute('data-type');
                el.removeAttribute('data-content');
                el.removeAttribute('rel');
                el.removeAttribute('trigger');
                el.removeAttribute('style');
                el.classList.remove('component');
            });

            getAllElements('.valtype', temporaryMarkupHolder).forEach(el => {
                el.removeAttribute('data-valtype');
                el.classList.remove('valtype');
            });

            getAllElements('form', temporaryMarkupHolder).forEach(el => {
                el.removeAttribute('id');
                el.removeAttribute('style');
            });

            const sourceDisplayArea = getSingleElement('#source');
            if (sourceDisplayArea) {
                sourceDisplayArea.value = temporaryMarkupHolder.innerHTML.replace(/\n\s{12}/g, '\n');
            }
        };

        // --- Popover Initialization and Interaction ---
        const setupTargetComponentPopovers = () => {
            getAllElements('.component', mainDropTarget).forEach(comp => {
                if (typeof jQuery !== 'undefined' && typeof jQuery.fn.popover === 'function') {
                    jQuery(comp).popover({ trigger: 'manual' });
                }
            });
        };
        setupTargetComponentPopovers();


        mainDropTarget.addEventListener('click', function(clickEvent) {
            const clickedTargetComponent = clickEvent.target.closest('.component');
            if (!clickedTargetComponent) return;

            clickEvent.preventDefault();

            getAllElements('.popover').forEach(p => p.style.display = 'none');

            if (typeof jQuery !== 'undefined' && typeof jQuery.fn.popover === 'function') {
                jQuery(clickedTargetComponent).popover('show');
            }

            const componentValueTypeElements = getAllElements('.valtype', clickedTargetComponent);
            componentValueTypeElements.forEach(valueElement => {
                const valueDataAttribute = valueElement.getAttribute('data-valtype');
                let retrievedValue;
                const popoverInputControl = getSingleElement(`.popover #${valueDataAttribute}`);

                if (!popoverInputControl) return;

                switch (valueDataAttribute) {
                    case 'placeholder':
                        retrievedValue = valueElement.getAttribute('placeholder');
                        popoverInputControl.value = retrievedValue || '';
                        break;
                    case 'checkbox':
                        retrievedValue = valueElement.checked;
                        popoverInputControl.checked = retrievedValue;
                        break;
                    case 'option':
                        retrievedValue = getAllElements('option', valueElement).map(opt => opt.textContent).join('\n');
                        popoverInputControl.value = retrievedValue;
                        break;
                    case 'checkboxes':
                    case 'radios':
                    case 'inline-checkboxes':
                    case 'inline-radios':
                        retrievedValue = getAllElements('label', valueElement).map(label => label.textContent.trim()).join('\n');
                        popoverInputControl.value = retrievedValue;
                        break;
                    case 'button':
                        retrievedValue = getSingleElement('button', valueElement).textContent;
                        popoverInputControl.value = retrievedValue;

                        const componentButton = getSingleElement('button', valueElement);
                        const buttonClassList = componentButton ? Array.from(componentButton.classList) : [];
                        const specificButtonType = buttonClassList.find(cls => cls.startsWith('btn-'));

                        getAllElements('.popover #color option').forEach(opt => opt.removeAttribute('selected'));
                        if (specificButtonType) {
                            const optionToSelect = getSingleElement(`.popover #color #${specificButtonType}`);
                            if (optionToSelect) optionToSelect.setAttribute('selected', 'selected');
                        } else {
                            const defaultButtonOption = getSingleElement('.popover #color #default');
                            if (defaultButtonOption) defaultButtonOption.setAttribute('selected', 'selected');
                        }
                        break;
                    default:
                        retrievedValue = valueElement.textContent;
                        popoverInputControl.value = retrievedValue;
                        break;
                }
            });

            const currentPopoverContainer = getSingleElement('.popover');
            if (currentPopoverContainer) {
                const popoverCancelButton = getSingleElement('.btn-danger', currentPopoverContainer);
                if (popoverCancelButton) {
                    popoverCancelButton.onclick = (e) => {
                        e.preventDefault();
                        if (typeof jQuery !== 'undefined' && typeof jQuery.fn.popover === 'function') {
                            jQuery(clickedTargetComponent).popover('hide');
                        }
                    };
                }

                const popoverSaveButton = getSingleElement('.btn-info', currentPopoverContainer);
                if (popoverSaveButton) {
                    popoverSaveButton.onclick = (e) => {
                        e.preventDefault();
                        const allPopoverInputs = Array.from(getAllElements('.popover input', currentPopoverContainer));
                        const popoverTextareaElement = getSingleElement('.popover textarea', currentPopoverContainer);
                        if (popoverTextareaElement) allPopoverInputs.push(popoverTextareaElement);

                        allPopoverInputs.forEach(inputControl => {
                            const inputID = inputControl.id;
                            const targetComponentValueElement = getSingleElement(`[data-valtype="${inputID}"]`, clickedTargetComponent);

                            if (!targetComponentValueElement) return;

                            switch (inputID) {
                                case 'placeholder':
                                    targetComponentValueElement.setAttribute('placeholder', inputControl.value);
                                    break;
                                case 'checkbox':
                                    inputControl.checked ? targetComponentValueElement.setAttribute('checked', 'true') : targetComponentValueElement.removeAttribute('checked');
                                    break;
                                case 'option':
                                    const optionListEntries = inputControl.value.split('\n').filter(line => line.trim() !== '');
                                    targetComponentValueElement.innerHTML = '';
                                    optionListEntries.forEach(line => {
                                        targetComponentValueElement.appendChild(document.createTextNode('\n      '));
                                        const newOptionElement = document.createElement('option');
                                        newOptionElement.textContent = line.trim();
                                        targetComponentValueElement.appendChild(newOptionElement);
                                    });
                                    targetComponentValueElement.appendChild(document.createTextNode('\n      '));
                                    break;
                                case 'checkboxes':
                                case 'radios':
                                case 'inline-checkboxes':
                                case 'inline-radios':
                                    const itemEntryLines = inputControl.value.split('\n').filter(line => line.trim() !== '');
                                    targetComponentValueElement.innerHTML = `\n      <!-- Multiple ${inputID.replace('-', ' ')} -->`;
                                    itemEntryLines.forEach(line => {
                                        if (line.length > 0) {
                                            const newLabelElement = document.createElement('label');
                                            newLabelElement.className = (inputID.includes('inline')) ? 'checkbox inline' : (inputID.includes('checkbox') ? 'checkbox' : 'radio');
                                            newLabelElement.innerHTML = `\n        <input type="${inputID.includes('checkbox') ? 'checkbox' : 'radio'}" value="${line.trim()}">\n        ${line.trim()}\n      `;
                                            targetComponentValueElement.appendChild(document.createTextNode('\n      '));
                                            targetComponentValueElement.appendChild(newLabelElement);
                                        }
                                    });
                                    targetComponentValueElement.appendChild(document.createTextNode('\n  '));
                                    if (inputID.includes('radios')) {
                                        const firstRadioInput = getSingleElement('input', targetComponentValueElement);
                                        if (firstRadioInput) firstRadioInput.setAttribute('checked', 'true');
                                    }
                                    break;
                                case 'button':
                                    const selectedButtonClassOption = getSingleElement('.popover #color option:checked', currentPopoverContainer);
                                    const newButtonClass = selectedButtonClassOption ? selectedButtonClassOption.id : 'btn-default';
                                    const buttonTargetElement = getSingleElement('button', targetComponentValueElement);
                                    if (buttonTargetElement) {
                                        buttonTargetElement.textContent = inputControl.value;
                                        Array.from(buttonTargetElement.classList).filter(cls => cls.startsWith('btn-')).forEach(cls => buttonTargetElement.classList.remove(cls));
                                        buttonTargetElement.classList.add(newButtonClass);
                                    }
                                    break;
                                default:
                                    targetComponentValueElement.textContent = inputControl.value;
                                    break;
                            }
                        });

                        if (typeof jQuery !== 'undefined' && typeof jQuery.fn.popover === 'function') {
                            jQuery(clickedTargetComponent).popover('hide');
                        }
                        produceCleanedSourceMarkup();
                    };
                }
            }
        });

        // Event listener for source tab click
        getSingleElement('#navtab').addEventListener('click', function(tabClickEvent) {
            if (tabClickEvent.target.id === 'sourcetab') {
                produceCleanedSourceMarkup();
            }
        });
    });
})();