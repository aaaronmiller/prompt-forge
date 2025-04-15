// Dropdown data for keyword categories
const dropdownData = {
    subjectMatter: [ { id: "sm1", value: "mystical creatures", label: "Mystical Creatures" }, { id: "sm2", value: "urban legends", label: "Urban Legends" }, { id: "sm3", value: "ethereal spirits", label: "Ethereal Spirits" }, { id: "sm4", value: "cybernetic entities", label: "Cybernetic Entities" }, { id: "sm5", value: "mythical deities", label: "Mythical Deities" }, { id: "sm6", value: "legendary warriors", label: "Legendary Warriors" }, { id: "sm7", value: "fabled beasts", label: "Fabled Beasts" }, { id: "sm8", value: "ancestral figures", label: "Ancestral Figures" }, { id: "sm9", value: "satirical caricatures", label: "Satirical Caricatures" }, { id: "sm10", value: "timeless icons", label: "Timeless Icons" }, { id: "sm11", value: "celestial bodies", label: "Celestial Bodies" }, { id: "sm12", value: "retro-futuristic humans", label: "Retro-Futuristic Humans" }, { id: "sm13", value: "cyberpunk rebels", label: "Cyberpunk Rebels" }, { id: "sm14", value: "surreal landscapes", label: "Surreal Landscapes" }, { id: "sm15", value: "abstract forms", label: "Abstract Forms" }, { id: "sm16", value: "hybrid species", label: "Hybrid Species" }, { id: "sm17", value: "enchanted portraits", label: "Enchanted Portraits" }, { id: "sm18", value: "storybook characters", label: "Storybook Characters" }, { id: "sm19", value: "urban nomads", label: "Urban Nomads" }, { id: "sm20", value: "digital avatars", label: "Digital Avatars" } ],
    locationSetting: [ { id: "ls1", value: "urban street", label: "Urban Street" }, { id: "ls2", value: "dystopian cityscape", label: "Dystopian Cityscape" }, { id: "ls3", value: "neon metropolis", label: "Neon Metropolis" }, { id: "ls4", value: "enchanted forest", label: "Enchanted Forest" }, { id: "ls5", value: "desert wasteland", label: "Desert Wasteland" }, { id: "ls6", value: "submerged ruins", label: "Submerged Ruins" }, { id: "ls7", value: "floating islands", label: "Floating Islands" }, { id: "ls8", value: "outer space", label: "Outer Space" }, { id: "ls9", value: "cyber city", label: "Cyber City" }, { id: "ls10", value: "abandoned carnival", label: "Abandoned Carnival" }, { id: "ls11", value: "tropical paradise", label: "Tropical Paradise" }, { id: "ls12", value: "rooftops of downtown", label: "Rooftops of Downtown" }, { id: "ls13", value: "abandoned industrial zone", label: "Abandoned Industrial Zone" }, { id: "ls14", value: "ancient temple", label: "Ancient Temple" }, { id: "ls15", value: "hidden alleyway", label: "Hidden Alleyway" }, { id: "ls16", value: "futuristic lab", label: "Futuristic Lab" }, { id: "ls17", value: "steampunk village", label: "Steampunk Village" }, { id: "ls18", value: "time warp street", label: "Time Warp Street" }, { id: "ls19", value: "lunar base", label: "Lunar Base" }, { id: "ls20", value: "underwater city", label: "Underwater City" } ],
    situationScenario: [ { id: "ss1", value: "epic battle", label: "Epic Battle" }, { id: "ss2", value: "urban escape", label: "Urban Escape" }, { id: "ss3", value: "retro road trip", label: "Retro Road Trip" }, { id: "ss4", value: "dream sequence", label: "Dream Sequence" }, { id: "ss5", value: "secret rendezvous", label: "Secret Rendezvous" }, { id: "ss6", value: "cosmic journey", label: "Cosmic Journey" }, { id: "ss7", value: "futuristic chase", label: "Futuristic Chase" }, { id: "ss8", value: "time travel", label: "Time Travel" }, { id: "ss9", value: "dystopian protest", label: "Dystopian Protest" }, { id: "ss10", value: "underground rave", label: "Underground Rave" }, { id: "ss11", value: "magical transformation", label: "Magical Transformation" }, { id: "ss12", value: "unexpected encounter", label: "Unexpected Encounter" }, { id: "ss13", value: "lost in time", label: "Lost in Time" }, { id: "ss14", value: "forbidden romance", label: "Forbidden Romance" }, { id: "ss15", value: "cyber heist", label: "Cyber Heist" }, { id: "ss16", value: "neon carnival", label: "Neon Carnival" }, { id: "ss17", value: "cryptic ritual", label: "Cryptic Ritual" }, { id: "ss18", value: "technological uprising", label: "Technological Uprising" }, { id: "ss19", value: "cosmic harmony", label: "Cosmic Harmony" }, { id: "ss20", value: "rebel uprising", label: "Rebel Uprising" } ],
    animalTypes: [ { id: "at1", value: "fierce lion", label: "Fierce Lion" }, { id: "at2", value: "regal eagle", label: "Regal Eagle" }, { id: "at3", value: "mysterious panther", label: "Mysterious Panther" }, { id: "at4", value: "mythical dragon", label: "Mythical Dragon" }, { id: "at5", value: "playful dolphin", label: "Playful Dolphin" }, { id: "at6", value: "tropical parrot", label: "Tropical Parrot" }, { id: "at7", value: "enchanted wolf", label: "Enchanted Wolf" }, { id: "at8", value: "robotic dog", label: "Robotic Dog" }, { id: "at9", value: "steampunk owl", label: "Steampunk Owl" }, { id: "at10", value: "celestial cat", label: "Celestial Cat" }, { id: "at11", value: "ferocious tiger", label: "Ferocious Tiger" }, { id: "at12", value: "magical unicorn", label: "Magical Unicorn" }, { id: "at13", value: "cybernetic octopus", label: "Cybernetic Octopus" }, { id: "at14", value: "glowing jellyfish", label: "Glowing Jellyfish" }, { id: "at15", value: "armored rhino", label: "Armored Rhino" }, { id: "at16", value: "primal bear", label: "Primal Bear" }, { id: "at17", value: "electric stingray", label: "Electric Stingray" }, { id: "at18", value: "ethereal deer", label: "Ethereal Deer" }, { id: "at19", value: "shadow bat", label: "Shadow Bat" }, { id: "at20", value: "mystic serpent", label: "Mystic Serpent" } ],
    vehicleTypes: [ { id: "vt1", value: "vintage convertible", label: "Vintage Convertible" }, { id: "vt2", value: "cyber bike", label: "Cyber Bike" }, { id: "vt3", value: "futuristic hovercar", label: "Futuristic Hovercar" }, { id: "vt4", value: "retro truck", label: "Retro Truck" }, { id: "vt5", value: "steampunk airship", label: "Steampunk Airship" }, { id: "vt6", value: "neon motorcycle", label: "Neon Motorcycle" }, { id: "vt7", value: "robotic exosuit", label: "Robotic Exosuit" }, { id: "vt8", value: "dystopian bus", label: "Dystopian Bus" }, { id: "vt9", value: "solar-powered car", label: "Solar-Powered Car" }, { id: "vt10", value: "industrial crane", label: "Industrial Crane" }, { id: "vt11", value: "futuristic subway", label: "Futuristic Subway" }, { id: "vt12", value: "armored vehicle", label: "Armored Vehicle" }, { id: "vt13", value: "space shuttle", label: "Space Shuttle" }, { id: "vt14", value: "electric scooter", label: "Electric Scooter" }, { id: "vt15", value: "monorail", label: "Monorail" }, { id: "vt16", value: "hoverboard", label: "Hoverboard" }, { id: "vt17", value: "cybernetic tank", label: "Cybernetic Tank" }, { id: "vt18", value: "racing car", label: "Racing Car" }, { id: "vt19", value: "autonomous drone", label: "Autonomous Drone" }, { id: "vt20", value: "mechanized elephant", label: "Mechanized Elephant" } ],
    robotTypes: [ { id: "rt1", value: "retro android", label: "Retro Android" }, { id: "rt2", value: "futuristic cyborg", label: "Futuristic Cyborg" }, { id: "rt3", value: "sentient ai", label: "Sentient AI" }, { id: "rt4", value: "humanoid robot", label: "Humanoid Robot" }, { id: "rt5", value: "mini drone", label: "Mini Drone" }, { id: "rt6", value: "steampunk automaton", label: "Steampunk Automaton" }, { id: "rt7", value: "bio-mechanical entity", label: "Bio-Mechanical Entity" }, { id: "rt8", value: "neon sentinel", label: "Neon Sentinel" }, { id: "rt9", value: "digital avatar", label: "Digital Avatar" }, { id: "rt10", value: "android companion", label: "Android Companion" }, { id: "rt11", value: "robotic guard", label: "Robotic Guard" }, { id: "rt12", value: "cybernetic helper", label: "Cybernetic Helper" }, { id: "rt13", value: "alien construct", label: "Alien Construct" }, { id: "rt14", value: "techno monk", label: "Techno Monk" }, { id: "rt15", value: "augmented human", label: "Augmented Human" }, { id: "rt16", value: "precision drone", label: "Precision Drone" }, { id: "rt17", value: "circuit board being", label: "Circuit Board Being" }, { id: "rt18", value: "synthetic samurai", label: "Synthetic Samurai" }, { id: "rt19", value: "mecha unit", label: "Mecha Unit" } ],
    planetTypes: [ { id: "pt1", value: "alien planets", label: "Alien Planets" }, { id: "pt2", value: "black hole", label: "Black Hole" }, { id: "pt3", value: "cosmic nebulae", label: "Cosmic Nebulae" }, { id: "pt4", value: "interstellar gates", label: "Interstellar Gates" }, { id: "pt5", value: "floating crystals", label: "Floating Crystals" }, { id: "pt6", value: "gravity defiance", label: "Gravity Defiance" }, { id: "pt7", value: "quantum rifts", label: "Quantum Rifts" }, { id: "pt8", value: "ethereal portals", label: "Ethereal Portals" }, { id: "pt9", value: "dazzling supernova", label: "Dazzling Supernova" }, { id: "pt10", value: "starlit skies", label: "Starlit Skies" }, { id: "pt11", value: "celestial orbs", label: "Celestial Orbs" }, { id: "pt12", value: "intergalactic vortex", label: "Intergalactic Vortex" }, { id: "pt13", value: "solar flares", label: "Solar Flares" }, { id: "pt14", value: "time distortions", label: "Time Distortions" }, { id: "pt15", value: "wormholes", label: "Wormholes" }, { id: "pt16", value: "meteor showers", label: "Meteor Showers" }, { id: "pt17", value: "galactic maps", label: "Galactic Maps" }, { id: "pt18", value: "planetary rings", label: "Planetary Rings" }, { id: "pt19", value: "aurora borealis", label: "Aurora Borealis" }, { id: "pt20", value: "cosmic dust", label: "Cosmic Dust" } ],
    additionalObjects: [ { id: "ao1", value: "ancient relics", label: "Ancient Relics" }, { id: "ao2", value: "futuristic gadgets", label: "Futuristic Gadgets" }, { id: "ao3", value: "mystic sigils", label: "Mystic Sigils" }, { id: "ao4", value: "urban graffiti", label: "Urban Graffiti" }, { id: "ao5", value: "digital qr codes", label: "Digital QR Codes" }, { id: "ao6", value: "tattooed symbols", label: "Tattooed Symbols" }, { id: "ao7", value: "sacred totems", label: "Sacred Totems" }, { id: "ao8", value: "burning candles", label: "Burning Candles" }, { id: "ao9", value: "floating symbols", label: "Floating Symbols" }, { id: "ao10", value: "radiant halos", label: "Radiant Halos" }, { id: "ao11", value: "abstract logos", label: "Abstract Logos" }, { id: "ao12", value: "baroque ornaments", label: "Baroque Ornaments" }, { id: "ao13", value: "minimalistic icons", label: "Minimalistic Icons" }, { id: "ao14", value: "cyber emblems", label: "Cyber Emblems" }, { id: "ao15", value: "tribal masks", label: "Tribal Masks" }, { id: "ao16", value: "sketched doodles", label: "Sketched Doodles" }, { id: "ao17", value: "illuminated manuscripts", label: "Illuminated Manuscripts" }, { id: "ao18", value: "art nouveau elements", label: "Art Nouveau Elements" }, { id: "ao19", value: "classic scrolls", label: "Classic Scrolls" }, { id: "ao20", value: "mosaic tiles", label: "Mosaic Tiles" } ],
    edgeStyle: [ { id: "es1", value: "ragged", label: "Ragged" }, { id: "es2", value: "rough", label: "Rough" }, { id: "es3", value: "asymmetrical", label: "Asymmetrical" }, { id: "es4", value: "chipped", label: "Chipped" }, { id: "es5", value: "frayed", label: "Frayed" }, { id: "es6", value: "torn", label: "Torn" }, { id: "es7", value: "splintered", label: "Splintered" }, { id: "es8", value: "jagged", label: "Jagged" }, { id: "es9", value: "scalloped", label: "Scalloped" }, { id: "es10", value: "uneven", label: "Uneven" }, { id: "es11", value: "distressed", label: "Distressed" }, { id: "es12", value: "cracked", label: "Cracked" }, { id: "es13", value: "fragmented", label: "Fragmented" }, { id: "es14", value: "weathered", label: "Weathered" }, { id: "es15", value: "irregular", label: "Irregular" } ],
    artisticStyle: [ { id: "as1", value: "surrealism", label: "Surrealism" }, { id: "as2", value: "abstract", label: "Abstract" }, { id: "as3", value: "expressionism", label: "Expressionism" }, { id: "as4", value: "cubism", label: "Cubism" }, { id: "as5", value: "minimalism", label: "Minimalism" }, { id: "as6", value: "futurism", label: "Futurism" }, { id: "as7", value: "pop art", label: "Pop Art" }, { id: "as8", value: "digital painting", label: "Digital Painting" }, { id: "as9", value: "watercolor", label: "Watercolor" }, { id: "as10", value: "graffiti", label: "Graffiti" }, { id: "as11", value: "collage", label: "Collage" }, { id: "as12", value: "impressionism", label: "Impressionism" }, { id: "as13", value: "neo-expressionism", label: "Neo-Expressionism" }, { id: "as14", value: "vaporwave", label: "Vaporwave" }, { id: "as15", value: "photorealism", label: "Photorealism" }, { id: "as16", value: "street art", label: "Street Art" }, { id: "as17", value: "avant-garde", label: "Avant-Garde" }, { id: "as18", value: "mixed media", label: "Mixed Media" }, { id: "as19", value: "hyperrealism", label: "Hyperrealism" }, { id: "as20", value: "conceptual", label: "Conceptual" } ],
    cinematicLighting: [ { id: "cl1", value: "high contrast", label: "High Contrast" }, { id: "cl2", value: "soft glow", label: "Soft Glow" }, { id: "cl3", value: "neon", label: "Neon" }, { id: "cl4", value: "backlit", label: "Backlit" }, { id: "cl5", value: "spotlight", label: "Spotlight" }, { id: "cl6", value: "ambient", label: "Ambient" }, { id: "cl7", value: "diffused", label: "Diffused" }, { id: "cl8", value: "moody", label: "Moody" }, { id: "cl9", value: "shadow play", label: "Shadow Play" }, { id: "cl10", value: "silhouette", label: "Silhouette" }, { id: "cl11", value: "rim lighting", label: "Rim Lighting" }, { id: "cl12", value: "chiaroscuro", label: "Chiaroscuro" }, { id: "cl13", value: "golden hour", label: "Golden Hour" }, { id: "cl14", value: "low-key", label: "Low-Key" }, { id: "cl15", value: "bioluminescent", label: "Bioluminescent" } ],
    perspectiveAngle: [ { id: "pa1", value: "bird’s eye view", label: "Bird’s Eye View" }, { id: "pa2", value: "worm’s eye view", label: "Worm’s Eye View" }, { id: "pa3", value: "isometric", label: "Isometric" }, { id: "pa4", value: "fisheye", label: "Fisheye" }, { id: "pa5", value: "wide-angle", label: "Wide-Angle" }, { id: "pa6", value: "close-up", label: "Close-Up" }, { id: "pa7", value: "overhead", label: "Overhead" }, { id: "pa8", value: "dutch angle", label: "Dutch Angle" }, { id: "pa9", value: "panoramic", label: "Panoramic" }, { id: "pa10", value: "macro", label: "Macro" }, { id: "pa11", value: "tilt-shift", label: "Tilt-Shift" }, { id: "pa12", value: "first person", label: "First Person" }, { id: "pa13", value: "dynamic diagonal", label: "Dynamic Diagonal" }, { id: "pa14", value: "oblong", label: "Oblong" } ],
    patternTexture: [ { id: "ptx1", value: "geometric", label: "Geometric" }, { id: "ptx2", value: "fractal", label: "Fractal" }, { id: "ptx3", value: "organic", label: "Organic" }, { id: "ptx4", value: "paisley", label: "Paisley" }, { id: "ptx5", value: "mosaic", label: "Mosaic" }, { id: "ptx6", value: "striped", label: "Striped" }, { id: "ptx7", value: "polka dots", label: "Polka Dots" }, { id: "ptx8", value: "camouflage", label: "Camouflage" }, { id: "ptx9", value: "houndstooth", label: "Houndstooth" }, { id: "ptx10", value: "damask", label: "Damask" }, { id: "ptx11", value: "zigzag", label: "Zigzag" }, { id: "ptx12", value: "chevron", label: "Chevron" }, { id: "ptx13", value: "abstract patterns", label: "Abstract Patterns" }, { id: "ptx14", value: "floral", label: "Floral" }, { id: "ptx15", value: "tribal", label: "Tribal" }, { id: "ptx16", value: "tie dye", label: "Tie Dye" }, { id: "ptx17", value: "grunge", label: "Grunge" }, { id: "ptx18", value: "stippled", label: "Stippled" }, { id: "ptx19", value: "crosshatch", label: "Crosshatch" } ],
    opacityFinish: [ { id: "of1", value: "transparent", label: "Transparent" }, { id: "of2", value: "semi-transparent", label: "Semi-Transparent" }, { id: "of3", value: "matte", label: "Matte" }, { id: "of4", value: "glossy", label: "Glossy" }, { id: "of5", value: "opaque", label: "Opaque" }, { id: "of6", value: "translucent", label: "Translucent" }, { id: "of7", value: "metallic shine", label: "Metallic Shine" }, { id: "of8", value: "subtle fade", label: "Subtle Fade" }, { id: "of9", value: "varnished", label: "Varnished" }, { id: "of10", value: "patina", label: "Patina" }, { id: "of11", value: "iridescent", label: "Iridescent" }, { id: "of12", value: "sheer", label: "Sheer" }, { id: "of13", value: "frosted", label: "Frosted" }, { id: "of14", value: "dusty finish", label: "Dusty Finish" }, { id: "of15", value: "high gloss", label: "High Gloss" } ],
    materialsUsed: [ { id: "mu1", value: "canvas", label: "Canvas" }, { id: "mu2", value: "watercolor paper", label: "Watercolor Paper" }, { id: "mu3", value: "wood", label: "Wood" }, { id: "mu4", value: "metal", label: "Metal" }, { id: "mu5", value: "plastic", label: "Plastic" }, { id: "mu6", value: "fabric", label: "Fabric" }, { id: "mu7", value: "concrete", label: "Concrete" }, { id: "mu8", value: "glass", label: "Glass" }, { id: "mu9", value: "recycled materials", label: "Recycled Materials" }, { id: "mu10", value: "collage paper", label: "Collage Paper" }, { id: "mu11", value: "ink", label: "Ink" }, { id: "mu12", value: "charcoal", label: "Charcoal" }, { id: "mu13", value: "pastel", label: "Pastel" }, { id: "mu14", value: "mixed media", label: "Mixed Media" }, { id: "mu15", value: "textile", label: "Textile" }, { id: "mu16", value: "vinyl", label: "Vinyl" }, { id: "mu17", value: "ceramic", label: "Ceramic" }, { id: "mu18", value: "neon lights", label: "Neon Lights" }, { id: "mu19", value: "digital pixels", label: "Digital Pixels" } ],
    genreVibe: [ { id: "gv1", value: "fantasy", label: "Fantasy" }, { id: "gv2", value: "sci-fi", label: "Sci-Fi" }, { id: "gv3", value: "horror", label: "Horror" }, { id: "gv4", value: "cyberpunk", label: "Cyberpunk" }, { id: "gv5", value: "steampunk", label: "Steampunk" }, { id: "gv6", value: "post-apocalyptic", label: "Post-Apocalyptic" }, { id: "gv7", value: "gothic", label: "Gothic" }, { id: "gv8", value: "romantic", label: "Romantic" }, { id: "gv9", value: "mythological", label: "Mythological" }, { id: "gv10", value: "dystopian", label: "Dystopian" }, { id: "gv11", value: "urban", label: "Urban" }, { id: "gv12", value: "urban fantasy", label: "Urban Fantasy" }, { id: "gv13", value: "magical realism", label: "Magical Realism" }, { id: "gv14", value: "noir", label: "Noir" }, { id: "gv15", value: "adventure", label: "Adventure" }, { id: "gv16", value: "epic", label: "Epic" }, { id: "gv17", value: "surreal", label: "Surreal" }, { id: "gv18", value: "dreamlike", label: "Dreamlike" }, { id: "gv19", value: "retro-futuristic", label: "Retro-Futuristic" }, { id: "gv20", value: "avant-garde", label: "Avant-Garde" } ],
    timeCulture: [ { id: "tc1", value: "renaissance", label: "Renaissance" }, { id: "tc2", value: "baroque", label: "Baroque" }, { id: "tc3", value: "victorian", label: "Victorian" }, { id: "tc4", value: "art deco", label: "Art Deco" }, { id: "tc5", value: "modern", label: "Modern" }, { id: "tc6", value: "futuristic", label: "Futuristic" }, { id: "tc7", value: "1960s", label: "1960s" }, { id: "tc8", value: "1980s", label: "1980s" }, { id: "tc9", value: "urban contemporary", label: "Urban Contemporary" }, { id: "tc10", value: "tribal", label: "Tribal" }, { id: "tc11", value: "medieval", label: "Medieval" }, { id: "tc12", value: "romantic era", label: "Romantic Era" }, { id: "tc13", value: "ancient civilizations", label: "Ancient Civilizations" }, { id: "tc14", value: "cyber age", label: "Cyber Age" }, { id: "tc15", value: "hip-hop culture", label: "Hip-Hop Culture" }, { id: "tc16", value: "caribbean vibes", label: "Caribbean Vibes" }, { id: "tc17", value: "global fusion", label: "Global Fusion" }, { id: "tc18", value: "ethereal pastoral", label: "Ethereal Pastoral" }, { id: "tc19", value: "industrial revolution", label: "Industrial Revolution" } ],
    cinematicModifiers: [ { id: "cm1", value: "epic scale", label: "Epic Scale" }, { id: "cm2", value: "slow motion", label: "Slow Motion" }, { id: "cm3", value: "time-lapse", label: "Time-Lapse" }, { id: "cm4", value: "hyperlapse", label: "Hyperlapse" }, { id: "cm5", value: "dramatic close-up", label: "Dramatic Close-Up" }, { id: "cm6", value: "wide shot", label: "Wide Shot" }, { id: "cm7", value: "tilted frame", label: "Tilted Frame" }, { id: "cm8", value: "bokeh", label: "Bokeh" }, { id: "cm9", value: "vignetting", label: "Vignetting" }, { id: "cm10", value: "lens flare", label: "Lens Flare" }, { id: "cm11", value: "color grading", label: "Color Grading" }, { id: "cm12", value: "frame within a frame", label: "Frame Within a Frame" }, { id: "cm13", value: "golden ratio", label: "Golden Ratio" }, { id: "cm14", value: "handheld", label: "Handheld" }, { id: "cm15", value: "animated sketch", label: "Animated Sketch" } ],
    colorTone: [ { id: "ct1", value: "vibrant", label: "Vibrant" }, { id: "ct2", value: "monochrome", label: "Monochrome" }, { id: "ct3", value: "pastel", label: "Pastel" }, { id: "ct4", value: "earthy tones", label: "Earthy Tones" }, { id: "ct5", value: "neon glow", label: "Neon Glow" }, { id: "ct6", value: "muted", label: "Muted" }, { id: "ct7", value: "bold & bright", label: "Bold & Bright" }, { id: "ct8", value: "duotone", label: "Duotone" }, { id: "ct9", value: "saturated", label: "Saturated" }, { id: "ct10", value: "primary colors", label: "Primary Colors" }, { id: "ct11", value: "analogous", label: "Analogous" }, { id: "ct12", value: "complementary", label: "Complementary" }, { id: "ct13", value: "split complementary", label: "Split Complementary" }, { id: "ct14", value: "triadic", label: "Triadic" }, { id: "ct15", value: "moody blues", label: "Moody Blues" } ],
    specialEffects: [ { id: "se1", value: "glitch", label: "Glitch" }, { id: "se2", value: "pixelation", label: "Pixelation" }, { id: "se3", value: "distortion", label: "Distortion" }, { id: "se4", value: "bokeh effect", label: "Bokeh Effect" }, { id: "se5", value: "lens distortion", label: "Lens Distortion" }, { id: "se6", value: "smoke", label: "Smoke" }, { id: "se7", value: "fire", label: "Fire" }, { id: "se8", value: "sparkles", label: "Sparkles" }, { id: "se9", value: "holographic", label: "Holographic" }, { id: "se10", value: "aura", label: "Aura" }, { id: "se11", value: "shadow effects", label: "Shadow Effects" }, { id: "se12", value: "reflections", label: "Reflections" }, { id: "se13", value: "smoke trails", label: "Smoke Trails" }, { id: "se14", value: "light leaks", label: "Light Leaks" }, { id: "se15", value: "double exposure", label: "Double Exposure" } ],
    culturalMotifs: [ { id: "cum1", value: "caribbean patterns", label: "Caribbean Patterns" }, { id: "cum2", value: "african tribal", label: "African Tribal" }, { id: "cum3", value: "polynesian tattoos", label: "Polynesian Tattoos" }, { id: "cum4", value: "aztec designs", label: "Aztec Designs" }, { id: "cum5", value: "celtic knots", label: "Celtic Knots" }, { id: "cum6", value: "native american symbols", label: "Native American Symbols" }, { id: "cum7", value: "japanese ink", label: "Japanese Ink" }, { id: "cum8", value: "indian mehndi", label: "Indian Mehndi" }, { id: "cum9", value: "scandinavian folklore", label: "Scandinavian Folklore" }, { id: "cum10", value: "middle eastern geometrics", label: "Middle Eastern Geometrics" }, { id: "cum11", value: "greco-roman", label: "Greco-Roman" }, { id: "cum12", value: "chinese brushwork", label: "Chinese Brushwork" }, { id: "cum13", value: "latin american murals", label: "Latin American Murals" }, { id: "cum14", value: "byzantine", label: "Byzantine" }, { id: "cum15", value: "oriental patterns", label: "Oriental Patterns" } ],
    frameBorder: [ { id: "fb1", value: "grunge frame", label: "Grunge Frame" }, { id: "fb2", value: "ornate", label: "Ornate" }, { id: "fb3", value: "minimalist line", label: "Minimalist Line" }, { id: "fb4", value: "baroque", label: "Baroque" }, { id: "fb5", value: "vintage frame", label: "Vintage Frame" }, { id: "fb6", value: "industrial", label: "Industrial" }, { id: "fb7", value: "rough sketch edges", label: "Rough Sketch Edges" }, { id: "fb8", value: "collage border", label: "Collage Border" }, { id: "fb9", value: "broken frame", label: "Broken Frame" }, { id: "fb10", value: "circular", label: "Circular" }, { id: "fb11", value: "irregular polygonal", label: "Irregular Polygonal" }, { id: "fb12", value: "fragmented", label: "Fragmented" }, { id: "fb13", value: "hand-drawn", label: "Hand-Drawn" }, { id: "fb14", value: "scrawled", label: "Scrawled" }, { id: "fb15", value: "mixed media border", label: "Mixed Media Border" } ],
    styleModulation: [ { id: "stm1", value: "dreamlike", label: "Dreamlike" }, { id: "stm2", value: "whimsical", label: "Whimsical" }, { id: "stm3", value: "hyperbolic", label: "Hyperbolic" }, { id: "stm4", value: "ethereal", label: "Ethereal" }, { id: "stm5", value: "dynamic", label: "Dynamic" }, { id: "stm6", value: "vibratory", label: "Vibratory" }, { id: "stm7", value: "chaotic", label: "Chaotic" }, { id: "stm8", value: "serene", label: "Serene" }, { id: "stm9", value: "intense", label: "Intense" }, { id: "stm10", value: "relaxed", label: "Relaxed" }, { id: "stm11", value: "surreal boost", label: "Surreal Boost" }, { id: "stm12", value: "organic flow", label: "Organic Flow" }, { id: "stm13", value: "mystical", label: "Mystical" }, { id: "stm14", value: "enigmatic", label: "Enigmatic" }, { id: "stm15", value: "animated vibe", label: "Animated Vibe" } ],
    cinematicOptions: [ { id: "co1", value: "8mm lens", label: "8mm Lens" }, { id: "co2", value: "16mm lens", label: "16mm Lens" }, { id: "co3", value: "35mm lens", label: "35mm Lens" }, { id: "co4", value: "50mm lens", label: "50mm Lens" }, { id: "co5", value: "85mm lens", label: "85mm Lens" }, { id: "co6", value: "cinematic photography", label: "Cinematic Photography" }, { id: "co7", value: "macro photography", label: "Macro Photography" }, { id: "co8", value: "tilt-shift effect", label: "Tilt-Shift Effect" }, { id: "co9", value: "zoom effect", label: "Zoom Effect" }, { id: "co10", value: "shallow depth of field", label: "Shallow Depth of Field (Bokeh)" }, { id: "co11", value: "strong bokeh", label: "Strong Bokeh" }, { id: "co12", value: "subtle bokeh", label: "Subtle Bokeh" }, { id: "co13", value: "lens flare", label: "Lens Flare" }, { id: "co14", value: "anamorphic lens flare", label: "Anamorphic Lens Flare" }, { id: "co15", value: "soft focus", label: "Soft Focus" } ]
};

