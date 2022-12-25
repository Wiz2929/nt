const fs = require("fs")
const ytdl = require("ytdl-core")
const express = require('express')
const cors = require("cors")
const app = express()
const port = 3300
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/get', (req, res) => {
    console.log(req.query)
  
  ytdl.getInfo(req.query.url).then(response => {
    let audioFormats = ytdl.filterFormats(response.formats, 'audioonly');

    res.send({
      details:response.videoDetails,
      formats:audioFormats,
      url:req.query.url
    })
  });
})
app.get('/download', (req, res) => {
  console.log(req.query)

ytdl.getInfo(req.query.url).then(response => {
  //let audioFormats = ytdl.filterFormats(response.formats, 'audioonly');
let format = ytdl.chooseFormat(response.formats, { quality: req.query.rate })
const stream = ytdl.downloadFromInfo(response, { quality: req.query.rate });
let fName = response.videoDetails.title
fName = fName.split(" ")
let f2 = ""
fName.forEach((nm,ind) => {
  if(nm.includes("|") == false && nm != "|"){
    f2 += nm+"-"
  }
  
})
//f2 = "KAKA-New-Punjabi-Song---Mitti-De-Tibbe"
fs.appendFile(f2+".mp3", '', function (err) {
  if (err) throw err;
  console.log('File is created successfully.');
});
stream.pipe(fs.createWriteStream(f2+".mp3"));
stream.on('end', () => {
  const file = `${__dirname}/${f2}.mp3`;
  setTimeout(function(){
    fs.unlink(file, function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log('File deleted!');
  });
  },180000)
  res.download(file);
});
stream.on('error', function(e) { console.error(e); });
stream.on('abort', () => reject('An error has ocurred while downloading video'));

  
});
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
//https://www.youtube.com/watch?v=LBxRg-2kY0g&list=RDLBxRg-2kY0g&start_radio=1
//https://www.youtube.com/watch?v=dRr_eF3YifA
