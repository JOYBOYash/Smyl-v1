import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function fetchOpenAPI() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("Missing Supabase configuration.");
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        "Accept": "application/json",
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`
      }
    });

    if (!response.ok) {
      console.log("Failed to fetch OpenAPI, status:", response.status);
      return;
    }

    const data = await response.json();
    console.log("Exposed Tables/Views:");
    if (data.definitions) {
      Object.keys(data.definitions).forEach(name => {
        console.log(`- ${name}`);
      });
    }

    console.log("\nExposed RPC Paths:");
    if (data.paths) {
      Object.keys(data.paths).forEach(path => {
        if (path.startsWith("/rpc/")) {
          console.log(`- ${path}`);
        }
      });
    }
  } catch (err: any) {
    console.error("Error fetching OpenAPI:", err.message || err);
  }
}

fetchOpenAPI();
