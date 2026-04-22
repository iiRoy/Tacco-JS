const domCraft = (() => {
    const acquireSingleElement = (querySpecifier, contextScope = document) => contextScope.querySelector(querySpecifier);
    const acquireMultipleElements = (querySpecifier, contextScope = document) => Array.from(contextScope.querySelectorAll(querySpecifier));

    const conferClasses = (elementCollection, ...newClassNames) => {
        if (!elementCollection) return;
        (Array.isArray(elementCollection) ? elementCollection : [elementCollection]).forEach(el => el && el.classList.add(...newClassNames));
    };

    const stripClasses = (elementCollection, ...oldClassNames) => {
        if (!elementCollection) return;
        (Array.isArray(elementCollection) ? elementCollection : [elementCollection]).forEach(el => el && el.classList.remove(...oldClassNames));
    };

    const applyStyleProperty = (elementCollection, cssProperty, cssValue) => {
        if (!elementCollection) return;
        (Array.isArray(elementCollection) ? elementCollection : [elementCollection]).forEach(el => el && (el.style[cssProperty] = cssValue));
    };

    const retrieveText = (targetElement) => targetElement ? targetElement.textContent : '';
    const updateInnerHtml = (targetElement, newHtmlContent) => targetElement && (targetElement.innerHTML = newHtmlContent);
    const retrieveInnerHtml = (targetElement) => targetElement ? targetElement.innerHTML : '';
    const fetchAttribute = (targetElement, attributeName) => targetElement ? targetElement.getAttribute(attributeName) : null;
    const assignAttribute = (targetElement, attributeName, attributeValue) => targetElement && targetElement.setAttribute(attributeName, attributeValue);
    const discardAttribute = (targetElement, attributeName) => targetElement && targetElement.removeAttribute(attributeName);

    const substituteContent = (originalElement, newMarkupOrElement) => {
        if (!originalElement) return;
        if (typeof newMarkupOrElement === 'string') {
            const temporaryContainer = document.createElement('div');
            temporaryContainer.innerHTML = newMarkupOrElement;
            originalElement.replaceWith(...Array.from(temporaryContainer.children));
        } else {
            originalElement.replaceWith(newMarkupOrElement);
        }
    };

    const insertAfterElement = (referencePoint, newContentElement) => {
        if (!referencePoint || !newContentElement) return;
        referencePoint.parentNode.insertBefore(newContentElement, referencePoint.nextSibling);
    };

    const insertBeforeElement = (referencePoint, newContentElement) => {
        if (!referencePoint || !newContentElement) return;
        referencePoint.parentNode.insertBefore(newContentElement, referencePoint);
    };

    const encloseElement = (targetElement, wrapperTag = 'div', wrapperClassName = '') => {
        if (!targetElement || !targetElement.parentNode) return;
        const wrapperNode = document.createElement(wrapperTag);
        if (wrapperClassName) wrapperNode.className = wrapperClassName;
        targetElement.parentNode.insertBefore(wrapperNode, targetElement);
        wrapperNode.appendChild(targetElement);
        return wrapperNode;
    };

    const liberateElement = (targetElement) => {
        if (!targetElement || !targetElement.parentNode) return;
        const parentNode = targetElement.parentNode;
        while (targetElement.firstChild) {
            parentNode.insertBefore(targetElement.firstChild, targetElement);
        }
        parentNode.removeChild(targetElement);
    };

    const appendChildElement = (parentContainer, childNode) => parentContainer && childNode && parentContainer.appendChild(childNode);
    const prependChildElement = (parentContainer, childNode) => parentContainer && childNode && parentContainer.insertBefore(childNode, parentContainer.firstChild);

    const concealElement = (targetElement) => targetElement && (targetElement.style.display = 'none');
    const revealElement = (targetElement) => targetElement && (targetElement.style.display = '');

    const obtainChildren = (targetElement) => targetElement ? Array.from(targetElement.children) : [];

    return {
        selectOne: acquireSingleElement,
        selectAll: acquireMultipleElements,
        addClass: conferClasses,
        removeClass: stripClasses,
        applyStyle: applyStyleProperty,
        getText: retrieveText,
        setHtml: updateInnerHtml,
        getHtml: retrieveInnerHtml,
        getAttr: fetchAttribute,
        setAttr: assignAttribute,
        removeAttr: discardAttribute,
        replace: substituteContent,
        insertAfter: insertAfterElement,
        insertBefore: insertBeforeElement,
        wrap: encloseElement,
        unwrap: liberateElement,
        append: appendChildElement,
        prepend: prependChildElement,
        hide: concealElement,
        show: revealElement,
        children: obtainChildren,
        navigatePageScroll: (verticalPosition) => {
            window.scrollTo(0, verticalPosition);
        }
    };
})();

