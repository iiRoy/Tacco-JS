var TaskMaster = TaskMaster || {};

TaskMaster.instructionRegistry = new Map();

TaskMaster.registerInstruction = function(designation, handlerFunction) {
    TaskMaster.instructionRegistry.set(designation, handlerFunction);
};

TaskMaster.executeInstruction = function(_, instruction) { 
    if (TaskMaster.instructionRegistry.has(instruction.instructionType)) {
        TaskMaster.instructionRegistry.get(instruction.instructionType)(instruction);
    } else {
        alert('No handler for instruction type "' + instruction.instructionType + '" defined!');
    }
};

TaskMaster.initiateRequest = function(operationPath, payload, successCallback, errorCallback) {
    let requestBody;
    let contentType;

    if (typeof payload === 'string') {
        requestBody = payload;
        contentType = 'application/x-www-form-urlencoded';
    } else if (payload instanceof FormData) {
        requestBody = new URLSearchParams(payload).toString();
        contentType = 'application/x-www-form-urlencoded';
    } else if (typeof payload === 'object' && payload !== null) {
        requestBody = new URLSearchParams(payload).toString();
        contentType = 'application/x-www-form-urlencoded';
    } else {
        requestBody = null;
        contentType = null;
    }

    const requestHeaders = {};
    if (contentType) {
        requestHeaders['Content-Type'] = contentType;
    }

    fetch('/a/' + operationPath, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text || response.statusText); });
        }
        return response.json();
    })
    .then(dataResponse => {
        if (successCallback) {
            successCallback(dataResponse);
        }
        if (Array.isArray(dataResponse)) {
            dataResponse.forEach(item => TaskMaster.executeInstruction(null, item));
        } else if (dataResponse && typeof dataResponse === 'object' && dataResponse.instructionType) {
            TaskMaster.executeInstruction(null, dataResponse);
        }
    })
    .catch(error => {
        const errorText = error.message || 'Unknown error';
        errorCallback(null, error.message, errorText);
        TaskMaster.handleRequestError(null, error.message, errorText);
    });
};

TaskMaster.blockControl = function(controlElement) {
    if (controlElement) {
        controlElement.setAttribute('disabled', 'disabled');
    }
};

TaskMaster.enableControl = function(controlElement) {
    if (controlElement) {
        controlElement.removeAttribute('disabled');
    }
};

TaskMaster.handleButtonPress = function(controlElement, operationPath, payload) {
    TaskMaster.blockControl(controlElement);
    TaskMaster.initiateRequest(
        operationPath,
        payload,
        function(dataResponse) { TaskMaster.enableControl(controlElement); },
        function(responseObject, statusText, failureReason) { TaskMaster.enableControl(controlElement); }
    );
    return false;
};

TaskMaster.processFormSubmission = function(formElement, operationPath, queryString) {
    const formButtons = Array.from(formElement.querySelectorAll('button'));
    formButtons.forEach(button => TaskMaster.blockControl(button));

    const formData = new FormData(formElement);
    const serializedData = new URLSearchParams(formData).toString();

    const fullOperationPath = operationPath + (queryString ? '?' + queryString : '');

    TaskMaster.initiateRequest(
        fullOperationPath,
        serializedData,
        function(dataResponse) { formButtons.forEach(button => TaskMaster.enableControl(button)); },
        function(responseObject, statusText, failureReason) { formButtons.forEach(button => TaskMaster.enableControl(button)); }
    );
    return false;
};

TaskMaster.handleRequestError = function(responseObject, statusText, failureReason) {
    TaskMaster.executeInstruction(null, {
        instructionType: 'error',
        caption: 'Error',
        contentMessage: '<p>The server has returned an unexpected response: <b>' + statusText + '</b>, ' + failureReason + '. \n' +
            'Please try performing this action again later and if the problem persists, <a href="/contact">contact</a> us.</p>'
    });
};

const getTargetElement = (targetId) => {
    if (!targetId) return null;
    return targetId.startsWith('#') ? document.getElementById(targetId.substring(1)) : document.querySelector(targetId);
};

const animateOpacity = (element, targetOpacity, durationMs, onComplete) => {
    if (!element) {
        onComplete && onComplete();
        return;
    }
    const start = performance.now();
    const initialOpacity = parseFloat(element.style.opacity || getComputedStyle(element).opacity || 1);
    const deltaOpacity = targetOpacity - initialOpacity;

    const performFrame = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / durationMs, 1);
        element.style.opacity = initialOpacity + deltaOpacity * progress;

        if (progress < 1) {
            requestAnimationFrame(performFrame);
        } else {
            onComplete && onComplete();
        }
    };
    requestAnimationFrame(performFrame);
};

TaskMaster.registerInstruction('notification', function(instruction) { alert(instruction.caption + ':\n' + instruction.dataValue); });
TaskMaster.registerInstruction('refresh-page', function(instruction) { location.reload(); });
TaskMaster.registerInstruction('open-page', function(instruction) { location.assign(instruction.resourceLink); });
TaskMaster.registerInstruction('open-window', function(instruction) { window.open(instruction.resourceLink, instruction.designation, instruction.windowOptions); });

