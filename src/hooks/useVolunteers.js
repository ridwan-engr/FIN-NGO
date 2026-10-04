import { useContext } from "react";

import VolunteerContext from "../context/volunteerContext.js";

export default function useVolunteers() {
  const context = useContext(VolunteerContext);

  if (!context) {
    throw new Error(
      "useVolunteers must be used inside VolunteerProvider.",
    );
  }

  return context;
}
