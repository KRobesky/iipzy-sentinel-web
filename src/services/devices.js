//import Defs from "iipzy-shared/src/defs";

//import eventManager from "../ipc/eventManager";
import http from "../ipc/httpService";

import sentinelInfo from "../utils/sentinelInfo";

let sentinelIPAddress = "sentinel address not set";
let sentinelProtocol = "sentinel protocol not set";

function init() {
  console.log("devices.init");
  sentinelIPAddress = sentinelInfo.getSentinelIPAddress();
  sentinelProtocol = sentinelInfo.getSentinelProtocol();
}

async function getDevices(queryString) {
  console.log("getDevices");

  return await http.get(
    sentinelProtocol + sentinelIPAddress + "/api/devices" + queryString
  );
}

async function putDevice(deviceChanges) {
  console.log("putDevice");

  return await http.put(sentinelProtocol + sentinelIPAddress + "/api/devices", {
    deviceChanges
  });
}

export default { init, getDevices, putDevice };
