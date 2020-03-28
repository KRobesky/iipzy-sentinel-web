import React from "react";
import { FiX } from "react-icons/fi";
import IconButton from "@material/react-icon-button";

class CloseButton extends React.Component {
  constructor(props) {
    super(props);

    console.log("CloseButton.constructor");

    this.state = {
      linkCount: 0
    };
  }

  handleClick(ev) {
    console.log("CloseButton.handleClick");
    this.props.onClick(ev);
  }

  render() {
    console.log("IipzyWindow.render");

    return (
      <div>
        <IconButton
          onClick={ev => this.handleClick(ev)}
          style={{
            position: "absolute",
            top: "0px",
            right: "0px",
            border: "none",
            background: "none",
            outline: "none"
          }}
        >
          <FiX style={{ height: 30, width: 30 }} />
        </IconButton>
      </div>
    );
  }
}

export default CloseButton;
