export function canTransition(current, next, method) {
  return (
    {
      new: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: [method === "delivery" ? "delivering" : "ready", "cancelled"],
      ready: ["completed", "cancelled"],
      delivering: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    }[current] || []
  ).includes(next);
}