class CustomBootstrapOverlay {
    constructor(overlayElement) {
        this.overlayElement = overlayElement;
        this.dismissButtons = domCraft.selectAll('[data-dismiss="modal"]', this.overlayElement);
        this.dismissButtons.forEach(btn => btn.addEventListener('click', () => this.conceal()));
        this.overlayElement.addEventListener('click', (ev) => {
            if (ev.target === this.overlayElement) {
                this.conceal();
            }
        });
    }

    display() {
        if (!this.overlayElement) return;
        domCraft.applyStyle(this.overlayElement, 'display', 'block');
        domCraft.setAttr(this.overlayElement, 'aria-hidden', 'false');
        domCraft.addClass(this.overlayElement, 'show');
        setTimeout(() => domCraft.addClass(this.overlayElement, 'in'), 10);
        domCraft.addClass(document.body, 'modal-open');
    }

    conceal() {
        if (!this.overlayElement) return;
        domCraft.removeClass(this.overlayElement, 'in', 'show');
        domCraft.setAttr(this.overlayElement, 'aria-hidden', 'true');
        domCraft.removeClass(document.body, 'modal-open');
        setTimeout(() => domCraft.applyStyle(this.overlayElement, 'display', 'none'), 150);
        setTimeout(() => this.overlayElement.remove(), 200);
    }
}

function establishInformationOverlay() {
    window.alert = (messageText) => {
        console.log(messageText);
        const uniqueId = 'infoOverlay' + new Date().getTime();
        const overlayMarkup = `
            <div class="modal fade" id="${uniqueId}" tabindex="-1" role="dialog" aria-labelledby="${uniqueId}Title" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="${uniqueId}Title">Alert</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Dismiss">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <p>${messageText}</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Okay</button>
                  </div>
                </div>
              </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', overlayMarkup);
        const newOverlayNode = domCraft.selectOne(`#${uniqueId}`);
        if (newOverlayNode) {
            new CustomBootstrapOverlay(newOverlayNode).display();
        }
    };
}

function establishVerificationOverlay() {
    window.confirm = (questionText) => {
        console.log(questionText);
        const uniqueId = 'verifyOverlay' + new Date().getTime();
        const surveyIdValue = domCraft.getAttr(domCraft.selectOne('#sid'), 'value') || '';
        const redirectionPath = `index/sid/${surveyIdValue}/newtest/Y`;

        const overlayMarkup = `
            <div class="modal fade" id="${uniqueId}" tabindex="-1" role="dialog" aria-labelledby="${uniqueId}Title" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="${uniqueId}Title">Confirmation</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Dismiss">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <p>${questionText}</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">
                        <span class="glyphicon glyphicon-thumbs-down"></span> No
                    </button>
                    <button type="button" class="btn btn-primary" id="confirmActionBtn${uniqueId}">
                        <span class="glyphicon glyphicon-thumbs-up"></span> Yes
                    </button>
                  </div>
                </div>
              </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', overlayMarkup);
        const newOverlayNode = domCraft.selectOne(`#${uniqueId}`);
        if (newOverlayNode) {
            const overlayInstance = new CustomBootstrapOverlay(newOverlayNode);
            domCraft.selectOne(`#confirmActionBtn${uniqueId}`).addEventListener('click', () => {
                overlayInstance.conceal();
                window.location = redirectionPath;
            });
            overlayInstance.display();
        }
    };
}

