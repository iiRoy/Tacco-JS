class OverlayManager {
    constructor(configData) {
        this.displayProperties = {
            captionText: configData.captionText || '',
            mainBodyMarkup: configData.mainBodyMarkup || '',
            actionControls: configData.actionControls || [],
            hasCaptionBar: configData.hasCaptionBar !== undefined ? configData.hasCaptionBar : true,
            hasFootnoteSection: configData.hasFootnoteSection !== undefined ? configData.hasFootnoteSection : false,
            removeOnDismiss: configData.removeOnDismiss !== undefined ? configData.removeOnDismiss : false
        };

        this.elementReferences = {};
        this.constructOverlay();
    }

    constructOverlay() {
        this.elementReferences.backdropLayer = document.createElement('div');
        this.elementReferences.backdropLayer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; opacity: 0; visibility: hidden; transition: opacity 0.3s ease;';

        this.elementReferences.messagePanel = document.createElement('div');
        this.elementReferences.messagePanel.style.cssText = 'background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 600px; width: 90%; transform: translateY(-50px); transition: transform 0.3s ease;';

        this.elementReferences.captionBar = document.createElement('div');
        this.elementReferences.captionBar.style.cssText = 'font-size: 1.5em; font-weight: bold; margin-bottom: 15px;';
        if (this.displayProperties.hasCaptionBar) {
            this.elementReferences.captionBar.textContent = this.displayProperties.captionText;
            this.elementReferences.messagePanel.appendChild(this.elementReferences.captionBar);
        }

        this.elementReferences.bodyContent = document.createElement('div');
        this.elementReferences.bodyContent.style.cssText = 'margin-bottom: 15px;';
        this.elementReferences.bodyContent.innerHTML = this.displayProperties.mainBodyMarkup;
        this.elementReferences.messagePanel.appendChild(this.elementReferences.bodyContent);

        this.elementReferences.footnoteSection = document.createElement('div');
        this.elementReferences.footnoteSection.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;';
        if (this.displayProperties.hasFootnoteSection || this.displayProperties.actionControls.length > 0) {
            this.displayProperties.actionControls.forEach(controlData => {
                let controlElement;
                if (controlData.customMarkup) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = controlData.customMarkup;
                    controlElement = tempDiv.firstElementChild;
                } else {
                    controlElement = document.createElement('button');
                    controlElement.textContent = controlData.labelContent || '';
                    controlElement.style.cssText = 'padding: 8px 15px; border: 1px solid #ccc; border-radius: 4px; background-color: #eee; cursor: pointer;';
                }

                if (controlData.styleClasses) {
                    controlData.styleClasses.split(' ').forEach(cls => controlElement.classList.add(cls));
                }

                const clickAction = (evt) => {
                    if (controlData.activationHandler) {
                        controlData.activationHandler(evt);
                    }
                    if (controlData.dismissOnAction) {
                        this.concealOverlay();
                    }
                    if (controlData.destinationLink) {
                        window.location.href = controlData.destinationLink;
                    }
                };

                controlElement.addEventListener('click', clickAction);
                this.elementReferences.footnoteSection.appendChild(controlElement);
            });
            this.elementReferences.messagePanel.appendChild(this.elementReferences.footnoteSection);
        }

        this.elementReferences.backdropLayer.appendChild(this.elementReferences.messagePanel);
        this.elementReferences.backdropLayer.addEventListener('click', (evt) => {
            if (evt.target === this.elementReferences.backdropLayer) {
                this.concealOverlay();
            }
        });
    }

    displayOverlay() {
        document.body.appendChild(this.elementReferences.backdropLayer);
        this.elementReferences.backdropLayer.offsetWidth; // Force reflow
        this.elementReferences.backdropLayer.style.opacity = '1';
        this.elementReferences.backdropLayer.style.visibility = 'visible';
        this.elementReferences.messagePanel.style.transform = 'translateY(0)';
    }

    concealOverlay() {
        this.elementReferences.backdropLayer.style.opacity = '0';
        this.elementReferences.messagePanel.style.transform = 'translateY(-50px)';

        const transitionEndHandler = () => {
            this.elementReferences.backdropLayer.style.visibility = 'hidden';
            if (this.displayProperties.removeOnDismiss) {
                this.elementReferences.backdropLayer.remove();
            }
            this.elementReferences.backdropLayer.removeEventListener('transitionend', transitionEndHandler);
        };

        this.elementReferences.backdropLayer.addEventListener('transitionend', transitionEndHandler);
    }
}

function activateOverlay(configData) {
    const managerInstance = new OverlayManager(configData);
    return {
        display: () => managerInstance.displayOverlay(),
        dismiss: () => managerInstance.concealOverlay()
    };
}

document.body.addEventListener('click', function (evt) {
    const targetElementId = evt.target.id;

    if (targetElementId === 'basic-example') {
        const basicConfiguration = {
            captionText: "Example title",
            mainBodyMarkup: "Here's some important message you must read.",
            actionControls: [
                {
                    labelContent: "Roger that",
                    dismissOnAction: true
                }
            ]
        };
        activateOverlay(basicConfiguration).display();
    } else if (targetElementId === 'full-example') {
        "use strict";

        const advancedConfiguration = {
            captionText: "Full example title",
            mainBodyMarkup: "<p>Rich content with some <strong>HTML</strong> tags <em>here</em> and <u>there</u></p>",
            hasCaptionBar: true,
            hasFootnoteSection: true,
            removeOnDismiss: true,
            actionControls: [
                {
                    labelContent: "Yup, I got it",
                    destinationLink: "#",
                    styleClasses: "btn-primary",
                    activationHandler: function(actionEvent) {
                        alert("Seriously, I got it!");
                    }
                },
                {
                    labelContent: "Get me out of here",
                    destinationLink: "#",
                    dismissOnAction: true
                },
                {
                    customMarkup: "<a href='#' data-dismiss='modal' class='btn btn-danger'>Danger, custom button</a>",
                    labelContent: "Achtung!",
                    styleClasses: "btn-large",
                    activationHandler: function() {
                        alert("Custom  button");
                    }
                }
            ]
        };
        activateOverlay(advancedConfiguration).display();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.codeFormatter === 'function') {
        window.codeFormatter();
    }
});