const webModule = require('http');
const commsModule = require('socket.io');
const dataModule = require('redis');

const initialPlayerEntity = {
  kind: 'position',
  coordX: 450,
  coordY: 150,
  graphic: 'playerAvatar'
};

const initialShadowOne = { coordX: 10, coordY: 60 };
const initialShadowTwo = { coordX: 10, coordY: 30 };

const availablePhantomNames = new Set(['specter', 'wraith', 'apparition', 'poltergeist']);
let eventCounter = 0;

const persistentDataStore = dataModule.createClient();

persistentDataStore.on('error', (issue) => {
  console.error('Data Store Problem:', issue);
});

const applicationServer = webModule.createServer();
const communicationHub = commsModule(applicationServer);

applicationServer.listen(8080, () => {
  console.log('Application server active on port 8080');
});

class GameSessionManager {
  constructor(commHubReference, dataStoreReference, phantomPoolReference) {
    this.commHub = commHubReference;
    this.dataStore = dataStoreReference;
    this.phantomPool = phantomPoolReference;
    this.assignedPhantoms = new Map();

    this.commHub.on('connection', this.onParticipantConnect.bind(this));
  }

  async obtainEntityLocation(entityIdentifier) {
    return new Promise((resolve, reject) => {
      this.dataStore.get(entityIdentifier, (err, storedValue) => {
        if (err) return reject(err);
        if (!storedValue) return resolve(null);
        try {
          // Original logs error even if data exists, replicating that behavior if this were called.
          // console.log(err);
          // console.log(JSON.parse(storedValue));
          resolve(JSON.parse(storedValue));
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });
  }

  async updateEntityLocation(entityIdentifier, positionData) {
    return new Promise((resolve, reject) => {
      this.dataStore.set(entityIdentifier, JSON.stringify(positionData), (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  async onParticipantConnect(participantConnection) {
    console.log('New participant joined.');

    let currentPhantom = null;
    const firstAvailable = this.phantomPool.values().next().value;

    if (firstAvailable) {
      currentPhantom = firstAvailable;
      this.phantomPool.delete(currentPhantom);
      this.assignedPhantoms.set(participantConnection.id, currentPhantom);
    } else {
      console.warn('No phantoms available for new participant.');
    }

    console.log('Assigned Phantom:', currentPhantom);

    participantConnection.emit('phantom_identity', { identifier: currentPhantom });
    participantConnection.broadcast.emit('new_arrival');

    participantConnection.on('input_signal', (incomingPayload) => {
      this.processIncomingPayload(participantConnection, incomingPayload, currentPhantom);
    });

    participantConnection.on('disconnect', () => {
      this.onParticipantDepart(participantConnection, currentPhantom);
    });
  }

  async processIncomingPayload(sourceConnection, payloadData, assignedPhantom) {
    console.log('Received payload:', payloadData);

    const payloadHandlers = new Map([
      ['position_update', async () => {
        if (assignedPhantom === undefined) return;
        const { coordX, coordY } = payloadData;
        await this.updateEntityLocation(assignedPhantom, { coordX, coordY });
        sourceConnection.broadcast.emit('location_update', {
          kind: 'position',
          graphic: assignedPhantom,
          coordX: coordX,
          coordY: coordY
        });
      }],
      ['victory_condition', () => {
        if (assignedPhantom === undefined) return;
        sourceConnection.broadcast.emit('game_over', { winner: assignedPhantom });
        sourceConnection.emit('game_over', { winner: assignedPhantom });
      }]
    ]);

    const handler = payloadHandlers.get(payloadData.signalType);
    if (handler) {
      await handler();
    } else {
      console.warn('Unknown payload type:', payloadData.signalType);
    }
  }

  onParticipantDepart(departingConnection, assignedPhantom) {
    console.log('Participant departed.');
    if (assignedPhantom !== undefined) {
      this.phantomPool.add(assignedPhantom);
      this.assignedPhantoms.delete(departingConnection.id);
      console.log('Returning phantom to pool:', assignedPhantom);
      departingConnection.broadcast.emit('location_update', {
        kind: 'position',
        graphic: assignedPhantom,
        coordX: -100,
        coordY: -100
      });
    } else {
        console.log('Departing participant had no assigned phantom.');
    }
  }
}

new GameSessionManager(communicationHub, persistentDataStore, availablePhantomNames);