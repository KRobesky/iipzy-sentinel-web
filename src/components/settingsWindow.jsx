import React from "react";
import Button from "@material-ui/core/Button";
import { FilePicker } from "react-file-picker";
import FormData from "form-data";

//import Defs from "iipzy-shared/src/defs";
import { get_is_debugging, set_is_debugging } from "iipzy-shared/src/utils/globals";

import http from "../ipc/httpService";
import settings from "../services/settings";

import cookie from "../utils/cookie";
import sentinelInfo from "../utils/sentinelInfo";

import InfoPopup from "./infoPopup";
import Navigator from "./navigator";
import SpinnerPopup from "./spinnerPopup";
import WiFiPopup from "./wifiPopup";

let app = null;

class SettingsWindow extends React.Component {
  constructor(props) {
    super(props);

    console.log("SettingsWindow.constructor");
    this.state = { count: 0 };

    app = this;
  }

  componentDidMount() {
    console.log("SettingsWindow.componentDidMount");
    getSettings();
  }

  componentWillUnmount() {
    console.log("SettingsWindow.componentWillUnmount");
    app = null;
  }

  getClientName() {
    return SettingsWindow.settings.clientName;
  }

  getDownloadSeconds() {
    //?? TODO - validate is integer between 1..9999
    //const val = cookie.get("downloadSeconds");
    return SettingsWindow.downloadSeconds;
  }

  getNominalLatencySeconds() {
    //?? TODO - validate is integer between 1..9999
    // const val = cookie.get("nominalLatencySeconds");
    // return val ? val : 10;
    return SettingsWindow.nominalLatencySeconds;
  }

  getServiceAddress() {
    return SettingsWindow.settings.serviceAddress;
  }

  getLogLevelDetailedChecked() {
    return SettingsWindow.settings.logLevel === "verbose";
  }
  
  getConsoleLogLevelDetailedChecked() {
    return get_is_debugging();
  }

  getSimulateDroppedPacketsChecked() {
    return SettingsWindow.settings.simulateDroppedPackets;
  }

  getSimulateSavesChecked() {
    return SettingsWindow.settings.simulateSaves;
  }

  getSimulateOfflineChecked() {
    return SettingsWindow.settings.simulateOffline;
  }

  getUploadSeconds() {
    //?? TODO - validate is integer between 1..9999
    // const val = cookie.get("uploadSeconds");
    // return val ? val : 10;
    return SettingsWindow.uploadSeconds;
  }

  getWifiChecked() {
    return (
      SettingsWindow.settings &&
      SettingsWindow.settings.wifiStatus &&
      !!SettingsWindow.settings.wifiStatus.network
    );
  }

  getNetwork() {
    return (
      SettingsWindow.settings &&
      SettingsWindow.settings.wifiStatus &&
      SettingsWindow.settings.wifiStatus.network
    );
  }

  getInfoMessage() {
    return SettingsWindow.infoMessage;
  }

  handleChange(ev) {
    const name = ev.target.name;
    const value = ev.target.value;

    console.log("SettingsWindow.name=" + name + ", value=" + this.state[name]);

    switch (name) {
      case "client-name": {
        SettingsWindow.settings.clientName = value;
        break;
      }
      case "download-seconds": {
        //?? TODO - validate is integer between 1..9999
        SettingsWindow.downloadSeconds = value;
        break;
      }
      case "nominal-latency-seconds": {
        //?? TODO - validate is integer between 1..9999
        SettingsWindow.nominalLatencySeconds = value;
        break;
      }
      case "service-address": {
        SettingsWindow.settingsWindow.serviceAddress = value;
        break;
      }
      case "upload-seconds": {
        //?? TODO - validate is integer between 1..9999
        SettingsWindow.uploadSeconds = value;
        break;
      }
      default: {
        break;
      }
    }

    this.setState({ [name]: value });
  }

  handleLogLevelDetailedClick(ev) {
    console.log(
      "SettingsWindow.handleLogLevelDetailedClick: " + ev.target.checked
    );
    SettingsWindow.settings.logLevel = ev.target.checked ? "verbose" : "info";
    SettingsWindow.inProgress = true;
    this.doRender();
    setSettings("logLevel", SettingsWindow.settings.logLevel);
  }