function reconfigureInterfaceComponents() {
    const modifyButtonHtml = (targetSelector, auxiliaryClass) => {
        const originalControl = domCraft.selectOne(targetSelector);
        if (!originalControl) return;

        const controlText = domCraft.getText(originalControl);
        const isControlDisabled = domCraft.getAttr(originalControl, 'aria-disabled') === 'true';
        const controlValue = domCraft.getAttr(originalControl, 'value');
        const controlName = domCraft.getAttr(originalControl, 'name');
        const controlAccessKey = domCraft.getAttr(originalControl, 'accesskey');
        const controlId = domCraft.getAttr(originalControl, 'id');

        let updatedControlHtml = `<button type="submit"`;
        if (controlId) updatedControlHtml += ` id="${controlId}"`;
        if (controlValue) updatedControlHtml += ` value="${controlValue}"`;
        if (controlName) updatedControlHtml += ` name="${controlName}"`;
        if (controlAccessKey) updatedControlHtml += ` accesskey="${controlAccessKey}"`;
        updatedControlHtml += ` class="submit btn btn-default navbar-btn ${auxiliaryClass}" role="button"`;
        if (isControlDisabled) updatedControlHtml += ` disabled aria-disabled="true"`;
        updatedControlHtml += `>${controlText}</button>`;

        domCraft.replace(originalControl, updatedControlHtml);
    };

    modifyButtonHtml('#moveprevbtn', '');
    modifyButtonHtml('#movenextbtn', 'btn-primary');
    modifyButtonHtml('#movesubmitbtn', 'btn-success');

    const specificSubmitButton = domCraft.selectOne('button[value="movesubmit"][name="move"]');
    if (specificSubmitButton) {
        const buttonContent = domCraft.getText(specificSubmitButton);
        const buttonDisabled = domCraft.getAttr(specificSubmitButton, 'aria-disabled') === 'true';
        const specificButtonHtml = `<button type="submit" value="movesubmit" name="move" class="submit btn btn-default btn-success btn-block" role="button" ${buttonDisabled ? 'disabled aria-disabled="true"' : ''}>${buttonContent}</button>`;
        domCraft.replace(specificSubmitButton, specificButtonHtml);
    }

    const clearAllAction = domCraft.selectOne('#clearall');
    if (clearAllAction) {
        const clearText = domCraft.getText(clearAllAction);
        const clearDisabled = domCraft.getAttr(clearAllAction, 'aria-disabled') === 'true';
        const clearHtml = `<button type="submit" id="clearall" value="clearall" name="clearall" class="clearall btn btn-default navbar-btn" role="button" data-confirmedby="confirm-clearall" ${clearDisabled ? 'disabled aria-disabled="true"' : ''}>${clearText}</button>`;
        domCraft.replace(clearAllAction, clearHtml);
    }
    
    modifyButtonHtml('#loadallbtn', 'saveall');
    modifyButtonHtml('#saveallbtn', 'saveall');

    domCraft.selectAll('button').forEach(btn => domCraft.addClass(btn, 'btn', 'btn-default'));
    domCraft.selectAll('select').forEach(sel => domCraft.addClass(sel, 'form-control'));
    domCraft.selectAll('textarea').forEach(txt => domCraft.addClass(txt, 'form-control'));

    domCraft.selectAll('.languagechanger').forEach(lc => domCraft.addClass(lc, 'navbar-btn'));

    const headerElement = domCraft.selectOne('.navbar-header.pull-left');
    domCraft.applyStyle(headerElement, 'paddingTop', '0px');
    domCraft.applyStyle(domCraft.selectOne('.navbar-toggle'), 'zIndex', '9999');
    domCraft.selectAll('.navbar button').forEach(btn => domCraft.addClass(btn, 'navbar-btn'));

    domCraft.selectAll('p.error').forEach(errParagraph => {
        const newParagraph = document.createElement('p');
        domCraft.addClass(newParagraph, 'text-warning');
        domCraft.setHtml(newParagraph, domCraft.getHtml(errParagraph));
        errParagraph.replaceWith(newParagraph);
    });
}

