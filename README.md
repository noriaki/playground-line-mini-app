# LINE Mini App JS API Tester

A comprehensive testing platform for JavaScript standard APIs within the LINE Mini App environment. Built with Next.js and deployed on Vercel.

## Overview

This application helps developers understand how various JavaScript APIs behave within the LINE Mini App environment by providing dedicated test pages for each API or functionality.

## Features

- **Comprehensive API Testing**: Test various JavaScript APIs including:
  - Storage APIs (localStorage, sessionStorage, IndexedDB)
  - Device APIs (Geolocation, Device Orientation, Vibration)
  - Media APIs (Camera, Audio, Screen Capture)
  - Network APIs (Fetch, WebSocket, Server-Sent Events)
  - Browser APIs (Clipboard, Notification, Fullscreen, Page Visibility)

- **LINE Mini App Optimized**: 
  - Mobile-first responsive design
  - Touch-optimized interactions
  - Viewport and PWA configuration
  - LINE-specific utility functions

- **Real-time Testing**: Execute API tests and see results immediately
- **Detailed Results**: View success/failure status, returned data, and error messages
- **Search Functionality**: Quickly find specific APIs to test

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/line-mini-app-js-api-tester.git
cd line-mini-app-js-api-tester
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Follow the prompts to configure your deployment

### Environment Variables

Copy `.env.example` to `.env.local` and configure any necessary environment variables:

```bash
cp .env.example .env.local
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api-tests/         # API test pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── tests/            # API-specific test components
│   └── ...               # UI components
├── data/                  # Static data and configurations
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── public/               # Static assets
```

## Testing APIs

### Fullscreen API

The Fullscreen API test page includes:
- Support detection for Fullscreen API methods
- Document and element fullscreen requests
- Fullscreen options testing (navigationUI)
- Video element fullscreen
- Real-time status monitoring
- Error handling and reporting

Access the test at: `/api-tests/fullscreen`

## LINE Mini App Considerations

### Supported Features
- Touch-optimized UI components
- Mobile viewport configuration
- PWA manifest for app-like experience
- LINE user agent detection utilities

### Limitations
Some JavaScript APIs may have limited or no support in the LINE Mini App WebView:
- Certain permissions may be restricted
- Some browser-specific features may not be available
- Network requests might be subject to CORS policies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Maintain mobile-first responsive design
- Test all features in actual LINE Mini App environment
- Document any API limitations discovered
- Keep bundle size minimal for optimal performance

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.