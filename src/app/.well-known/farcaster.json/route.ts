function withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET() {
const URL = process.env.NEXT_PUBLIC_URL as string;
return Response.json(
{
  "accountAssociation": {
    "header": "eyJmaWQiOjEzNjYwOTUsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhiMkJkM2EyMDY1QjVFMThjQTdkOTJDYWQ5OGE5MGMxRUExNjg3QzJBIn0",
    "payload": "eyJkb21haW4iOiJyYWl0ZTI1LWdhY2hhLnZlcmNlbC5hcHAifQ",
    "signature": "MHg2YTk5Y2E0YTg4NTJhMjFmNzY2ZDkwMGY4YzFkMjFmODc2ZmFhNWU1OWI1MjkzMmE2ZjMxMGI2MDNmOTAyMmU1N2RkMmY5MDg5NGUxYjliNjhhNTRiOWUzNzJlMDI1OWE2ZTc4ZjNhMDM5YTdlNDQ5NjM2MjJhZDYyNmNiNTYzMzFi"
  },
  "baseBuilder": {
    "allowedAddresses": [""] // add your Base Account address here
  },
  "miniapp": {
    "version": "1",
    "name": "Example Mini App",
    "homeUrl": "https://ex.co",
    "iconUrl": "https://ex.co/i.png",
    "splashImageUrl": "https://ex.co/l.png",
    "splashBackgroundColor": "#000000",
    "webhookUrl": "https://ex.co/api/webhook",
    "subtitle": "Fast, fun, social",
    "description": "A fast, fun way to challenge friends in real time.",
    "screenshotUrls": [
      "https://ex.co/s1.png",
      "https://ex.co/s2.png",
      "https://ex.co/s3.png"
    ],
    "primaryCategory": "social",
    "tags": ["example", "miniapp", "baseapp"],
    "heroImageUrl": "https://ex.co/og.png",
    "tagline": "Play instantly",
    "ogTitle": "Example Mini App",
    "ogDescription": "Challenge friends in real time.",
    "ogImageUrl": "https://ex.co/og.png",
    "noindex": true
  }
}
); 
}
