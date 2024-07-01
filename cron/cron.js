import cron from "cron";
import https from "https";

const url = "https://untld-backend.onrender.com";

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully");
      } else {
        console.log("GET request sent Failed", res.statusCode);
      }
    })
    .on("error", (e) => {
      console.error("ERROR while sending Request", e);
    });
});

export default job;
