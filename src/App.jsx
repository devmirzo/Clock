import React, { useState, useEffect } from "react";
import day from "../public/day.jpg"; // Kunduzgi rasm
import night from "../public/night.jpg"; // Kechki rasm
import { meta } from "@eslint/js";

const App = () => {
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState(null); // Koordinatalar
  const [address, setAddress] = useState(""); // Joylashuv manzili
  const [error, setError] = useState(null); // Xatolik
  const [theme, setTheme] = useState("dark"); // Mavzu: dark/light

  // Foydalanuvchining joylashuvini olish
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        () => {
          setError("Unable to retrieve your location");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  // Reverse geocoding orqali manzilni olish
  useEffect(() => {
    if (location) {
      const fetchAddress = async () => {
        const API_KEY = import.meta.env.VITE_ACCESS_KEY; // O'zingizning API kalitingizni kiriting
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${API_KEY}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.results.length > 0) {
            const components = data.results[0].components;
            const city =
              components.city ||
              components.town ||
              components.village ||
              "Unknown city";
            const country = components.country || "Unknown country";
            setAddress(`${city}, ${country}`);
          } else {
            setAddress("Location not found");
          }
        } catch {
          setError("Failed to fetch location details");
        }
      };
      fetchAddress();
    }
  }, [location]);

  // Soatni yangilash va mavzuni belgilash
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      setTime(currentTime);

      // Kun vaqtiga qarab mavzuni belgilash
      const hours = currentTime.getHours();
      setTheme(hours >= 6 && hours < 18 ? "light" : "dark");
    }, 1000);

    return () => clearInterval(timer); // Tozalash
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Fon rasmi URL ni tanlash
  const backgroundImage = theme === "dark" ? `url(${night})` : `url(${day})`;

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen text-white"
      style={{
        backgroundImage: backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <section className="text-center bg-black bg-opacity-50 p-4 rounded-lg">
        <p className="text-lg font-semibold mb-2">{formatDate(time)}</p>
        <h1 className="text-6xl font-bold">{formatTime(time)}</h1>

        {location && address && (
          <div className="mt-4">
            <p className="text-lg">
              <span className="font-semibold">Location:</span> {address}
            </p>
          </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </section>
    </main>
  );
};

export default App;
