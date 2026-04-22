window.addEventListener('DOMContentLoaded', () => {
    const obtainCookieData = (targetIdentifier) => {
        const allStoredCookies = document.cookie.split(';');
        for (let entry of allStoredCookies) {
            let trimmedEntry = entry.trim();
            if (trimmedEntry.startsWith(`${targetIdentifier}=`)) {
                return trimmedEntry.substring(targetIdentifier.length + 1);
            }
        }
        return null;
    };

    const establishPermanentCookie = (key, value, durationInDays) => {
        const expirationPoint = new Date();
        expirationPoint.setTime(expirationPoint.getTime() + (durationInDays * 24 * 60 * 60 * 1000));
        const expirationString = `expires=${expirationPoint.toUTCString()}`;
        document.cookie = `${key}=${value};${expirationString};path=/`;
    };

    const policyLinkElement = document.querySelector('link[rel="cookie-policy"]');
    const policyHyperlink = policyLinkElement ? policyLinkElement.getAttribute('href') : null;

    if (policyHyperlink) {
        if (!obtainCookieData('user_consent_status')) {
            const currentBodyTopMargin = parseInt(window.getComputedStyle(document.body).marginTop, 10) || 0;
            const newBodyTopMargin = currentBodyTopMargin + 38;

            const injectedStyleElement = document.createElement('style');
            injectedStyleElement.textContent = `
                body.cookie_prompt_active { margin-top: ${newBodyTopMargin}px !important; }
                #cookie_notification_panel { position: fixed; z-index: 2147483647; left: 0; top: 0; width: 100%; min-height: 34px; border-top: 1px solid #FFFFFF; border-bottom: 1px solid #CCCCCC; background-color: #EBEBEB; background-image:-moz-linear-gradient(50% 0% -90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0, rgb(236,236,236)),color-stop(1, rgb(225,225,225))); background-image:-webkit-linear-gradient(-90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); background-image:linear-gradient(-90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); }
                #cookie_notification_panel p { margin: 0 20px 0 0; padding: 10px; color: #000000; font-size: 12px; text-align: left; }
                @media (max-width: 480px) { #cookie_notification_panel p { margin: 0 40px 0 0; } }
                #cookie_notification_panel button { position: absolute; top: 10px; right: 10px; background-color: transparent; width: 15px; height: 15px; padding: 0; margin: 0; border: none; box-shadow: none; cursor: pointer; background-image: url('https://raw.github.com/ninefour/cookiebar.js/master/assets/dismiss.png'); background-position: 0 0; background-repeat: no-repeat; }
                @media (max-width: 480px) { #cookie_notification_panel button { margin: 0; padding: 0; width: 30px; height: 30px; background-position: -20px 0; } }
                #cookie_notification_panel button:hover { background-position: 0 -30px; }
                @media (max-width: 480px) { #cookie_notification_panel button:hover { background-position: -20px -30px; } }
                #cookie_notification_panel button span { display: none; }
            `;
            document.head.appendChild(injectedStyleElement);

            const informationPanel = document.createElement('div');
            informationPanel.id = 'cookie_notification_panel';

            const messageText = document.createElement('p');
            messageText.textContent = 'This website uses cookies. You can ';

            const settingsAccessLink = document.createElement('a');
            settingsAccessLink.href = policyHyperlink;
            settingsAccessLink.textContent = 'change your cookie settings';
            messageText.appendChild(settingsAccessLink);
            messageText.append(' to disable them. If you continue to browse our site, you are agreeing to our use of cookies.');

            const closeButton = document.createElement('button');
            closeButton.title = 'Dismiss';
            const closeButtonLabel = document.createElement('span');
            closeButtonLabel.textContent = 'Dismiss';
            closeButton.appendChild(closeButtonLabel);

            informationPanel.appendChild(messageText);
            informationPanel.appendChild(closeButton);

            document.body.classList.add('cookie_prompt_active');
            document.body.insertBefore(informationPanel, document.body.firstChild);

            closeButton.addEventListener('click', () => {
                const cookieExpiryYears = 10;
                establishPermanentCookie('user_consent_status', 'accepted', 365 * cookieExpiryYears);
                document.body.classList.remove('cookie_prompt_active');
                informationPanel.style.display = 'none';
            });
        }
    } else {
        alert("The document head must contain a link element with 'rel=\"cookie-policy\"' and an 'href' attribute.");
    }
});