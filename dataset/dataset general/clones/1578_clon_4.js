const GLOBAL_TOAST_EVENT_NAME = 'displayToastNotification';
const TOAST_ELEMENT_TAG = 'toast-notification-display';

class ToastNotificationDisplay extends HTMLElement {
    #notificationRegistry = [];
    #allowDuplicates = false;
    #displayHost;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            :host {
                display: block;
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                width: 300px;
                box-sizing: border-box;
            }
            .notification-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .notification-item {
                padding: 15px;
                margin-bottom: 5px;
                border: 1px solid transparent;
                border-radius: 4px;
                position: relative;
                word-wrap: break-word;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .notification-item .dismiss-button {
                position: absolute;
                top: 5px;
                right: 10px;
                font-size: 21px;
                font-weight: bold;
                line-height: 1;
                color: #000;
                text-shadow: 0 1px 0 #fff;
                opacity: .2;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
            }
            .notification-item .dismiss-button:hover {
                opacity: .5;
            }
            .notification-item.status-success {
                color: #3c763d;
                background-color: #dff0d8;
                border-color: #d6e9c6;
            }
            .notification-item.status-error, .notification-item.status-danger {
                color: #a94442;
                background-color: #f2dede;
                border-color: #ebccd1;
            }
            .notification-item.status-info {
                color: #31708f;
                background-color: #d9edf7;
                border-color: #bce8f1;
            }
            .notification-item.status-warning {
                color: #8a6d3b;
                background-color: #fcf8e3;
                border-color: #faebcc;
            }
        `;
        shadowRoot.appendChild(styleSheet);

        this.#displayHost = document.createElement('div');
        this.#displayHost.classList.add('notification-container');
        shadowRoot.appendChild(this.#displayHost);
    }

    static get observedAttributes() {
        return ['permit-duplicates'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'permit-duplicates') {
            this.#allowDuplicates = (newValue === 'true' || newValue === '');
        }
    }

    connectedCallback() {
        document.addEventListener(GLOBAL_TOAST_EVENT_NAME, this.#handleIncomingNotification);
        this.#allowDuplicates = (this.getAttribute('permit-duplicates') === 'true' || this.getAttribute('permit-duplicates') === '');
        this.#renderNotifications();
    }

    disconnectedCallback() {
        document.removeEventListener(GLOBAL_TOAST_EVENT_NAME, this.#handleIncomingNotification);
        this.#notificationRegistry.forEach(item => {
            if (item.timerId) {
                clearTimeout(item.timerId);
            }
        });
    }

    #handleIncomingNotification = (evt) => {
        const itemPayload = evt.detail;
        this.#addNotification(itemPayload);
    };

    #addNotification(payload) {
        if (!this.#allowDuplicates) {
            const alreadyPresent = this.#notificationRegistry.some(
                (existing) => existing.content === payload.content && existing.level === payload.level
            );
            if (alreadyPresent) {
                return;
            }
        }

        const newIdentifier = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
        const notificationObject = {
            id: newIdentifier,
            content: payload.content,
            level: payload.level,
            duration: payload.duration,
            enableMarkup: payload.enableMarkup,
            timerId: null
        };

        this.#notificationRegistry.push(notificationObject);
        this.#renderNotifications();

        if (notificationObject.duration && notificationObject.duration !== -1) {
            notificationObject.timerId = setTimeout(() => {
                this.#removeNotification(notificationObject.id);
            }, notificationObject.duration);
        }
    }

    #removeNotification = (identifierToRemove) => {
        const itemToRemove = this.#notificationRegistry.find(item => item.id === identifierToRemove);
        if (itemToRemove && itemToRemove.timerId) {
            clearTimeout(itemToRemove.timerId);
        }

        this.#notificationRegistry = this.#notificationRegistry.filter(
            (item) => item.id !== identifierToRemove
        );
        this.#renderNotifications();
    };

    #deriveVisualAttributes(item) {
        const baseClasses = ['notification-item'];
        switch (item.level) {
            case 'success':
                baseClasses.push('status-success');
                break;
            case 'error':
                baseClasses.push('status-error', 'status-danger');
                break;
            case 'info':
                baseClasses.push('status-info');
                break;
            case 'warn':
                baseClasses.push('status-warning');
                break;
            default:
                break;
        }
        return baseClasses.join(' ');
    }

    #renderNotifications() {
        this.#displayHost.innerHTML = '';

        this.#notificationRegistry.forEach((item) => {
            const notificationElement = document.createElement('div');
            notificationElement.className = this.#deriveVisualAttributes(item);

            const dismissButton = document.createElement('button');
            dismissButton.type = 'button';
            dismissButton.classList.add('dismiss-button');
            dismissButton.innerHTML = '&times;';
            dismissButton.addEventListener('click', () => this.#removeNotification(item.id));
            notificationElement.appendChild(dismissButton);

            const contentWrapper = document.createElement('div');
            if (item.enableMarkup) {
                contentWrapper.innerHTML = item.content;
            } else {
                contentWrapper.textContent = item.content;
            }
            notificationElement.appendChild(contentWrapper);

            this.#displayHost.appendChild(notificationElement);
        });
    }
}

customElements.define(TOAST_ELEMENT_TAG, ToastNotificationDisplay);

const notificationManager = {
    broadcast: (messageData) => {
        const customEvent = new CustomEvent(GLOBAL_TOAST_EVENT_NAME, {
            detail: {
                content: messageData.text,
                level: messageData.severity,
                duration: messageData.ttl,
                enableMarkup: messageData.enableHtml
            },
            bubbles: true,
            composed: true
        });
        document.dispatchEvent(customEvent);
    }
};