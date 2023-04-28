import Defs from "iipzy-shared/src/defs";

import http from "../ipc/httpService";

import sentinelInfo from "../utils/sentinelInfo";

let sentinelIPAddress = "sentinel address not set";
let sentinelProtocol = "sentinel protocol not set";

function init() {
  console.log("settings.init");
  sentinelIPAddress = sentinelInfo.getSentinelIPAddress();
  sentinelProtocol = sentinelInfo.getSentinelProtocol();
}

async function getServiceAddress() {
  console.log("settings.getServiceAddress");
  const { data, status } = await http.get(
    sentinelProtocol + sentinelIPAddress + "/api/settings/serviceaddress"
  );
  if (status === Defs.httpStatusOk) return data.serviceAddress;
  return "address not set";
}

async function getSettings() {
  console.log("settings.getSettings");
  return await http.get(sentinelProtocol + sentinelIPAddress + "/api/settings/");
}

async function setSettings(settings) {
  console.log("settings.setSettings");
  return await http.post(
    sentinelProtocol + sentinelIPAddress + "/api/settings/",
    settings
  );
}

export default { init, getServiceAddress, getSettings, setSettings };
