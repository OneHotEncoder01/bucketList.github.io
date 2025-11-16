const fs = require('fs');
const path = require('path');

const boardId = 'life-quest-achievements';
const ROOT_ID = 'root';

const themes = {
  overview: { color: '#fbbf24', icon: '🌟' },
  travel: { color: '#38bdf8', icon: '🌍' },
  adventure: { color: '#f97316', icon: '🧗' },
  skills: { color: '#a855f7', icon: '🎓' },
  culture: { color: '#facc15', icon: '🎭' },
  milestones: { color: '#ef4444', icon: '💖' },
  soul: { color: '#22c55e', icon: '🧘' }
};

const tree = {
  id: ROOT_ID,
  label: 'Grand Adventure Log',
  description: 'Unlock every life quest across travel, mastery, culture, service, and soul.',
  status: 'tracking',
  rarity: 'legendary',
  reward: 'Life Mastery Emblem',
  icon: themes.overview.icon,
  tags: ['overview'],
  theme: 'overview',
  children: [
    {
      id: 'pillar-travel',
      label: 'Travel & Nature Wonders',
      description: 'Complete iconic natural marvel quests around the globe.',
      rarity: 'legendary',
      reward: 'Nomad’s Compass',
      icon: themes.travel.icon,
      tags: ['pillar', 'travel'],
      theme: 'travel',
      children: [
        {
          id: 'travel-natural-marvels',
          label: 'Natural Marvels',
          rarity: 'epic',
          description: 'Chase Earth’s rarest sky and sea spectacles.',
          tags: ['travel', 'nature'],
          children: [
            { id: 'travel-northern-lights', label: 'See the Northern Lights', description: 'Witness aurora borealis in Norway, Iceland, or Finland.', rarity: 'rare', reward: 'Aurora Cloak', icon: '🌌', tags: ['travel', 'nature', 'cold'], progressTotal: 1 },
            { id: 'travel-bioluminescent-bay', label: 'Witness Bioluminescence', description: 'Kayak glowing waters in Puerto Rico or the Maldives.', rarity: 'rare', reward: 'Starlit Tide Orb', icon: '✨', tags: ['travel', 'nature'], progressTotal: 1 },
            { id: 'travel-victoria-falls', label: 'See Victoria Falls', description: 'Stand in the spray of Mosi-oa-Tunya on the Zambezi.', rarity: 'rare', reward: 'Spraywalker Medal', icon: '💦', tags: ['travel', 'waterfall'], progressTotal: 1 },
            { id: 'travel-antarctica-cruise', label: 'Cruise to Antarctica', description: 'Embark on an expedition to the Antarctic Peninsula.', rarity: 'legendary', reward: 'Polar Explorer Flag', icon: '🧊', tags: ['travel', 'polar'], progressTotal: 1 }
          ]
        },
        {
          id: 'travel-heritage-treasures',
          label: 'Heritage Treasures',
          rarity: 'epic',
          description: 'Walk storied paths and sunrise citadels.',
          tags: ['travel', 'heritage'],
          children: [
            { id: 'travel-machu-picchu', label: 'Hike to Machu Picchu', description: 'Complete the trek to the Incan citadel in Peru.', rarity: 'rare', reward: 'Incan Trailband', icon: '🏛️', tags: ['travel', 'hiking', 'heritage'], progressTotal: 1 },
            { id: 'travel-great-wall', label: 'Walk the Great Wall', description: 'Hike along China’s legendary fortification.', rarity: 'uncommon', reward: 'Wall Walker Medal', icon: '🧱', tags: ['travel', 'history'], progressTotal: 1 },
            { id: 'travel-taj-mahal', label: 'Sunrise at the Taj Mahal', description: 'Watch dawn break over the Taj Mahal.', rarity: 'rare', reward: 'Marble Dawn Charm', icon: '🕌', tags: ['travel', 'heritage'], progressTotal: 1 },
            { id: 'travel-camino-norte', label: 'Walk Camino del Norte', description: 'Complete Spain’s coastal pilgrimage path.', rarity: 'epic', reward: 'Pilgrim Shell', icon: '🪪', tags: ['travel', 'pilgrimage'], progressTotal: 1 }
          ]
        },
        {
          id: 'travel-ecosystems',
          label: 'Remote Ecosystems',
          rarity: 'epic',
          description: 'Step into wild biomes and biodiversity hotspots.',
          tags: ['travel', 'wildlife'],
          children: [
            { id: 'travel-amazon', label: 'Explore the Amazon Rainforest', description: 'Immerse yourself in Amazon biodiversity with a local guide.', rarity: 'rare', reward: 'Jungle Pathfinder Token', icon: '🌳', tags: ['travel', 'rainforest'], progressTotal: 1 },
            { id: 'travel-safari-big-five', label: 'See the Big Five', description: 'Spot the Big Five on an African safari.', rarity: 'rare', reward: 'Safari Ranger Badge', icon: '🦁', tags: ['wildlife', 'travel'], progressTotal: 1 },
            { id: 'travel-greenland-fjords', label: 'Kayak Greenland’s Fjords', description: 'Paddle iceberg-lined fjords in Greenland.', rarity: 'epic', reward: 'Glacier Paddle Token', icon: '🛶', tags: ['travel', 'kayak'], progressTotal: 1 },
            { id: 'travel-socotra', label: 'Visit Socotra Island', description: 'Explore Yemen’s dragon blood trees and surreal landscapes.', rarity: 'legendary', reward: 'Dragon’s Blood Vial', icon: '🪴', tags: ['travel', 'biodiversity'], progressTotal: 1 }
          ]
        },
        {
          id: 'travel-cultural-immersions',
          label: 'Cultural Immersions',
          rarity: 'epic',
          description: 'Live among cultures shaped by seasons and sands.',
          tags: ['travel', 'culture'],
          children: [
            { id: 'travel-cherry-blossoms', label: 'See Sakura in Japan', description: 'Witness cherry blossoms in full bloom across Japan.', rarity: 'uncommon', reward: 'Hanami Fan', icon: '🌸', tags: ['travel', 'seasons'], progressTotal: 1 },
            { id: 'travel-gobi-camp', label: 'Camp in the Gobi Desert', description: 'Spend nights under Mongolian desert skies.', rarity: 'rare', reward: 'Nomad Bedroll', icon: '🏜️', tags: ['travel', 'desert'], progressTotal: 1 },
            { id: 'travel-faroe-islands', label: 'Explore the Faroe Islands', description: 'Roam the dramatic cliffs and turf villages of the Faroes.', rarity: 'rare', reward: 'North Atlantic Pennant', icon: '🪶', tags: ['travel', 'islands'], progressTotal: 1 },
            { id: 'travel-dead-sea', label: 'Float in the Dead Sea', description: 'Experience the buoyant waters of the Dead Sea.', rarity: 'uncommon', reward: 'Mineral Salts Satchel', icon: '🧂', tags: ['travel', 'wellness'], progressTotal: 1 }
          ]
        }
      ]
    },
    {
      id: 'pillar-adventure',
      label: 'Physical Challenges & Outdoor Adventures',
      description: 'Face endurance epics, aerial thrills, and survival mastery.',
      rarity: 'legendary',
      reward: 'Trailblazer’s Crest',
      icon: themes.adventure.icon,
      tags: ['pillar', 'adventure'],
      theme: 'adventure',
      children: [
        {
          id: 'adventure-expeditions',
          label: 'Global Expeditions',
          rarity: 'epic',
          description: 'High altitude summits and desert odysseys.',
          tags: ['adventure', 'expedition'],
          children: [
            { id: 'physical-eight-thousand', label: 'Climb an 8,000m Peak', description: 'Summit a guided eight-thousander in the Himalaya or Karakoram.', rarity: 'mythic', reward: 'Summit Crown', icon: '🏔️', tags: ['adventure', 'mountaineering'], progressTotal: 1 },
            { id: 'physical-world-mountain', label: 'Summit an Iconic Mountain', description: 'Reach the top of Fuji, Kilimanjaro, Toubkal, or Everest Base Camp.', rarity: 'legendary', reward: 'Peak Conqueror Patch', icon: '🧗', tags: ['adventure', 'mountains'], progressTotal: 1 },
            { id: 'physical-desert-trek', label: 'Desert Trek Expedition', description: 'Complete a multi-day trek in the Sahara or Wadi Rum.', rarity: 'epic', reward: 'Dune Walker Token', icon: '🏜️', tags: ['adventure', 'desert'], progressTotal: 1 }
          ]
        },
        {
          id: 'adventure-endurance',
          label: 'Endurance Feats',
          rarity: 'epic',
          description: 'Push lungs, legs, and oceans.',
          tags: ['adventure', 'endurance'],
          children: [
            { id: 'physical-english-channel', label: 'Swim the English Channel', description: 'Complete a solo or relay cross-channel swim.', rarity: 'legendary', reward: 'Channel Swimmer Medal', icon: '🏊', tags: ['endurance', 'swim'], progressTotal: 1 },
            { id: 'physical-marathon', label: 'Run a Marathon', description: 'Finish a marathon or ultramarathon.', rarity: 'epic', reward: 'Endurance Laurel', icon: '🏅', tags: ['running', 'endurance'], progressTotal: 1 },
            { id: 'physical-long-distance-cycle', label: 'Cycle a Legendary Route', description: 'Ride a long-distance path like the Danube Trail or Pacific Coast.', rarity: 'epic', reward: 'Touring Wheel Charm', icon: '🚴', tags: ['cycling', 'endurance'], progressTotal: 1 }
          ]
        },
        {
          id: 'adventure-adrenaline',
          label: 'Adrenaline & Aerial',
          rarity: 'rare',
          description: 'Leap, plunge, and drift above wonders.',
          tags: ['adventure', 'adrenaline'],
          children: [
            { id: 'physical-skydive', label: 'Skydive from 15,000 ft', description: 'Leap from the sky above iconic landscapes.', rarity: 'rare', reward: 'Skyfall Wings', icon: '🪂', tags: ['adrenaline'], progressTotal: 1 },
            { id: 'physical-bungee', label: 'Bungee Jump Iconic Site', description: 'Take a plunge from a world-famous bungee platform.', rarity: 'uncommon', reward: 'Bungee Cord Charm', icon: '🪢', tags: ['adrenaline'], progressTotal: 1 },
            { id: 'physical-hot-air-balloon', label: 'Hot Air Balloon Voyage', description: 'Soar over Cappadocia, Serengeti, or Bagan.', rarity: 'uncommon', reward: 'Sky Lantern Badge', icon: '🎈', tags: ['travel', 'sky'], progressTotal: 1 }
          ]
        },
        {
          id: 'adventure-survival',
          label: 'Survival Mastery',
          rarity: 'epic',
          description: 'Earn fieldcraft and solo wilderness resilience.',
          tags: ['adventure', 'survival'],
          children: [
            { id: 'physical-whitewater', label: 'Raft Class IV/V Rapids', description: 'Navigate high-grade white water.', rarity: 'epic', reward: 'River Runner Crest', icon: '🚣', tags: ['adventure', 'water'], progressTotal: 1 },
            { id: 'physical-national-park-week', label: 'Camp a National Park Week', description: 'Live in a national park for seven days.', rarity: 'rare', reward: 'Park Ranger Patch', icon: '🏕️', tags: ['outdoors', 'camping'], progressTotal: 1 },
            { id: 'physical-solitude-night', label: 'Night Alone in Wilderness', description: 'Spend a solo night in the wild.', rarity: 'rare', reward: 'Solitude Stone', icon: '🌌', tags: ['survival', 'mindfulness'], progressTotal: 1 },
            { id: 'physical-survival-course', label: 'Complete Survival Course', description: 'Finish a multi-day survival or bushcraft course.', rarity: 'rare', reward: 'Fieldcraft Badge', icon: '🧭', tags: ['survival', 'skills'], progressTotal: 1 }
          ]
        }
      ]
    },
    {
      id: 'pillar-skills',
      label: 'Mastery & Crafts',
      description: 'Gather new disciplines, craftsmanship, and mental artistry.',
      rarity: 'legendary',
      reward: 'Artisan’s Ledger',
      icon: themes.skills.icon,
      tags: ['pillar', 'learning'],
      theme: 'skills',
      children: [
        {
          id: 'skills-communication',
          label: 'Communication Arts',
          rarity: 'epic',
          description: 'Voice, words, and human connection.',
          tags: ['learning', 'communication'],
          children: [
            { id: 'skills-new-language', label: 'Master a New Language', description: 'Learn a language and use it abroad.', rarity: 'epic', reward: 'Polyglot Pin', icon: '🗣️', tags: ['learning', 'language'], progressTotal: 1 },
            { id: 'skills-sign-language', label: 'Learn Sign Language', description: 'Hold a full conversation in sign language.', rarity: 'rare', reward: 'Bridge of Hands Token', icon: '🤟', tags: ['language', 'inclusion'], progressTotal: 1 },
            { id: 'skills-article-publish', label: 'Publish a Feature Article', description: 'Pitch, write, and publish an article in a major outlet.', rarity: 'rare', reward: 'Byline Badge', icon: '📰', tags: ['writing', 'communication'], progressTotal: 1 }
          ]
        },
        {
          id: 'skills-performance',
          label: 'Music & Performance',
          rarity: 'epic',
          description: 'Create ovations and mentor others.',
          tags: ['learning', 'performance'],
          children: [
            { id: 'skills-musical-instrument', label: 'Master an Instrument', description: 'Perform fluently on a musical instrument.', rarity: 'rare', reward: 'Virtuoso Ribbon', icon: '🎻', tags: ['music', 'learning'], progressTotal: 1 },
            { id: 'skills-standup-comedy', label: 'Perform Stand-Up Comedy', description: 'Write a stand-up set and perform it live.', rarity: 'epic', reward: 'Spotlight Mic', icon: '🎤', tags: ['performance', 'courage'], progressTotal: 1 },
            { id: 'skills-lead-workshop', label: 'Lead a Masterclass', description: 'Teach a workshop to 20+ attendees.', rarity: 'epic', reward: 'Mentor Crest', icon: '🎓', tags: ['teaching', 'leadership'], progressTotal: 1 }
          ]
        },
        {
          id: 'skills-crafts',
          label: 'Craftsmanship & Maker',
          rarity: 'epic',
          description: 'Shape wood, metal, ink, and garden soil.',
          tags: ['learning', 'craft'],
          children: [
            { id: 'skills-woodworking', label: 'Craft a Woodworking Project', description: 'Build a piece of furniture from raw lumber.', rarity: 'rare', reward: 'Workshop Mark', icon: '🪚', tags: ['craft', 'maker'], progressTotal: 1 },
            { id: 'skills-blacksmithing', label: 'Forge Metal Art', description: 'Complete a blacksmithing intensive and forge a usable item.', rarity: 'rare', reward: 'Forgefire Token', icon: '⚒️', tags: ['craft', 'maker'], progressTotal: 1 },
            { id: 'skills-calligraphy', label: 'Learn Calligraphy', description: 'Create a calligraphed piece to gift or display.', rarity: 'uncommon', reward: 'Ink Artisan Seal', icon: '🖋️', tags: ['art', 'craft'], progressTotal: 1 },
            { id: 'skills-home-garden', label: 'Design a Home Garden', description: 'Grow a thriving edible or botanical garden for a season.', rarity: 'uncommon', reward: 'Greenkeeper Badge', icon: '🌿', tags: ['sustainability', 'craft'], progressTotal: 1 }
          ]
        },
        {
          id: 'skills-innovation',
          label: 'Science & Innovation',
          rarity: 'epic',
          description: 'Pilot airspace and prototype the future.',
          tags: ['learning', 'innovation'],
          children: [
            { id: 'skills-pilot-license', label: 'Earn a Pilot License', description: 'Complete flight school and earn a private pilot certificate.', rarity: 'legendary', reward: 'Sky Captain Wings', icon: '✈️', tags: ['aviation', 'learning'], progressTotal: 1 },
            { id: 'skills-3d-printing', label: 'Prototype with 3D Printing', description: 'Design and print a functional prototype.', rarity: 'rare', reward: 'Makerspace Badge', icon: '🧱', tags: ['tech', 'maker'], progressTotal: 1 },
            { id: 'skills-chess-tournament', label: 'Compete in a Chess Tournament', description: 'Train and enter a rated chess tournament.', rarity: 'rare', reward: 'Grandmaster Pin', icon: '♟️', tags: ['strategy', 'competition'], progressTotal: 1 }
          ]
        },
        {
          id: 'skills-service',
          label: 'Service & Healing Arts',
          rarity: 'epic',
          description: 'Serve, soothe, and guide.',
          tags: ['learning', 'service'],
          children: [
            { id: 'skills-first-aid', label: 'Certify in First Aid', description: 'Complete first aid and CPR certification and keep it current.', rarity: 'uncommon', reward: 'Responder Patch', icon: '🩹', tags: ['health', 'service'], progressTotal: 1 },
            { id: 'skills-meditation-teacher', label: 'Meditation Teacher Training', description: 'Complete a 200-hour mindfulness or meditation teacher course.', rarity: 'epic', reward: 'Awakened Guide Seal', icon: '🧘', tags: ['mindfulness', 'teaching'], progressTotal: 1 },
            { id: 'skills-music-therapy', label: 'Train in Music Therapy', description: 'Complete certification in music therapy.', rarity: 'epic', reward: 'Harmony Lyre', icon: '🎶', tags: ['healing', 'music'], progressTotal: 1 }
          ]
        }
      ]
    },
    {
      id: 'pillar-culture',
      label: 'Cultural & Artistic Experiences',
      description: 'Immerse yourself in global celebrations, arts, and heritage.',
      rarity: 'legendary',
      reward: 'Cultural Laurels',
      icon: themes.culture.icon,
      tags: ['pillar', 'culture'],
      theme: 'culture',
      children: [
        {
          id: 'culture-world-festivals',
          label: 'World Festivals',
          rarity: 'epic',
          description: 'Dance with the calendar’s grandest gatherings.',
          tags: ['culture', 'festival'],
          children: [
            { id: 'culture-rio-carnival', label: 'Celebrate Rio Carnival', description: 'March with a samba school during Rio’s Carnival.', rarity: 'legendary', reward: 'Samba Sash', icon: '🎉', tags: ['festival', 'brazil'], progressTotal: 1 },
            { id: 'culture-gion-matsuri', label: 'Attend Gion Matsuri', description: 'Experience Kyoto’s historic Gion Matsuri parade.', rarity: 'rare', reward: 'Yamaboko Charm', icon: '🎐', tags: ['festival', 'japan'], progressTotal: 1 },
            { id: 'culture-diwali', label: 'Illuminate Diwali', description: 'Share Diwali festivities with a host family in India.', rarity: 'rare', reward: 'Lamp of Light', icon: '🪔', tags: ['festival', 'india'], progressTotal: 1 },
            { id: 'culture-day-of-the-dead', label: 'Honor Día de Muertos', description: 'Join a Day of the Dead celebration in Oaxaca.', rarity: 'rare', reward: 'Calavera Mask', icon: '💀', tags: ['festival', 'mexico'], progressTotal: 1 },
            { id: 'culture-edinburgh-fringe', label: 'Explore Edinburgh Fringe', description: 'Immerse in the world’s largest arts festival.', rarity: 'rare', reward: 'Fringe Playbill', icon: '🎙️', tags: ['festival', 'uk'], progressTotal: 1 },
            { id: 'culture-sundance-film', label: 'Attend Sundance Film Festival', description: 'Watch premieres and panels at Sundance.', rarity: 'epic', reward: 'Laurel Badge', icon: '🎬', tags: ['film', 'usa'], progressTotal: 1 }
          ]
        },
        {
          id: 'culture-iconic-arts',
          label: 'Iconic Arts',
          rarity: 'epic',
          description: 'Collect opening nights, orchestras, and jazz legends.',
          tags: ['culture', 'arts'],
          children: [
            { id: 'culture-broadway-premiere', label: 'See a Broadway Premiere', description: 'Attend opening night of a Broadway production.', rarity: 'epic', reward: 'Playbill Keepsake', icon: '🎟️', tags: ['theatre', 'usa'], progressTotal: 1 },
            { id: 'culture-vienna-philharmonic', label: 'Hear the Vienna Philharmonic', description: 'Attend a live performance in Vienna.', rarity: 'rare', reward: 'Maestro Baton', icon: '🎼', tags: ['music', 'austria'], progressTotal: 1 },
            { id: 'culture-la-scala-opera', label: 'Night at La Scala', description: 'Dress for an opera evening at Teatro alla Scala.', rarity: 'epic', reward: 'Opera Fan', icon: '🎭', tags: ['opera', 'italy'], progressTotal: 1 },
            { id: 'culture-blue-note-jazz', label: 'Record at Blue Note', description: 'Sit in on a live jazz recording session in NYC.', rarity: 'legendary', reward: 'Blue Note Vinyl', icon: '🎷', tags: ['music', 'usa'], progressTotal: 1 },
            { id: 'culture-literary-festival', label: 'Lead a Literary Session', description: 'Present at an international literary festival.', rarity: 'epic', reward: 'Author’s Quill', icon: '✒️', tags: ['literature', 'global'], progressTotal: 1 }
          ]
        },
        {
          id: 'culture-heritage',
          label: 'Heritage & History',
          rarity: 'epic',
          description: 'Walk museums, rituals, and preserved memory.',
          tags: ['culture', 'heritage'],
          children: [
            { id: 'culture-louvre-masterpieces', label: 'Study Louvre Masterpieces', description: 'Spend a day with a curator exploring the Louvre.', rarity: 'rare', reward: 'Curator’s Token', icon: '🖼️', tags: ['art', 'france'], progressTotal: 1 },
            { id: 'culture-kyoto-tea', label: 'Perform a Tea Ceremony', description: 'Train in a traditional Kyoto tea ceremony house.', rarity: 'rare', reward: 'Tea Whisk Seal', icon: '🍵', tags: ['ritual', 'japan'], progressTotal: 1 },
            { id: 'culture-silk-road-caravan', label: 'Trace the Silk Road', description: 'Follow a historic Silk Road section with local guides.', rarity: 'legendary', reward: 'Caravan Compass', icon: '🧭', tags: ['history', 'asia'], progressTotal: 1 },
            { id: 'culture-harbin-ice', label: 'Roam Harbin Ice Festival', description: 'Wander among illuminated ice sculptures in Harbin.', rarity: 'rare', reward: 'Ice Lantern', icon: '🧊', tags: ['festival', 'china'], progressTotal: 1 },
            { id: 'culture-cape-coast-storytelling', label: 'Storytelling at Cape Coast Castle', description: 'Help preserve oral histories in Ghana.', rarity: 'epic', reward: 'Heritage Beads', icon: '📜', tags: ['heritage', 'ghana'], progressTotal: 1 }
          ]
        }
      ]
    },
    {
      id: 'pillar-milestones',
      label: 'Personal Milestones & Giving Back',
      description: 'Build legacy through service, creation, and stewardship.',
      rarity: 'legendary',
      reward: 'Legacy Banner',
      icon: themes.milestones.icon,
      tags: ['pillar', 'service'],
      theme: 'milestones',
      children: [
        {
          id: 'milestones-impact',
          label: 'Impact & Philanthropy',
          rarity: 'epic',
          description: 'Fund futures and gift generosity.',
          tags: ['service', 'legacy'],
          children: [
            { id: 'milestones-donate-year-income', label: 'Gift a Year of Income', description: 'Donate an entire year’s salary to causes you love.', rarity: 'mythic', reward: 'Altruist Halo', icon: '💝', tags: ['philanthropy', 'service'], progressTotal: 1 },
            { id: 'milestones-scholarship-fund', label: 'Create a Scholarship Fund', description: 'Establish a scholarship that funds at least three students.', rarity: 'legendary', reward: 'Scholarship Seal', icon: '🎓', tags: ['education', 'legacy'], progressTotal: 3 },
            { id: 'milestones-sponsor-student', label: 'Sponsor a Student', description: 'Fund a student’s complete tuition.', rarity: 'legendary', reward: 'Guardian Seal', icon: '🎒', tags: ['education', 'service'], progressTotal: 1 }
          ]
        },
        {
          id: 'milestones-community',
          label: 'Community Leadership',
          rarity: 'epic',
          description: 'Host movements and mentor many.',
          tags: ['community', 'leadership'],
          children: [
            { id: 'milestones-start-business', label: 'Launch a Purposeful Venture', description: 'Start a mission-driven business or non-profit.', rarity: 'epic', reward: 'Founder Crest', icon: '🚀', tags: ['entrepreneurship', 'impact'], progressTotal: 1 },
            { id: 'milestones-mentor-ten', label: 'Mentor Ten People', description: 'Guide ten mentees to reach their goals.', rarity: 'rare', reward: 'Mentor Laurels', icon: '🤝', tags: ['service', 'leadership'], progressTotal: 10 },
            { id: 'milestones-community-festival', label: 'Host a Community Festival', description: 'Organize a cultural or service festival for 1,000 attendees.', rarity: 'epic', reward: 'Community Banner', icon: '🎪', tags: ['community', 'service'], progressTotal: 1 }
          ]
        },
        {
          id: 'milestones-creative-legacy',
          label: 'Creative Legacy',
          rarity: 'epic',
          description: 'Publish, curate, and archive stories that last.',
          tags: ['legacy', 'creation'],
          children: [
            { id: 'milestones-publish-book', label: 'Publish a Book', description: 'Write and publish a book that reaches 1,000 readers.', rarity: 'epic', reward: 'Author’s Medal', icon: '📚', tags: ['writing', 'legacy'], progressTotal: 1 },
            { id: 'milestones-art-exhibit', label: 'Curate a Public Exhibit', description: 'Produce a public art or history exhibit.', rarity: 'rare', reward: 'Curator Ribbon', icon: '🖼️', tags: ['art', 'legacy'], progressTotal: 1 },
            { id: 'milestones-family-history', label: 'Archive Family History', description: 'Document and share your family’s oral histories.', rarity: 'rare', reward: 'Heritage Tome', icon: '📜', tags: ['legacy', 'family'], progressTotal: 1 },
            { id: 'milestones-estate-plan', label: 'Design a Legacy Plan', description: 'Craft an estate plan that funds future philanthropy.', rarity: 'rare', reward: 'Legacy Ledger', icon: '📑', tags: ['planning', 'legacy'], progressTotal: 1 }
          ]
        },
        {
          id: 'milestones-earth',
          label: 'Stewardship & Earth',
          rarity: 'epic',
          description: 'Restore ecosystems and lead service retreats.',
          tags: ['environment', 'legacy'],
          children: [
            { id: 'milestones-plant-forest', label: 'Plant a Micro-Forest', description: 'Plant and sustain 500 native trees.', rarity: 'legendary', reward: 'Forest Wardenship', icon: '🌲', tags: ['environment', 'legacy'], progressTotal: 5 },
            { id: 'milestones-service-retreat', label: 'Service Retreat Team', description: 'Lead three service retreats focused on the environment.', rarity: 'epic', reward: 'Earth Guardian Band', icon: '🌍', tags: ['service', 'environment'], progressTotal: 3 }
          ]
        }
      ]
    },
    {
      id: 'pillar-soul',
      label: 'Mind, Body & Soul',
      description: 'Pursue inner mastery, reflection, and spiritual resilience.',
      rarity: 'legendary',
      reward: 'Inner Sage Sigil',
      icon: themes.soul.icon,
      tags: ['pillar', 'mindfulness'],
      theme: 'soul',
      children: [
        {
          id: 'soul-mindful-practice',
          label: 'Mindful Practice',
          rarity: 'epic',
          description: 'Deepen meditative and breath-centered discipline.',
          tags: ['mindfulness', 'practice'],
          children: [
            { id: 'mind-silent-retreat', label: 'Complete a Silent Retreat', description: 'Finish a 10-day silent meditation retreat.', rarity: 'epic', reward: 'Silence Bead', icon: '🕯️', tags: ['mindfulness', 'retreat'], progressTotal: 10 },
            { id: 'mind-meditation-streak', label: '365-Day Meditation Streak', description: 'Meditate daily for an entire year.', rarity: 'legendary', reward: 'Streak Band', icon: '🧘', tags: ['mindfulness', 'discipline'], progressTotal: 365 },
            { id: 'mind-breathwork-guide', label: 'Train as Breathwork Guide', description: 'Finish breathwork facilitator certification.', rarity: 'rare', reward: 'Prana Pendant', icon: '🌬️', tags: ['wellness', 'training'], progressTotal: 1 }
          ]
        },
        {
          id: 'soul-holistic-wellness',
          label: 'Holistic Wellness',
          rarity: 'epic',
          description: 'Balance yoga, therapy, and forest immersion.',
          tags: ['wellness', 'balance'],
          children: [
            { id: 'mind-yoga-200hr', label: 'Earn 200-Hour Yoga Certification', description: 'Complete a Yoga Alliance approved training.', rarity: 'epic', reward: 'Lotus Emblem', icon: '🪷', tags: ['wellness', 'training'], progressTotal: 200 },
            { id: 'mind-therapy-series', label: 'Complete Therapy Series', description: 'Finish 40 sessions of personal therapy.', rarity: 'rare', reward: 'Healing Stone', icon: '💠', tags: ['mental-health', 'growth'], progressTotal: 40 },
            { id: 'mind-forest-bathing', label: 'Shinrin-yoku Immersion', description: 'Complete 12 guided forest bathing sessions.', rarity: 'rare', reward: 'Forest Whisper Charm', icon: '🌲', tags: ['nature', 'wellness'], progressTotal: 12 }
          ]
        },
        {
          id: 'soul-resilience',
          label: 'Resilience & Exploration',
          rarity: 'epic',
          description: 'Explore vision quests, solitude, and cold mastery.',
          tags: ['resilience', 'exploration'],
          children: [
            { id: 'mind-vision-quest', label: 'Undertake a Vision Quest', description: 'Spend four days in solo nature meditation.', rarity: 'legendary', reward: 'Vision Feather', icon: '🪶', tags: ['spiritual', 'outdoors'], progressTotal: 4 },
            { id: 'mind-annual-solo', label: 'Annual Solo Reflection Trip', description: 'Take a yearly solo retreat for five consecutive years.', rarity: 'epic', reward: 'Wayfinder Token', icon: '🗺️', tags: ['reflection', 'travel'], progressTotal: 5 },
            { id: 'mind-cold-immersion', label: 'Master Cold Immersion', description: 'Maintain cold exposure practice for 52 weeks.', rarity: 'rare', reward: 'Iceflow Sigil', icon: '🧊', tags: ['resilience', 'habit'], progressTotal: 52 }
          ]
        },
        {
          id: 'soul-creative-habits',
          label: 'Creative Habit & Awareness',
          rarity: 'epic',
          description: 'Record gratitude, refine mornings, and dream lucidly.',
          tags: ['habit', 'awareness'],
          children: [
            { id: 'mind-gratitude-journal', label: 'Keep a Gratitude Journal', description: 'Record gratitude entries for 200 days.', rarity: 'rare', reward: 'Gratitude Quill', icon: '🖊️', tags: ['mindfulness', 'habit'], progressTotal: 200 },
            { id: 'mind-digital-detox', label: 'Complete Digital Detox Year', description: 'Take one tech-free weekend each month for a year.', rarity: 'epic', reward: 'Offline Halo', icon: '📵', tags: ['balance', 'habit'], progressTotal: 12 },
            { id: 'mind-lucid-dream', label: 'Master Lucid Dreaming', description: 'Experience lucid dreams ten times.', rarity: 'rare', reward: 'Dreamcatcher', icon: '🪄', tags: ['mind', 'sleep'], progressTotal: 10 },
            { id: 'mind-morning-routine', label: 'Craft a Master Morning Routine', description: 'Stick to a tailored routine for 180 mornings.', rarity: 'rare', reward: 'Sunrise Band', icon: '🌅', tags: ['habit', 'discipline'], progressTotal: 180 }
          ]
        },
        {
          id: 'soul-service-discipline',
          label: 'Service & Discipline',
          rarity: 'epic',
          description: 'Serve retreat teams and earn martial mastery.',
          tags: ['service', 'discipline'],
          children: [
            { id: 'mind-martial-arts-blackbelt', label: 'Earn a Martial Arts Black Belt', description: 'Train to black belt in a martial art.', rarity: 'legendary', reward: 'Dojo Crest', icon: '🥋', tags: ['discipline', 'physical'], progressTotal: 1 },
            { id: 'mind-service-retreat', label: 'Serve on a Mindfulness Retreat Team', description: 'Volunteer for three mindfulness retreats.', rarity: 'epic', reward: 'Service Mala', icon: '📿', tags: ['service', 'mindfulness'], progressTotal: 3 }
          ]
        }
      ]
    }
  ]
};

