-- Monolithic E-Commerce Seed Data

-- Insert Categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Electronics', 'electronics', 'Cutting-edge gadgets, computing gear, and smart hardware', 'cpu'),
('Audio', 'audio', 'High-fidelity headphones, wireless speakers, and sound gear', 'headphones'),
('Wearables', 'wearables', 'Smartwatches, fitness bands, and wearable technology', 'watch'),
('Home & Office', 'home-office', 'Modern ergonomic furniture, desk setups, and ambient lights', 'home'),
('Accessories', 'accessories', 'Durable backpacks, cables, mechanical keyboards, and peripherals', 'backpack')
ON CONFLICT (slug) DO NOTHING;

-- Insert Products
INSERT INTO products (name, slug, description, price, category_id, image_url, stock, rating, featured) VALUES
(
  'Aura Pro Wireless ANC Headphones',
  'aura-pro-wireless-headphones',
  'Premium spatial audio with hybrid active noise cancellation, 40-hour battery life, plush memory foam ear cushions, and ultra-low latency Bluetooth 5.3 streaming.',
  249.99,
  (SELECT id FROM categories WHERE slug = 'audio'),
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  25,
  4.9,
  true
),
(
  'Horizon Ultra 4K Smart Monitor 27"',
  'horizon-ultra-4k-monitor',
  '27-inch IPS UHD display with 99% DCI-P3 color accuracy, 144Hz refresh rate, USB-C 90W power delivery hub, and ultra-thin bezels for creative pros.',
  429.00,
  (SELECT id FROM categories WHERE slug = 'electronics'),
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
  14,
  4.8,
  true
),
(
  'Apex Tactile Mechanical Keyboard',
  'apex-tactile-mechanical-keyboard',
  'Custom hot-swappable tactile switches, CNC aluminum frame, PBT double-shot keycaps, RGB backlighting, and programmable rotary dial for productivity.',
  159.50,
  (SELECT id FROM categories WHERE slug = 'accessories'),
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  30,
  4.7,
  true
),
(
  'Titan Flow Smartwatch GPS',
  'titan-flow-smartwatch',
  'Aerospace-grade titanium chassis, AMOLED always-on screen, dual-frequency GPS, 14-day battery life, and complete health telemetry tracking.',
  299.00,
  (SELECT id FROM categories WHERE slug = 'wearables'),
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  18,
  4.9,
  true
),
(
  'ErgoComfort Mesh Task Chair',
  'ergocomfort-mesh-task-chair',
  'Adaptive lumbar support, breathable 3D elastomeric mesh, 4D adjustable armrests, and synchro-tilt mechanism engineered for all-day posture support.',
  349.99,
  (SELECT id FROM categories WHERE slug = 'home-office'),
  'https://images.unsplash.com/photo-1580481077195-c3a8245559ba?auto=format&fit=crop&w=800&q=80',
  8,
  4.6,
  false
),
(
  'Nomad Weatherproof Commuter Pack 24L',
  'nomad-weatherproof-commuter-pack',
  'Recycled Cordura nylon fabric, padded 16-inch laptop compartment, magnetic quick-access fidlock buckles, and ergonomic airflow back panel.',
  119.00,
  (SELECT id FROM categories WHERE slug = 'accessories'),
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  40,
  4.8,
  false
),
(
  'Pulse Studio High-Res Desktop Speakers',
  'pulse-studio-desktop-speakers',
  'Acoustically tuned wooden enclosures, bi-amplified 60W RMS drivers, optical & Bluetooth inputs, and dedicated subwoofer output for crisp desktop audio.',
  189.99,
  (SELECT id FROM categories WHERE slug = 'audio'),
  'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
  12,
  4.7,
  false
),
(
  'Zenith Minimalist LED Desk Light',
  'zenith-minimalist-led-desk-light',
  'Architectural aluminum bar with touch dimmer, 5 color temperature modes, glare-free asymmetrical optical light design, and integrated wireless charging base.',
  79.50,
  (SELECT id FROM categories WHERE slug = 'home-office'),
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  50,
  4.5,
  false
),
(
  'Vanguard Precision Optical Mouse',
  'vanguard-precision-optical-mouse',
  'Ergonomic thumb cradle, 26,000 DPI optical sensor, silent switches, dual-mode tri-device wireless connectivity, and 70-day rechargeable battery.',
  89.00,
  (SELECT id FROM categories WHERE slug = 'accessories'),
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
  22,
  4.8,
  true
),
(
  'AeroCharge 3-in-1 MagSafe Station',
  'aerocharge-3-in-1-magsafe-station',
  'Fast magnetic 15W wireless charging stand for Phone, Watch, and Earbuds simultaneously with weighted aluminum base and LED status indicators.',
  65.00,
  (SELECT id FROM categories WHERE slug = 'electronics'),
  'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80',
  35,
  4.6,
  false
),
(
  'PureSound True Wireless Earbuds',
  'puresound-true-wireless-earbuds',
  'IPX7 waterproof rating, active environmental noise cancellation for calls, compact wireless charging case, and 32 total hours of playback.',
  99.99,
  (SELECT id FROM categories WHERE slug = 'audio'),
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  28,
  4.7,
  false
),
(
  'SolidOak Ergonomic Laptop Riser',
  'solidoak-ergonomic-laptop-riser',
  'Handcrafted solid oak wood stand elevating laptop screen to eye level, improving heat ventilation and reducing neck strain during long coding sessions.',
  49.00,
  (SELECT id FROM categories WHERE slug = 'home-office'),
  'https://images.unsplash.com/photo-1616353071588-708dcff912e2?auto=format&fit=crop&w=800&q=80',
  19,
  4.9,
  false
)
ON CONFLICT (slug) DO NOTHING;

