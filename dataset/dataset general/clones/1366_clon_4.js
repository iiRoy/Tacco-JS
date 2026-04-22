class TaskOverseer {
  #dataContainer = {};
  #taskList = [];
  #isAuthenticated = false;
  #dataConnection;
  #taskHandler;
  #conflictHandler;
  #activeDescription = '';
  #pendingIssues = [];

  constructor(connectionService, taskService, conflictService) {
    this.#dataConnection = connectionService;
    this.#taskHandler = taskService;
    this.#conflictHandler = conflictService;
  }

  async initializeState() {
    const [allTasksResult, allConflictsResult] = await Promise.all([
      this.#taskHandler.retrieveAll(),
      this.#conflictHandler.fetchAll()
    ]);
    this.#taskList = allTasksResult.records;
    this.#pendingIssues = allConflictsResult;
  }

  changeTaskStatus(item) {
    this.#taskHandler.alter(item);
  }

  async addNewTask(descriptionValue) {
    await this.#taskHandler.insert({ description: descriptionValue, finished: false });
    this.#activeDescription = '';
  }

  get activeTaskDescription() {
    return this.#activeDescription;
  }

  set activeTaskDescription(value) {
    this.#activeDescription = value;
  }

  countUnfinished() {
    return this.#taskList.reduce((total, taskRecord) => {
      return total + (taskRecord.document.finished ? 0 : 1);
    }, 0);
  }

  async establishSession() {
    await this.#dataConnection.storeCredentials({ endpoint: 'http://localhost:5984/test20', keepActive: true });
    this.#isAuthenticated = true;
  }

  async terminateSession() {
    await this.#dataConnection.disconnect();
    this.#isAuthenticated = false;
  }

  async obliterateAllTasks() {
    const destructionPromises = this.#taskList.map(taskRecord => this.#taskHandler.remove(taskRecord));
    await Promise.all(destructionPromises);
    this.#taskList = [];
  }

  get currentTasks() {
    return this.#taskList;
  }

  get currentConflicts() {
    return this.#pendingIssues;
  }

  get userStatus() {
    return this.#isAuthenticated;
  }
}