class DisplayOverlayComponent {
    constructor() {
        this.dimmerElement = document.createElement('div');
        this.dimmerElement.className = 'app-dimmer-overlay';
        this.dimmerElement.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); z-index: 10000; display: none;';

        this.dialogElement = document.createElement('div');
        this.dialogElement.className = 'app-dialog-container';
        this.dialogElement.style.cssText = 'position: absolute; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); z-index: 10001; display: none; max-width: 90vw; max-height: 90vh; overflow: auto;';

        this.dialogContentElement = document.createElement('div');
        this.dialogContentElement.className = 'app-dialog-content-area';
        this.dialogContentElement.style.marginBottom = '15px';

        this.dialogCloseButton = document.createElement('button');
        this.dialogCloseButton.className = 'app-dialog-action-close';
        this.dialogCloseButton.textContent = 'Close';
        this.dialogCloseButton.style.cssText = 'position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.2em; cursor: pointer;';

        this.dialogElement.appendChild(this.dialogContentElement);
        this.dialogElement.appendChild(this.dialogCloseButton);

        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(this.dimmerElement);
            document.body.appendChild(this.dialogElement);
        });

        this.dialogCloseButton.addEventListener('click', (ev) => {
            ev.preventDefault();
            this.hideDialog();
        });

        this.boundAdjustPosition = this.adjustPosition.bind(this);
    }

    adjustPosition() {
        let currentViewportHeight = window.innerHeight;
        let currentViewportWidth = window.innerWidth;
        let currentDialogHeight = this.dialogElement.offsetHeight;
        let currentDialogWidth = this.dialogElement.offsetWidth;

        let currentScrollYOffset = window.scrollY || document.documentElement.scrollTop;
        let currentScrollXOffset = window.scrollX || document.documentElement.scrollLeft;

        let newTopCoordinate = Math.max((currentViewportHeight - currentDialogHeight) / 2, 0) + currentScrollYOffset;
        let newLeftCoordinate = Math.max((currentViewportWidth - currentDialogWidth) / 2, 0) + currentScrollXOffset;

        this.dialogElement.style.top = `${newTopCoordinate}px`;
        this.dialogElement.style.left = `${newLeftCoordinate}px`;
    }

    presentDialog(configuration) {
        this.dialogContentElement.innerHTML = '';
        if (typeof configuration.contentData === 'string') {
            this.dialogContentElement.innerHTML = configuration.contentData;
        } else if (configuration.contentData instanceof HTMLElement) {
            this.dialogContentElement.appendChild(configuration.contentData);
        }

        this.dialogElement.style.width = configuration.areaWidth || 'auto';
        this.dialogElement.style.height = configuration.areaHeight || 'auto';

        this.adjustPosition();

        window.addEventListener('resize', this.boundAdjustPosition);
        window.addEventListener('scroll', this.boundAdjustPosition);

        this.dimmerElement.style.display = 'block';
        this.dialogElement.style.display = 'block';
    }

    hideDialog() {
        this.dimmerElement.style.display = 'none';
        this.dialogElement.style.display = 'none';
        this.dialogContentElement.innerHTML = '';

        window.removeEventListener('resize', this.boundAdjustPosition);
        window.removeEventListener('scroll', this.boundAdjustPosition);
    }
}

const systemInterface = new DisplayOverlayComponent();

document.addEventListener('DOMContentLoaded', function() {
    const userPreferenceForm = document.querySelector('form#user_new');
    const destinationInput = document.getElementById('sip_username');

    if (userPreferenceForm && destinationInput) {
        userPreferenceForm.addEventListener('change', function(inputSourceEvent) {
            if (inputSourceEvent.target && inputSourceEvent.target.type === 'radio' && inputSourceEvent.target.checked) {
                const associatedLabel = inputSourceEvent.target.nextElementSibling;
                if (associatedLabel) {
                    destinationInput.value = associatedLabel.textContent.trim();
                }
            }
        });

        const preselectedOption = userPreferenceForm.querySelector('input[type="radio"]:checked');
        if (preselectedOption) {
            const preselectedLabel = preselectedOption.nextElementSibling;
            if (preselectedLabel) {
                destinationInput.value = preselectedLabel.textContent.trim();
            }
        }
    }
});