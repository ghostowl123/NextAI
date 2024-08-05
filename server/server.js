import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // Import multer
import chat from "./chat.js";


dotenv.config();

// app init
const app = express();
// 允许app 使用第三方插件
app.use(cors());

// Configure multer
//multer 处理用户传输数据 并把数据存储下来
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  fileName: function (req, file, cb) {
    cb(null, file.originalname);
  },
 });
 
 
 const upload = multer({
  storage,
 });
 
 
 const PORT = process.env.PORT || 8080;
 
 
 let filePath;
//express define api
//step 1:
// Restful api? stateless   soap graphQL what does the api do? in one sentence
// key word? get post?  
// status code 200 401 404 500
// input payload ? param?
// output
// upload.single middleware 
//可以加功能 如何检查用户上传的类型
app.get("/", (req, res) => {
  res.send("healthy");
 });
 
 
 app.post("/upload", upload.single("file"), (req, res) => {
  filePath = req.file.path;
  res.send(filePath + "upload successfully.");
 });
 
 
 app.get("/chat", async (req, res) => {
  const resp = await chat(req.query.question, filePath);
  res.send(resp.text);
 });
 
 
 app.listen(PORT, () => {
  console.log(`🚀🚀🚀 Server is running on port ${PORT}`);
 });
 
