const express = require('express')
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const cors = require('cors')

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const authRouter = require('./authRouter');
app.use(express.json());
app.use("/auth", authRouter);
const start = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://novikovisergeevich:123@cluster0.osefsfh.mongodb.net/?retryWrites=true&w=majority`,
    );
    app.listen(process.env.PORT || 5000, () => console.log(`server statred on port ${PORT}`));
  } catch (error) {
    console.log(e);
  }
};

start();
