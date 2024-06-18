import mongoose from "mongoose";


const activitySchema = new mongoose.Schema({
    activityType: { type: String, required: true }, // e.g., "walking", "fast running", "juggling"
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }, // in seconds
    // Additional fields specific to all activities or common attributes
    caloriesBurned: { type: Number },
    distanceCovered: { type: Number },
    // Other activity-specific fields can be added as needed
  });
  
  const Activity = mongoose.model("Activity", activitySchema);
  