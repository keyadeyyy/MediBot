const asyncHandler = require('express-async-handler')
const axios = require('axios');
const { createClient } = require('redis');

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.connect().catch(console.error);

const getMedicine = asyncHandler(async (req, res) => {
  const query = req.query.q?.toLowerCase().trim(); // ✅ Normalize input
  console.log("Query received:", req.query.q);

  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  const cacheKey = `medicine:${query}`;
  console.log("⏱ Start:", new Date().toISOString());
  const cached = await redisClient.get(cacheKey);
    


  if (cached) {
    console.log("✅ Cache hit");
     console.log("⏱ End:", new Date().toISOString());
    return res.json(JSON.parse(cached));
   

  }
  
  console.log("⏱ Start:", new Date().toISOString());

  const fieldsToTry = ["generic_name", "brand_name"];
  let med = null;

  for (const field of fieldsToTry) {
    const url = `https://api.fda.gov/drug/label.json?search=openfda.${field}:${query}*&limit=1`;
    console.log("Final URL:", url);

    try {
      const response = await axios.get(url);
      if (response.data.results.length > 0) {
        med = response.data.results[0];
        break;
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  console.log("⏱ End:", new Date().toISOString());

  if (!med) {
    return res.status(404).json({ error: "No medicine found. Ensure that the spelling is correct." });
  }

  const result = {
    generic_name: med.openfda?.generic_name?.[0] || "N/A",
    active_ingredient: med.active_ingredient?.[0] || "N/A",
    purpose: med.purpose?.[0] || "N/A",
    indications: med.indications_and_usage?.[0] || "N/A",
    dosage: med.dosage_and_administration?.[0] || "N/A",
    warnings: med.warnings?.[0] || "N/A",
  };

  // ✅ Cache result for 24 hours
  await redisClient.set(cacheKey, JSON.stringify(result), {
    EX: 86400, // 24 hours
  });

  return res.json(result);
});

module.exports = {getMedicine}