const board = {
  id: boardId,
  name: 'Life Quest Achievements',
  description: 'A gamified board turning life goals into quest achievements.',
  theme: { mode: 'dark' },
  layout: { direction: 'TB' },
  stats: {
    total: 0,
    stepsTotal: 0,
    stepsDone: 0,
    xpCompleted: 0
  },
  progression: {
    level: 1,
    xp: 0,
    xpIntoLevel: 0,
    xpPerLevel: 400
  },
  nodes: [],
  edges: []
};

function makeNode(node, depth, index) {
  const theme = node.theme ? themes[node.theme] : undefined;
  return {
    id: node.id,
    type: 'achievement',
    position: {
      x: depth * 360,
      y: index * 180
    },
    data: {
      label: node.label,
      description: node.description || '',
      status: node.status || 'locked',
      rarity: node.rarity || 'common',
      reward: node.reward || '',
      xp: node.xp || 0,
      icon: node.icon || theme?.icon || '',
      tags: node.tags || [],
      color: theme?.color,
      progress: {
        current: 0,
        total: node.progressTotal || (Array.isArray(node.children) ? node.children.length || 1 : 1)
      }
    }
  };
}

function walk(node, parentId, depth, state) {
  const rowIndex = state.nextIndex++;
  const created = makeNode(node, depth, rowIndex);
  if (!node.children || node.children.length === 0) {
    created.data.progress.total = node.progressTotal || 1;
  }
  board.nodes.push(created);
  board.stats.total += 1;
  board.stats.stepsTotal += created.data.progress.total;

  if (parentId) {
    board.edges.push({
      id: `edge-${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      type: 'smoothstep'
    });
  }

  if (Array.isArray(node.children)) {
    const childDepth = depth + 1;
    node.children.forEach((child) => walk(child, node.id, childDepth, state));
  }
}

walk(tree, null, 0, { nextIndex: 0 });

const rootProgress = board.nodes.find((node) => node.id === ROOT_ID);
if (rootProgress) {
  rootProgress.data.progress.total = board.nodes.length - 1;
}

const outputPath = path.join(__dirname, '..', 'seed', `${boardId}.json`);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(board, null, 2));

console.log(`Generated tree board with ${board.nodes.length} nodes and ${board.edges.length} edges at ${outputPath}`);
