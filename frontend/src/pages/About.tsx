import { useEffect } from 'react'
import { trackScreenView } from '../services/events'

export default function About() {
  useEffect(() => { trackScreenView('about') }, [])
  return (
    <div className="min-h-screen bg-bg-grey">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-20 py-16 sm:py-20">
        {/* Logo */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-3.5">
            <img src="/logo-icon.png" srcSet="/logo-icon@2x.png 2x" alt="Market Compare" style={{ width: 'auto', height: 72 }} />
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.05, color: '#141414' }} className="m-0">
                Market<br />Compare
              </h1>
              <p style={{ fontSize: 11, color: '#555' }} className="mt-0.5">Know before you go</p>
            </div>
          </div>
        </div>

        {/* Article */}
        <article className="text-2xl leading-[38px] text-black space-y-6">
          <p>
            <strong>About MarketCompare</strong> We built this because the market should work for the shopper — not against them. Every day, millions of Nigerian families leave home to buy food without knowing what prices await them at the market. They spend money on transport, arrive at Bodija only to discover beans are cheaper at Dugbe, and return home having overpaid — or worse, having bought less than they needed because the budget ran out. This is not a small inconvenience. For families already stretching every naira, it is a real and recurring cost. MarketCompare was built to fix that.
          </p>

          <p>
            <strong>What We Are</strong> MarketCompare is a free, crowd-sourced food price comparison platform built specifically for Nigerian shoppers, students, and households managing tight budgets. We give you live, community-verified prices for everyday food items — rice, beans, tomatoes, garri, eggs, cooking oil — across multiple markets in your area, so you can compare before you travel. No guesswork. No wasted trips. Just accurate, up-to-date prices from people who were just where you are about to go.
          </p>

          <p>
            <strong>How It Works</strong> MarketCompare runs on the collective knowledge of everyday shoppers and market vendors. When someone buys rice at Bodija Market, they can submit the price in seconds. That price immediately becomes useful to the next person planning their shopping trip. The more people contribute, the more accurate and valuable the platform becomes for everyone. Every price on MarketCompare is: Crowd-submitted — entered by real shoppers and vendors in real time; Trend-tracked — so you can see whether a price is rising or falling, not just what it is today; Flaggable — if a price looks wrong or outdated, any user can report it for review. We do not scrape data from supermarkets or rely on government price indices. We rely on the community — because the community is always closest to the truth.
          </p>

          <p>
            <strong>Who We Built This For</strong> MarketCompare was designed first and foremost for the budget-conscious household — the mother planning a week of meals, the student buying provisions, the small chop vendor sourcing ingredients. If you have ever arrived at a market and felt the frustration of discovering you came to the wrong one, this platform is for you. We also built with accessibility in mind. MarketCompare works on basic Android phones, runs on low data, and uses plain, simple language throughout, because the people who need this most should never be excluded by the technology meant to serve them.
          </p>

          <p>
            <strong>Our Commitment</strong> We believe price transparency is not a luxury. It is a basic tool for financial dignity — the ability to make informed decisions about how you spend your money, especially when every naira counts. MarketCompare is free. It will remain free. We will never charge shoppers to access price information that was contributed by the community for the community. As we grow, we are committed to: Expanding market coverage across more cities and states; Improving the accuracy and freshness of price data; Keeping the platform simple enough for anyone to use; Building trust through transparency, not just technology.
          </p>

          <p>
            <strong>Built in Nigeria, For Nigeria</strong> MarketCompare was conceived and built in Ibadan, a city of markets, of commerce, of people who know the value of showing up prepared. We understand the terrain because we live it. This is not a foreign solution adapted for Nigeria. It was imagined here, for the specific realities of how Nigerians shop, budget, and survive. We are proud of that — and we are just getting started.
          </p>

          <p>
            <strong>Join the Community</strong> MarketCompare grows every time someone submits a price, flags a wrong entry, or simply tells a neighbour about it. You do not need to be a developer or a data scientist to contribute. You just need to have been to the market recently. Submit a price today and help someone shop smarter tomorrow.
          </p>
        </article>

        {/* Separator */}
        <hr className="border-t border-black my-16 max-w-[769px]" />

        {/* Contact */}
        <p className="text-2xl leading-[38px] text-black">
          <strong>Have questions, suggestions, or want to partner with us?</strong> Reach us at info@marketcompare.ng or call +234 913 9444 569 &middot; Ibadan, Nigeria
        </p>
      </div>
    </div>
  )
}
