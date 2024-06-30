const MONTHS = [
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

export function formatDate(date) {
  if (date instanceof Date) return formatDateObj(date);
  return formatDateStr(date);
}
function formatDateObj(date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  return formatter.format(date).replace(",", "-");
}

function formatDateStr(date) {
  const parts = date.split(/[- :]/); // Split by hyphens, spaces, and colons
  return `${parts[2]}-${MONTHS[parseInt(parts[1]) - 1]}-${parts[0].slice(-2)}`;
}
