import React from "react";

import cookie from "../utils/cookie";

//let app = null;

class CloseWindow extends React.Component {
  constructor(props) {
    super(props);

    console.log("CloseWindow.constructor");
    this.state = { count: 0 };

    //app = this;
  }

  componentDidMount() {
    console.log("CloseWindow.componentDidMount");
    window.location.replace(cookie.get("fromOrigin"));
  }

  render() {
    console.log("CloseWindow.render");

    return <div></div>;
  }
}

export default CloseWindow;
