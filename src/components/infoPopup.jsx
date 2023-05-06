import React from "react";
import Button from "@material-ui/core/Button";
import copy from 'copy-to-clipboard';

import CloseButton from "./closeButton";
import Navigator from "./navigator";

class InfoPopup extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  getInfoMessage() {
    return this.props.getInfoMessage();
  }

  handleCopyClick(ev) {
    console.log("...Popup handleCopyClick");
    copy(this.props.getInfoMessage());
  }

  handleSubmitClick(ev) {
    console.log("...Popup handleSubmitClick");
    this.props.closePopup();
  }

  render() {
    console.log("InfoPopup render");

    return (
      <div>
        <Navigator />
        <div className="popup">
          <div className="popup_inner">
            <div style={{ marginLeft: 20, textAlign: "left" }}>
              <p style={{ fontSize: "140%" }}>{this.props.title}</p>
            </div>
            <div style={{ marginLeft: 30, textAlign: "left" }}>
              <p>
                <br />
                {this.getInfoMessage()}
              </p>
            </div>
            <div align="center">
              <Button
                type="button"
                variant="contained"
                style={{
                  width: "130px",
                  color: "#0000b0",
                }}
                onClick={(ev) => this.handleCopyClick(ev)}
              >
                Copy
              </Button>
            </div>
            <CloseButton onClick={(ev) => this.handleSubmitClick(ev)} />
          </div>
        </div>
      </div>
    );
  }
}

export default InfoPopup;
