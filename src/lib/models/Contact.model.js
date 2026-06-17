const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    facebook: {
        type: String,
        required: true,
    },
    instagram: {
        type: String,
        required: true,
    },
    linkedin: {
        type: String,
        required: true,
    },
    youtube: {
        type: String,
        required: true,
    },
    // ── CTA Banner fields (used on every page of the website) ──
    cta_title: {
        type: String,
        default: 'Get Started Today',
    },
    cta_text_white: {
        type: String,
        default: 'Ready to connect and acquire the',
    },
    cta_text_blue: {
        type: String,
        default: 'aircraft of your dreams?',
    },
    cta_bg_image: {
        type: String,
        default: '',
    },
    // ── Team page hero section ──
    team_hero_title: {
        type: String,
        default: 'Meet the Team',
    },
    team_hero_description: {
        type: String,
        default: 'Meet the aviation experts and passionate professionals behind Mason Amelia. Our mission is to elevate your flight experience through transparency, expertise, and personalized service.',
    },
    team_hero_bg_image: {
        type: String,
        default: '',
    },
    // ── Higher page ──
    higher_hero_title_white: {
        type: String,
        default: "We're More Than Brokers —",
    },
    higher_hero_title_blue: {
        type: String,
        default: "We're Storytellers",
    },
    higher_hero_description: {
        type: String,
        default: "If Your Broker Isn't Crafting a Marketing Plan as Compelling as the Aircraft Itself, They're Not Truly Selling It",
    },
    higher_hero_bg_image: {
        type: String,
        default: '',
    },
    higher_vision_title: {
        type: String,
        default: 'Looking for Higher on YouTube',
    },
    higher_vision_subtitle: {
        type: String,
        default: "When you partner with Mason Amelia, you're not just getting a brokerage—you're getting a full-service, marketing-driven strategy to maximize visibility and find the right buyer.",
    },
    higher_vision_body1: {
        type: String,
        default: "At Mason Amelia, we're more than brokers; we're storytellers. While there are many brokers out there, few live truer to the aviation lifestyle than our founder, Jesse Adams, who started the YouTube channel, Looking for Higher, which now serves as Mason Amelia's video marketing platform. On the channel, you will find insights on the true experience of aircraft ownership from transitioning into a turbine to the freedom of flying family across the country.",
    },
    higher_vision_body2: {
        type: String,
        default: "Every video we create tells the unique story of each aircraft we represent, bringing its personality and capabilities to life in ways that resonate with prospective buyers. This storytelling approach is powerful and essential in today's market, where a listing alone doesn't cut it. If Your Broker Isn't Crafting a Marketing Plan as Compelling as the Aircraft Itself, They're Not Truly Selling It",
    },
    // ── Skynet page ──
    skynet_hero_title_white: {
        type: String,
        default: 'Mason Amelia Pricing Intelligence —',
    },
    skynet_hero_title_blue: {
        type: String,
        default: 'Powered by SkyNet',
    },
    skynet_hero_description: {
        type: String,
        default: 'No guesswork. No lag. Real-time market intelligence that gives our clients the sharpest edge; Fast, factual, and unbeatable.',
    },
    skynet_hero_bg_image: {
        type: String,
        default: '',
    },
    skynet_advantage_title_white: {
        type: String,
        default: 'Unlock',
    },
    skynet_advantage_title_blue: {
        type: String,
        default: "SkyNet's Data Advantage",
    },
    skynet_advantage_description: {
        type: String,
        default: "\u201CHold on, John Connor!\u201D because Mason Amelia\u2019s proprietary aircraft pricing app, SkyNet, employs a proprietary means of collecting, analyzing, and presenting transaction data. With no MLS substitute, this private data is the lifeblood that empowers our buyers and sellers. Simply put, SkyNet ensures every decision is powered by data and backed by Mason Amelia\u2019s experience.",
    },
    skynet_timeline_title_white: {
        type: String,
        default: 'The Evolution of SkyNet:',
    },
    skynet_timeline_title_blue: {
        type: String,
        default: 'A Timeline of Innovation',
    },
    skynet_timeline_items: {
        type: [{
            year: { type: String },
            description: { type: String },
            image: { type: String, default: '' },
        }],
        default: [
            { year: '2023', description: 'Mason Amelia launches, relying on traditional, manual methods for aircraft data aggregation and analysis.', image: '' },
            { year: '2024', description: 'As the sales team grew, it became clear that shared spreadsheets and folders were insufficient to properly equip and align our brokers. We envisioned a purpose-built web and mobile platform and named it SkyNet.', image: '' },
            { year: '2025', description: 'SkyNet is deployed. Secure, fast, and built by aviation experts, it quickly becomes the backbone of our brokers\u2019 pricing, market insight, and decision-making.', image: '' },
            { year: '2026', description: 'SkyNet continues to evolve, integrating predictive analytics and early AI-driven learning to deliver even more accurate forecasting, smarter pricing strategy, and enhanced deal preparation.', image: '' },
        ],
    },
    // ── Home page: Hero ──
    home_hero_title: { type: String, default: 'Turbulence-Free Transactions' },
    home_hero_description: { type: String, default: 'Industry-leading marketing, data, and grit to help you buy or sell.' },
    home_hero_video_url: { type: String, default: '/assets/file.mp4' },
    home_hero_mobile_title: { type: String, default: 'Turbulence-Free Transactions' },
    // ── Home page: Meet the Team ──
    home_team_title_white: { type: String, default: 'From San Antonio to Duluth…' },
    home_team_title_blue: { type: String, default: 'Meet the Team' },
    home_team_description: { type: String, default: 'We are purveyors of high-end piston and owner-flown turbine aircraft. Our nationwide team brings decades of experience across every corner of aviation. From initial consultation to final aircraft delivery, we handle every transaction with efficiency and an unwavering focus on your satisfaction\'s bottom line. Putting clients first and building lasting relationships is the foundation of our success and yours.' },
    home_team_image: { type: String, default: '' },
    // ── Home page: By the Numbers ──
    home_stats_title: { type: String, default: 'By the Numbers' },
    home_stats_description: { type: String, default: 'The data doesn\'t lie. Mason Amelia is your expert wingman with a proven track record and reputation.' },
    home_stats_cards: {
        type: [{
            prefix: { type: String, default: '' },
            count: { type: Number, default: 0 },
            suffix: { type: String, default: '' },
            description: { type: String, default: '' },
        }],
        default: [
            { prefix: '$', count: 500, suffix: 'M', description: 'In completed aircraft transactions' },
            { prefix: '', count: 300, suffix: '+', description: 'Aircraft closings successfully managed worldwide' },
            { prefix: '', count: 75, suffix: '', description: 'Years of combined experience in aviation industry' },
            { prefix: '', count: 8, suffix: '', description: 'Dedicated professionals team serving our valued clients' },
            { prefix: '', count: 0, suffix: '', description: 'Excuses — delivering trusted results every single time' },
        ],
    },
    // ── Home page: Gallery ──
    home_gallery_title: { type: String, default: 'A Bespoke Approach to Brokerage' },
    // ── Acquisition page hero ──
    acquisition_hero_title_white: { type: String, default: 'The Right Aircraft ' },
    acquisition_hero_title_blue: { type: String, default: 'Changes Everything' },
    acquisition_hero_description: { type: String, default: 'We take a consultative approach, learning your mission, analyzing the market, and guiding your acquisition from your first call to first flight.' },
    acquisition_hero_bg_image: { type: String, default: '' },
    // ── Acquisition: Preflight Planning ──
    acquisition_preflight_title: { type: String, default: 'Preflight Planning' },
    acquisition_preflight_subtitle: { type: String, default: 'Strategy, not speculation. Your mission defines the search. ' },
    acquisition_preflight_description: { type: String, default: 'We define your mission profile: how you\'ll fly, where you\'ll go, and establish what ownership means for you. Then we align the right aircraft to your mission, your lifestyle, and your financial strategy.' },
    acquisition_preflight_bg_image: { type: String, default: '' },
    // ── Acquisition: Taxi & Systems Check ──
    acquisition_taxi_tagline: { type: String, default: 'Taxi & Systems Check' },
    acquisition_taxi_title: { type: String, default: 'Expert guidance and trusted partners to clear the path before takeoff' },
    acquisition_taxi_description: { type: String, default: 'Before we roll, we ensure every system is a go. Mason Amelia is aligned with top-tier aviation professionals. We ensure the right expertise is engaged early. This includes financing, tax, legal, insurance, training, maintenance, and operational advisors. This cohesive approach gives you clarity and confidence from the very first turn.' },
    acquisition_taxi_cards: {
        type: [{
            title: { type: String },
            point: { type: String },
        }],
        default: [
            { title: 'Financing', point: 'Connect with trusted aviation lenders to secure competitive terms.' },
            { title: 'Tax & Legal', point: 'Collaborate with top aviation advisors to protect and optimize your position.' },
            { title: 'Insurance', point: 'Aviation-specific protection for what matters most.' },
            { title: 'Training & Operations', point: 'Assess needs and link you with proven providers.' },
            { title: 'Project Oversight', point: 'Ensure every detail stays aligned and on schedule across all parties.' },
        ],
    },
    // ── Acquisition: Cleared for Takeoff ──
    acquisition_cleared_title: { type: String, default: 'Cleared for Takeoff' },
    acquisition_cleared_subtitle: { type: String, default: 'Aircraft Identification & Acquisition' },
    acquisition_cleared_intro: { type: String, default: 'With a clear mission and strong foundation in place, we advance to the acquisition phase. Mason Amelia actively searches both public and off-market opportunities to locate the ideal aircraft. No stone unturned, no shortcuts taken.' },
    acquisition_cleared_bullets: {
        type: [String],
        default: [
            'Develop and deploy strategic outreach campaigns to identify off-market aircraft and untapped opportunities.',
            'Present qualified aircraft and deliver precise price and value analyses powered by SkyNet.',
            'From LOIs to closing, we negotiate terms and manage due diligence every step of the way.',
        ],
    },
    acquisition_cleared_outro: { type: String, default: 'We don\'t just find airplanes — we deliver outcomes. Every step is handled with precision and purpose so you can take off with confidence.' },
    acquisition_cleared_image: { type: String, default: '' },
    // ── Acquisition: Relationship ──
    acquisition_relationship_title: { type: String, default: 'Relationships for Life' },
    acquisition_relationship_subtitle: { type: String, default: 'This isn\'t transactional. This is a life-long friendship.' },
    acquisition_relationship_image: { type: String, default: '' },
    // ── Brokerage page hero ──
    brokerage_hero_title_white: { type: String, default: 'A Strategic Hands-On Approach ' },
    brokerage_hero_title_blue: { type: String, default: 'to Selling Your Aircraft' },
    brokerage_hero_description: { type: String, default: 'Your aircraft deserves to stand out. We highlight its strengths and handle every phase with intent, precision, and the relentless pursuit of perfection.' },
    brokerage_hero_bg_image: { type: String, default: '' },
    // ── Brokerage: Preflight Planning ──
    brokerage_preflight_title: { type: String, default: 'Preflight Planning' },
    brokerage_preflight_subtitle: { type: String, default: 'Consultation' },
    brokerage_preflight_description: { type: String, default: 'Every brokerage is a unique opportunity with its own challenges. By understanding your goals, timing, and long-term vision, we design a clear path forward through brokerage, trade-in, or wholesale that helps you transition smoothly and maximize your results.' },
    brokerage_preflight_bg_image: { type: String, default: '' },
    // ── Brokerage: Taxi & Systems Check ──
    brokerage_taxi_tagline: { type: String, default: 'Taxi & Systems Check' },
    brokerage_taxi_title: { type: String, default: 'Bringing to Market' },
    brokerage_taxi_description: { type: String, default: 'Four disciplines. One objective: sell your aircraft efficiently and correctly.' },
    brokerage_taxi_cards: {
        type: [{
            title: { type: String },
            point: { type: String },
        }],
        default: [
            { title: 'Advertising', point: 'This is where we go full throttle. From pro photography and high-impact video to disruptive social campaigns, we turn your aircraft into a must-see listing.' },
            { title: 'Pricing Accuracy', point: 'Leveraging our decades of experience and backed by SkyNet, our proprietary market valuation platform, we analyze real-time data to set an accurate, competitive price from the very start.' },
            { title: 'Sales Network', point: 'Your aircraft joins an exclusive network of qualified buyers, elite brokers, and international partners — amplifying visibility and minimizing time on market.' },
            { title: 'Project Management', point: "We're process-driven and relentless about execution. Every detail is tracked, every timeline met, every update delivered." },
        ],
    },
    // ── Brokerage: Cleared for Takeoff ──
    brokerage_cleared_title: { type: String, default: 'Cleared for Takeoff' },
    brokerage_cleared_subtitle: { type: String, default: 'Active Marketing, Negotiation & Closing' },
    brokerage_cleared_intro: { type: String, default: 'With your mission set and systems in sync, we execute. Mason Amelia takes your aircraft to market with precision, discipline, and transparency, aggressively marketing, strategically negotiating, and closing efficiently to deliver maximum value in minimal time.' },
    brokerage_cleared_bullets: {
        type: [String],
        default: [
            'Analyze market data and position your aircraft for maximum impact.',
            'Launch targeted campaigns and direct outreach to qualified buyers.',
            'Present offers and deliver real-time market feedback.',
            'Negotiate terms and manage contract execution through closing.',
            'Coordinate logistics and support a seamless handoff at delivery.',
        ],
    },
    brokerage_cleared_outro: { type: String, default: "From first call to final handshake, we don't just list aircraft. We own the process, executing with precision, creating demand, and closing with clean and solid results." },
    brokerage_cleared_image: { type: String, default: '' },
    // ── Brokerage: Relationship ──
    brokerage_relationship_title: { type: String, default: 'Relationships for Life' },
    brokerage_relationship_subtitle: { type: String, default: "This isn't transactional. This is a life-long friendship." },
    brokerage_relationship_image: { type: String, default: '' },
    // ── Acquisition: CTA Banner ──
    acquisition_cta_line1_white: { type: String, default: 'Data informs' },
    acquisition_cta_line1_blue: { type: String, default: 'decisions.' },
    acquisition_cta_line2_white: { type: String, default: 'Relationships create' },
    acquisition_cta_line2_blue: { type: String, default: 'opportunity.' },
    acquisition_cta_line3_white: { type: String, default: 'Execution delivers' },
    acquisition_cta_line3_blue: { type: String, default: 'results.' },
    // ── Brokerage: CTA Banner ──
    brokerage_cta_line1_white: { type: String, default: 'Data informs' },
    brokerage_cta_line1_blue: { type: String, default: 'decisions.' },
    brokerage_cta_line2_white: { type: String, default: 'Exposure creates' },
    brokerage_cta_line2_blue: { type: String, default: 'opportunity.' },
    brokerage_cta_line3_white: { type: String, default: 'Execution delivers' },
    brokerage_cta_line3_blue: { type: String, default: 'results.' },
    // ── Insurance page hero ──
    insurance_hero_title_white: { type: String, default: 'Aircraft ' },
    insurance_hero_title_blue: { type: String, default: 'Insurance' },
    insurance_hero_description: { type: String, default: 'Our trusted partners at Titan Insurance specialize exclusively in high-end owner-flown piston and turbine aircraft, backed by decades of aviation insurance expertise. Get a tailored quote today.' },
    insurance_hero_bg_image: { type: String, default: '' },
    // ── Showroom page hero ──
    showroom_hero_title_white: { type: String, default: 'Where Precision' },
    showroom_hero_title_blue: { type: String, default: 'Meets Passion' },
    showroom_hero_description: { type: String, default: 'We curate an exclusive collection of high-performance piston and owner-flown turbine aircraft, each one selected to satisfy the most discerning aviators.' },
    showroom_hero_bg_image: { type: String, default: '' },
    // ── About page hero ──
    about_hero_title_white: { type: String, default: 'Redefining ' },
    about_hero_title_blue: { type: String, default: 'Aircraft Brokerage' },
    about_hero_description: { type: String, default: 'Built on Trust, Performance, and Relationships That Endure.' },
    about_hero_bg_image: { type: String, default: '' },
    // ── About page: What Sets Us Apart ──
    about_wsa_title_white: { type: String, default: 'Who is ' },
    about_wsa_title_blue: { type: String, default: 'Mason Amelia?' },
    about_wsa_subtitle: { type: String, default: 'An aircraft brokerage named after our founder Jesse Adams\' children, focused on high-performance piston and owner-flown turbine aircraft, built on:' },
    about_wsa_cards: {
        type: [{
            title: { type: String },
            description: { type: String },
        }],
        default: [
            { title: 'Integrity', description: 'When you name a company after your children, you hold yourself to a higher standard. Mason Amelia was built on the belief that every transaction should be a win for both Buyer and Seller. Our greatest sense of accomplishment comes from the repeat clients, referrals, and reputation that follow doing business the right way.' },
            { title: 'Relationships', description: 'We value relationships over transactions. Loyalty runs deep here : to our clients, our partners, and our friends. Matching the right buyer with the right seller is how we take care of our circle.' },
            { title: 'Expertise', description: "Confidence isn't a claim, it's a credential. With experience spanning flight instruction, airline, and corporate aviation, we've flown the mission from every seat. That's what makes our methodology an industry benchmark." },
        ],
    },
    // ── About page: Timeline ──
    about_timeline_bg_image: { type: String, default: '' },
    about_timeline_items: {
        type: [{
            year: { type: String },
            heading: { type: String },
            description: { type: String },
        }],
        default: [
            { year: '2004', heading: 'Aviation Begins', description: 'After honorable enlisted military service, Jesse began flight training and quickly progressed through CFI, CFII, and MEI ratings.' },
            { year: '2007–2012', heading: 'Airlines and Entrepreneurship', description: 'Jesse flew regional jets for Republic Airways while simultaneously pursuing entrepreneurial ventures, building discipline as a pro pilot, alongside business acumen.' },
            { year: '2012–2015', heading: 'Business Foundation', description: 'Jesse joined his brothers at Sagacious Consultants, helping scale the firm to a successful acquisition by Accenture – but never stopped flying.' },
            { year: '2018', heading: 'Founded', description: 'Initially a spin-off of the Adams brothers\' entrepreneurial success, Mason Amelia was created as a professional services firm and business consultancy. As the company began recruiting for aviation sales organizations, a clear opportunity emerged...' },
            { year: '2019–2023', heading: 'Brokerage Mastery', description: 'Nearly five years at the world\'s largest Cirrus focused brokerage gave Jesse exposure to high volume global transactions across piston and owner-flown turbine aircraft, completing more than 200 deals.' },
            { year: '2023', heading: 'Strategic Refocus', description: 'Jesse founded Mason Amelia as a modern aircraft brokerage, combining data, elevated marketing, and grit. Within six months, the first team members were hired and remain core to the firm today.' },
            { year: '2024', heading: 'Rapid Growth', description: 'Mason Amelia became one of the fastest growing aircraft brokerages in the country, reshaping how owner-flown aircraft are marketed and sold.' },
            { year: '2025', heading: 'SkyNet Launch', description: 'The launch of SkyNet formalized Mason Amelia\'s data driven valuation approach, bringing greater clarity and precision to the market.' },
            { year: '2026', heading: 'Looking Forward', description: 'Executing at scale. Growing with intent.' },
        ],
    },
}, { timestamps: true });

contactSchema.index({ createdAt: -1 });

// Delete cached model so HMR picks up schema changes in development
if (mongoose.models.Contact) {
    delete mongoose.models.Contact;
}

module.exports = mongoose.model("Contact", contactSchema);