  handleConsoleLogLevelDetailedClick(ev) {
    console.log(
      "SettingsWindow.handleConsoleLogLevelDetailedClick: " + ev.target.checked
    );
    set_is_debugging(ev.target.checked);
    //SettingsWindow.inProgress = true;
    this.doRender();
  }

  handleRebootClick(ev) {
    console.log("SettingsWindow handleRebootClick");
    SettingsWindow.inProgress = true;
    this.doRender();
    setSettings("rebootAppliance", true);
  }
  
  handleShutdownClick(ev) {
    console.log("SettingsWindow handleShutdownClick");
    SettingsWindow.inProgress = true;
    this.doRender();
    setSettings("shutdownAppliance", true);
  }

  handleSendLogsClick(ev) {
    console.log("SettingsWindow handleSendLogsClick");
    SettingsWindow.inProgress = true;
    this.doRender();
    setSettings("sendLogs", true);
  }

  handleSetClientNameClick(ev) {
    console.log("SettingsWindow handleSetClientNameClick");
    SettingsWindow.inProgress = true;
    this.doRender();
    setSettings("clientName", SettingsWindow.settings.clientName);
  }

  handleSetServiceAddressClick(ev) {
    console.log("SettingsWindow handleSetServiceAddressClick");
    SettingsWindow.inProgress = true;
    this.doRender();
    setSettings("serviceAddress", SettingsWindow.settings.serviceAddress);
  }

  handleSimulateDroppedPacketsClick(ev) {
    console.log(
      "SettingsWindow.handleSimulateDroppedPacketsClick: " + ev.target.checked
    );
    SettingsWindow.settings.simulateDroppedPackets = ev.target.checked;
    SettingsWindow.inProgress = true;
    this.doRender();
    setSettings(
      "simulateDroppedPackets",
      SettingsWindow.settings.simulateDroppedPackets
    );
  }

  handleSimulateSavesClick(ev) {
    console.log(
      "SettingsWindow.handleSimulateSavesClick: " + ev.target.checked
    );
    SettingsWindow.settings.simulateSaves = ev.target.checked;
    SettingsWindow.inProgress = true;
    this.doRender();
    setSettings(
      "simulateSaves",
      SettingsWindow.settings.simulateSaves
    );
  }

  handleSimulateOfflineClick(ev) {
    console.log(
      "SettingsWindow.handleSimulateOfflineClick: " + ev.target.checked
    );
    SettingsWindow.settings.simulateOffLine = ev.target.checked;
    SettingsWindow.inProgress = true;
    this.doRender();
    setSettings("simulateOffLine", SettingsWindow.settings.simulateOffLine);
  }

  handleWifiClick(ev) {
    console.log("SettingsWindow.handleWifiClick: " + ev.target.checked);
    joinLeaveWifi(ev.target.checked);
  }

  handleNetworkClick(ev) {
    console.log("SettingsWindow.handleNetworkClick");
    SettingsWindow.showWiFiPopup = true;
    SettingsWindow.inProgress = true;
    this.doRender();
  }

  handleInfoPopupClick() {
    console.log("SettingsWindow.handleInfoPopupClick");
  }

  handleWiFiCloseClick(ev) {
    console.log("settingsWindow.handleWiFiCloseClick");
    this.doRender();
  }

  hideResponsePopup() {
    SettingsWindow.showInfoPopup = false;
    SettingsWindow.buttonsEnabled = true;
    this.doRender();
  }

  hideWiFiPopup() {
    SettingsWindow.showWiFiPopup = false;
    SettingsWindow.buttonsEnabled = true;
    SettingsWindow.inProgress = false;
    getSettings();
  }

  handleRestorePingChartDataClick(ev) {
    console.log("SettingsWindow.handleRestorePingChartDataClick");
    restoreFile("pingChartDataRestore");
  }

  handleRestoreSpeedTestDataClick(ev) {
    console.log("SettingsWindow.handleRestoreSpeedTestDataClick");
    restoreFile("speedTestDataRestore");
  }

  handleUploadPingChartDataClick(file) {
    console.log("SettingsWindow.handleUploadPingChartDataClick");
    uploadFile("uploadpingpchartdata", file);
  }

  handleUploadPingChartDataError(errMsg) {
    console.log(
      "(Error) SettingsWindow.handleUploadPingChartDataError: errMsg = " +
        errMsg
    );
  }

