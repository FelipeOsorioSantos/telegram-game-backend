/**
 * 				CONET Platform
 *
 */
declare const ethers;

const workerReadyChannel = "conet-platform";
const workerProcessChannel = "workerLoader";
const channelWrokerListenName = "toMainWroker";
const responseChannel = new BroadcastChannel("toServiceWroker");
const channel = new BroadcastChannel(channelWrokerListenName);

const backGroundPoolWorker: clientPoolWroker[] = [];

self.onhashchange = () => {
  channel.removeEventListener("message", channelWorkerDoCommand);
};

const initEncryptWorker = async () => {
  const baseUrl = self.name + "/workers/";
  const channelLoading = new BroadcastChannel(workerProcessChannel);
  self.importScripts(baseUrl + "Buffer.js");
  channelLoading.postMessage(10);

  self.importScripts(
    "https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js"
  );
  self.importScripts(
    "https://cdnjs.cloudflare.com/ajax/libs/pouchdb/9.0.0/pouchdb.min.js"
  );
  self.importScripts(
    "https://cdnjs.cloudflare.com/ajax/libs/async/3.2.5/async.min.js"
  );
  self.importScripts(
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
  );
  self.importScripts(
    "https://cdnjs.cloudflare.com/ajax/libs/jimp/0.22.12/jimp.min.js"
  );
  self.importScripts(
    "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.1/ethers.umd.min.js"
  );
  self.importScripts(
    "https://cdn.jsdelivr.net/npm/openpgp@5.11.2/dist/openpgp.min.js"
  );

  channelLoading.postMessage(30);

  self.importScripts(baseUrl + "util.js");
  self.importScripts(baseUrl + "CoNETModule.js");
  self.importScripts(baseUrl + "main.js");

  channelLoading.postMessage(90);
  channel.addEventListener("message", channelWorkerDoCommand);
  await checkStorage();

  // testFunction();
};

const returnUUIDChannel = (cmd: worker_command) => {
  if (!cmd.uuid) {
    return logger(`getPrimaryBalance cmd uuid is null`, cmd);
  }
  const sendChannel = new BroadcastChannel(cmd.uuid);
  sendChannel.postMessage(customJsonStringify(cmd));
  sendChannel.close();
};

const channelWorkerDoCommand = async (e) => {
  const jsonData = buffer.Buffer.from(e.data).toString();
  let cmd: worker_command;
  try {
    cmd = JSON.parse(jsonData);
  } catch (ex) {
    return console.dir(ex);
  }

  processCmd(cmd);
};

let getFaucetCount = 0;

const processCmd = async (cmd: worker_command) => {
  switch (cmd.cmd) {
    case "createOrGetWallet": {
      return createOrGetWallet(cmd);
    }

    case "importWallet": {
      return importWallet(cmd);
    }

    case "getWalletCCNTPBalance": {
      return getWalletCCNTPBalance(cmd);
    }

    case "getFirstRouletteResult": {
      return getFirstRouletteResult(cmd);
    }

    case "getSecondRouletteResult": {
      return getSecondRouletteResult(cmd);
    }

    case "startMining": {
      return startMining(cmd);
    }

    case "stopMining": {
      miningStatus = "STOP";
      return returnUUIDChannel(cmd);
    }

    default: {
      cmd.err = "INVALID_COMMAND";
      responseChannel.postMessage(JSON.stringify(cmd));
      console.log(`channelWorkerDoCommand unknow command!`, cmd);
      return returnUUIDChannel(cmd);
    }
  }
};

/**
 *
 */

initEncryptWorker();
