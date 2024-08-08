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

/**
 * Convert a date to string format `dd-mm-yy`.
 * @param {(Date|string)} date date to format
 * @returns {string} date as string format `dd-mmm-yy`
 */
export const formatDate = (date) => {
  if (date instanceof Date && !isNaN(date)) return formatDateObj(date);
  return formatDateStr(date);
};

export const formatNumber = (num, min = 0) => {
  if (isNaN(num)) return "";
  const returnString = Intl.NumberFormat("en-US", {
    minimumFractionDigits: min,
    maximumFractionDigits: 2,
    signDisplay: "never",
  }).format(num);
  return num < 0 ? `(${returnString})` : returnString;
};

export const formatCost = (cost) => "$" + formatNumber(cost, 2);

export const formatPercent = (value, sign = "auto") => {
  if (isNaN(value)) return "N/A";
  const returnString = Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: sign,
  }).format(value);
  return returnString;
};

/**
 * Convert a date to string format `dd-mm-yy`.
 * @param {Date} date date to format
 * @returns {string} date as string format `dd-mmm-yy`
 */
function formatDateObj(date) {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear().toString().substring(2);
  return `${day < 10 ? "0" : ""}${day}-${month}-${year}`;
}

/**
 * Convert a date to string format `dd-mm-yy`.
 * @param {string} date date to format
 * @returns {string} date as string format `dd-mmm-yy`
 */
function formatDateStr(date) {
  const parts = date.split(/[- :]/); // Split by hyphens, spaces, and colons
  return `${parts[2]}-${MONTHS[parseInt(parts[1]) - 1]}-${parts[0].slice(-2)}`;
}
