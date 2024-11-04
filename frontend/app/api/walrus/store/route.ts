import { error } from "console";

export async function PUT(req: Request) {
  try {
    const epochs = 5;
    const force = true;
    const url = `https://publisher-devnet.walrus.space/v1/store?epochs=${epochs}&force=${force}`;

    // Send a PUT request to the external API
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: req.body, // Image file data
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    const responseData = await response.json();
    const blobId = responseData.newlyCreated.blobObject.blobId;
    console.log("Uploaded image with blobId:", blobId);
    return Response.json({
      blobId,
      error: "",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return Response.json({
      blobId: "",
      error: error,
    });
  }
}