function activateProgressDisplay() {
    const progressWrapper = domCraft.selectOne('#progress-wrapper');
    if (progressWrapper) domCraft.hide(progressWrapper);

    const progressMonitor = new MutationObserver((mutations) => {
        for (const mutationRecord of mutations) {
            if (mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'class') {
                const progressBar = domCraft.selectOne('#progress-wrapper #progressbar');
                if (progressBar && progressBar.classList.contains('ui-progressbar')) {
                    const currentProgressValue = domCraft.getAttr(progressBar, 'aria-valuenow');
                    const visualProgressBars = domCraft.selectAll('.progress .progress-bar');
                    
                    visualProgressBars.forEach(bar => {
                        domCraft.setAttr(bar, 'aria-valuenow', currentProgressValue);
                        domCraft.applyStyle(bar, 'width', currentProgressValue + '%');
                        const statusSpan = domCraft.selectOne('span.sr-only', bar);
                        if (statusSpan) domCraft.setHtml(statusSpan, currentProgressValue + '% Complete');
                        
                        if (currentProgressValue > 0 && !domCraft.selectOne('span:not(.sr-only)', bar)) {
                             const valueSpan = document.createElement('span');
                             domCraft.setHtml(valueSpan, currentProgressValue + '%');
                             domCraft.append(bar, valueSpan);
                        }
                    });
                    domCraft.show(domCraft.selectOne('.progress'));

                    const indexSection = domCraft.selectOne('#index');
                    if (indexSection) domCraft.applyStyle(indexSection, 'paddingTop', '40px');
                    progressMonitor.disconnect();
                }
            }
        }
    });

    const targetProgressNode = domCraft.selectOne('#progress-wrapper #progressbar');
    if (targetProgressNode) {
        progressMonitor.observe(targetProgressNode, { attributes: true });
    } else {
        // Fallback for immediate state or late rendering
        setTimeout(() => {
            const progressBar = domCraft.selectOne('#progress-wrapper #progressbar');
            if (progressBar && progressBar.classList.contains('ui-progressbar')) {
                const currentProgressValue = domCraft.getAttr(progressBar, 'aria-valuenow');
                const visualProgressBars = domCraft.selectAll('.progress .progress-bar');
                
                visualProgressBars.forEach(bar => {
                    domCraft.setAttr(bar, 'aria-valuenow', currentProgressValue);
                    domCraft.applyStyle(bar, 'width', currentProgressValue + '%');
                    const statusSpan = domCraft.selectOne('span.sr-only', bar);
                    if (statusSpan) domCraft.setHtml(statusSpan, currentProgressValue + '% Complete');
                    if (currentProgressValue > 0 && !domCraft.selectOne('span:not(.sr-only)', bar)) {
                         const valueSpan = document.createElement('span');
                         domCraft.setHtml(valueSpan, currentProgressValue + '%');
                         domCraft.append(bar, valueSpan);
                    }
                });
                domCraft.show(domCraft.selectOne('.progress'));

                const indexSection = domCraft.selectOne('#index');
                if (indexSection) domCraft.applyStyle(indexSection, 'paddingTop', '40px');
            }
        }, 100);
    }
}

