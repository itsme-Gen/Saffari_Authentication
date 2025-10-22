const  mongoose = require("mongoose")

const db = (()=>{
    try{
        const isConnected = mongoose.connect("mongodb://localhost:27017/saffari_users")
        if(isConnected){
            console.log("Mongodb connected successfully")
        }
    }catch(error){
        console.error("Error:",error)
    }
})

module.exports = db