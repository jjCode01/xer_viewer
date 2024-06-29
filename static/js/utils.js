export function formatDate(date) {
  const parts = date.split(/[- :]/); // Split by hyphens, spaces, and colons
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${parts[2]}-${months[parseInt(parts[1]) - 1]}-${parts[0].slice(-2)}`;
}
