import React from "react";
import { NavLink } from "react-router-dom";

import Defs from "iipzy-shared/src/defs";

import eventManager from "../ipc/eventManager";

let app = null;

class NavBar extends React.Component {
  constructor(props) {
    super(props);

    console.log("NavBar constructor");

    this.state = { count: 0 };

    app = this;
  }

  doRender() {
    console.log("NavBar.doRender");
    const count = this.state.count + 1;
    this.setState({ count: count });
  }

  handleClick = e => {
    if (!NavBar.sentinelOnline) e.preventDefault();
  };

  render() {
    console.log("NavBar render called");

    const needLogin = NavBar.needLogin;
    const needSettings = NavBar.needSettings;

    const clientName = NavBar.clientName;
    const userName = NavBar.userName;

    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              {!needLogin && !needSettings && (
                <NavLink
                  className="nav-item nav-link"
                  onClick={this.handleClick}
                  to={Defs.urlPingPlot}
                >
                  Charts
                </NavLink>
              )}
              {!needLogin && !needSettings && (
                <NavLink
                  className="nav-item nav-link"
                  onClick={this.handleClick}
                  to={Defs.urlThroughputTest}
                >
                  Speed Test
                </NavLink>
              )}
              {!needLogin && !needSettings && (
                <NavLink
                  className="nav-item nav-link"
                  onClick={this.handleClick}
                  to={Defs.urlDevices}
                >
                  Network Devices
                </NavLink>
              )}
              {needLogin && (
                <NavLink
                  className="nav-item nav-link"
                  onClick={this.handleClick}
                  to={Defs.urlLogin}
                >
                  Log in
                </NavLink>
              )}
              <NavLink
                className="nav-item nav-link"
                onClick={this.handleClick}
                to={Defs.urlSettings}
              >
                Settings
              </NavLink>
              <NavLink className="nav-item nav-link" to={Defs.urlCloseSentinel}>
                Home
              </NavLink>
            </div>
          </div>
        </nav>
        <div style={{ marginLeft: 24, textAlign: "left" }}>
            <p style={{ fontSize: "100%" }}>User: {userName}.&nbsp;&nbsp;Device: {clientName}</p>
        </div>
      </div>
    );
  }
}

NavBar.isAdmin = false;
NavBar.clientName= "no device";
NavBar.needLogin = true;
NavBar.needSettings = false;
NavBar.sentinelOnline = false;
NavBar.userName = "not logged in";

const handleSentinelOnLineStatus = (event, data) => {
  const { sentinelStatus } = data;
  console.log(
    "NavBar.handleSentinelOnLineStatus: sentinelStatus = " + sentinelStatus
  );
  NavBar.sentinelOnline = sentinelStatus === Defs.sentinelStatusOnline;
};

const handleLoginStatus = (event, data) => {
  const { loginStatus } = data;
  console.log("NavBar.handleLoginStatus: loginStatus = " + loginStatus);
  NavBar.needLogin = loginStatus === Defs.loginStatusLoginFailed;
  NavBar.needSettings = loginStatus === Defs.loginStatusNoServerAddress;
  if (NavBar.needLogin) eventManager.send(Defs.ipcLinkTo, Defs.urlLogin);
  else if (NavBar.needSettings)
    eventManager.send(Defs.ipcLinkTo, Defs.urlSettings);
  else eventManager.send(Defs.ipcLinkTo, Defs.urlPingPlot);
  if (app != null) app.doRender();
};

const handleNavBarInfo = (event, data) => {
  const { userName, clientName } = data;
  NavBar.clientName = clientName;
  NavBar.userName = userName;
  if (app != null) app.doRender();
}

eventManager.on(Defs.ipcSentinelOnlineStatus, handleSentinelOnLineStatus);
eventManager.on(Defs.pevLoginStatus, handleLoginStatus);
eventManager.on(Defs.ipcNavBarInfo, handleNavBarInfo);

export default NavBar;
