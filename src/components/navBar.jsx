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

    return (
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
    );
  }
}

NavBar.isAdmin = false;
NavBar.needLogin = true;
NavBar.needSettings = false;
NavBar.sentinelOnline = false;

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

eventManager.on(Defs.ipcSentinelOnlineStatus, handleSentinelOnLineStatus);
eventManager.on(Defs.pevLoginStatus, handleLoginStatus);

export default NavBar;
