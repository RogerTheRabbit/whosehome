import cors from "cors";
import express from "express";

const app = express();
const port = 3000;
app.use(
  cors({
    origin: "*", // TODO Read from env var for production
  }),
);

const STATUS = Object.freeze({
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
});

const USERS = JSON.parse(process.env.USERS || "{}");

console.log("Users:", USERS);

app.get("/", async (req, res) => {
  let user = req.query.user;
  if (
    user === null ||
    user === undefined ||
    USERS[user] === undefined ||
    USERS[user] === null
  ) {
    return res
      .status(404)
      .send(
        `Unknown user: ${user}. Make sure you are setting the ?user=[NAME] query param`,
      );
  }

  let result;
  try {
    result = await fetchClients();
  } catch (err) {
    console.log("Failed fetching clients:", err);
    return res.sendStatus(500);
  }

  let devices = await result.json();
  let onlineDevices = devices.data.filter((device) =>
    USERS[user].deviceIds.includes(device.id),
  );

  res.send(onlineDevices.length > 0);
});

app.get("/all", async (req, res) => {
  let result;
  try {
    result = await fetchClients();
  } catch (err) {
    console.log("Failed fetching clients:", err);
    return res.sendStatus(500);
  }

  let devices = await result.json();
  let onlineDevices = devices.data.map((device) => device.id);
  let resp = {};
  Object.entries(USERS).forEach(([name, users]) => {
    let online = users.deviceIds.some((deviceId) =>
      onlineDevices.includes(deviceId),
    );
    resp[name] = {
      status: online ? STATUS.ONLINE : STATUS.OFFLINE,
      color: `#${USERS[name].color}`,
    };
  });

  res.send(resp);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const fetchClients = async () => {
  return await fetch(
    `${process.env.UNIFI_SCHEME}${process.env.UNIFI_DOMAIN}/proxy/network/integration/v1/sites/${process.env.UNIFI_SITE_ID}/clients?limit=100`,
    {
      headers: {
        "X-API-KEY": process.env.UNIFI_API_KEY,
      },
    },
  );
};
