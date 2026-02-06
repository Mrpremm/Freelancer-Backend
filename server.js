const app=require("./server/app");
const connectDB=require("./server/config/db");
require("dotenv").config();


const PORT =process.env.PORT||3000;


connectDB();

const server=app.listen(PORT,()=>{
  console.log(`Server is running  on port ${PORT}`);
  
});
process.on("unhandledRejection",(err,promise)=>{
  console.error(`Error: ${err.message}`);
  server.close(()=>{process.exit(1)});
})

