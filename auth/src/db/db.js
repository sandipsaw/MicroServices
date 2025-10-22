const mongoose = require('mongoose')

async function connectToDb(){
    await mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Database is Connected");
    })
    .catch((error)=>{
        console.log(error)
    })
}

module.exports = connectToDb