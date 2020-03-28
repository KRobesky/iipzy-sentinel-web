import http from "../ipc/httpService";
import cookie from "../utils/cookie";
import { log } from "../utils/log";

let sentinelIPAddress = "sentinel address not set";

function init(sentinelIPAddress_) {
  console.log("credentials.init: sentinelIPAddress = " + sentinelIPAddress_);
  sentinelIPAddress = sentinelIPAddress_;
}

async function send() {
  log(">>>credentials.send", "cred", "verbose");
  const userName = cookie.get("userName");
  if (userName) {
    const passwordEncrypted = cookie.get("password");
    if (passwordEncrypted) {
      log("sendToSentinel - sending", "cred", "verbose");
      //const { status } =
      await http.post("http://" + sentinelIPAddress + "/api/credentials", {
        userName,
        passwordEncrypted
      });
    }
  }

  log("<<<credentials.send", "cred", "verbose");
}

export default { init, send };
