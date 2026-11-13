import React from "react";
import Hero from "../components/Hero";
import UpcomingEvents from "../components/UpcomingEvents";
import Intro from "../components/Intro";
import Community from "../components/Community";

export default function Home() {
  return (
    <div>
      <Hero />
      <UpcomingEvents />
      <Intro />
      <Community />
    </div>
  );
}
