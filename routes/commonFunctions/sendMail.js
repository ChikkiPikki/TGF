async function sendMail(options) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        console.log(accessToken)
        // const refreshToken = await oAuth2Client.getRefreshToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: 'oauth2.googleapis.com',
            auth: {
                type: 'OAuth2',
                user: process.env.USER,
                clientId: process.env.OAUTH_CLIENTID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
        const result = await transport.sendMail(options);
        return result;
    }
    catch (error) {
        return error;
    }
}

module.exports = sendMail