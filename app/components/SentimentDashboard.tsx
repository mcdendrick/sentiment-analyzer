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
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([
    { name: 'Product Quality', positive: 75, negative: 25 },
    { name: 'Customer Service', positive: 65, negative: 35 },
    { name: 'Pricing', positive: 45, negative: 55 },
    { name: 'Usability', positive: 85, negative: 15 },
  ]);

  useEffect(() => {
    // Generate realistic sample data for the past 7 days
    const initialHistoricalData: HistoricalDataPoint[] = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
      
      // Generate different patterns for different days
      let positive = 0, negative = 0, neutral = 0;
      
      if (i === 0) {
        // Today starts empty
        positive = 0;
        negative = 0;
        neutral = 0;
      } else if (i === 1) {
        // Yesterday had mostly positive feedback
        positive = 85;
        negative = 10;
        neutral = 5;
      } else if (i === 2) {
        // Day before was mixed
        positive = 45;
        negative = 40;
        neutral = 15;
      } else if (i === 3) {
        // Some negative feedback
        positive = 30;
        negative = 60;
        neutral = 10;
      } else if (i === 4) {
        // Mostly neutral day
        positive = 20;
        negative = 20;
        neutral = 60;
      } else if (i === 5) {
        // Good day
        positive = 70;
        negative = 20;
        neutral = 10;
      } else {
        // Week started okay
        positive = 50;
        negative = 30;
        neutral = 20;
      }

      return {
        date,
        positive,
        negative,
        neutral,
      };
    }).reverse();
    
    setHistoricalData(initialHistoricalData);
  }, []);

  // Add debug logging for state changes
  useEffect(() => {
    console.log('Historical Data:', historicalData);
  }, [historicalData]);

  useEffect(() => {
    console.log('Category Data:', categoryData);
  }, [categoryData]);

  const getSentimentColor = (sentiment: 'Positive' | 'Negative' | 'Neutral'): string => {
    switch (sentiment) {
      case 'Positive':
        return 'text-green-500';
      case 'Negative':
        return 'text-red-500';
      case 'Neutral':
        return 'text-yellow-500';
      default:
        return '';
    }
  };

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
      console.log('API Response:', data);
      setResults(data);
      
      // Update historical data with force refresh
      const today = new Date().toLocaleDateString();
      const confidenceValue = Math.round(data.confidence * 100);
      
      setHistoricalData(prev => {
        console.log('Previous Historical Data:', prev);
        const existingIndex = prev.findIndex(item => item.date === today);
        let newData;
        
        if (existingIndex === -1) {
          newData = [...prev.slice(1), {
            date: today,
            positive: data.overallSentiment === 'Positive' ? confidenceValue : 0,
            negative: data.overallSentiment === 'Negative' ? confidenceValue : 0,
            neutral: data.overallSentiment === 'Neutral' ? confidenceValue : 0,
          }];
        } else {
          newData = prev.map((item, index) => {
            if (index === existingIndex) {
              return {
                ...item,
                positive: data.overallSentiment === 'Positive' ? item.positive + confidenceValue : item.positive,
                negative: data.overallSentiment === 'Negative' ? item.negative + confidenceValue : item.negative,
                neutral: data.overallSentiment === 'Neutral' ? item.neutral + confidenceValue : item.neutral,
              };
            }
            return item;
          });
        }
        console.log('New Historical Data:', newData);
        return newData;
      });

      // Update category data with force refresh
      setCategoryData(prev => {
        console.log('Previous Category Data:', prev);
        const newData = prev.map(cat => {
          if (cat.name === data.category) {
            // Calculate new total and adjust percentages
            const currentTotal = cat.positive + cat.negative;
            const newConfidence = confidenceValue;
            
            let newPositive = cat.positive;
            let newNegative = cat.negative;
            
            if (data.overallSentiment === 'Positive') {
              // Add to positive, adjust both to maintain 100% total
              const adjustedPositive = ((currentTotal * cat.positive) + (100 * newConfidence)) / (currentTotal + 100);
              const adjustedNegative = 100 - adjustedPositive;
              newPositive = Math.round(adjustedPositive);
              newNegative = Math.round(adjustedNegative);
            } else if (data.overallSentiment === 'Negative') {
              // Add to negative, adjust both to maintain 100% total
              const adjustedNegative = ((currentTotal * cat.negative) + (100 * newConfidence)) / (currentTotal + 100);
              const adjustedPositive = 100 - adjustedNegative;
              newPositive = Math.round(adjustedPositive);
              newNegative = Math.round(adjustedNegative);
            }
            
            const newCat = {
              ...cat,
              positive: newPositive,
              negative: newNegative,
            };
            console.log('Updated Category:', cat.name, newCat);
            return newCat;
          }
          return cat;
        });
        console.log('New Category Data:', newData);
        return newData;
      });

      // Force a re-render by creating new array references
      setHistoricalData(current => [...current]);
      setCategoryData(current => [...current]);

      setFeedback('');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
                      <span className={`font-bold ${getSentimentColor(results.overallSentiment)}`}>
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
                    {results.keyPhrases && results.keyPhrases.length > 0 && (
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
                    )}
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
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke="#4CAF50" name="Positive" />
                      <Line type="monotone" dataKey="negative" stroke="#f44336" name="Negative" />
                      <Line type="monotone" dataKey="neutral" stroke="#FFA726" name="Neutral" />
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
                      <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="positive" fill="#4CAF50" name="Positive" />
                      <Bar dataKey="negative" fill="#f44336" name="Negative" />
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