function structureSurveyNavigationPanel() {
    const navigationIndexContainer = domCraft.selectOne('#index');
    if (!navigationIndexContainer) return;

    const mainSurveyElement = domCraft.selectOne('#limesurvey');
    if (mainSurveyElement) {
        domCraft.unwrap(mainSurveyElement);

        const contentWrapperDiv = document.createElement('div');
        domCraft.addClass(contentWrapperDiv, 'col-md-8', 'content-col');
        domCraft.children(mainSurveyElement).forEach(child => domCraft.append(contentWrapperDiv, child));
        domCraft.append(mainSurveyElement, contentWrapperDiv);

        const indexColumnDiv = document.createElement('div');
        domCraft.addClass(indexColumnDiv, 'col-md-4', 'index-col');
        domCraft.insertAfter(contentWrapperDiv, indexColumnDiv);
        domCraft.append(indexColumnDiv, navigationIndexContainer);
    }

    const indexHeader = domCraft.selectOne('h2', navigationIndexContainer);
    if (indexHeader) {
        const newHeader = document.createElement('h1');
        domCraft.setHtml(newHeader, domCraft.getHtml(indexHeader));
        indexHeader.replaceWith(newHeader);
    }

    const innerIndexContent = domCraft.selectOne('.container', navigationIndexContainer);
    if (innerIndexContent) {
        domCraft.addClass(innerIndexContent, 'panel-body');
        domCraft.removeClass(innerIndexContent, 'container');
        domCraft.wrap(innerIndexContent, 'div', 'panel panel-default');
    }

    domCraft.selectAll('div div.row', navigationIndexContainer).forEach(el => domCraft.removeClass(el, 'row'));
    domCraft.selectAll('div div ol li.row', navigationIndexContainer).forEach(el => domCraft.removeClass(el, 'row'));
    domCraft.selectAll('div div ol li', navigationIndexContainer).forEach(el => domCraft.addClass(el, 'text-success'));
    domCraft.selectAll('div div ol li.missing', navigationIndexContainer).forEach(el => domCraft.removeClass(el, 'text-success').addClass(el, 'text-muted'));
    domCraft.selectAll('div div ol li.current', navigationIndexContainer).forEach(el => domCraft.removeClass(el, 'text-success', 'text-danger').addClass(el, 'text-primary'));

    const headerElements = domCraft.selectAll('.hdr', navigationIndexContainer);
    headerElements.forEach(el => domCraft.append(el, document.createTextNode('. ')));

    domCraft.selectAll('span', navigationIndexContainer).forEach(el => domCraft.addClass(el, 'text-success'));
    domCraft.selectAll('.current span', navigationIndexContainer).forEach(el => domCraft.removeClass(el, 'text-success').addClass(el, 'text-primary'));
    domCraft.selectAll('.current span', navigationIndexContainer).forEach(el => {
        const nextElement = el.nextElementSibling;
        if (nextElement) domCraft.removeClass(nextElement, 'text-success').addClass(nextElement, 'text-primary');
    });

    domCraft.selectAll('input', navigationIndexContainer).forEach(el => domCraft.hide(el));
    domCraft.selectAll('button', navigationIndexContainer).forEach(el => el.remove());
}

function organizeQuestionSections() {
    domCraft.selectAll('.group :nth-child(n) span').forEach(spanElement => {
        domCraft.applyStyle(spanElement, 'font', '');
        domCraft.applyStyle(spanElement, 'fontFamily', '');
        domCraft.applyStyle(spanElement, 'fontVariant', '');
        domCraft.applyStyle(spanElement, 'fontSize', '');
        domCraft.applyStyle(spanElement, 'fontStretch', '');
    });

    const questionNumberDisplay = domCraft.selectOne('.group .question-number');
    if (questionNumberDisplay && domCraft.getHtml(questionNumberDisplay)) {
        domCraft.append(questionNumberDisplay, document.createTextNode('. '));
    }

    const questionCodeDisplay = domCraft.selectOne('.group .question-code');
    if (questionCodeDisplay && domCraft.getHtml(questionCodeDisplay)) {
        domCraft.addClass(questionCodeDisplay, 'badge');
    }
}

