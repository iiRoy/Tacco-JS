class SubmissionPreparer {
  constructor() {
    this.userIdentifier = prompt('Enter your unique student ID (e.g., a0012345)');
    this.courseCode = 'CS3216';
    this.semesterStart = new Date(2014, 7, 11);
    this.taskDescriptions = {
      'Assignment Marking': 'Evaluated student assignments',
      'Course Material Preparation': 'Prepared instructional content',
      'Tutorial': 'Facilitated workshop sessions'
    };
  }

  produceClaimItems() {
    const firstBatchWeeks = Array.from({ length: 2 }, (_, idx) => idx + 1);
    const secondBatchWeeks = Array.from({ length: (11 - 5) / 2 + 1 }, (_, idx) => 5 + idx * 2);

    const batchOneItems = firstBatchWeeks.flatMap(currentPeriod => [
      {
        categoryLabel: 'Tutorial',
        periodIndex: currentPeriod,
        dayOfWeek: 'SATURDAY',
        commencementTime: '0900',
        completionTime: '1300'
      },
      {
        categoryLabel: 'Course Material Preparation',
        periodIndex: currentPeriod,
        dayOfWeek: 'SUNDAY',
        commencementTime: '1500',
        completionTime: '1900'
      }
    ]);

    const batchTwoItems = secondBatchWeeks.map(currentPeriod => ({
      categoryLabel: 'Assignment Marking',
      periodIndex: currentPeriod,
      dayOfWeek: 'MONDAY',
      commencementTime: '1700',
      completionTime: '1900'
    }));

    return [...batchOneItems, ...batchTwoItems];
  }

  getSettingsObject() {
    return {
      student_id: this.userIdentifier,
      module: this.courseCode,
      first_day_of_sem: this.semesterStart,
      duties: this.taskDescriptions,
      activities_list_fn: () => this.produceClaimItems()
    };
  }
}

const externalModuleURL = 'https://rawgit.com/nusmodifications/nus-soc-scripts/master/claims/claim.js';
let submissionHandler;

function acquireRemoteScript(url) {
  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement('script');
    scriptElement.src = url;
    scriptElement.async = true;
    scriptElement.onload = () => resolve();
    scriptElement.onerror = (error) => reject(new Error(`Script acquisition failed: ${url}, ${error}`));
    document.head.appendChild(scriptElement);
  });
}

acquireRemoteScript(externalModuleURL)
  .then(() => {
    if (typeof Claim === 'undefined') {
      throw new Error('Core Claim utility not detected after script load. External resource might be unavailable or altered.');
    }

    const preparerInstance = new SubmissionPreparer();
    submissionHandler = new Claim(preparerInstance.getSettingsObject());
    console.log('Submission management object successfully initialized. Invoke submissionHandler.makeAllClaims() to proceed.');
  })
  .catch(issue => {
    console.error('An error transpired during script retrieval or setup:', issue);
  });