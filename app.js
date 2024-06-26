const express = require("express");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const cors = require("cors");

const userRouter = require("./routes/userRoutes");

const app = express();
app.use(cors());
// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
