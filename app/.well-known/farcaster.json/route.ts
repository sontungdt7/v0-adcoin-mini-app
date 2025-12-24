export async function GET() {
  const URL =
    process.env.NEXT_PUBLIC_URL ||
    "https://bf86a94d-4eae-4e2b-a5d4-561fd4558851-00-13dju1adontpd.sisko.replit.dev/";

  const manifest = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    miniapp: {
      version: "1",
      name: "Adcoin",
      homeUrl: URL,
      iconUrl: `${URL}/icon.svg`,
      splashImageUrl: `${URL}/placeholder.jpg`,
      splashBackgroundColor: "#000000",
      subtitle: "Connect Brands with Creators",
      description:
        "A mini app for managing advertising tokens and connecting advertisers with creators on Base.",
      screenshotUrls: [
        `${URL}/placeholder.jpg`,
        `${URL}/placeholder.jpg`,
        `${URL}/placeholder.jpg`,
      ],
      primaryCategory: "social",
      tags: ["adcoin", "advertising", "base", "creators", "brands"],
      tagline: "Tokenized Creator Advertising",
      ogTitle: "Adcoin - Mini App",
      ogDescription:
        "Connect advertisers and creators through on-chain advertising tokens.",
      ogImageUrl: `${URL}/placeholder.jpg`,
      noindex: false,
    },
  };

  return Response.json(manifest);
}
