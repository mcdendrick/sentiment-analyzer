"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Loader2 } from "lucide-react";

interface AnalysisResult {
  overallSentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  category: string;
  keyPhrases: string[];
}

interface HistoricalDataPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface CategoryDataPoint {
  name: string;
  positive: number;
  negative: number;
}

const SentimentDashboard: React.FC = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);

  useEffect(() => {
    const mockHistoricalData: HistoricalDataPoint[] = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      positive: Math.floor(Math.random() * 30) + 50,
      negative: Math.floor(Math.random() * 20) + 10,
      neutral: Math.floor(Math.random() * 20) + 10,
    })).reverse();
    
    setHistoricalData(mockHistoricalData);
  }, []);

  const analyzeSentiment = async (text: string): Promise<void> => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze sentiment');
      }

      const data: AnalysisResult = await response.json();
      setResults(data);
      
      setHistoricalData(prev => {
        const newData = [...prev];
        if (newData.length >= 7) newData.shift();
        const dataPoint: HistoricalDataPoint = {
          date: new Date().toLocaleDateString(),
          positive: data.overallSentiment === 'Positive' ? Math.round(data.confidence * 100) : 0,
          negative: data.overallSentiment === 'Negative' ? Math.round(data.confidence * 100) : 0,
          neutral: data.overallSentiment === 'Neutral' ? Math.round(data.confidence * 100) : 0,
        };
        newData.push(dataPoint);
        return newData;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryData: CategoryDataPoint[] = [
    { name: 'Product Quality', positive: 65, negative: 35 },
    { name: 'Customer Service', positive: 75, negative: 25 },
    { name: 'Pricing', positive: 45, negative: 55 },
    { name: 'Usability', positive: 80, negative: 20 },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Customer Feedback Analysis Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Textarea
              className="min-h-[100px]"
              placeholder="Enter customer feedback here..."
              value={feedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
            />
            <Button
              className="mt-2"
              onClick={() => analyzeSentiment(feedback)}
              disabled={isLoading || !feedback.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Feedback'
              )}
            </Button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          {results && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Sentiment:</span>
                      <span className={`font-bold ${
                        results.overallSentiment === 'Positive' ? 'text-green-500' :
                        results.overallSentiment === 'Negative' ? 'text-red-500' :
                        'text-yellow-500'
                      }`}>
                        {results.overallSentiment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Confidence:</span>
                      <span>{(results.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span>{results.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">Key Phrases:</span>
                      <div className="mt-1">
                        {results.keyPhrases.map((phrase, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                          >
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke="#4CAF50" />
                      <Line type="monotone" dataKey="negative" stroke="#f44336" />
                      <Line type="monotone" dataKey="neutral" stroke="#FFA726" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="positive" fill="#4CAF50" name="Positive %" />
                      <Bar dataKey="negative" fill="#f44336" name="Negative %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentDashboard;