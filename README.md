# Forex Conversion Rate

A web application that provides real-time currency conversion rates using the [Finage Forex Data API](https://finage.co.uk).

## Screenshot

![Forex Conversion App Screenshot](/public/screenshot.png)

## Features

- Convert between multiple currencies.
- Swap source and target currencies.
- Caches exchange rates for improved performance.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/corsfix/forex-conversion
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the project root and add your API key:
   ```env
   NEXT_PUBLIC_API_KEY=your_finage_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

- `NEXT_PUBLIC_API_KEY`: Your Finage API key. Sign up at https://finage.co.uk to obtain one.
- The app uses a CORS proxy powered by [Corsfix](https://corsfix.com) to avoid CORS issues.

## Technologies

- Next.js (App Router, TypeScript)
- React (Client Components)
- Tailwind CSS

## License

MIT License
