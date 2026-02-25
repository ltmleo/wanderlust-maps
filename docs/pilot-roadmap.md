# Wanderlust Maps - Pilot Roadmap (Long-Term Plan)

This document outlines the long-term roadmap to evolve the current POC into a fully-functional, scalable pilot system over the coming months.

## Phase 1: Foundation, Database & Map Performance
**Goal:** Move away from static `.json` files to a scalable, performant map system and establish user accounts.

- [x] **Spatial Database:** Migrate mapping data (`regions.json`, `pois.json`) to a Spatial Database (e.g., Supabase with PostGIS).
- [x] **Dynamic Fetching:** Implement backend API for dynamic data fetching based on Map Bounding Box (load data as user pans/zooms, utilize geographic caching).
- [x] **Smart Clustering:** Setup Map Clustering on the frontend to improve render performance when zoomed out. *Crucial detail: The cluster icon should visually represent or highlight the most important POI in that region instead of just a generic number.*
- [x] **Auth & DB Setup:** Set up the Backend for User Accounts.
- [x] **Schema Design:** Design Database Schema (Users, Travel History, Saved Itineraries, Places, Reviews).

## Phase 2: Real Experience Layer (Social & History)
**Goal:** Make the map feel "alive" with real user experiences and social proof.

- [x] **User Authentication:** Implement functional Login/Signup flows.
- [x] **Digital Passport:** Build "My Travels" profile section where users can log previous trips and the dates they visited. Data feeds into personalized recommendations.
- [x] **Social Media Integration:** Integrate TikTok / Instagram Reels embeds into POI Modals to give a fast, real feel of the place.
- [x] **Real Tips:** Allow users to leave short "real" tips or reviews on places they've visited.

## Phase 3: AI Travel Agent & Itineraries
**Goal:** Provide guided, intelligent travel planning directly on the map.

- [ ] **LLM Integration:** Integrate an LLM API securely via backend routes (OpenAI/Anthropic).
- [ ] **AI Assistant UI:** Build the Chat/AI Interface component (`AIAssistant.tsx`) to answer contextual questions (e.g., "Is it too rainy in Thailand in July?").
- [ ] **Smart Itinerary Builder:** Implement the "Estimate Itinerary" feature based on user inputs (budget, time, region), generating day-by-day plans.
- [ ] **Contextualization:** Contextualize the AI responses with the map's rich data (weather scores, cost scores, real user tips).

## Phase 4: Monetization & Redirections
**Goal:** Generate revenue natively without hurting the user experience.

- [ ] **Native Ads:** Design non-intrusive ad placements within the Region Sidebar and POI Modals.
- [ ] **Affiliate Integration:** Integrate Booking Affiliates (e.g., Booking.com, Skyscanner) organically into the platform.
- [ ] **Contextual Actions:** Add "Book Now" / "Check Flights" call-to-action buttons in POI cards and generated itineraries.

## Phase 5: Pilot Polish & Launch
**Goal:** Ensure a smooth, bug-free experience for the pilot users.

- [ ] **End-to-End Testing:** Rigorous testing of the user journey, from discovery to itinerary generation to booking redirection.
- [ ] **Performance Optimizations:** Ensure lazy loading for videos and images, optimize map rendering on mobile.
- [ ] **Pilot Launch!**
