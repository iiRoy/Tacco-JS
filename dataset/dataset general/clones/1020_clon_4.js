const applicationViews = {
    'start': '#home-view',
    'create': '#new-view',
    'active': '#active-view'
};

const uiSelectors = {
    saveButton: '#save-action-button',
    deleteAllButton: '#eradicate-all-button',
    navigationLinks: '.nav-area a',
    inputFieldPrefix: '.add-',
    cronJobListContainer: '.active-job-list-area'
};

async function performApiRequest(path, method = 'GET', payload = null) {
    const requestOptions = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (payload) {
        requestOptions.body = JSON.stringify(payload);
    }
    const response = await fetch(`/lib/${path}`, requestOptions);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

async function activateApplicationView(viewIdentifier) {
    await acquireAndDisplayJobData();

    Object.values(applicationViews).forEach(viewSelector => {
        const currentViewElement = document.querySelector(viewSelector);
        if (currentViewElement) {
            currentViewElement.style.display = 'none';
        }
    });

    document.querySelectorAll(uiSelectors.navigationLinks).forEach(navLink => {
        navLink.parentElement.classList.remove('active-panel-link');
    });

    const targetViewElement = document.querySelector(applicationViews[viewIdentifier]);
    if (targetViewElement) {
        targetViewElement.style.display = 'block';
    }

    const correspondingNavLink = document.querySelector(`.nav-${viewIdentifier}`);
    if (correspondingNavLink) {
        correspondingNavLink.classList.add('active-panel-link');
    }
}

async function initiateFullRemoval() {
    try {
        await performApiRequest('deleteall.php', 'GET');
        window.location.reload();
    } catch (err) {
        console.error('Error during full removal:', err);
        alert('Failed to remove all items.');
    }
}

async function initiateItemRemoval(specificJobId) {
    try {
        await performApiRequest('deletejob.php', 'POST', { jobIdToDelete: specificJobId });
        window.location.reload();
    } catch (err) {
        console.error('Error during item removal:', err);
        alert('Failed to remove item.');
    }
}

async function processNewEntrySubmission() {
    const inputFieldNames = ['minute', 'hour', 'dayweek', 'daymonth', 'month', 'name', 'command'];
    const submissionPayload = inputFieldNames.reduce((acc, fieldName) => {
        const inputElement = document.querySelector(`${uiSelectors.inputFieldPrefix}${fieldName}`);
        if (inputElement) {
            acc[fieldName] = inputElement.value;
        }
        return acc;
    }, {});

    try {
        const responseData = await performApiRequest('add.php', 'POST', submissionPayload);
        console.info('Submission response:', responseData);
        activateApplicationView('active');
    } catch (err) {
        console.error('Error during submission:', err);
        alert('Failed to save new entry.');
    }
}

async function acquireAndDisplayJobData() {
    try {
        const jobData = await performApiRequest('active.php', 'GET');
        const jobListingsContainer = document.querySelector(uiSelectors.cronJobListContainer);
        if (!jobListingsContainer) return;

        if (Array.isArray(jobData)) {
            const compiledHtmlRows = jobData.map((jobEntry, entryIndex) => {
                const parts = jobEntry.split(' ');
                const cellHtml = parts.map(part => `<td>${part}</td>`).join('');
                return `<tr>${cellHtml}<td><button class="action-btn remove-entry-btn" data-job-id="${entryIndex}">Eliminate</button></td></tr>`;
            }).join('');
            jobListingsContainer.innerHTML = compiledHtmlRows;
        } else {
            jobListingsContainer.innerHTML = '<tr><td colspan="7">No active jobs found.</td></tr>';
        }
    } catch (err) {
        console.error('Error fetching job data:', err);
        const jobListingsContainer = document.querySelector(uiSelectors.cronJobListContainer);
        if (jobListingsContainer) {
             jobListingsContainer.innerHTML = '<tr><td colspan="7">Error loading jobs.</td></tr>';
        }
    }
}

function startApplication() {
    const currentHash = window.location.hash.substring(1);
    const hashToViewMap = {
        'new': 'create',
        'active': 'active'
    };

    if (hashToViewMap[currentHash]) {
        activateApplicationView(hashToViewMap[currentHash]);
    } else {
        activateApplicationView('start');
    }

    const saveActionElement = document.querySelector(uiSelectors.saveButton);
    if (saveActionElement) {
        saveActionElement.addEventListener('click', processNewEntrySubmission);
    }

    const deleteAllElement = document.querySelector(uiSelectors.deleteAllButton);
    if (deleteAllElement) {
        deleteAllElement.addEventListener('click', initiateFullRemoval);
    }

    const jobListingsArea = document.querySelector(uiSelectors.cronJobListContainer);
    if (jobListingsArea) {
        jobListingsArea.addEventListener('click', (event) => {
            const targetElement = event.target;
            if (targetElement.classList.contains('remove-entry-btn')) {
                const jobIdToRemove = targetElement.dataset.jobId;
                if (jobIdToRemove !== undefined) {
                    initiateItemRemoval(jobIdToRemove);
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', startApplication);