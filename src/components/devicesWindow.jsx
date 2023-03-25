import React from "react";

import Defs from "iipzy-shared/src/defs";

import eventManager from "../ipc/eventManager";
import devices from "../services/devices";

import DevicePopup from "./devicePopup";
import Navigator from "./navigator";

console.log("----DevicesWindow");

class DeviceTable extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    const devices = this.props.devices;

    return (
      <table id="device-table">
        {devices &&
          devices.map(
            (item) =>
              item.alive && (
                <tr key={item.ipAddress}>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => this.props.onClick(item.ipAddress)}
                  >
                    {item.ipAddress}
                  </td>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => this.props.onClick(item.ipAddress)}
                  >
                    <div style={{ textAlign: "left", marginLeft: 20 }}>
                      {item.displayName}
                    </div>
                  </td>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => this.props.onClick(item.ipAddress)}
                  >
                    <div style={{ textAlign: "left", marginLeft: 20 }}>
                      {item.comment}
                    </div>
                  </td>
                </tr>
              )
          )}
      </table>
    );
  }
}

let app = null;

class DevicesWindow extends React.Component {
  constructor(props) {
    super(props);

    console.log("DevicesWindow.constructor");
    this.state = { count: 0 };

    app = this;
  }

  componentDidMount() {
    console.log("DevicesWindow.componentDidMount");
    getDevices("?aliveonly=1");
  }

  componentWillUnmount() {
    console.log("DevicesWindow.componentWillUnmount");
    app = null;
  }

  doRender() {
    const count = this.state.count + 1;
    this.setState({ count: count });
  }

  handleIpAddressClick(ipAddress) {
    console.log("....ipAddressClick = " + ipAddress);
    DevicesWindow.deviceIpAddress = ipAddress;
    DevicesWindow.showDevicePopup = true;
    this.doRender();
  }

  handleDeviceCloseClick() {
    console.log("...DevicesWindow.handleDeviceCloseClick");
  }

  hideDevicePopup() {
    DevicesWindow.showDevicePopup = false;
    this.doRender();
  }

  getDevice() {
    console.log("DevicesWindow.getDevice");
    return DevicesWindow.deviceByIpAddress.get(DevicesWindow.deviceIpAddress);
  }

  putDevice(device) {
    console.log("DevicesWindow.putDevice: " + JSON.stringify(device, null, 2));
    updateDevice(device);
  }

  render() {
    console.log("DevicesWindow.render");

    const devices = DevicesWindow.devices;
    const showDevicePopup = DevicesWindow.showDevicePopup;

    return (
      <div>
        <Navigator />
        <div style={{ marginLeft: 20, textAlign: "left" }}>
          <p style={{ fontSize: "140%" }}>Devices on your Network</p>
        </div>
        {showDevicePopup ? (
          <DevicePopup
            getDevice={() => this.getDevice()}
            putDevice={(device) => this.putDevice(device)}
            onClose={(ev) => this.handleDeviceCloseClick(ev)}
            closePopup={this.hideDevicePopup.bind(this)}
          />
        ) : null}
        <div
          /*           align="center" */
          style={{
            marginLeft: 20,
            width: "750px",
            height: "450px",
            border: "1px solid #ccc",
            font: "14px Courier New",
            fontWeight: "bold",
            overflowX: "scroll",
            overflowY: "scroll",
          }}
        >
          <DeviceTable
            devices={devices}
            onClick={(ev) => this.handleIpAddressClick(ev)}
          />
        </div>
      </div>
    );
  }
}

DevicesWindow.devices = null;
DevicesWindow.deviceByIpAddress = new Map();
DevicesWindow.deviceIpAddress = "";
DevicesWindow.infoMessage = "";
DevicesWindow.showDevicePopup = false;

async function getDevices(queryString) {
  const { data } = await devices.getDevices(queryString);
  if (data.__hadError__) {
    DevicesWindow.infoMessage = data.__hadError__.errorMessage;

    if (app) app.doRender();

    return;
  }

  DevicesWindow.devices = data.devices;
  DevicesWindow.deviceByIpAddress = new Map();
  for (let i = 0; i < DevicesWindow.devices.length; i++) {
    const device = DevicesWindow.devices[i];
    DevicesWindow.deviceByIpAddress.set(device.ipAddress, device);
  }

  if (app) app.doRender();
}

function updateDevice(device_) {
  DevicesWindow.deviceByIpAddress.set(device_.ipAddress, device_);
  DevicesWindow.devices = [];
  for (const [
    // NB: Although lint says otherwise, ipAddress is needed for proper operation.
    // eslint-disable-next-line
    ipAddress,
    device,
  ] of DevicesWindow.deviceByIpAddress.entries()) {
    DevicesWindow.devices.push(device);
  }
}

const handleDevicesReady = (event, data) => {
  console.log("DevicesWindow.handleDevicesReady");
  getDevices("?aliveonly=0");
};

const handleDeviceUpdated = (event, data) => {
  console.log("DevicesWindow.handleDeviceUpdated");

  if (!data.__hadError__) {
    // update devices.
    console.log(
      "DevicesWindow - handleDeviceUpdated data = " +
        JSON.stringify(data, null, 2)
    );
    updateDevice(data.device);

    if (app != null) app.doRender();
  }
};

eventManager.on(Defs.ipcDevicesReady, handleDevicesReady);
eventManager.on(Defs.ipcDeviceUpdated, handleDeviceUpdated);

export default DevicesWindow;
