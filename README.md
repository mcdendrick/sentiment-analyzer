# AI-Powered Sentiment Analysis Dashboard

A sophisticated sentiment analysis and customer feedback categorization system built with Next.js, TypeScript, and OpenAI. This project demonstrates advanced AI/ML capabilities in a real-world business context.

## Features

- 🤖 Real-time sentiment analysis using OpenAI's GPT models
- 📊 Interactive data visualizations with Recharts
- 🎯 Automatic feedback categorization
- 📈 Historical trend analysis
- 🎨 Modern UI with Tailwind CSS
- 🔍 Key phrase extraction
- 📱 Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- OpenAI API
- Tailwind CSS
- Recharts for data visualization
- Shadcn/ui for UI components

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sentiment-analyzer.git
cd sentiment-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sentiment-analyzer/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── components/        # React components
├── components/            # Shared UI components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utility functions
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## Future Enhancements

- [ ] Add database integration for persistent storage
- [ ] Implement user authentication
- [ ] Add more advanced analytics features
- [ ] Support for multiple languages
- [ ] Export functionality for reports
- [ ] Real-time collaboration features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
