const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDM1NzB9.oRKgLrsCVyCbNu1uMee39l3BUZFfdYWt8Y-FJzK-Vvk";

async function testUrl(url) {
  console.log("Testing:", url);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`
      },
      body: JSON.stringify({
        what: "React",
        where: "",
        page: "1"
      })
    });
    console.log("Status:", resp.status);
    const text = await resp.text();
    console.log("Response text sample:", text.slice(0, 500));
  } catch (err) {
    console.error("Error for", url, err.message);
  }
}

async function run() {
  await testUrl("https://59m666gk.functions.insforge.app/jobs-search");
  await testUrl("https://59m666gk.ap-southeast.insforge.app/functions/jobs-search");
}

run().catch(console.error);
