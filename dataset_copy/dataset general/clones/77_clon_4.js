const securityCredential = 'some_predefined_api_key_value'; 

function manageElementVisibility(targetNode, shouldBeVisible) {
    if (targetNode) {
        targetNode.style.display = shouldBeVisible ? '' : 'none';
    }
}

function processDomElements(cssSelector, operationFunction) {
    const locatedElements = document.querySelectorAll(cssSelector);
    locatedElements.forEach(operationFunction);
}

function beginApplicationLogic() {
    processDomElements('.ui.radio.checkbox', (uiComponent) => {
        if (typeof jQuery !== 'undefined' && jQuery.fn.checkbox) {
            jQuery(uiComponent).checkbox();
        }
    });

    processDomElements('.ui.dropdown', (uiComponent) => {
        if (typeof jQuery !== 'undefined' && jQuery.fn.dropdown) {
            jQuery(uiComponent).dropdown();
        }
    });

    const actionTypeInput = document.getElementById('actType');
    if (actionTypeInput) {
        const displayConfigurations = {
            "2": { showIds: ['email'], hideIds: ['weibo', 'url', 'mobile_push'] },
            "3": { showIds: ['url'], hideIds: ['weibo', 'email', 'mobile_push'] },
            "4": { showIds: ['weibo'], hideIds: ['email', 'url', 'mobile_push'] },
            "6": { showIds: ['mobile_push'], hideIds: ['email', 'weibo', 'url'] }
        };

        actionTypeInput.addEventListener('change', (eventDetail) => {
            const currentSelectedValue = eventDetail.target.value;
            const specificInstructions = displayConfigurations[currentSelectedValue];

            if (specificInstructions) {
                const allPotentialTargets = ['weibo', 'email', 'url', 'mobile_push'].map(id => document.getElementById(id));
                allPotentialTargets.forEach(elem => manageElementVisibility(elem, false));
                specificInstructions.showIds.forEach(id => {
                    manageElementVisibility(document.getElementById(id), true);
                });
            }
        });
    }

    processDomElements('.chooseUrl', (triggerElement) => {
        triggerElement.addEventListener('change', (eventNotification) => {
            eventNotification.preventDefault();

            const currentlySelectedRadio = document.querySelector('input[name="chooseUrl"]:checked');
            const activeOptionValue = currentlySelectedRadio ? currentlySelectedRadio.value : null;

            const switchDisplayAreas = document.querySelectorAll('span.chooseSwitch');
            const urlInputAreas = document.querySelectorAll('span.writeUrl');
            const targetUrlField = document.getElementById('postUrl_2');
            const authorizationKeyField = document.getElementById('act_apt_key');

            if (activeOptionValue === "1") {
                switchDisplayAreas.forEach(elem => manageElementVisibility(elem, true));
                urlInputAreas.forEach(elem => manageElementVisibility(elem, false));
            } else if (activeOptionValue === "2") {
                switchDisplayAreas.forEach(elem => manageElementVisibility(elem, false));
                urlInputAreas.forEach(elem => manageElementVisibility(elem, true));

                if (targetUrlField && targetUrlField.nextElementSibling) {
                    targetUrlField.nextElementSibling.innerHTML = '';
                }

                if (authorizationKeyField && targetUrlField && authorizationKeyField.value === securityCredential) {
                    targetUrlField.value = '';
                }
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', beginApplicationLogic);