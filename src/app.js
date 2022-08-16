const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const fileUpload = require("express-fileupload");
const connectDB = require("./database/config/db");
const { connectRedis } = require("./config/redis_config");
const userRouter = require("./routes/user");
const { onError } = require("./utils/response");

const app = express();
dotenv.config();

// connect to database

connectDB();
connectRedis();
// middleware
app.use(express.json());
app.use(cors());
// upload files
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);

// endpoints
app.use("/api/user", userRouter);
const PORT = process.env.PORT || 5000;

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("*", (req, res) => {
  return onError(res, 404, "Not found");
});
app.post("*", (req, res) => {
  return onError(res, 404, "Not found");
});
app.delete("*", (req, res) => {
  return onError(res, 404, "Not found");
});
app.patch("*", (req, res) => {
  return onError(res, 404, "Not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
