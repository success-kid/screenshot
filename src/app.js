const parse = require("csv-parse/lib/sync"); //using the csv parseelibrary
const fs = require("fs"); // this is a file stream
const fsPromises = require("fs");
const path = require("path");
const axios = require("axios"); // Axios is the libary used to call HTTP functions
const assert = require("assert");

require("dotenv").config(); //reads enviornmental variables file and save those variables from a secure file called .env (more here: https://www.youtube.com/watch?v=5WFyhsnU4Ik)
let SSAPI = process.env.SSAPI; //putting the screenshot API call into a shorter variable

// read csv
const data = fs.readFileSync("data/websites.csv", "utf8"); //read the file
console.log(data);
const records = parse(data.trim(), { columns: true, skipEmptyLines: true }); //parse the file
var errors = [];

console.log(data);

async function getScreenshots() {
  // use api
  try {
    for (const singleRecord of records) {
      //for of loop
      try {
        var res = await axios.post(`https://shot.screenshotapi.net/screenshot`, {
          token: SSAPI,
          url: singleRecord.domain,
          width: 3360,
          height: 1890,
          delay: 2500,
        });
        var screenshotData = await axios.get(res.data.screenshot, {
          responseType: "arraybuffer",
        });
        // Create directory for screenshot
        fs.promises.mkdir(path.join("snapshot"), { recursive: true }).catch(console.error);
        // write screenshot to snapshot directory
        fsPromises.writeFile(`snapshot/${singleRecord.domain}.png`, screenshotData.data, function (err, data) {
          if (err) console.log("error", err);
        });
      } catch (err) {
        console.log(singleRecord.domain, err);
        errors.push(singleRecord.domain);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

getScreenshots();
