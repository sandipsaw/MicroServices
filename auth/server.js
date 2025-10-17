require('dotenv').config()
const connectToDb = require('./src/db/db')
const app = require('./src/app');

connectToDb()

app.listen(3000,()=>{
    console.log("server is running on port 3000");
})