  handleUploadSpeedTestDataClick(file) {
    console.log("SettingsWindow.handleUploadSpeedTestDataClick");
    uploadFile("uploadspeedtestdata", file);
  }

  handleUploadSpeedTestDataError(errMsg) {
    console.log(
      "(Error) SettingsWindow.handleUploadSpeedTestDataError: errMsg = " +
        errMsg
    );
  }

  handleSaveSpeedTestSettingsClick(ev) {
    cookie.set("downloadSeconds", SettingsWindow.downloadSeconds);
    cookie.set("nominalLatencySeconds", SettingsWindow.nominalLatencySeconds);
    cookie.set("uploadSeconds", SettingsWindow.uploadSeconds);
  }

  doRender() {
    console.log("SettingsWindow.doRender");
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    console.log("SettingsWindow.render");

    if (!SettingsWindow.settings) return <div></div>;

    const disabledWhileUpdating = SettingsWindow.inProgress;

    const restorePingChartDataReady =
      SettingsWindow.settings.pingChartDataRestore;
    const restoreSpeedTestDataReady =
      SettingsWindow.settings.speedTestDataRestore;
    const sentinelIPAddress = SettingsWindow.sentinelIPAddress;
    const showInfoPopup = SettingsWindow.showInfoPopup;

    const showSpinner = SettingsWindow.inProgress;
    const showWiFiPopup = SettingsWindow.showWiFiPopup;

    const settings_ = SettingsWindow.settings;

    return (
      <div>
        <Navigator />
        <div style={{ marginLeft: 20, textAlign: "left" }}>
          <p style={{ fontSize: "140%" }}>Sentinel Settings</p>
        </div>
        {showSpinner && <SpinnerPopup />}
        {showWiFiPopup && (
          <WiFiPopup
            settings={settings_}
            onClose={(ev) => this.handleWiFiCloseClick(ev)}
            closePopup={this.hideWiFiPopup.bind(this)}
          />
        )}
        {showInfoPopup && (
          <InfoPopup
            getInfoMessage={() => this.getInfoMessage()}
            onSubmit={(ev) => this.handleInfoPopupClick(ev)}
            closePopup={this.hideResponsePopup.bind(this)}
          />
        )}
        {!showInfoPopup && (
          <div style={{ marginLeft: "20px" }}>
            <table align="left">
              <tbody>
                {/*                 <tr>
                  <td>&nbsp;</td>
                </tr> */}
                <tr>
                  <table align="left">
                    <tbody>
                      <tr>
                        <table align="left">
                          <tbody>
                            <tr>
                              <td>
                                <label htmlFor="client-name">
                                  Name:&nbsp;&nbsp;
                                </label>
                              </td>
                              <td>
                                <input
                                  autoFocus={false}
                                  disabled={false}
                                  value={this.getClientName()}
                                  onChange={(ev) => this.handleChange(ev)}
                                  id="client-name"
                                  name="client-name"
                                  type="text"
                                  size="32"
                                />
                              </td>
                              <tr>&nbsp;</tr>
                              <td>
                                <Button
                                  type="button"
                                  variant="contained"
                                  disabled={disabledWhileUpdating}
                                  style={{
                                    width: "130px",
                                    color: "#0000b0",
                                  }}
                                  onClick={(ev) =>
                                    this.handleSetClientNameClick(ev)
                                  }
                                >
                                  Set
                                </Button>
                              </td>
                            </tr>
                            <tr>&nbsp;</tr>
                            <tr>
                              <td>
                                <label htmlFor="service-address">
                                  Service Address:&nbsp;&nbsp;
                                </label>
                              </td>
                              <td>
                                <input
                                  autoFocus={false}
                                  disabled={false}
                                  value={this.getServiceAddress()}
                                  onChange={(ev) => this.handleChange(ev)}
                                  id="service-address"
                                  name="service-address"
                                  type="text"
                                  size="32"
                                />
                              </td>
                              <tr>&nbsp;</tr>
                              <td>
                                <Button
                                  type="button"
                                  variant="contained"
                                  disabled={disabledWhileUpdating}
                                  style={{
                                    width: "130px",
                                    color: "#0000b0",
                                  }}
                                  onClick={(ev) =>
                                    this.handleSetServiceAddressClick(ev)
                                  }
                                >
                                  Set
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                      </tr>
                      <tr>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</tr>
                      <tr>
                        <input
                          type="checkbox"
                          name="action-log-level-detailed"
                          checked={this.getLogLevelDetailedChecked()}
                          disabled={disabledWhileUpdating}
                          onChange={(ev) =>
                            this.handleLogLevelDetailedClick(ev)
                          }
                        />
                        &nbsp;Log Level Detailed&nbsp;&nbsp;
                      </tr>
                      <tr>
                        <input
                          type="checkbox"
                          name="action-console-log-level-detailed"
                          checked={this.getConsoleLogLevelDetailedChecked()}
                          disabled={disabledWhileUpdating}
                          onChange={(ev) =>
                            this.handleConsoleLogLevelDetailedClick(ev)
                          }
                        />
                        &nbsp;Console Log Detailed&nbsp;&nbsp;
                      </tr>
                      <tr>
                        <input
                          type="checkbox"
                          name="action-simulate-dropped-packets"
                          checked={this.getSimulateDroppedPacketsChecked()}
                          disabled={disabledWhileUpdating}
                          onChange={(ev) =>
                            this.handleSimulateDroppedPacketsClick(ev)
                          }
                        />
                        &nbsp;Simulate Dropped Packets&nbsp;&nbsp;
                      </tr>
                      <tr>
                        <input
                          type="checkbox"
                          name="action-simulate-saves"
                          checked={this.getSimulateSavesChecked()}
                          disabled={disabledWhileUpdating}
                          onChange={(ev) =>
                            this.handleSimulateSavesClick(ev)
                          }
                        />
                        &nbsp;Simulate Saves&nbsp;&nbsp;
                      </tr>
                      <tr>
                        <input
                          type="checkbox"
                          name="action-simulate-offline"
                          checked={this.getSimulateOfflineChecked()}
                          disabled={disabledWhileUpdating}
                          onChange={(ev) => this.handleSimulateOfflineClick(ev)}
                        />
                        &nbsp;Simulate Offline&nbsp;&nbsp;
                      </tr>
                      {/* <tr>
                        <table>
                          <tbody>
                            <tr>
                              <td>
                                <input
                                  type="checkbox"
                                  name="action-wifi"
                                  checked={this.getWifiChecked()}
                                  disabled={disabledWhileUpdating}
                                  onChange={(ev) => this.handleWifiClick(ev)}
                                />
                                &nbsp;WiFi&nbsp;&nbsp;
                              </td>
                              <td>
                                <input
                                  className="input_disabled"
                                  readonly="readonly"
                                  value={this.getNetwork()}
                                  onClick={(ev) => this.handleNetworkClick(ev)}
                                  id="network"
                                  name="network"
                                  type="text"
                                  size="32"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </tr> */}
                      <tr>&nbsp;</tr>
                      <tr>
                        <Button
                          type="button"
                          variant="contained"
                          disabled={disabledWhileUpdating}
                          style={{
                            width: "130px",
                            color: "#0000b0",
                          }}
                          onClick={(ev) => this.handleSendLogsClick(ev)}
                        >
                          Send Logs
                        </Button>
                      </tr>
                      <tr>&nbsp;</tr>
                      <tr>
                        <Button
                          type="button"
                          variant="contained"
                          disabled={disabledWhileUpdating}
                          style={{
                            width: "130px",
                            color: "#0000b0",
                          }}
                          onClick={(ev) => this.handleRebootClick(ev)}
                        >
                          Reboot
                        </Button>
                      </tr>
                      <tr>&nbsp;</tr>
                      <tr>
                        <Button
                          type="button"
                          variant="contained"
                          disabled={disabledWhileUpdating}
                          style={{
                            width: "130px",
                            color: "#0000b0",
                          }}
                          onClick={(ev) => this.handleShutdownClick(ev)}
                        >
                          Shutdown
                        </Button>
                      </tr>
                      <tr>&nbsp;</tr>
                      <tr>
                        <table>
                          <tbody>
                            <tr>
                              <td>
                                <label>Ping Chart Data:&nbsp;&nbsp;</label>
                              </td>
                              <td>
                                <Button
                                  type="button"
                                  variant="contained"
                                  disabled={disabledWhileUpdating}
                                  style={{
                                    width: "130px",
                                    color: "#0000b0",
                                  }}
                                  href={
                                    "http://" +
                                    sentinelIPAddress +
                                    "/api/settings/downloadpingchartdata"
                                  }
                                >
                                  Download
                                </Button>
                              </td>
                              <td>&nbsp;</td>
                              <td>
                                <FilePicker
                                  extensions={["rrdb"]}
                                  maxSize={64}
                                  onChange={(file) =>
                                    this.handleUploadPingChartDataClick(file)
                                  }
                                  onError={(errMsg) =>
                                    this.handleUploadPingChartDataError(errMsg)
                                  }
                                >
                                  <Button
                                    type="button"
                                    variant="contained"
                                    disabled={disabledWhileUpdating}
                                    style={{
                                      width: "130px",
                                      color: "#0000b0",
                                    }}
                                  >
                                    Upload
                                  </Button>
                                </FilePicker>
                              </td>
                              <td>&nbsp;</td>
                              <td>
                                <Button
                                  type="button"
                                  variant="contained"
                                  disabled={
                                    disabledWhileUpdating ||
                                    !restorePingChartDataReady
                                  }
                                  style={{
                                    width: "130px",
                                    color: "#0000b0",
                                  }}
                                  onClick={(ev) =>
                                    this.handleRestorePingChartDataClick(ev)
                                  }
                                >
                                  Restore
                                </Button>
                              </td>
                            </tr>
                            <tr>&nbsp;</tr>
                            <tr>
                              <td>
                                <label>Speed Test Data:&nbsp;&nbsp;</label>
                              </td>
                              <td>
                                <Button
                                  type="button"
                                  variant="contained"
                                  disabled={disabledWhileUpdating}
                                  style={{
                                    width: "130px",
                                    color: "#0000b0",
                                  }}
                                  href={
                                    "http://" +
                                    sentinelIPAddress +
                                    "/api/settings/downloadspeedtestdata"
                                  }
                                >
                                  Download
                                </Button>
                              </td>
                              <td>&nbsp;</td>
                              <td>
                                <FilePicker
                                  extensions={["rrdb"]}
                                  maxSize={2}
                                  onChange={(file) =>
                                    this.handleUploadSpeedTestDataClick(file)
                                  }
                                  onError={(errMsg) =>
                                    this.handleUploadSpeedTestDataError(errMsg)
                                  }
                                >
                                  <Button
                                    type="button"
                                    variant="contained"
                                    disabled={disabledWhileUpdating}
                                    style={{
                                      width: "130px",
                                      color: "#0000b0",
                                    }}
                                  >
                                    Upload
                                  </Button>
                                </FilePicker>
                              </td>
                              <td>&nbsp;</td>
                              <td>
                                <Button
                                  type="button"
                                  variant="contained"
                                  disabled={
                                    disabledWhileUpdating ||
                                    !restoreSpeedTestDataReady
                                  }
                                  style={{
                                    width: "130px",
                                    color: "#0000b0",
                                  }}
                                  onClick={(ev) =>
                                    this.handleRestoreSpeedTestDataClick(ev)
                                  }
                                >
                                  Restore
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <table>
                          <tbody>
                            <tr>
                              <td>
                                <label>Speed Test Durations&nbsp;&nbsp;</label>
                              </td>
                              <table>
                                <tbody>
                                  <tr>
                                    <td>
                                      <label>
                                        nominal latency seconds:&nbsp;&nbsp;
                                      </label>
                                    </td>
                                    <td>
                                      <input
                                        autoFocus={false}
                                        disabled={false}
                                        value={this.getNominalLatencySeconds()}
                                        onChange={(ev) => this.handleChange(ev)}
                                        id="nominal-latency-seconds"
                                        name="nominal-latency-seconds"
                                        type="text"
                                        size="2"
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <label>
                                        download seconds:&nbsp;&nbsp;
                                      </label>
                                    </td>
                                    <td>
                                      <input
                                        autoFocus={false}
                                        disabled={false}
                                        value={this.getDownloadSeconds()}
                                        onChange={(ev) => this.handleChange(ev)}
                                        id="download-seconds"
                                        name="download-seconds"
                                        type="text"
                                        size="2"
                                      />
                                    </td>
                                    <td>&nbsp;</td>
                                    <td>
                                      <Button
                                        type="button"
                                        variant="contained"
                                        disabled={disabledWhileUpdating}
                                        style={{
                                          width: "130px",
                                          color: "#0000b0",
                                        }}
                                        onClick={(ev) =>
                                          this.handleSaveSpeedTestSettingsClick(
                                            ev
                                          )
                                        }
                                      >
                                        Set
                                      </Button>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <label>upload seconds:&nbsp;&nbsp;</label>
                                    </td>
                                    <td>
                                      <input
                                        autoFocus={false}
                                        disabled={false}
                                        value={this.getUploadSeconds()}
                                        onChange={(ev) => this.handleChange(ev)}
                                        id="upload-seconds"
                                        name="upload-seconds"
                                        type="text"
                                        size="2"
                                      />
                                    </td>
                                    <td>&nbsp;</td>
                                  </tr>
                                </tbody>
                              </table>
                            </tr>
                          </tbody>
                        </table>
                      </tr>
                    </tbody>
                  </table>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

SettingsWindow.settings = {};
SettingsWindow.sentinelIPAddress = "ip address not set";

SettingsWindow.downloadSeconds = cookie.get("downloadSeconds", 10);
SettingsWindow.nominalLatencySeconds = cookie.get("nominalLatencySeconds", 10);
SettingsWindow.uploadSeconds = cookie.get("uploadSeconds", 10);

SettingsWindow.buttonsEnabled = true;
SettingsWindow.inProgress = false;
SettingsWindow.infoMessage = "";
SettingsWindow.showInfoPopup = false;
SettingsWindow.showWiFiPopup = false;

async function getSettings() {
  console.log("SettingsWindow.getSettings");
  const { data } = await settings.getSettings();
  SettingsWindow.settings = data.settings;
  SettingsWindow.sentinelIPAddress = sentinelInfo.getSentinelIPAddress();
  console.log(
    "SettingsWindow.getSettings: settings = " +
      JSON.stringify(SettingsWindow.settings, null, 2)
  );
  if (app) app.doRender();
}

async function joinLeaveWifi(checked) {
  SettingsWindow.wifi = checked;
  SettingsWindow.inProgress = true;
  if (app) app.doRender();
  if (SettingsWindow.wifi) SettingsWindow.showWiFiPopup = true;
  else {
    const wifiJoin = { network: "", password: "" };
    await setSettings("wifiJoin", wifiJoin);
    await getSettings();
    SettingsWindow.inProgress = false;
  }
  if (app) app.doRender();
}

async function restoreFile(restoreName) {
  SettingsWindow.inProgress = true;
  if (app) app.doRender();
  const { data, status } = await setSettings(restoreName, true);
  const { message } = data;
  console.log(
    "SettingsWindow.restoreFile: status = " + status + ", message = " + message
  );
  SettingsWindow.infoMessage = message;
  SettingsWindow.showInfoPopup = true;
  SettingsWindow.inProgress = false;
  await getSettings();
  if (app) app.doRender();
}

async function sendRequest(method, file) {
  const form = new FormData();
  form.append("file", file, file.name);
  return await http.post(
    "https://" + SettingsWindow.sentinelIPAddress + "/api/settings/" + method,
    form
  );
}

async function setSettings(name, value) {
  console.log(
    "SettingsWindow.setSettings: name = " + name + ", value = " + value
  );
  let settings_ = {};
  settings_[name] = value;
  const ret = await settings.setSettings({ settings: settings_ });
  //??TODO error check.
  SettingsWindow.inProgress = false;
  if (app) app.doRender();
  return ret;
}

async function uploadFile(method, file) {
  try {
    SettingsWindow.inProgress = true;
    if (app) app.doRender();
    const { status, data } = await sendRequest(method, file);
    const { message } = data;
    console.log(
      "SettingsWindow.uploadFile: status = " +
        status +
        ", upload message = " +
        message
    );
    SettingsWindow.infoMessage = message;
    SettingsWindow.showInfoPopup = true;
  } catch (ex) {
    // Not Production ready! Do some error handling here instead...
  }
  // await getSettings();
  SettingsWindow.inProgress = false;
  if (app) app.doRender();
}

export default SettingsWindow;
