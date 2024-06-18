import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import annyang from "annyang";

// Registering components for Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [activities, setActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);
  const currentActivityRef = useRef(null); // Ref to keep track of currentActivity
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (annyang) {
      const commands = {
        "start walking": () => handleVoiceCommand("start walking"),
        "stop walking": () => handleVoiceCommand("stop walking"),
        "start fast running": () => handleVoiceCommand("start fast running"),
        "stop fast running": () => handleVoiceCommand("stop fast running"),
        "start slow running": () => handleVoiceCommand("start slow running"),
        "stop slow running": () => handleVoiceCommand("stop slow running"),
        "start juggling": () => handleVoiceCommand("start juggling"),
        "stop juggling": () => handleVoiceCommand("stop juggling"),
      };

      annyang.addCommands(commands);
      annyang.start();

      annyang.addCallback("result", (phrases) => {
        console.log("Recognized phrases:", phrases);
      });
    }
  }, []);

  useEffect(() => {
    console.log("Current activity state updated:", currentActivity);
    currentActivityRef.current = currentActivity; // Update ref whenever currentActivity changes
  }, [currentActivity]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get("http://localhost:5000/activities");
      setActivities(response.data);
      setMessage("Fetched activity data");
      console.log("Fetched activities:", response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setMessage("Error fetching activity data");
    }
  };

  const startActivity = async (activity) => {
    try {
      const response = await axios.post("http://localhost:5000/start", {
        activity,
      });
      setCurrentActivity(response.data);
      setMessage("Activity started: " + activity);
      console.log("Started activity:", response.data);
      // fetchActivities(); // Fetch activities after starting
    } catch (error) {
      console.error("Error starting activity:", error);
      setMessage("Error starting activity");
    }
  };

  const stopActivity = async () => {
    console.log(
      "Current activity in stopActivity:",
      currentActivityRef.current
    );
    if (currentActivityRef.current) {
      try {
        const response = await axios.post("http://localhost:5000/stop", {
          id: currentActivityRef.current._id,
        });
        setMessage("Activity stopped");
        console.log("Stopped activity:", response.data);
        fetchActivities(); // Fetch activities after stopping
        setCurrentActivity(null);
      } catch (error) {
        console.error("Error stopping activity:", error);
        setMessage("Error stopping activity");
      }
    } else {
      setMessage("No current activity to stop");
    }
  };

  const handleVoiceCommand = (command) => {
    console.log("Handling voice command:", command);
    if (command.includes("start")) {
      const activity = command.replace("start ", "");
      startActivity(activity);
    } else if (command.includes("stop")) {
      setTimeout(() => {
        stopActivity();
      }, 500); // Delay to ensure state has time to update
    }
  };

  const data = {
    labels: activities.map((activity) =>
      new Date(activity.startTime).toLocaleString()
    ),
    datasets: [
      {
        label: "Walking Time (seconds)",
        data: activities.map((activity) => activity.duration),
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  return (
    <div>
      <h1>Activity Tracker</h1>
      <button onClick={fetchActivities}>Fetch Activities</button>
      <button onClick={() => startActivity("walking")}>Start Walking</button>
      <button onClick={stopActivity}>Stop Walking</button>
      <p>{message}</p>
      {activities.length > 0 ? (
        <Line data={data} />
      ) : (
        <p>No activity data available</p>
      )}
    </div>
  );
};

export default App;
