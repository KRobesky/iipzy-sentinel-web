import React from "react";

import Defs from "iipzy-shared/src/defs";

import eventManager from "../ipc/eventManager";

import Navigator from "./navigator";

let app = null;

class SentinelOnlineCheckWindow extends React.Component {
  constructor(props) {
    super(props);

    console.log("SentinelOnlineCheckWindow.constructor");

    app = this;

    this.state = { count: 0 };
  }

  async componentDidMount() {
    console.log("SentinelOnlineCheckWindow.componentDidMount");
  }

  componentWillUnmount() {
    console.log("SentinelOnlineCheckWindow.componentWillUnmount");
    app = null;
  }

  doRender() {
    const count = this.state.count + 1;
    this.setState({ count: count });
  }

  render() {
    console.log("SentinelOnlineCheckWindow.render");

    return (
      <div>
        <Navigator />
        <div style={{ marginLeft: 20, textAlign: "left" }}>
          <p style={{ fontSize: "140%" }}>Connecting to iipzy Sentinel</p>
        </div>
      </div>
    );
  }
}

const handleSentinelOnLineStatus = (event, data) => {
  if (app) app.doRender();
};

eventManager.on(Defs.ipcSentinelOnlineStatus, handleSentinelOnLineStatus);

export default SentinelOnlineCheckWindow;
