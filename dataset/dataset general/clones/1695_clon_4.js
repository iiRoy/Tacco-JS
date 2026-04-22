(function() {
    const panelAnimator = (targetElement, action) => {
        if (!targetElement) return;
        targetElement.style.transition = 'max-height 0.5s ease-in-out, opacity 0.5s ease-in-out';
        if (action === 'expose') {
            targetElement.style.display = '';
            targetElement.style.maxHeight = targetElement.scrollHeight + 'px';
            targetElement.style.opacity = '1';
        } else { // 'conceal'
            targetElement.style.maxHeight = '0';
            targetElement.style.opacity = '0';
            setTimeout(() => {
                if (targetElement.style.opacity === '0' && targetElement.style.maxHeight === '0px') {
                    targetElement.style.display = 'none';
                }
            }, 500);
        }
    };

    const configurePanelInteractions = () => {
        const centralPanel = document.querySelector('#banner');
        const displayActivators = document.querySelectorAll('#portfolio-t, #skills-experience-t, #contact-t');
        const hideActivator = document.querySelector('#home-t');

        displayActivators.forEach(activator => {
            activator.addEventListener('click', () => panelAnimator(centralPanel, 'expose'));
        });

        if (hideActivator) {
            hideActivator.addEventListener('click', () => panelAnimator(centralPanel, 'conceal'));
        }
    };

    document.addEventListener('DOMContentLoaded', configurePanelInteractions);
})();

(function() {
    const initializeVisualCycle = () => {
        const cycleElements = document.querySelectorAll('.flexslider');
        if (typeof window.jQuery !== 'undefined' && typeof window.jQuery.fn.flexslider === 'function') {
            cycleElements.forEach(element => {
                window.jQuery(element).flexslider({
                    animation: "fade",
                    animationLoop: true,
                });
            });
        } else {
            console.warn('FlexSlider library not found or not initialized. Skipping visual cycle setup.');
        }
    };

    window.addEventListener('load', initializeVisualCycle);
})();

const initiateMessageDispatch = () => {
    const submissionPayload = new FormData();
    submissionPayload.append("name", document.getElementById("form_name")?.value || '');
    submissionPayload.append("mail", document.getElementById("form_email")?.value || '');
    submissionPayload.append("subject", document.getElementById("form_subject")?.value || '');
    submissionPayload.append("text", document.getElementById("form_message")?.value || '');

    fetch("mail.php", {
        method: "POST",
        body: submissionPayload,
        headers: {
            'Accept': 'application/json, text/plain, */*'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    })
    .then(rawContent => {
        if (rawContent) {
            let processedData;
            try {
                // Replicating original's eval behavior for parsing the response
                processedData = eval("(" + rawContent + ")");
            } catch (e) {
                console.error("Failed to parse response content:", e);
                window.location.reload();
                return;
            }

            const clearInputAfterDelay = (fieldElement, delayMs) => {
                if (fieldElement) {
                    setTimeout(() => { fieldElement.value = ''; }, delayMs);
                }
            };

            const responseDisplay = document.getElementById("response");

            if (processedData.name !== undefined) {
                const nameField = document.getElementById("form_name");
                if (nameField) nameField.value = processedData.name;
                clearInputAfterDelay(nameField, 1500);
            }
            if (processedData.mail !== undefined) {
                const emailField = document.getElementById("form_email");
                if (emailField) emailField.value = processedData.mail;
                clearInputAfterDelay(emailField, 1500);
            }
            if (processedData.text !== undefined) {
                const messageField = document.getElementById("form_message");
                if (messageField) messageField.value = processedData.text;
                clearInputAfterDelay(messageField, 1500);
            }
            if (processedData.subject !== undefined) {
                const subjectField = document.getElementById("form_subject");
                if (subjectField) subjectField.value = processedData.subject;
                clearInputAfterDelay(subjectField, 1500);
            }

            if (processedData.main !== undefined) {
                if (responseDisplay) {
                    responseDisplay.innerHTML = processedData.main;
                    responseDisplay.style.transition = 'opacity 0.5s ease-in-out';
                    responseDisplay.style.display = '';
                    responseDisplay.style.opacity = '1';
                    setTimeout(() => {
                        responseDisplay.style.opacity = '0';
                        setTimeout(() => {
                            if (responseDisplay.style.opacity === '0') {
                                responseDisplay.style.display = 'none';
                            }
                        }, 500);
                    }, 2000);
                }
            }
        } else {
            window.location.reload();
        }
    })
    .catch(error => {
        console.error("Transmission error:", error);
        window.location.reload();
    });
};
window.initiateMessageDispatch = initiateMessageDispatch;

(function () {
    const tabCoordinator = new class {
        constructor() {
            window.addEventListener('hashchange', this.updateContentDisplay.bind(this));
            document.addEventListener('DOMContentLoaded', this.updateContentDisplay.bind(this));
        }

        visualTransition(element, action, durationMs = 400, onCompleteCallback = null) {
            if (!element) return;
            element.style.transition = `opacity ${durationMs / 1000}s ease-in-out`;

            if (action === 'reveal') {
                element.style.display = '';
                element.style.opacity = '0';
                element.offsetWidth; // Force reflow
                element.style.opacity = '1';
                setTimeout(() => {
                    if (onCompleteCallback) onCompleteCallback();
                }, durationMs);
            } else { // 'conceal'
                element.style.opacity = '0';
                setTimeout(() => {
                    if (element.style.opacity === '0') {
                        element.style.display = 'none';
                    }
                    if (onCompleteCallback) onCompleteCallback();
                }, durationMs);
            }
        }

        updateContentDisplay() {
            const currentAddressHash = window.location.hash;
            if (!currentAddressHash) return;

            const associatedNavLinks = document.querySelectorAll('ul.tabs a[href*="' + currentAddressHash + '"]');
            const designatedContentSection = document.querySelector(currentAddressHash);

            if (associatedNavLinks.length > 0 && designatedContentSection) {
                const primaryNavLink = associatedNavLinks[0];
                const containingTabSystem = primaryNavLink.closest('.tabs');

                if (primaryNavLink.classList.contains('active')) {
                    return;
                }

                if (containingTabSystem) {
                    containingTabSystem.querySelectorAll('.active').forEach(activeLink => {
                        activeLink.classList.remove('active');
                    });
                }
                
                // Find all sibling content sections to deactivate
                const allContentSectionsInParent = designatedContentSection.parentNode.children;
                Array.from(allContentSectionsInParent).forEach(section => {
                    if (section.classList.contains('active') && section !== designatedContentSection) {
                        section.classList.remove('active');
                        this.visualTransition(section, 'conceal', 400);
                    }
                });

                primaryNavLink.classList.add('active');

                this.visualTransition(designatedContentSection, 'reveal', 400, () => {
                    designatedContentSection.classList.add('active');
                });
            }
        }
    };
    tabCoordinator.updateContentDisplay(); // Initial execution on script load
})();