TaskMaster.registerInstruction('dom-add-class', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.classList.add(instruction.dataValue);
});
TaskMaster.registerInstruction('dom-after', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.insertAdjacentHTML('afterend', instruction.dataValue);
});
TaskMaster.registerInstruction('dom-append', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.insertAdjacentHTML('beforeend', instruction.dataValue);
});
TaskMaster.registerInstruction('dom-set-attr', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) {
        if (instruction.designation) {
            el.setAttribute(instruction.designation, instruction.dataValue);
        } else if (instruction.attributeMap) {
            for (const key in instruction.attributeMap) {
                if (Object.prototype.hasOwnProperty.call(instruction.attributeMap, key)) {
                    el.setAttribute(key, instruction.attributeMap[key]);
                }
            }
        }
    }
});
TaskMaster.registerInstruction('dom-before', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.insertAdjacentHTML('beforebegin', instruction.dataValue);
});
TaskMaster.registerInstruction('dom-set-css', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) {
        if (instruction.designation) {
            el.style.setProperty(instruction.designation, instruction.dataValue);
        } else if (instruction.attributeMap) {
            for (const key in instruction.attributeMap) {
                if (Object.prototype.hasOwnProperty.call(instruction.attributeMap, key)) {
                    el.style.setProperty(key, instruction.attributeMap[key]);
                }
            }
        }
    }
});
TaskMaster.registerInstruction('dom-detach', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el && el.parentNode) el.parentNode.removeChild(el);
});
TaskMaster.registerInstruction('dom-make-empty', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.innerHTML = '';
});
TaskMaster.registerInstruction('dom-set-height', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.style.height = (typeof instruction.targetHeight === 'number' ? instruction.targetHeight + 'px' : instruction.targetHeight);
});
TaskMaster.registerInstruction('dom-html', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.innerHTML = instruction.dataValue;
});
TaskMaster.registerInstruction('dom-set-offset', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el && instruction.targetCoordinates) {
        if (typeof instruction.targetCoordinates.left !== 'undefined') {
            el.style.left = instruction.targetCoordinates.left + 'px';
        }
        if (typeof instruction.targetCoordinates.top !== 'undefined') {
            el.style.top = instruction.targetCoordinates.top + 'px';
        }
    }
});
TaskMaster.registerInstruction('dom-prepend', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.insertAdjacentHTML('afterbegin', instruction.dataValue);
});
TaskMaster.registerInstruction('dom-set-prop', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) {
        if (instruction.designation) {
            el[instruction.designation] = instruction.dataValue;
        } else if (instruction.attributeMap) {
            for (const key in instruction.attributeMap) {
                if (Object.prototype.hasOwnProperty.call(instruction.attributeMap, key)) {
                    el[key] = instruction.attributeMap[key];
                }
            }
        }
    }
});
TaskMaster.registerInstruction('dom-remove-element', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el && el.parentNode) el.parentNode.removeChild(el);
});
TaskMaster.registerInstruction('dom-remove-attr', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.removeAttribute(instruction.designation);
});
TaskMaster.registerInstruction('dom-remove-class', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.classList.remove(instruction.designation);
});
TaskMaster.registerInstruction('dom-remove-prop', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el && instruction.designation) {
        delete el[instruction.designation];
    }
});
TaskMaster.registerInstruction('dom-replace-with', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.outerHTML = instruction.dataValue;
});
TaskMaster.registerInstruction('dom-set-scroll-left', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.scrollLeft = instruction.dataValue;
});
TaskMaster.registerInstruction('dom-set-scroll-top', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.scrollTop = instruction.dataValue;
});
TaskMaster.registerInstruction('dom-text', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.textContent = instruction.dataValue;
});
TaskMaster.registerInstruction('dom-toggle-class', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.classList.toggle(instruction.dataValue);
});
TaskMaster.registerInstruction('dom-set-width', function(instruction) {
    const el = getTargetElement(instruction.targetId);
    if (el) el.style.width = (typeof instruction.targetWidth === 'number' ? instruction.targetWidth + 'px' : instruction.targetWidth);
});

TaskMaster.registerInstruction('error',
    function(instruction) {
        TaskMaster.executeInstruction(null, { instructionType: 'notification', caption: 'Error', dataValue: instruction.contentMessage, isPersistent: true });
    });

TaskMaster.registerInstruction('dom-fade',
    function(instruction) {
        const el = getTargetElement(instruction.targetId);
        if (!el) return;

        animateOpacity(el, 0, 200, () => {
            el.style.display = 'none';
            el.innerHTML = instruction.dataValue;
            el.style.opacity = 0;

            el.style.display = '';
            animateOpacity(el, 1, 600, () => {
            });
        });
    });