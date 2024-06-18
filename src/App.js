import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import annyang from "annyang";
import "bootstrap/dist/css/bootstrap.min.css";

// Registering components for Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [activities, setActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);
  const currentActivityRef = useRef(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("today");

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
        "start stretching ": () => handleVoiceCommand("start stretching"),
        "stop stretching stop stiching ": () =>
          handleVoiceCommand("stop stretching"),
        "start yoga": () => handleVoiceCommand("start yoga"),
        "stop yoga": () => handleVoiceCommand("stop yoga"),
        "start cycling": () => handleVoiceCommand("start cycling"),
        "stop cycling": () => handleVoiceCommand("stop cycling"),
        "start meditating": () => handleVoiceCommand("start meditating"),
        "stop meditating": () => handleVoiceCommand("stop meditating"),
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
    currentActivityRef.current = currentActivity;
  }, [currentActivity]);

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get("http://localhost:5000/activities");
      setActivities(response.data);

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
        fetchActivities();
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
      }, 500);
    }
  };

  const filterActivities = (activities, filter) => {
    const now = new Date();
    let startDate;
    if (filter === "today") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (filter === "this week") {
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
    } else if (filter === "this month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return activities.filter(
      (activity) => new Date(activity.startTime) >= startDate
    );
  };

  const filteredActivities = filterActivities(activities, filter);

  const data = {
    labels: [
      "Walking",
      "Fast Running",
      "Slow Running",
      "Juggling",
      "Stretching",
      "Yoga",
      "Cycling",
      "Meditating",
    ],
    datasets: [
      {
        label: "Time (seconds)",
        data: [
          filteredActivities
            .filter((activity) => activity.activity === "walking")
            .reduce((sum, act) => sum + act.duration, 0),
          filteredActivities
            .filter((activity) => activity.activity === "fast running")
            .reduce((sum, act) => sum + act.duration, 0),
          filteredActivities
            .filter((activity) => activity.activity === "slow running")
            .reduce((sum, act) => sum + act.duration, 0),
          filteredActivities
            .filter((activity) => activity.activity === "juggling")
            .reduce((sum, act) => sum + act.duration, 0),
          filteredActivities
            .filter((activity) => activity.activity === "stretching")
            .reduce((sum, act) => sum + act.duration, 0),
          filteredActivities
            .filter((activity) => activity.activity === "yoga")
            .reduce((sum, act) => sum + act.duration, 0),
          filteredActivities
            .filter((activity) => activity.activity === "cycling")
            .reduce((sum, act) => sum + act.duration, 0),
          filteredActivities
            .filter((activity) => activity.activity === "meditating")
            .reduce((sum, act) => sum + act.duration, 0),
        ],
        backgroundColor: [
          "rgb(75, 192, 192)",
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 206, 86)",
          "rgb(153, 102, 255)",
          "rgb(255, 159, 64)",
          "rgb(199, 199, 199)",
          "rgb(255, 99, 71)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(199, 199, 199, 0.2)",
          "rgba(255, 99, 71, 0.2)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const renderActivityTimeline = () => {
    const timeline = Array(144).fill("white"); // 24 hours * 6 (10-minute intervals per hour)

    filteredActivities.forEach((activity) => {
      const start = new Date(activity.startTime);
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const durationMinutes = Math.ceil(activity.duration / 60);
      const endMinutes = Math.min(startMinutes + durationMinutes, 24 * 60); // Ensure end doesn't exceed 24 hours

      console.log(
        `Activity: ${activity.activity}, Start Minutes: ${startMinutes}, End Minutes: ${endMinutes}`
      );

      for (let minute = startMinutes; minute < endMinutes; minute += 10) {
        const intervalIndex = Math.floor(minute / 10);
        if (intervalIndex >= 0 && intervalIndex < 144) {
          if (activity.activity === "walking")
            timeline[intervalIndex] = "rgb(75, 192, 192)";
          if (activity.activity === "fast running")
            timeline[intervalIndex] = "rgb(255, 99, 132)";
          if (activity.activity === "slow running")
            timeline[intervalIndex] = "rgb(54, 162, 235)";
          if (activity.activity === "juggling")
            timeline[intervalIndex] = "rgb(255, 206, 86)";
          if (activity.activity === "stretching")
            timeline[intervalIndex] = "rgb(153, 102, 255)";
          if (activity.activity === "yoga")
            timeline[intervalIndex] = "rgb(255, 159, 64)";
          if (activity.activity === "cycling")
            timeline[intervalIndex] = "rgb(199, 199, 199)";
          if (activity.activity === "meditating")
            timeline[intervalIndex] = "rgb(255, 99, 71)";
        }
      }
    });

    return timeline.map((color, interval) => (
      <div
        key={interval}
        style={{
          width: "0.69%", // 100% / 144 intervals
          backgroundColor: color,
          height: "20px",
        }}
        title={getIntervalString(interval)}></div>
    ));
  };

  const getIntervalString = (interval) => {
    const hour = Math.floor(interval / 6);
    const minute = (interval % 6) * 10;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
      <h2 className="text-success mt-2 mb-2">
        {" "}
        <span className="text-primary">Activity</span> Tracker
      </h2>
      <div
        className="btn-group"
        role="group"
        aria-label="Basic radio toggle button group">
        <input
          type="radio"
          className="btn-check"
          name="btnradio"
          id="btnradio1"
          autoComplete="off"
          checked={filter === "today"}
          onChange={() => setFilter("today")}
        />
        <label className="btn btn-outline-secondary" htmlFor="btnradio1">
          Today
        </label>

        <input
          type="radio"
          className="btn-check"
          name="btnradio"
          id="btnradio2"
          autoComplete="off"
          checked={filter === "this week"}
          onChange={() => setFilter("this week")}
        />
        <label className="btn btn-outline-secondary" htmlFor="btnradio2">
          This Week
        </label>

        <input
          type="radio"
          className="btn-check"
          name="btnradio"
          id="btnradio3"
          autoComplete="off"
          checked={filter === "this month"}
          onChange={() => setFilter("this month")}
        />
        <label className="btn btn-outline-secondary" htmlFor="btnradio3">
          This Month
        </label>
      </div>
      <div className="m-3 border border-secondary border-2 rounded">
        <div className="d-flex justify-content-between">
          {renderActivityTimeline()}
        </div>
      </div>
      <h5 className="m-3" style={{ color: "#6CB4EE" }}>
        {currentActivity ? (
          `${
            currentActivity.activity.charAt(0).toUpperCase() +
            currentActivity.activity.slice(1)
          } in progress...`
        ) : (
          <span style={{ color: "red" }}>
            {message || "Want to record activity? Speak!"}
          </span>
        )}
      </h5>
      <div style={{ height: "70vh" }}>
        <Bar data={data} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default App;
