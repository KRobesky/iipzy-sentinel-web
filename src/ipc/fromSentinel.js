import Defs from "iipzy-shared/src/defs";
import { sleep } from "iipzy-shared/src/utils/utils";

import eventManager from "./eventManager";
//import http from "./httpService_impl";
import http from "./httpService";

import sentinelInfo from "../utils/sentinelInfo";

// receive an event from iipzy-sentinel and forword to renderer.
//let fromSentinel = null;

/*
  sentinelStatusOnline: 0,
  sentinelStatusOffline: 1,
  sentinelStatusInuse: 2,
  sentinelStatusNoAddress: 3,
*/

class FromSentinel {
  constructor(clientToken) {
    console.log("fromSentinel.constructor: clientToken = " + clientToken);

    this.clientToken = clientToken;

    this.sentinelIPAddress = sentinelInfo.getSentinelIPAddress();
    this.sentinelProtocol = sentinelInfo.getSentinelProtocol();

    this.sentinelStatus = Defs.sentinelStatusUnknown;

    this.running = true;

    this.loginStatus = null;

    this.ready = false;

    //fromSentinel = this;
  }

  send(event, data) {
    console.log("fromSentinel.send: event = " + event + ", data = " + data);
    eventManager.send(event, data);
  }

  setExiting() {
    this.running = false;
  }

  sendSentinelStatus(sentinelStatus) {
    if (this.sentinelStatus !== sentinelStatus) {
      console.log("fromSentinel.sendSentinelStatus: " + sentinelStatus);
      eventManager.send(Defs.ipcSentinelOnlineStatus, { sentinelStatus });
      switch (sentinelStatus) {
        case Defs.sentinelStatusOnline: {
          eventManager.send(Defs.ipcLinkTo, Defs.urlPingPlot);
          break;
        }
        case Defs.sentinelStatusOffline: {
          eventManager.send(Defs.ipcLinkTo, Defs.urlSentinelOnlineCheck);
          break;
        }
        case Defs.sentinelStatusInUse: {
          eventManager.send(Defs.ipcLinkTo, Defs.urlSentinelInUse);
          break;
        }
        default: {
          break;
        }
      }
      this.sentinelStatus = sentinelStatus;
    }
  }

  async run() {
    console.log(">>>fromSentinel.run");
    
    if (this.clientToken) http.setClientTokenHeader(this.clientToken);

    while (this.running) {
      console.log("fromSentinel.run: calling eventWait");
      let clientToken = http.getClientTokenHeader();
      if (!clientToken) {
        console.log("fromSentinel.run: other client token is null");
      }

      const { data, status } = await http.get(
        this.sentinelProtocol + this.sentinelIPAddress + "/api/eventWait",
        {
          timeout: 10000
        }
      );

      if (status !== Defs.httpStatusOk) {
        console.log(
          "(Error) fromSentinel.run: AFTER calling eventWait: status = " +
            status +
            ", error = " +
            JSON.stringify(data, null, 2)
        );
        switch (status) {
          case Defs.httpStatusConnRefused:
          case Defs.httpStatusConnAborted: {
            this.sendSentinelStatus(Defs.sentinelStatusOffline);
            break;
          }
          case Defs.httpStatusConnReset:
          case Defs.httpStatusException: {
            break;
          }
          case Defs.httpStatusSentinelInUse: {
            this.sendSentinelStatus(Defs.sentinelStatusInUse);
            this.running = false;
            break;
          }
          default: {
            break;
          }
        }
        this.loginStatus = null;
        await sleep(1000);
        // continue.
        continue;
      }
      const { event, data: _data, forMain, loginStatus } = data;
      console.log(
        "fromSentinel.run: AFTER calling eventWait: event = " +
          event +
          ", data = " +
          _data +
          ", forMain = " +
          forMain +
          ", loginStatus = " +
          loginStatus
      );

      if (event === Defs.ipcConnectionToken) {
        const { connToken } = _data;
        console.log("fromSentinel.run: new connection token  = " + connToken);
        http.setConnTokenHeader(connToken);  
      }
      
      this.ready = true;

      try {
        this.sendSentinelStatus(Defs.sentinelStatusOnline);
        this.send(event, _data);
      } catch (ex) {
        console.log("(Exception) fromSentinel.run: " + ex, "send", "info");
      }

      if (loginStatus && this.loginStatus !== loginStatus) {
        eventManager.send(Defs.pevLoginStatus, { loginStatus });
        this.loginStatus = loginStatus;
      }
    }
    console.log("<<<fromSentinel.run");
  }

  is_ready() {
    return this.ready;
  }
}

// FromSentinel.sentinelIPAddress = "sentinel address not set";

// ipcMain.on(Defs.ipcSentinelOnlineStatus, (event, data) => {
//   const { sentinelIPAddress } = data;
//   if (sentinelIPAddress) {
//     log(
//       "fromSentinel: sentinelIPAddress= " + sentinelIPAddress,
//       "send",
//       "info"
//     );
//     fromSentinel.sentinelIPAddress = sentinelIPAddress;
//   } else {
//     fromSentinel.sentinelIPAddress = "sentinel address not set";
//   }
// });

// ipcMain.on(Defs.ipcExiting, (event, data) => {
//   log("fromSentinel: ipcExiting");
//   if (fromSentinel) fromSentinel.setExiting();
// });

export default FromSentinel;
