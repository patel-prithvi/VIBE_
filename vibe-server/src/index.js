import dotenv from "dotenv";

dotenv.config({
	path: './.env'
});
import connectDB from "./DB/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`⚙️ Server is ready and running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message || err);
    app.listen(PORT, () => {
      console.log(`⚠️ Server running in fallback mode on port: ${PORT}`);
    });
  });
