import dotenv from "dotenv";
dotenv.config();

console.log("All keys in process.env:");
Object.keys(process.env).sort().forEach(key => {
  console.log(`- ${key}`);
});
