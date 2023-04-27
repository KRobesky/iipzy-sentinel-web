import Defs from "iipzy-shared/src/defs";

import http from "../ipc/httpService";

let sentinelIPAddress = "sentinel address not set";

function init(sentinelIPAddress_) {
  console.log("settings.init: sentinelIPAddress = " + sentinelIPAddress_);
  sentinelIPAddress = sentinelIPAddress_;
}

async function getServiceAddress() {
  console.log("settings.getServiceAddress");
  const { data, status } = await http.get(
    "http://" + sentinelIPAddress + "/api/settings/serviceaddress"
  );
  if (status === Defs.httpStatusOk) return data.serviceAddress;
  return "address not set";
}

async function getSettings() {
  console.log("settings.getSettings");
  return await http.get("http://" + sentinelIPAddress + "/api/settings/");
}

async function setSettings(settings) {
  console.log("settings.setSettings");
  return await http.post(
    "http://" + sentinelIPAddress + "/api/settings/",
    settings
  );
}

export default { init, getServiceAddress, getSettings, setSettings };
