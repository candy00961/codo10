// netlify/functions/fetchKwh.js
const fetch = require('node-fetch'); // Make sure 'node-fetch' is in dependencies

exports.handler = async (event) => {
  const moduleUuid = "c667ff46-9730-425e-ad48-1e950691b3f9";
  const measuringPointUuid = "71ef9476-3855-4a3f-8fc5-333cfbf9e898";
  const start = "2024-10-16";
  const end = "2024-11-25";

  // *** FIX: Added backticks for template literal ***
  const url = `https://api.develop.rve.ca/v1/modules/${moduleUuid}/measuring-points/${measuringPointUuid}/reads?start=${start}&end=${end}`;

  // *** FIX: Check for API_Key environment variable ***
  const apiKey = process.env.API_Key;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API Key not configured" }) };
  }

  try {
    console.log(`[fetchKwh] Fetching URL: ${url}`); // Add logging
    const response = await fetch(url, {
      headers: { "Access-Token": apiKey }, // Use the variable
    });
    console.log(`[fetchKwh] Response status: ${response.status}`); // Add logging

    if (!response.ok) {
      // Log error details if fetch failed
      const errorBody = await response.text();
      console.error(`[fetchKwh] API Error ${response.status}: ${errorBody}`);
      return { statusCode: response.status, body: JSON.stringify({ error: `API request failed: ${response.statusText}`, details: errorBody }) };
    }

    const data = await response.json();

    // Process and return the data
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" }, // Added Content-Type header
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("[fetchKwh] Fetch error:", error); // Log the actual error
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
