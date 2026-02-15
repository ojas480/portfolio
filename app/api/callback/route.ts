import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: "http://localhost:3000/api/callback",
        }),
    });

    const data = await response.json();

    if (data.error) {
        return NextResponse.json(data, { status: 400 });
    }

    // Display the refresh token so the user can copy it
    return new NextResponse(
        `<html>
      <body style="background:#0c0c0c;color:#e8e8e8;font-family:monospace;padding:40px;">
        <h2>✅ Success! Copy this refresh token:</h2>
        <pre style="background:#1a1a1a;padding:16px;border-radius:8px;word-break:break-all;font-size:14px;">${data.refresh_token}</pre>
        <p style="color:#777;margin-top:16px;">Paste this back in the chat, then you can close this tab.</p>
      </body>
    </html>`,
        { headers: { "Content-Type": "text/html" } }
    );
}
