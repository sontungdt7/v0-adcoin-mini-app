import { NextRequest, NextResponse } from 'next/server'

const ZEROX_API_URL = 'https://api.0x.org/swap/permit2/quote'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sellToken = searchParams.get('sellToken')
  const buyToken = searchParams.get('buyToken')
  const sellAmount = searchParams.get('sellAmount')
  const chainId = searchParams.get('chainId') || '8453'
  const taker = searchParams.get('taker')

  if (!sellToken || !buyToken || !sellAmount) {
    return NextResponse.json(
      { error: 'Missing required parameters: sellToken, buyToken, sellAmount' },
      { status: 400 }
    )
  }

  const apiKey = process.env.ZEROX_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: '0x API key not configured' },
      { status: 500 }
    )
  }

  try {
    const params = new URLSearchParams({
      sellToken,
      buyToken,
      sellAmount,
      chainId,
      ...(taker && { taker }),
    })

    const response = await fetch(`${ZEROX_API_URL}?${params.toString()}`, {
      headers: {
        '0x-api-key': apiKey,
        '0x-version': 'v2',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('0x API error:', errorText)
      return NextResponse.json(
        { error: `0x API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching 0x quote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote from 0x API' },
      { status: 500 }
    )
  }
}
