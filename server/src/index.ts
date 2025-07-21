import express from "express";
const app = express();
app.get("/api/hello", (_req,res)=>res.json({msg:"Hello"}));
app.listen(3001, ()=>console.log("Server on 3001"));

