// Static utility file with hardcoded mock data

const mockAuthData = {
    user: {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com'
    },
    token: 'mock-authentication-token'
};

const mockWishlistData = [
    { id: 1, destination: 'Paris', visited: false },
    { id: 2, destination: 'New York', visited: true },
    { id: 3, destination: 'Tokyo', visited: false }
];

module.exports = {
    mockAuthData,
    mockWishlistData
};