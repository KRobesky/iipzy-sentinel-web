// import React from "react";
// import ReactDOM from "react-dom";
// import "./index.css";
// import App from "./App";
// import * as serviceWorker from "./serviceWorker";

// //const Defs = require("iipzy-shared/src/defs");
// // const { log, logInit, setLogLevel } = require("iipzy-shared/src/utils/logFile");
// // const userDataPath = "/etc/iipzy";
// // const logPath = process.platform === "win32" ? "c:/temp/" : "/var/log/iipzy";
// // logInit(logPath, "iipzy-client-web");

// // log("iipzy-client-web starting", "main", "info");

// ReactDOM.render(<App />, document.getElementById("root"));

// // If you want your app to work offline and load faster, you can change
// // unregister() to register() below. Note this comes with some pitfalls.
// // Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
// import "bootstrap/dist/css/bootstrap.css";
// import "font-awesome/css/font-awesome.css";

import Defs from "iipzy-shared/src/defs";

import cipher from "./utils/cipher";
import cookie from "./utils/cookie";
import sentinelInfo from "./utils/sentinelInfo";
import localIPAddress from "./utils/localIPAddress";

import FromSentinel from "./ipc/fromSentinel";
import toSentinel from "./ipc/toSentinel";
import auth from "./services/auth";
import credentials from "./services/credentials";
import devices from "./services/devices";
import settings from "./services/settings";

import eventManager from "./ipc/eventManager";

console.log("window--------");
console.log(window);

const sentinelIPAddress =
  window.location.hostname === "localhost"
    ? "192.168.1.145:8002"
    : window.location.hostname + ":8002";
console.log("sentinelIPAddress = " + sentinelIPAddress);

localIPAddress.getLocalSubnet();

/*
  Handling credentials.
  From iipzy-server-web (i.e., "params"):
    Put userName, password into cookies.
    Send creds to sentinel.

  From direct call (e.g., http://192.168.1.56:8008):
    if no cookie, 
      show LoginWindow (other windows are blocked).
      on login:
        Put userName, password into cookies.
        Send creds to sentinel.
        No escape on fail.

  Sentinel
    if no or bad credentials, set needLogin in event return.
    iipzy-sentinel-web does "no-cookie" dance (above).

*/

let sendCredentials = false;
const paramsURI = getQueryVariable("params");
if (paramsURI) {
  const paramsEncrypted = decodeURI(paramsURI);
  if (paramsEncrypted) {
    const params = JSON.parse(cipher.decrypt(paramsEncrypted));
    const { userName, password, from } = params;

    console.log("userName = " + userName);
    console.log("passwordEncrypted = " + password);
    console.log("from = " + from);

    if (userName) cookie.set("userName", userName);
    if (password) cookie.set("password", password);
    if (from) cookie.set("fromOrigin", from);
    sendCredentials = true;
  }
}

auth.init(sentinelIPAddress);
credentials.init(sentinelIPAddress);
devices.init(sentinelIPAddress);
sentinelInfo.init(sentinelIPAddress);
settings.init(sentinelIPAddress);
toSentinel.init(sentinelIPAddress);

const fromSentinel = new FromSentinel(sentinelIPAddress);
fromSentinel.run();

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);

if (sendCredentials) credentials.send();

//if (true) eventManager.send(Defs.ipcLinkTo, Defs.urlLogin);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

// from: https://stackoverflow.com/questions/35352638/react-how-to-get-parameter-value-from-query-string
function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  console.log(query);
  const vars = query.split("&");
  console.log(vars);
  for (let i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    console.log(pair);
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return null;
}

const handleLoginVerifyStatus = async (event, data) => {
  const { verifyStatus } = data;
  console.log("main.handleLoginVerifyStatus: verifyStatus = " + verifyStatus);
  if (verifyStatus === Defs.loginStatusVerified) await credentials.send();
};

eventManager.on(Defs.ipcLoginVerifyStatus, handleLoginVerifyStatus);