function formatResponseComponents() {
    domCraft.selectAll('.answer .tip').forEach(tipElement => domCraft.addClass(tipElement, 'text-muted', 'small'));
    domCraft.selectAll('.answer .answer ul').forEach(unorderedList => domCraft.addClass(unorderedList, 'list-unstyled'));

    domCraft.selectAll('.answer .answer ul').forEach(ulNode => {
        const listChildren = domCraft.children(ulNode);
        if (listChildren.length === 0) return;

        const columnSize = listChildren.length < 13 ? Math.floor(12 / listChildren.length) : 12;

        const rowWrapper = document.createElement('div');
        domCraft.addClass(rowWrapper, 'row');
        listChildren.forEach(li => {
            const columnWrapper = document.createElement('div');
            domCraft.addClass(columnWrapper, `col-md-${columnSize}`);
            domCraft.append(columnWrapper, li);
            domCraft.append(rowWrapper, columnWrapper);
        });
        domCraft.append(ulNode, rowWrapper);
    });

    domCraft.selectAll('.answer .radio-list .radio-item').forEach(radioItemNode => {
        const otherLabel = domCraft.selectOne('label[for$="othertext"]', radioItemNode);
        if (otherLabel) domCraft.addClass(otherLabel, 'othertext');

        const inputControl = domCraft.selectOne('input', radioItemNode);
        if (inputControl) domCraft.removeAttr(inputControl, 'class');

        const regularLabel = domCraft.selectOne('label:not(.othertext)', radioItemNode);
        if (inputControl && regularLabel) {
            domCraft.prepend(regularLabel, inputControl);
        }

        domCraft.selectAll('label', radioItemNode).forEach(labelNode => {
            domCraft.wrap(labelNode, 'div', 'radio');
            domCraft.applyStyle(domCraft.selectOne('.radio', labelNode.parentNode), 'paddingRight', '20px');
        });
    });

    domCraft.selectAll('.answer .radio-list .radio-item div.radio label.hide').forEach(hiddenLabel => {
        Array.from(hiddenLabel.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).forEach(textNode => textNode.remove());
        
        const inputToMove = domCraft.selectOne('input', hiddenLabel);
        if (inputToMove && hiddenLabel.parentNode) {
            domCraft.insertBefore(hiddenLabel.parentNode, inputToMove);
            hiddenLabel.remove();
        }
    });

    domCraft.selectAll('.answer input[type="text"]').forEach(inputField => domCraft.addClass(inputField, 'form-control'));
    domCraft.selectAll('.answer table').forEach(tableElement => domCraft.wrap(tableElement, 'div', 'table-responsive').classList.add('table', 'table-striped', 'table-hover', 'table-condensed'));
    domCraft.selectAll('.answer table thead tr td').forEach(tableData => {
        const newTableHeader = document.createElement('th');
        newTableHeader.innerHTML = '&nbsp;';
        tableData.replaceWith(newTableHeader);
    });

    domCraft.selectAll('.survey-question-help > img').forEach(imageElement => {
        const newIconSpan = document.createElement('span');
        domCraft.addClass(newIconSpan, 'glyphicon', 'glyphicon-info-sign', 'pull-left');
        newIconSpan.innerHTML = '&nbsp;';
        imageElement.replaceWith(newIconSpan);
    });

    domCraft.selectAll('.answer strong .errormandatory').forEach(errorSpanElement => {
        if (errorSpanElement.parentNode && errorSpanElement.parentNode.tagName === 'STRONG') {
            domCraft.unwrap(errorSpanElement.parentNode);
        }
        domCraft.addClass(errorSpanElement, 'text-danger');
    });
    domCraft.selectAll('.answer .text-danger br').forEach(lineBreak => lineBreak.remove());

    const uploadButton = domCraft.selectOne('.upload');
    if (uploadButton) {
        if (uploadButton.parentNode && uploadButton.parentNode.tagName === 'H2') {
            domCraft.unwrap(uploadButton);
        }
        domCraft.addClass(uploadButton, 'btn', 'btn-primary');
    }

    domCraft.selectAll('.subquestions-list li').forEach(listItem => {
        const inputInsideLi = domCraft.selectOne('input', listItem);
        const labelInsideLi = domCraft.selectOne('label', listItem);
        if (inputInsideLi && labelInsideLi) {
            domCraft.append(labelInsideLi, inputInsideLi);
        }

        const nonSliderLabel = domCraft.selectOne('label:not(.slider-label)', listItem);
        if (nonSliderLabel) {
            domCraft.wrap(nonSliderLabel, 'div', 'checkbox');
        }

        const optionSpan = domCraft.selectOne('span.option', listItem);
        if (optionSpan) {
            const inputInOption = domCraft.selectOne('input', optionSpan);
            const labelInOption = domCraft.selectOne('label', optionSpan);
            if (inputInOption && labelInOption) {
                domCraft.prepend(labelInOption, inputInOption);
            }
            if (labelInOption) {
                domCraft.wrap(labelInOption, 'div', 'checkbox');
            }
        }
    });
}

