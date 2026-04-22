const baseEndpoint = '/contacts';

const dataManagementUtility = {
    async addRecord(payloadData) {
        try {
            const serverResponse = await fetch(baseEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadData)
            });
            if (!serverResponse.ok) {
                throw new Error(`HTTP error! Status: ${serverResponse.status}`);
            }
            return await serverResponse.json();
        } catch (errorIssue) {
            console.error('Failed to create item:', errorIssue);
            throw errorIssue;
        }
    },

    async fetchAllRecords() {
        try {
            const serverResponse = await fetch(baseEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!serverResponse.ok) {
                throw new Error(`HTTP error! Status: ${serverResponse.status}`);
            }
            return await serverResponse.json();
        } catch (errorIssue) {
            console.error('Failed to retrieve list:', errorIssue);
            throw errorIssue;
        }
    },

    async modifyRecord(recordIdentifier, payloadData) {
        try {
            const serverResponse = await fetch(`${baseEndpoint}/${recordIdentifier}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadData)
            });
            if (serverResponse.status === 204) return {}; // No Content
            if (!serverResponse.ok) {
                throw new Error(`HTTP error! Status: ${serverResponse.status}`);
            }
            return await serverResponse.json();
        } catch (errorIssue) {
            console.error('Failed to update item:', errorIssue);
            throw errorIssue;
        }
    },

    async removeRecord(recordIdentifier) {
        try {
            const serverResponse = await fetch(`${baseEndpoint}/${recordIdentifier}`, {
                method: 'DELETE'
            });
            if (serverResponse.status === 204) return {}; // No Content
            if (!serverResponse.ok) {
                throw new Error(`HTTP error! Status: ${serverResponse.status}`);
            }
            return await serverResponse.json();
        } catch (errorIssue) {
            console.error('Failed to delete item:', errorIssue);
            throw errorIssue;
        }
    }
};