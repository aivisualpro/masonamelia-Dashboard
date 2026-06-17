const axios = require('axios');

async function testSave() {
  try {
    const contactRes = await axios.get('http://localhost:3000/api/contact');
    console.log("RESPONSE:", contactRes.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testSave();