function adjustResetOptionsDisplay() {
    domCraft.selectAll('.clearall-results-restart a').forEach(linkElement => domCraft.addClass(linkElement, 'btn', 'btn-primary', 'btn-lg'));
    domCraft.selectAll('.clearall-results-close a').forEach(linkElement => domCraft.addClass(linkElement, 'btn', 'btn-danger', 'btn-lg'));
}

function arrangeConfidentialityInfo() {
    const privacyContentDiv = domCraft.selectOne('div.privacy');
    if (!privacyContentDiv) return;

    const headingElement = domCraft.selectOne('.panel-heading h3', privacyContentDiv);
    const bodySpanElement = domCraft.selectOne('.panel-body span', privacyContentDiv);
    const bodyContainer = domCraft.selectOne('.panel-body', privacyContentDiv);

    if (headingElement && bodySpanElement) {
        domCraft.setHtml(headingElement, domCraft.getHtml(bodySpanElement));
        bodySpanElement.remove();
    }

    if (bodyContainer) {
        domCraft.selectAll('br', bodyContainer).forEach(brTag => brTag.remove());
        const privacyText = domCraft.getHtml(bodyContainer);
        domCraft.setHtml(bodyContainer, '');
        const newParagraph = document.createElement('p');
        domCraft.setHtml(newParagraph, privacyText);
        domCraft.append(bodyContainer, newParagraph);
    }
}

function convertTableToFormGroups(formContainerSelector, newWrapperClass, actionButtonSelector, actionButtonClass) {
    const formElement = domCraft.selectOne(formContainerSelector);
    if (!formElement) return;

    domCraft.selectAll('input[type="text"]', formElement).forEach(input => domCraft.addClass(input, 'form-control'));
    domCraft.selectAll('input[type="password"]', formElement).forEach(input => domCraft.addClass(input, 'form-control'));
    
    const actionButton = domCraft.selectOne(actionButtonSelector, formElement);
    if (actionButton) domCraft.addClass(actionButton, actionButtonClass);

    const newFormWrapper = document.createElement('div');
    domCraft.addClass(newFormWrapper, newWrapperClass);
    domCraft.insertAfter(formElement, newFormWrapper);

    domCraft.selectAll('tr', formElement).forEach((tableRow, index) => {
        const firstCell = domCraft.selectOne('td:first-child', tableRow);
        const secondCell = domCraft.selectOne('td:nth-child(2)', tableRow);

        if (firstCell && secondCell) {
            const labelMarkup = domCraft.getHtml(firstCell).slice(0, -1);
            const fieldMarkup = domCraft.getHtml(secondCell);

            if (labelMarkup.indexOf('<img') === -1 && fieldMarkup) {
                const formGroupDiv = document.createElement('div');
                domCraft.addClass(formGroupDiv, 'form-group', `group${index}`);
                formGroupDiv.insertAdjacentHTML('beforeend', labelMarkup);
                formGroupDiv.insertAdjacentHTML('beforeend', fieldMarkup);
                domCraft.append(newFormWrapper, formGroupDiv);
            }
        }
    });
    formElement.remove();
}

function transformDataPersistencePanel() {
    convertTableToFormGroups('.save-form', 'save-form-bootstrap', '#savebutton', 'btn-primary');
}

function transformDataRetrievalPanel() {
    convertTableToFormGroups('.load-form', 'load-form-bootstrap', '#loadbutton', 'btn-primary');
}

