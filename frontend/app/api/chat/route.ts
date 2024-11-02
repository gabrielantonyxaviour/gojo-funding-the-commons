export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const data = {
      text: "Hello Gabriel, here is what I geenrated for you",
      contracts: [
        {
          name: "Crosschain Airdrop",
          chain: 80002,
          code: "flknesdlkvnsefknwekonwegoksenfokwnfkowefewkoneoksnvewf",
        },
        {
          name: "Crosschain Airdrop",
          chain: 1_444_673_419,
          code: "iuhfksensnvsejnvselkfnwejgweoknvweokmn",
        },
      ],
    };

    console.log(data);
    // Send the response back to the frontend
    return Response.json(data);
  } catch (error) {
    console.log("Error fetching data from external API:", error);
    Response.json({ message: "Internal server error" });
  }
}
