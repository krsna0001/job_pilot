async function testRemoteOK() {
  console.log("Testing RemoteOK API...");
  try {
    const response = await fetch("https://remoteok.com/api", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });
    const data = await response.json();
    console.log("Data length:", data.length);
    if (data.length > 1) {
      console.log("Second item (index 1):", JSON.stringify(data[1], null, 2));
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testRemoteOK();
