import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Defs from "iipzy-shared/src/defs";

import NavBar from "./components/navBar";
//import logo from "./logo.svg";
import "./App.css";

import CloseWindow from "./components/closeWindow";
import DevicesWindow from "./components/devicesWindow";
import LoginWindow from "./components/loginWindow";
import PingPlotWindow from "./components/pingPlotWindow";
import SentinelInUseWindow from "./components/sentinelInUseWindow";
import SentinelOnlineCheckWindow from "./components/sentinelOnlineCheckWindow";
import SettingsWindow from "./components/settingsWindow";
import ThroughputTestWindow from "./components/throughputTestWindow";

import eventManager from "./ipc/eventManager";

//let app = null;

class App extends Component {
  constructor(props) {
    super(props);

    console.log("App.constructor");

    this.state = { count: 0, data: null };

    //app = this;
  }

  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.callBackendAPI()
      .then(res => this.setState({ data: res.express }))
      .catch(err => console.log(err));
  }
  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  callBackendAPI = async () => {
    const response = await fetch("/express_backend");
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };

  // render() {
  //   return (
  //     <div className="App">
  //       <header className="App-header">
  //         <img src={logo} className="App-logo" alt="logo" />
  //         <h1 className="App-title">Welcome to React</h1>
  //       </header>
  //       <p className="App-intro">{this.state.data}</p>
  //     </div>
  //   );
  // }

  render() {
    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar user={this.state.user} />
        <main className="container">
          <Switch>
            <Route path={Defs.urlCloseSentinel} exact component={CloseWindow} />

            <Route path={Defs.urlDevices} exact component={DevicesWindow} />
            <Route path={Defs.urlLogin} exact component={LoginWindow} />
            <Route path={Defs.urlPingPlot} exact component={PingPlotWindow} />
            <Route
              path={Defs.urlSentinelInUse}
              exact
              component={SentinelInUseWindow}
            />
            <Route
              path={Defs.urlSentinelOnlineCheck}
              exact
              component={SentinelOnlineCheckWindow}
            />
            <Route
              path={Defs.urlThroughputTest}
              exact
              component={ThroughputTestWindow}
            />
            <Route path={Defs.urlSettings} exact component={SettingsWindow} />
            <Redirect to={Defs.urlPingPlot} />
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

const handleLoginStatus = (event, data) => {
  console.log("App.handleLoginStatus");
  const { loginStatus } = data;

  App.loggedIn = loginStatus === Defs.loginStatusLoggedIn;

  if (App.navbarName === "home") {
    if (App.loggedIn) {
      eventManager.send(Defs.ipcLinkTo, Defs.urlPingPlot);
    } else {
      eventManager.send(Defs.ipcLinkTo, Defs.urlLogin);
    }
  }
};

eventManager.on(Defs.ipcLoginStatus, handleLoginStatus);

export default App;
