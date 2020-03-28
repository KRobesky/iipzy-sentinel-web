import React from "react";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import Button from "@material-ui/core/Button";

//import Defs from "iipzy-shared/src/defs";

import settings from "../services/settings";
import CloseButton from "./closeButton";
import InfoPopup from "./infoPopup";
import PasswordPopup from "./passwordPopup";

let app = null;

//const defaultOption = options[0];

class WiFiPopup extends React.Component {
  constructor(props) {
    super(props);
    app = this;

    console.log(
      "WiFiPopup constructor: settings = " +
        JSON.stringify(this.props.settings, null, 2)
    );

    // this.device = null;
    // this.title = "Network Device";

    this.state = { count: 0 };
  }

  componentDidMount() {
    console.log("WiFiPopup.componentDidMount");
  }

  componentWillUnmount() {
    console.log("WiFiPopup.componentWillUnmount");
    app = null;
  }

  async setSettings(name, value) {
    console.log("WiFiPopup.setSettings: name = " + name + ", value = " + value);
    let settings_ = {};
    settings_[name] = value;
    return await settings.setSettings({ settings: settings_ });
  }

  getEnableJoin() {
    return !WiFiPopup.inProgress;
    // return (
    //   (device.comment && device.comment !== WiFiPopup.orgComment) ||
    //   (device.watch !== undefined && device.watch !== WiFiPopup.orgWatch)
    // );
  }

  getNetworks() {
    return this.props.settings.wifiNetworks.networks;
  }

  getInfoMessage() {
    return WiFiPopup.infoMessage;
  }

  getSelectedNetwork() {
    return WiFiPopup.selectedNetwork;
  }

  handleCloseClick(ev) {
    console.log("...WiFiPopup.handleCloseClick");
    this.props.closePopup();
    this.props.onClose(ev);
  }

  handleInfoPopupClick() {
    console.log("...WiFiPopup.handleInfoPopupClick");
  }

  handleJoinClick(ev) {
    console.log("...WiFiPopup.handleJoinClick");

    WiFiPopup.showPasswordPopup = true;
    WiFiPopup.inProgress = true;
    this.doRender();
  }

  async handlePasswordPopupClick(password) {
    console.log("...handlePasswordPopupClick: password = " + password);
    // send password to sentinel.
    WiFiPopup.inProgress = true;
    this.doRender();
    const wifiJoin = { network: WiFiPopup.selectedNetwork, password };
    const { data, status } = await this.setSettings("wifiJoin", wifiJoin);
    if (data.__hadError__) {
      WiFiPopup.infoMessage = data.__hadError__.errorMessage;
      WiFiPopup.showInfoPopup = true;
      WiFiPopup.inProgress = false;
      this.doRender();
      return;
    }

    WiFiPopup.inProgress = false;
    this.doRender();

    this.handleCloseClick(null);
  }

  handleSelect(ev) {
    console.log("...handleSelect: val = " + ev.value);
    WiFiPopup.selectedNetwork = ev.value;
    // enable join if current ssid !== selected
  }

  hideInfoPopup() {
    WiFiPopup.showInfoPopup = false;
    this.doRender();
  }

  hidePasswordPopup() {
    console.log("...hidePasswordPopup");

    WiFiPopup.showPasswordPopup = false;

    this.doRender();
  }
  doRender() {
    const count = this.state.count + 1;
    this.setState({ count: count });
  }

  render() {
    console.log("WiFiPopup.render");

    const showInfoPopup = WiFiPopup.showInfoPopup;
    const showPasswordPopup = WiFiPopup.showPasswordPopup;

    return (
      <div className="popup">
        <div className="popup_inner_medium">
          {showPasswordPopup && (
            <PasswordPopup
              onSubmit={ev => this.handlePasswordPopupClick(ev)}
              closePopup={this.hidePasswordPopup.bind(this)}
            />
          )}
          {showInfoPopup && (
            <InfoPopup
              getInfoMessage={() => this.getInfoMessage()}
              onSubmit={ev => this.handleInfoPopupClick(ev)}
              closePopup={this.hideInfoPopup.bind(this)}
            />
          )}
          <div>
            <div style={{ marginLeft: 20, textAlign: "left" }}>
              <p style={{ fontSize: "140%" }}>WiFi Networks</p>
            </div>
          </div>
          <Dropdown
            options={this.getNetworks()}
            onChange={ev => this.handleSelect(ev)}
            value={this.getSelectedNetwork()}
            placeholder="Select a network"
          />{" "}
          <div>&nbsp;</div>
          <div align="center">
            <Button
              type="button"
              variant="contained"
              disabled={!this.getEnableJoin()}
              style={{
                width: "130px",
                color: "#0000b0"
              }}
              onClick={ev => this.handleJoinClick(ev)}
            >
              Join
            </Button>
          </div>
          <CloseButton onClick={ev => this.handleCloseClick(ev)} />
        </div>
      </div>
    );
  }
}

WiFiPopup.networks = [];
WiFiPopup.selectedNetwork = "";

WiFiPopup.infoMessage = "";
WiFiPopup.inProgress = false;
WiFiPopup.showInfoPopup = false;
WiFiPopup.showPasswordPopup = false;

export default WiFiPopup;
