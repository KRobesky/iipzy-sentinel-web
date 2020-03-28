import React from "react";

//import Defs from "iipzy-shared/src/defs";

import Navigator from "./navigator";

//let app = null;

class SentinelInUseWindow extends React.Component {
  constructor(props) {
    super(props);
    console.log("------SentinelInUseWindow constructor");

    //app = this;
  }

  async componentDidMount() {
    console.log("SentinelInUseWindow componentDidMount");
  }

  componentWillUnmount() {
    console.log("SentinelInUseWindow componentWillUnmount");
  }

  render() {
    console.log("SentinelInUseWindow render");

    return (
      <div>
        <Navigator />
        <div style={{ marginLeft: 20, textAlign: "left" }}>
          <p style={{ fontSize: "140%" }}>Another Client is using Sentinel</p>
        </div>
      </div>
    );
  }
}

export default SentinelInUseWindow;
