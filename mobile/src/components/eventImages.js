export const EVENT_IMAGES = {
  cultural: require("../../assets/images/fest.png"),
  technical: require("../../assets/images/tech.png"),
  sports: require("../../assets/images/football.png"),
  academic: require("../../assets/images/graduation-hat.png"),
  workshop: require("../../assets/images/graphic.png"),
  creative: require("../../assets/images/graphic.png"),
  default: require("../../assets/images/campus.png"),
};

export function getEventImage(category = "") {
  const value = String(category).toLowerCase();
  if (value.includes("cultur") || value.includes("fest")) return EVENT_IMAGES.cultural;
  if (value.includes("tech") || value.includes("hack") || value.includes("coding")) return EVENT_IMAGES.technical;
  if (value.includes("sport") || value.includes("football") || value.includes("game")) return EVENT_IMAGES.sports;
  if (value.includes("academic") || value.includes("graduat") || value.includes("education")) return EVENT_IMAGES.academic;
  if (value.includes("workshop") || value.includes("design") || value.includes("graphic")) return EVENT_IMAGES.workshop;
  return EVENT_IMAGES.default;
}
