import React from "react";

//?? TODO hidden
const Input = ({
  type,
  name,
  label,
  value,
  error,
  autofocus,
  disabled,
  onChange
}) => {
  return (
    <div className="form-group" style={{ width: "88%", marginLeft: 45 }}>
      <label htmlFor={name}>{label}</label>
      <input
        autoFocus={autofocus}
        disabled={disabled}
        value={value ? value : ""}
        onChange={onChange}
        id={name}
        name={name}
        type={type}
        className="form-control"
      />
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

//module.exports = Input;
export default Input;
