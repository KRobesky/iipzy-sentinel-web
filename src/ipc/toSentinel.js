//import Defs from "iipzy-shared/src/defs";

import http from "./httpService";

let sentinelIPAddress = "sentinel address not set";

function init(sentinelIPAddress_) {
  console.log(
    "toSentinel.init: sentinelIPAddress = " + sentinelIPAddress_,
    "devs",
    "info"
  );
  sentinelIPAddress = sentinelIPAddress_;
}

async function send(channel, data) {
  console.log("toSentinel.send: channel=" + channel + ", data = " + data);
  await http.post("http://" + sentinelIPAddress + "/api/request", {
    event: channel,
    data
  });
}

export default { init, send };
