import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Disable SSL verification
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const namespace = searchParams.get("namespace") || "default";
  const K8S_API = process.env.K8S_API_URL;
  const TOKEN = process.env.K8S_TOKEN;

  try {
    const response = await axios.get(
      `${K8S_API}/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        httpsAgent,
      },
    );
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.error("Error fetching pod metrics:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
