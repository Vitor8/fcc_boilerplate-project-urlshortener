require('dotenv').config();
const express = require('express');
const cors = require('cors');
let bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

const schema = new mongoose.Schema({ url: 'string' });
const Url = mongoose.model('Url', schema);

app.post('/api/shorturl', async function(req, res) {
  const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

  if (!urlRegex.test(req.body.url)) return res.json({ error: 'invalid url' }); 
  
  const url = new Url({ url: req.body.url });
  
  return await url.save((err, data) => {
    res.json({
      "original_url": req.body.url,
      "short_url": data["_id"]
    });
  });
});

app.get('/api/shorturl/:id', function(req, res) {
  const { id } = req.params;

  Url.findById(id, (err, data) => {
    if (!data) {
      return res.json({ error: 'invalid url' }); 
    } else {
      return res.redirect(data.url);
    }
  })
});

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
