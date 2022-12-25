const fs = require("fs")
const ytdl = require("ytdl-core")
const express = require('express')
const cors = require("cors")
const app = express()
const port = 3300
const AWS = require("aws-sdk");
const s3 = new AWS.S3()
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
fs.appendFile("/tmp/"+f2+".mp3", '', function (err) {
  if (err) throw err;
  console.log('File is created successfully.');
});
//stream.pipe(fs.createWriteStream("/tmp/"+f2+".mp3"));

async function uploadReadableStream(stream) {
  const params = {Bucket: "cyclic-wild-pear-sea-lion-cape-ap-southeast-2", Key: f2+".mp3", Body: stream};
  return s3.upload(params).promise();
}

async function upload() {
  const readable = stream.pipe(fs.createWriteStream("/tmp/"+f2+".mp3"));
  const results = await uploadReadableStream(readable);
  let my_file = await s3.getObject({
                Bucket: "cyclic-wild-pear-sea-lion-cape-ap-southeast-2",
                Key: f2+".mp3",
            }).promise()
            res.download(my_file);
            
  console.log('upload complete', results);
}
stream.on('end', () => {
  const file = `${__dirname}/tmp/${f2}.mp3`;
  /*setTimeout(function(){
    fs.unlink(file, function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log('File deleted!');
  });
  },180000)*/
  
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
