import Defs from "iipzy-shared/src/defs";

import eventManager from "../ipc/eventManager";
import http from "../ipc/httpService";
import { encrypt } from "../utils/cipher";
import cookie from "../utils/cookie";
import { log } from "../utils/log";

import settings from "./settings";

let serverIPAddress = "address not set";

async function init() {
  log("auth.init", "auth", "info");
}

async function sendVerify(credentials) {
  log("sendVerify", "auth", "info");
  return await http.post(
    "https://" + serverIPAddress + "/api/auth/verify",
    credentials
  );
}

async function verifyAsync(userName, passwordDecrypted) {
  log(">>>verifyAsync", "auth", "info");

  const { data, status } = await sendVerify({
    userName,
    password: passwordDecrypted
  });

  log("verifyAsync: status = " + status, "auth", "info");
  if (status === Defs.httpStatusOk) {
    log("verifyAsync: succeeded", "auth", "info");
    await handleCompletion(
      userName,
      passwordDecrypted,
      data.verified ? Defs.loginStatusVerified : Defs.loginStatusVerifyFailed
    );
  } else {
    // failed
    log("verifyAsync: failed", "auth", "info");
    await handleCompletion(userName, "", Defs.loginStatusVerifyFailed);
  }

  log("<<<verifyAsync", "auth", "info");

  //?? THIS DOESN'T WORK WHEN THERE IS AN ERROR CONNECTING TO SERVICE.
  return { data, status };
}

async function handleCompletion(userName, passwordDecrypted, verifyStatus) {
  log(
    ">>>handleCompletion: userName=" +
      userName +
      ", verifyStatus = " +
      verifyStatus,
    "auth",
    "info"
  );

  // save in cookie.
  cookie.set("userName", userName);
  if (verifyStatus === Defs.loginStatusVerified) {
    cookie.set("password", encrypt(passwordDecrypted));
  } else {
    cookie.set("password", "");
  }

  eventManager.send(Defs.ipcLoginVerifyStatus, { verifyStatus });

  log("<<<handleCompletion", "auth", "info");
}

async function verifyRequest(dataReq) {
  log("verifyRequest", "auth", "info");
  const { userName, password } = dataReq;
  return await verifyAsync(userName, password);
}

async function handleSentinelOnLineStatus(event, data) {
  log("handleSentinelOnLineStatus", "auth", "info");
  const { sentinelStatus } = data;
  if (sentinelStatus === Defs.sentinelStatusOnline) {
    // get serverIPAddress from sentinel.
    serverIPAddress = await settings.getServiceAddress();
  }
}

eventManager.on(Defs.ipcSentinelOnlineStatus, handleSentinelOnLineStatus);

export default {
  init,
  verifyRequest
};