function streamlineUserEnrollmentForm() {
    const registrationForm = domCraft.selectOne('.register-form form');
    if (!registrationForm) return;

    domCraft.selectAll('input[type="text"]', registrationForm).forEach(input => domCraft.addClass(input, 'form-control'));
    domCraft.selectAll('input[type="password"]', registrationForm).forEach(input => domCraft.addClass(input, 'form-control'));
    
    const registerButton = domCraft.selectOne('#registercontinue', registrationForm);
    if (registerButton) domCraft.addClass(registerButton, 'btn', 'btn-primary');

    const newFormWrapper = document.createElement('div');
    domCraft.addClass(newFormWrapper, 'register-form-bootstrap');
    domCraft.append(registrationForm, newFormWrapper);

    domCraft.selectAll('.register-form tr').forEach((tableRow, index) => {
        const firstCell = domCraft.selectOne('td:first-child', tableRow);
        const secondCell = domCraft.selectOne('td:nth-child(2)', tableRow);

        if (firstCell && secondCell) {
            const labelMarkup = domCraft.getHtml(firstCell).slice(0, -1);
            const fieldMarkup = domCraft.getHtml(secondCell);

            if (labelMarkup.indexOf('<img') === -1 && fieldMarkup) {
                const formGroupDiv = document.createElement('div');
                domCraft.addClass(formGroupDiv, 'form-group', `group${index}`);
                formGroupDiv.insertAdjacentHTML('beforeend', labelMarkup);
                formGroupDiv.insertAdjacentHTML('beforeend', fieldMarkup);
                domCraft.append(newFormWrapper, formGroupDiv);
            }
        }
    });
    const originalTable = domCraft.selectOne('.register-form table.register');
    if (originalTable) originalTable.remove();
}

function processSurveyCollectionDisplay() {
    const surveyContactInfo = domCraft.selectOne('.survey-list-table .survey-contact');
    if (surveyContactInfo) {
        let currentHtmlContent = domCraft.getHtml(surveyContactInfo);
        currentHtmlContent = currentHtmlContent.replace(/\( /, '(').replace(/ \)/, ')');
        domCraft.setHtml(surveyContactInfo, currentHtmlContent);
    }
}

function formatAuthorizationMessage() {
    const authMessageParagraph = domCraft.selectOne('p#tokenmessage');
    if (!authMessageParagraph) return;

    domCraft.wrap(authMessageParagraph, 'div', 'well');

    const errorSpanElement = domCraft.selectOne('span.error', authMessageParagraph);
    if (errorSpanElement) {
        const newHeaderOne = document.createElement('h1');
        domCraft.setHtml(newHeaderOne, domCraft.getHtml(errorSpanElement));
        errorSpanElement.replaceWith(newHeaderOne);
    }

    domCraft.selectAll('br', authMessageParagraph).forEach(brTag => brTag.remove());

    let currentHtmlContent = domCraft.getHtml(authMessageParagraph);
    currentHtmlContent = currentHtmlContent.replace(/\( /, '(').replace(/ \)/, ')');
    domCraft.setHtml(authMessageParagraph, currentHtmlContent);
}

function initializeApplicationFeatures() {
    establishInformationOverlay();
    establishVerificationOverlay();

    reconfigureInterfaceComponents();
    activateProgressDisplay();
    structureSurveyNavigationPanel();
    organizeQuestionSections();
    formatResponseComponents();
    adjustResetOptionsDisplay();
    arrangeConfidentialityInfo();
    transformDataPersistencePanel();
    transformDataRetrievalPanel();
    streamlineUserEnrollmentForm();
    processSurveyCollectionDisplay();
    formatAuthorizationMessage();

    const mainDisplayContent = domCraft.selectOne('.bflsMainContent');
    if (mainDisplayContent) domCraft.show(mainDisplayContent);

    const requiredErrorElements = domCraft.selectAll('.errormandatory');
    if (requiredErrorElements.length > 0) {
        let scrollTargetNode = requiredErrorElements[0].parentNode;
        for(let i = 0; i < 4; i++) {
            if (scrollTargetNode && scrollTargetNode.parentNode) {
                scrollTargetNode = scrollTargetNode.parentNode;
            } else {
                break;
            }
        }
        if (scrollTargetNode) {
            const documentOffset = scrollTargetNode.getBoundingClientRect().top + window.pageYOffset;
            domCraft.navigatePageScroll(documentOffset - 50);
        }
    } else {
        domCraft.navigatePageScroll(1);
    }
}

document.addEventListener('DOMContentLoaded', initializeApplicationFeatures);