const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const ytdl = require("ytdl-core");
let songs = [];
const yt = require("yt-search");
const db = require("quick.db");
const ytsr = url =>
  new Promise((resolve, reject) =>
    yt(url, (err, r) => (err ? reject(err) : resolve(r)))
  );

app.set("view engine", "ejs");
app.use(express.static("css"));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
server.listen(process.env.PORT, function() {
  console.log("App running on port *3000");
});

app.get("/", (req, res) => {
  let data = db.all().filter(d => d.ID.startsWith("played"));
  console.log(new Date() + " Ping Received!");
  res.render("index", {
    title: "Home",
    error: null,
    data: Array.from(new Set(data))
  });
});

app.post("/", async (req, res) => {
  let data = db.all().filter(d => d.ID.startsWith("played"));
  var url = req.body.url;
  if (!url)
    return res.render("index", {
      title: "Home",
      error: true,
      data: data
    });
  console.log(url);
  if (!ytdl.validateURL(url))
    try {
      var uri = await ytsr(url);
      url = uri.videos
        ? uri.videos.length
          ? `https://www.youtube.com/watch?v=${uri.videos[0].video_id ||
              uri.videos[0].id ||
              uri.videos[0].videoId}`
          : "none"
        : "none";
    } catch (e) {
      console.error(e);
      return res.render("index", {
        title: "Home",
        error: true,
        data: data
      });
    }
  
  ytdl.getInfo(url, (err, info) => {
    if (err)
      return res.render("index", {
        title: "Home",
        error: true,
        data: data
      });
    let format = info.formats;
    let struct = {
      title: info.title,
      buffer: format[0].url,
      data: info,
      thumbnail: `https://i.ytimg.com/vi/${info.video_id}/maxresdefault.jpg`,
      loop: req.body.loop ? "loop" : "",
      playAudio: req.body.video ? false : true,
      time: new Date()
    };
    db.push(`played`, struct);
    return play(res, struct);
  });
});

function play(res, struct) {
  return res.render("player", struct);
}

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me`);
}, 280000);
