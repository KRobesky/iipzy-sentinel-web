//import Defs from "iipzy-shared/src/defs";

import http from "./httpService";

import sentinelInfo from "../utils/sentinelInfo";

let sentinelIPAddress = "sentinel address not set";
let sentinelProtocol = "sentinel protocol not set";

function init() {
  console.log(
    "toSentinel.init",
    "devs",
    "info"
  );
  sentinelIPAddress = sentinelInfo.getSentinelIPAddress();
  sentinelProtocol = sentinelInfo.getSentinelProtocol();
}

async function send(channel, data) {
  console.log("toSentinel.send: channel=" + channel + ", data = " + data);
  await http.post(sentinelProtocol + sentinelIPAddress + "/api/request", {
    event: channel,
    data
  });
}

export default { init, send };
