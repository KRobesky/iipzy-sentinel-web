import http from "../ipc/httpService";
import cookie from "../utils/cookie";
import { log } from "../utils/log";
import sentinelInfo from "../utils/sentinelInfo";

let sentinelIPAddress = "sentinel address not set";
let sentinelProtocol = "sentinel protocol not set";

function init() {
  console.log("credentials.init");
  sentinelIPAddress = sentinelInfo.getSentinelIPAddress();
  sentinelProtocol = sentinelInfo.getSentinelProtocol();
}

async function send() {
  log(">>>credentials.send", "cred", "verbose");
  const userName = cookie.get("userName");
  if (userName) {
    const passwordEncrypted = cookie.get("password");
    if (passwordEncrypted) {
      log("sendToSentinel - sending", "cred", "verbose");
      //const { status } =
      await http.post(sentinelProtocol + sentinelIPAddress + "/api/credentials", {
        userName,
        passwordEncrypted
      });
    }
  }

  log("<<<credentials.send", "cred", "verbose");
}

export default { init, send };
