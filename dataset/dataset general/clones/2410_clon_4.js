(function() {
    let notificationContainerElement = null;
    let notificationParagraphElement = null;
    let autoHideTimerIdentifier = null;

    const presentMessageToUser = function(messageContent, isMessageTypeError) {
        if (!notificationContainerElement) {
            console.error('Notification display system not initialized.');
            return;
        }

        if (autoHideTimerIdentifier) {
            clearTimeout(autoHideTimerIdentifier);
        }

        notificationParagraphElement.textContent = messageContent;

        if (isMessageTypeError) {
            notificationContainerElement.classList.add("alert-error");
        } else {
            notificationContainerElement.classList.remove("alert-error");
        }

        notificationContainerElement.style.display = 'block';
        void notificationContainerElement.offsetWidth;
        notificationContainerElement.style.opacity = '1';

        autoHideTimerIdentifier = setTimeout(() => {
            notificationContainerElement.style.opacity = '0';
            setTimeout(() => {
                notificationContainerElement.style.display = 'none';
            }, 600);
        }, 10000);
    };

    document.addEventListener('DOMContentLoaded', function() {
        const mainDisplayDiv = document.createElement('div');
        mainDisplayDiv.className = 'application-alert-display alert alert-success';
        mainDisplayDiv.style.cssText = 'position:fixed; top:10px; left:50%; transform:translateX(-50%); width:80%; max-width:600px; z-index:2000; opacity:0; transition:opacity 0.6s ease-out;';

        const dismissalButton = document.createElement('a');
        dismissalButton.className = 'close';
        dismissalButton.href = '#';
        dismissalButton.innerHTML = '&times;';
        dismissalButton.addEventListener('click', function(evt) {
            evt.preventDefault();
            if (autoHideTimerIdentifier) {
                clearTimeout(autoHideTimerIdentifier);
            }
            mainDisplayDiv.style.opacity = '0';
            setTimeout(() => {
                mainDisplayDiv.style.display = 'none';
            }, 600);
        });

        const messageParagraph = document.createElement('p');
        messageParagraph.style.margin = '0 !important';

        mainDisplayDiv.appendChild(dismissalButton);
        mainDisplayDiv.appendChild(messageParagraph);

        document.body.insertBefore(mainDisplayDiv, document.body.firstChild);

        notificationContainerElement = mainDisplayDiv;
        notificationParagraphElement = messageParagraph;
    });

    window.presentMessageToUser = presentMessageToUser;
}).call(this);