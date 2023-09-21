const express = require('express');
const bodyParser = require('body-parser')
const User = require("./routes/router")

const app = express();
app.use(bodyParser.json());

app.use('/user/prisma', User)

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
