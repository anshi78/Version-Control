const { clerkClient, ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// In a real application, you might want to use the Express middleware from Clerk
// Ensure you have CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY in .env
// We'll use a simple mock for now if Clerk isn't configured, or the actual middleware.

const checkAuth = ClerkExpressRequireAuth({
    jwtKey: process.env.CLERK_JWT_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
});

// A wrapper to safely handle auth or mock it during local dev without keys
const authMiddleware = (req, res, next) => {
    if (process.env.SKIP_AUTH === 'true') {
        req.auth = { userId: "mock-user-123" };
        return next();
    }
    return checkAuth(req, res, next);
};

module.exports = { authMiddleware };
