import React from "react";
import Button from "@material-ui/core/Button";

//import Defs from "iipzy-shared/src/defs";

import devices from "../services/devices";
import CloseButton from "./closeButton";
import InfoPopup from "./infoPopup";
import eventManager from "../ipc/eventManager";

let app = null;

// for Bonjour services
class ServiceTable extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    const services = this.props.services;

    return (
      <table id="service-table">
        {services &&
          services.map(
            (item) =>
              item.serviceInfo && (
                <tr key={item.serviceInfo.friendlyName}>
                  <td>{item.serviceInfo.friendlyName}</td>
                </tr>
              )
          )}
      </table>
    );
  }
}

class DevicePopup extends React.Component {
  constructor(props) {
    super(props);
    app = this;

    this.state = { count: 0 };

    // make a copy
    DevicePopup.device = JSON.parse(JSON.stringify(this.props.getDevice()));

    DevicePopup.title = "Device @" + DevicePopup.device.ipAddress;
    DevicePopup.orgComment = DevicePopup.device.comment
      ? DevicePopup.device.comment
      : "";
    DevicePopup.orgWatch = DevicePopup.device.watch
      ? DevicePopup.device.watch
      : false;
  }

  componentDidMount() {
    console.log("devicePopup componentDidMount");
  }

  componentWillUnmount() {
    console.log("devicePopup componentWillUnmount");
    app = null;
  }

  handleSubmitClick(ev) {
    console.log("DevicePopup.handleSubmitClick");
    let deviceChanges = {};
    const device = DevicePopup.device;
    deviceChanges.ipAddress = device.ipAddress;
    if (device.comment && device.comment !== DevicePopup.orgComment)
      deviceChanges.comment = device.comment;
    if (device.watch !== undefined && device.watch !== DevicePopup.orgWatch)
      deviceChanges.watch = device.watch;

    console.log("..submit: data = " + JSON.stringify(deviceChanges, null, 2));

    putDevice(deviceChanges);
  }

  handleCloseClick(ev) {
    console.log("DevicePopup.handleCloseClick");
    this.props.putDevice(DevicePopup.device);
    this.props.closePopup();
    this.props.onClose(ev);
  }

  handleCommentChange(ev) {
    console.log("DevicePopup.handleCommentChange: " + ev.target.value);
    DevicePopup.device.comment = ev.target.value;
    this.doRender();
  }

  handleWatchChange(ev) {
    console.log("DevicePopup.handleWatchChange: " + ev.target.checked);
    DevicePopup.device.watch = ev.target.checked;
    console.log("DevicePopup.handleWatchChange2: " + DevicePopup.device.watch);
    this.doRender();
  }

  doRender() {
    const count = this.state.count + 1;
    this.setState({ count: count });
  }

  getEnableSubmit() {
    const device = DevicePopup.device;
    return (
      (device.comment && device.comment !== DevicePopup.orgComment) ||
      (device.watch !== undefined && device.watch !== DevicePopup.orgWatch)
    );
  }

  getInfoMessage() {
    return DevicePopup.infoMessage;
  }

  handleInfoPopupClick() {
    console.log("...DevicePopup.handleInfoPopupClick");
  }

  hideInfoPopup() {
    DevicePopup.showInfoPopup = false;
    this.doRender();
  }

  render() {
    console.log("DevicePopup render");

    const device = DevicePopup.device;
    const showInfoPopup = DevicePopup.showInfoPopup;

    return (
      <div className="popup">
        <div className="popup_inner_large">
          {showInfoPopup ? (
            <InfoPopup
              getInfoMessage={() => this.getInfoMessage()}
              onSubmit={(ev) => this.handleInfoPopupClick(ev)}
              closePopup={this.hideInfoPopup.bind(this)}
            />
          ) : null}
          {!showInfoPopup ? (
            <div>
              <div style={{ marginLeft: 20, textAlign: "left" }}>
                <p style={{ fontSize: "140%" }}>{this.title}</p>
              </div>
              <table align="center">
                <tbody>
                  <tr>
                    <td>IP Address:</td>
                    <td>{device.ipAddress}</td>
                  </tr>
                  <tr>
                    <td>Name:</td>
                    <td>{device.displayName}</td>
                  </tr>
                  <tr>
                    <td>Comment:</td>
                    {/*                 <td>{device.comment}</td> */}
                    <td>
                      <input
                        type="text"
                        name="comment-text"
                        size="40"
                        value={device.comment ? device.comment : ""}
                        onChange={(ev) => this.handleCommentChange(ev)}
                      />
                    </td>
                  </tr>
                  {device.hostName ? (
                    <tr>
                      <td>Host Name:</td>
                      <td>{device.hostName}</td>
                    </tr>
                  ) : null}
                  {device.vendor ? (
                    <tr>
                      <td>Vendor:</td>
                      <td>{device.vendor}</td>
                    </tr>
                  ) : null}
                  {device.macAddress ? (
                    <tr>
                      <td>Mac Address:</td>
                      <td>{device.macAddress}</td>
                    </tr>
                  ) : null}
                  {device.netBiosName ? (
                    <tr>
                      <td>NetBIOS Name:</td>
                      <td>{device.netBiosName}</td>
                    </tr>
                  ) : null}
                  {device.services ? (
                    <tr>
                      <td>Services:</td>
                      <td>
                        <ServiceTable services={device.services} />
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <td>On Line:</td>
                    <td>{device.pingSucceeded ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td>Latest Good Ping:</td>
                    <td>
                      {device.latestGoodPing ? device.latestGoodPing : ""}
                    </td>
                  </tr>
                  <tr>
                    <td>Watch:</td>
                    {/*                <td>{device.watch}</td> */}
                    <td>
                      <input
                        type="checkbox"
                        name="watch-state"
                        checked={device.watch ? device.watch : false}
                        onChange={(ev) => this.handleWatchChange(ev)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                </tbody>
              </table>
              <div align="center">
                <Button
                  type="button"
                  variant="contained"
                  disabled={!this.getEnableSubmit()}
                  style={{
                    width: "130px",
                    color: "#0000b0",
                  }}
                  autoFocus
                  onClick={(ev) => this.handleSubmitClick(ev)}
                >
                  Submit
                </Button>
              </div>
            </div>
          ) : null}
          <CloseButton onClick={(ev) => this.handleCloseClick(ev)} />
        </div>
      </div>
    );
  }
}

DevicePopup.device = null;
DevicePopup.title = "Network Device";
DevicePopup.orgComment = "";
DevicePopup.orgWatch = false;
DevicePopup.showInfoPopup = false;
DevicePopup.infoMessage = "";

async function putDevice(deviceChanges) {
  const { data, status } = await devices.putDevice(deviceChanges);
  if (data.__hadError__) {
    DevicePopup.infoMessage = data.__hadError__.errorMessage;
    DevicePopup.showInfoPopup = true;

    if (app) app.doRender();

    return;
  }

  DevicePopup.device = data.device;
  DevicePopup.infoMessage = DevicePopup.device.ipAddress + " updated";
  DevicePopup.showInfoPopup = true;
  DevicePopup.orgComment = DevicePopup.device.comment
    ? DevicePopup.device.comment
    : "";
  DevicePopup.orgWatch = DevicePopup.device.watch
    ? DevicePopup.device.watch
    : false;

  if (app) app.doRender();
}

export default DevicePopup;
