(() => {
    'use strict';

    const pageSections = document.getElementsByClassName('dynamic');

    if (pageSections.length === 0) {
        return;
    }

    const mainPanel = pageSections[0];
    const activationControl = mainPanel.firstElementChild;

    activationControl.onclick = async () => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'hint=dynamic'
        };

        try {
            const serverResponse = await fetch('/examples/simpleTooltip/demo/demo.php', requestOptions);

            if (serverResponse.ok) {
                const responseContent = await serverResponse.text();

                activationControl.remove();

                mainPanel.insertAdjacentHTML('beforeend', responseContent);
            } else {
                console.error('Server responded with an error:', serverResponse.status);
            }
        } catch (operationError) {
            console.error('Fetch operation failed:', operationError);
        }
    };

    activationControl.simpleTooltip({
        shift: 'south',
        tip: 'This tooltip was assigned by means of custom method'
    });
})();