// Stored ComfyUI Workflows (as strings)
const comfyWorkflows = {
    "Comfy API": `{
      "6": {
        "inputs": {
          "text": "A satirical caricature of a retro-futuristic human couple, a forbidden romance unfolding amidst submerged ruins and floating islands in a dreamlike sequence.  The scene depicts a secret rendezvous at an underground rave within a partially flooded ancient city, illuminated by the neon glow of holographic projections and the hazy smoke of incense.  An armored rhino, adorned with Polynesian tattoos, stands guard nearby, partially submerged in the murky water.  The composition utilizes a tilted frame, emphasizing a dynamic angle that follows the rule of thirds. The color palette leans towards earthy tones, contrasted by vibrant neon accents and light leaks from an unseen source, creating a chiaroscuro effect.  The style is a blend of vintage frame aesthetic, reminiscent of old travel posters, with the detailed linework and bold colors of a satirical caricature, emphasizing the dreamlike, surreal nature of the secret rendezvous.  Intricate details include the reflection of neon signs on the wet surfaces of the ruins and the smoke swirling around the couple. The overall effect evokes a retro-futuristic, slightly chaotic, and dreamlike atmosphere, suitable for a t-shirt graphic. The image is further enhanced by a subtle volumetric lighting effect, highlighting the textures and depth of the submerged environment.",
          "clip": [
            "42",
            0
          ]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Positive Prompt)"
        }
      },
      "8": {
        "inputs": {
          "samples": [
            "31",
            0
          ],
          "vae": [
            "41",
            0
          ]
        },
        "class_type": "VAEDecode",
        "_meta": {
          "title": "VAE Decode"
        }
      },
      "27": {
        "inputs": {
          "width": 832,
          "height": 1216,
          "batch_size": 1
        },
        "class_type": "EmptySD3LatentImage",
        "_meta": {
          "title": "EmptySD3LatentImage"
        }
      },
      "31": {
        "inputs": {
          "seed": 1016353382075181,
          "steps": 4,
          "cfg": 1,
          "sampler_name": "euler",
          "scheduler": "simple",
          "denoise": 1,
          "model": [
            "40",
            0
          ],
          "positive": [
            "35",
            0
          ],
          "negative": [
            "46",
            0
          ],
          "latent_image": [
            "27",
            0
          ]
        },
        "class_type": "KSampler",
        "_meta": {
          "title": "KSampler"
        }
      },
      "35": {
        "inputs": {
          "guidance": 3.5,
          "conditioning": [
            "6",
            0
          ]
        },
        "class_type": "FluxGuidance",
        "_meta": {
          "title": "FluxGuidance"
        }
      },
      "40": {
        "inputs": {
          "unet_name": "shuttleMixes_305GGUFQ3KS.gguf"
        },
        "class_type": "UnetLoaderGGUF",
        "_meta": {
          "title": "Unet Loader (GGUF)"
        }
      },
      "41": {
        "inputs": {
          "vae_name": "ae.safetensors"
        },
        "class_type": "VAELoader",
        "_meta": {
          "title": "Load VAE"
        }
      },
      "42": {
        "inputs": {
          "clip_name1": "clip_l.safetensors",
          "clip_name2": "t5-v1_1-xxl-encoder-Q8_0.gguf",
          "type": "flux"
        },
        "class_type": "DualCLIPLoaderGGUF",
        "_meta": {
          "title": "DualCLIPLoader (GGUF)"
        }
      },
      "46": {
        "inputs": {
          "text": "",
          "clip": [
            "42",
            0
          ]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Negative Prompt)"
        }
      },
      "50": {
        "inputs": {
          "filename_prefix": "prompt-forge",
          "images": [
            "8",
            0
          ]
        },
        "class_type": "SaveImage",
        "_meta": {
          "title": "Save Image"
        }
      }
    }`
};

// Stored API Keys (USE PLACEHOLDERS ONLY - DO NOT COMMIT REAL KEYS)
const storedApiKeys = {
  gemini: '' // Or 'YOUR_GEMINI_API_KEY_HERE'
};