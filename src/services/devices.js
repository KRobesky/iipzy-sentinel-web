//import Defs from "iipzy-shared/src/defs";

//import eventManager from "../ipc/eventManager";
import http from "../ipc/httpService";

let sentinelIPAddress = "sentinel address not set";

function init(sentinelIPAddress_) {
  console.log("devices.init: sentinelIPAddress = " + sentinelIPAddress_);
  sentinelIPAddress = sentinelIPAddress_;
}

async function getDevices(queryString) {
  console.log("getDevices");

  return await http.get(
    "http://" + sentinelIPAddress + "/api/devices" + queryString
  );
}

async function putDevice(deviceChanges) {
  console.log("putDevice");

  return await http.put("http://" + sentinelIPAddress + "/api/devices", {
    deviceChanges
  });
}

export default { init, getDevices, putDevice };
