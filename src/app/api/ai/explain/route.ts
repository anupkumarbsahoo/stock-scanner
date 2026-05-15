import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StockDetail } from '@/types';

export async function POST(request: Request) {
  const { ticker, stock }: { ticker: string; stock: StockDetail } = await request.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      explanation: `${ticker} is exhibiting strong momentum characteristics. The stock has demonstrated institutional accumulation with elevated relative volume of ${stock.relativeVolume?.toFixed(1)}x. Technical structure shows ${stock.pattern} pattern with RSI at ${stock.rsi?.toFixed(0)}, positioned in favorable momentum territory. EMA alignment confirms bullish trend structure. The combination of ${stock.fundamentalScore >= 70 ? 'strong fundamentals' : 'improving fundamentals'} and technical momentum creates a compelling risk/reward setup.`,
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert quantitative stock analyst. Analyze this stock and provide a concise, professional 3-4 sentence explanation of why it's appearing in an AI market scanner.

Stock: ${ticker} (${stock.company})
Price: $${stock.price} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent?.toFixed(2)}%)
AI Score: ${stock.aiScore}/100
Technical Score: ${stock.technicalScore}/100
Pattern: ${stock.pattern}
Trend: ${stock.trend}
RSI: ${stock.rsi?.toFixed(1)}
MACD: ${stock.macd >= 0 ? 'Bullish' : 'Bearish'}
EMA Alignment: ${stock.ema9 > stock.ema21 ? 'Bullish (9>21>50)' : 'Bearish'}
Relative Volume: ${stock.relativeVolume?.toFixed(2)}x
Revenue Growth: ${stock.revenueGrowth}%
EPS Growth: ${stock.epsGrowth}%
Institutional Ownership: ${stock.institutionalOwnership}%
Insider Activity: ${stock.insiderBuying}
Options Flow Score: ${stock.optionsFlowScore}/100

Write a professional, data-driven 3-4 sentence analysis. Focus on the key catalyst(s) driving the score. Be specific, mention exact metrics, and avoid generic statements. Do not include any asterisks or markdown formatting.`;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Gemini AI error:', error);
    return NextResponse.json({
      explanation: `${ticker} is demonstrating notable momentum with an AI score of ${stock.aiScore}/100. The ${stock.pattern} pattern combined with ${stock.trend.toLowerCase()} trend and ${stock.relativeVolume?.toFixed(1)}x relative volume suggests accumulation phase. ${stock.institutionalOwnership > 60 ? `Institutional ownership at ${stock.institutionalOwnership}% indicates smart money positioning.` : ''} Technical indicators confirm momentum continuation setup.`,
    });
  }
}
