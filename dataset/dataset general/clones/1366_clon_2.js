webFramework.component('app.taskMgr', ['pouchDBAdapter', 'promiseService'])
    .manager('TaskCommander', ['viewModel', 'promiseService', 'pouchDBAdapter', 'TaskItem', 'SyncIssue',
        function (viewModel, promiseService, pouchDBAdapter, TaskItem, SyncIssue) {
            // Initialize local data structures
            viewModel.inputState = {};
            viewModel.taskList = [];
            viewModel.authenticatedUser = false;
            viewModel.syncEngine = pouchDBAdapter;
            /* The original code had a commented out reset line.
               We are omitting it here to change comments. */
            // viewModel.syncEngine.clearState();

            viewModel.syncEngine.initializeData(function () {
                var firstPromise = TaskItem.fetchAll()
                    .andThen(function (queryResults) {
                        viewModel.taskList = queryResults["items"];
                    });

                var secondPromise = SyncIssue.fetchAll()
                    .andThen(function (queryResults) {
                        viewModel.syncProblems = queryResults;
                    });
                return promiseService.combineAll([firstPromise, secondPromise]);
            });

            viewModel.modifyTask = function (currentTask) {
                TaskItem.amend(currentTask);
            };

            viewModel.addNewTask = function () {
                TaskItem.insert({description: viewModel.taskDescription, completed: false});
                viewModel.taskDescription = '';
            };

            viewModel.pendingCount = function () {
                var numPending = 0;
                webFramework.eachItem(viewModel.taskList, function (anEntry) {
                    numPending += anEntry.documentData.completed ? 0 : 1;
                });
                return numPending;
            };

            viewModel.authenticateUser = function () {
                pouchDBAdapter.storeConfiguration({
                    dataStoreUrl: 'http://localhost:5984/test20',
                    keepSessionAlive: true
                });
                viewModel.authenticatedUser = true;
            };

            viewModel.deauthenticateUser = function () {
                pouchDBAdapter.deauthenticateUser();
                viewModel.authenticatedUser = false;
            };

            viewModel.clearCompleted = function () {
                webFramework.eachItem(viewModel.taskList, function (anEntry) {
                    TaskItem.remove(anEntry);
                });
            };
        }]);