import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { distance, point, rhumbBearing } from '@turf/turf';

export function capitalizeFirstWords(str: string, makeUnderscoresSpaces: boolean = false) {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  if (makeUnderscoresSpaces) {
    str = str.replace(/_/g, ' ');
  }
  const words = str.split(' ');

  const capitalizedWords = words.map(word => {
    if (word.length === 0) {
      return '';
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return capitalizedWords.join(' ');
}

export function cmToIn(centimeters: number, precision: number = 2) {
  const inches = centimeters * 0.393701;
  return parseFloat(inches.toFixed(precision));
}

export function inToCm(inches: number, precision: number = 2) {
  const centimeters = inches * 2.54;
  return parseFloat(centimeters.toFixed(precision));
}

export function mphToKph(mph: number, precision: number = 2) {
  const kph = mph * 1.60934;
  return parseFloat(kph.toFixed(precision));
}

export function kphToMph(kph: number, precision: number = 2) {
  const mph = kph * 0.621371;
  return parseFloat(mph.toFixed(precision));
}

export function bearingBetweenCoordinates(lat1, long1, lat2, long2) {
  return rhumbBearing(point([long1, lat1]), point([long2, lat2]));
}

export function distanceBetweenCoordinates(lat1, long1, lat2, long2, units: 'kilometers' | 'miles' = 'kilometers') {
  return distance(point([long1, lat1]), point([long2, lat2]), { units });
}

export function distinct(value, index, self) {
  return self.indexOf(value) === index;
}

export function downloadBlob(blob, fileName) {
  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', URL.createObjectURL(blob));
  downloadAnchorNode.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function downloadJsonFile(fileName: string, jsonData: any) {
  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonData, null, 2))}`);
  downloadAnchorNode.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function downloadFromUrl(url, fileName) {
  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', url);
  downloadAnchorNode.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function encodeUriPlusSpecials(uri: string) {

  let otherSpecialsToEncode = [
    { character: "#", replacement: '%23' },
    { character: "'", replacement: '%27%27' },
    { character: "+", replacement: '%2B' },
    { character: "/", replacement: '%2F' },
    { character: ":", replacement: '%3A' },
    { character: "–", replacement: '%96' },
    { character: "—", replacement: '%97' }
  ];

  let encodedUri = encodeURIComponent(uri);

  for (let special of otherSpecialsToEncode) {
    while (encodedUri.includes(special.character)) {
      encodedUri = encodedUri.replace(special.character, special.replacement);
    }
  }

  return encodedUri;
}

export function escapePreParse(stringValue: string) {

  stringValue = stringValue.replace(/"/g, '\\"');
  return stringValue;
}

export function exportCsvFile(fileName: string, csvData: any) {

  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', URL.createObjectURL(new Blob([csvData], { type: 'text/csv;charset=utf-8' })));
  downloadAnchorNode.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function exportJsonFile(fileName: string, jsonData: any) {

  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonData))}`);
  downloadAnchorNode.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function formatDate(utc: number) {
  let d = new Date(utc);
  return `${d.toLocaleDateString()}`;
}

export function formatDateTimeString(dateString: string, formatString?: string) {
  let d = new Date(dateString);
  if (!formatString) {
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
  return format(d, formatString);
}

export function formatDateTimeToLocale(dateValue: string | Date | number): string {
  if (!dateValue) {
    return '';
  }

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      // Invalid date
      return dateValue.toString();
    }
    // Get the user's current timezone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Convert the UTC date to the user's local timezone
    const zonedDate = toZonedTime(date, userTimeZone);
    // 1. Format the date and time part using date-fns: "MM/dd/yyyy - hh:mm:ss a"
    // hh: 12-hour format (01-12)
    // a: AM/PM marker
    const dateTimePart = format(zonedDate, 'MM/dd/yyyy - hh:mm:ss a');

    // 2. Get the short timezone name using Intl.DateTimeFormat
    // This is the most reliable way to get 'CDT', 'EST', etc.
    const timeZoneNameFormatter = new Intl.DateTimeFormat(navigator.language, {
      timeZone: userTimeZone,
      timeZoneName: 'short', // Request the short time zone name
    });

    // Format the zoned date to get the string that includes the short time zone name
    // Example output might be "7/20/2025, 3:40:03 PM CDT"
    const formattedWithTimeZone = timeZoneNameFormatter.format(zonedDate);

    // Extract just the timezone part from the end of the formatted string
    // This is a bit of a hack, but reliable for common formats.
    // We'll look for the last word in the string, assuming it's the TZ abbreviation.
    const parts = formattedWithTimeZone.split(' ');
    const timeZoneAbbreviation = parts[parts.length - 1];

    // Combine them into the desired final format
    return `${dateTimePart} (${timeZoneAbbreviation})`;
  } catch (error) {
    console.error('Error formatting date to locale:', error);
    return dateValue.toString();
  }
}

