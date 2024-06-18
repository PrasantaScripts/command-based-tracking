const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://0000:0000@cluster0.svuj0yt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const activitySchema = new mongoose.Schema({
  activity: String,
  startTime: Date,
  endTime: Date,
  duration: Number,
});

const Activity = mongoose.model("Activity", activitySchema);

app.post("/start", async (req, res) => {
  const { activity } = req.body;
  const startTime = new Date();
  const newActivity = new Activity({ activity, startTime });
  await newActivity.save();
  res.status(201).send(newActivity);
});

app.post("/stop", async (req, res) => {
  const { id } = req.body;
  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).send({ error: "Activity not found" });
    }
    activity.endTime = new Date();
    activity.duration = (activity.endTime - activity.startTime) / 1000; // duration in seconds
    await activity.save();
    res.status(200).send(activity);
  } catch (error) {
    console.error("Error stopping activity:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.get("/activities", async (req, res) => {
  const activities = await Activity.find({});
  res.status(200).send(activities);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
