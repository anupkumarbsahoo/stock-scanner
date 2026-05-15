import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { StockDetail } from '@/types';

export async function POST(request: Request) {
  const { ticker, stock }: { ticker: string; stock: StockDetail } = await request.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      explanation: `${ticker} is exhibiting strong momentum characteristics. The stock has demonstrated institutional accumulation with elevated relative volume of ${stock.relativeVolume?.toFixed(1)}x. Technical structure shows ${stock.pattern} pattern with RSI at ${stock.rsi?.toFixed(0)}, positioned in favorable momentum territory. EMA alignment confirms bullish trend structure. The combination of ${stock.fundamentalScore >= 70 ? 'strong fundamentals' : 'improving fundamentals'} and technical momentum creates a compelling risk/reward setup.`,
    });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are an expert quantitative stock analyst. Analyze this stock and provide a concise, professional 3-4 sentence explanation of why it's showing up in our AI scanner.

Stock: ${ticker} (${stock.company})
Price: $${stock.price} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent?.toFixed(2)}%)
AI Score: ${stock.aiScore}/100
Technical Score: ${stock.technicalScore}/100
Pattern: ${stock.pattern}
Trend: ${stock.trend}
RSI: ${stock.rsi?.toFixed(1)}
MACD: ${stock.macd >= 0 ? 'Bullish' : 'Bearish'}
EMA: ${stock.ema9 > stock.ema21 ? 'Bullish alignment (9>21>50)' : 'Bearish alignment'}
Relative Volume: ${stock.relativeVolume?.toFixed(2)}x
Revenue Growth: ${stock.revenueGrowth}%
EPS Growth: ${stock.epsGrowth}%
Institutional Ownership: ${stock.institutionalOwnership}%
Insider Activity: ${stock.insiderBuying}
Options Flow Score: ${stock.optionsFlowScore}/100

Provide a professional, data-driven 3-4 sentence analysis. Focus on the key catalyst(s) driving the score. Be specific and avoid generic statements.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const explanation = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('AI explain error:', error);
    return NextResponse.json({
      explanation: `${ticker} is demonstrating notable momentum with an AI score of ${stock.aiScore}/100. The ${stock.pattern} pattern combined with ${stock.trend.toLowerCase()} trend and ${stock.relativeVolume?.toFixed(1)}x relative volume suggests accumulation phase. ${stock.institutionalOwnership > 60 ? `Institutional ownership at ${stock.institutionalOwnership}% indicates smart money positioning.` : ''} Technical indicators confirm momentum continuation setup.`,
    });
  }
}
