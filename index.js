import cors from "cors";
import express from "express";

const app = express();
const port = 3000;
app.use(
  cors({
    origin: "*", // TODO Read from env var for production
  })
);

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
        `Unknown user: ${user}. Make sure you are setting the ?user=[NAME] query param`
      );
  }

  let result;
  try {
    result = await fetch(
      `${process.env.UNIFI_SCHEME}${process.env.UNIFI_DOMAIN}/proxy/network/integration/v1/sites/${process.env.UNIFI_SITE_ID}/clients?limit=100`,
      {
        headers: {
          "X-API-KEY": process.env.UNIFI_API_KEY,
        },
      }
    );
  } catch (err) {
    console.log("Failed fetching clients:", err);
    return res.sendStatus(500);
  }

  let devices = await result.json();
  let onlineDevices = devices.data.filter((device) =>
    USERS[user].includes(device.id)
  );

  res.send(onlineDevices.length > 0);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
