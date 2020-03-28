function send(channel, data) {
  // console.log("eventManager.send: " + channel);
  let data_ = {};
  if (data || data === 0 || data === "" || data === []) data_ = data;
  const e = new CustomEvent(channel, { detail: { data: data_ } });
  document.getElementById("root").dispatchEvent(e);
}

function on(channel, callback) {
  document.getElementById("root").addEventListener(
    channel,
    e => {
      // console.log(
      //   "eventManager.on: channel = " +
      //     channel +
      //     ", e.detail = " +
      //     JSON.stringify(e.detail)
      // );
      callback(channel, e.detail.data);
    },
    false
  );
}

export default { send, on };
