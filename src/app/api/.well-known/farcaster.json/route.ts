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
    "allowedAddresses": ["0xA1BF131Da72BB3AC780c9B0835000A2D6F643186"]
  },
  "miniapp": {
    "version": "1",
    "name": "GachaCare",
    "homeUrl": `${URL}`,
    "iconUrl": `${URL}/globe.svg`,
    "splashImageUrl": "https://ex.co/l.png",
    "splashBackgroundColor": "#000000",
    "webhookUrl": "https://ex.co/api/webhook",
    "subtitle": 'Pull NFTs, Care, Battle, Earn',
    "description": "Be able to mint NFT pets, care for them, increase their stats, battle others, and a lot more.",
    "screenshotUrls": [
      "https://ex.co/s1.png",
      "https://ex.co/s2.png",
      "https://ex.co/s3.png"
    ],
    "primaryCategory": "game",
    "tags": ["gacha", "petcare", "baseapp", "game"],
    "heroImageUrl": "https://ex.co/og.png",
    "tagline": 'Pull NFTs, Care, Battle, Earn',
    "ogTitle": "GachaCare - Pet Game",
    "ogDescription":"Be able to mint NFT pets, care for them, increase their stats, battle others, and a lot more.",
    "ogImageUrl": `${URL}/globe.svg`,
    "noindex": true
  }
}
); 
}
