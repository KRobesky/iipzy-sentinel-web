import Cookies from "js-cookie";

import { log } from "./log";

//const cookieName = "iipzy-server-web";

function get(key, defaultValue) {
  let val = Cookies.get(key);
  if (!val && defaultValue) val = defaultValue;
  log("cookie.get: key = " + key + ", val = " + val, "cook", "info");
  return val;
}

function set(key, val) {
  log("cookie.set: key = " + key + ", val = " + val, "cook", "info");
  return Cookies.set(key, val, { expires: 365 });
}

export default { get, set };