export function formatDateTime(utc: number) {
  let d = new Date(utc);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function formatTime(utc: number) {

  let d = new Date(utc);

  return `${d.toLocaleTimeString()}`;
}

export function generateDigitString(length = 5) {
  let rs = Math.random().toString().substring(2);
  while (rs.length < length) {
    rs += Math.random().toString().substring(2);
  }
  return rs.slice(0, length);
}

export function generateRandomNumber(min: number = 0, max: number = 100) {
  // min and max are included as options 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function generateUUID() {
  let
    d = new Date().getTime(),
    d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
}

export function getCurrentDateTime() {
  let d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear(),
    time = d.toLocaleTimeString()

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return `${year}-${month}-${day} ${time}`;
}

export function getObjectProperty(object, path, defaultValue) {
  // Ensure path is an array of keys
  const pathParts = Array.isArray(path)
    ? path.filter(key => key) // Filter out any empty strings if path is already an array
    : path.split('.').filter(key => key); // Split string path and filter out empty parts

  if (!pathParts.length) {
    return object; // If path is empty, return the object itself
  }

  let current = object;
  let isLengthCheck = false;

  // Check if the last part of the path is 'length'
  if (pathParts[pathParts.length - 1] === 'length') {
    isLengthCheck = true;
    pathParts.pop(); // Remove 'length' to get the parent array/string
  }

  // Traverse the object
  for (const part of pathParts) {
    if (current === null || typeof current !== 'object' || !current.hasOwnProperty(part)) {
      return defaultValue; // Property not found at this level
    }
    current = current[part];
  }

  // Handle the 'length' feature
  if (isLengthCheck) {
    if (Array.isArray(current) || typeof current === 'string') {
      return current.length;
    } else {
      return defaultValue; // Parent property doesn't have a length
    }
  }

  // Return the found value or defaultValue if current is undefined (after traversal)
  return current === undefined ? defaultValue : current;
}

export function getWindowLocationDomain() {

  let indexOfDoubleForwardSlash = window.location.href.indexOf("//") + 2;
  let indexOfNextForwardSlash = window.location.href.indexOf("/", indexOfDoubleForwardSlash);

  return window.location.href.substring(0, indexOfNextForwardSlash);
}

export function getWindowLocationPath() {

  let indexOfDoubleForwardSlash = window.location.href.indexOf("//") + 2;
  let indexOfNextForwardSlash = window.location.href.indexOf("/", indexOfDoubleForwardSlash);

  return window.location.href.substring(indexOfNextForwardSlash);
}

export function sanitizeString(str) {
  // Use a regular expression to match anything that is NOT a letter (a-z, A-Z),
  // a number (0-9), or a whitespace character (\s).
  // The 'g' flag ensures all occurrences are replaced, not just the first.
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
}

export function setDarkTheme(enabled: boolean) {
  document.body.classList.toggle("dark", enabled);
}

export function setQueryParams(url: string, params: Record<string, any>): string {
  
  try {
    // Use the URL object to correctly parse the URL and its existing query parameters.
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;

    for (const key in params) {
      // Ensure we only process own properties of the params object
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key];

        // Skip parameters that are null, undefined, or empty strings.
        if (value === null || value === undefined || (typeof value === 'string' && value.length === 0)) {
          continue;
        }

        // Handle arrays by appending multiple values with the same key (e.g., ids=1&ids=2).
        if (Array.isArray(value)) {
          // Remove any existing parameter with this key to avoid duplicates
          searchParams.delete(key); 
          value.forEach(item => {
            if (item !== null && item !== undefined) {
              searchParams.append(key, String(item));
            }
          });
        } 
        // Handle all other primitive types (string, number, boolean)
        else {
          searchParams.set(key, String(value));
        }
      }
    }

    // Reconstruct and return the new URL string.
    urlObj.search = searchParams.toString();
    return urlObj.toString();
    
  } catch (error) {
    return url;
  }
}

export function sortItems(array: any[], propertyName: string, direction: 'asc' | 'desc' = 'asc') {
  return array.sort((a, b) => {
    if (a[propertyName] < b[propertyName]) { return direction == 'asc' ? -1 : 1 }
    else if (a[propertyName] > b[propertyName]) { return direction == 'asc' ? 1 : -1 }
    return 0;
  });
}