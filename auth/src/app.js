const express = require('express')
const authRoute = require('./routes/auth.routes')
const app = express();

app.use(express.json())
app.use('/auth',authRoute)

if (process.env.NODE_ENV !== 'test') {
  app.listen(5000, () => console.log("Server running on port 5000"));
}

module.exports = app;