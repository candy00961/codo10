module.exports = {
  siteUrl: 'https://codo10.netlify.app', // Replace with your website URL
  generateRobotsTxt: true, // Generate robots.txt file
  sitemapSize: 7000, // Split large sitemaps into multiple files
  exclude: ['/server-sitemap.xml'], // Exclude specific routes
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};
