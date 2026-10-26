import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import ItemReport from '../src/models/ItemReport.js';
import ClaimRequest from '../src/models/ClaimRequest.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/findora';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: 'findora' });
    console.log(`[Seed] Connected successfully to database: ${mongoose.connection.name}`);

    // Remove existing seed demo data (identified by @findora.campus.edu emails)
    console.log('[Seed] Cleaning up previous demo data...');
    const demoUsers = await User.find({ email: /@findora\.campus\.edu$/ });
    const demoUserIds = demoUsers.map((u) => u._id);

    await ClaimRequest.deleteMany({
      $or: [{ requester: { $in: demoUserIds } }]
    });

    await ItemReport.deleteMany({
      reporter: { $in: demoUserIds }
    });

    await User.deleteMany({
      _id: { $in: demoUserIds }
    });

    console.log('[Seed] Creating demo users...');
    const passwordHash = await User.hashPassword('FindoraDemo123!');
    const adminPasswordHash = await User.hashPassword('AdminPass123!');

    const [admin, userAlex, userPriya, userMarcus] = await User.create([
      {
        name: 'Dean Eleanor Vance (Admin)',
        email: 'admin@findora.campus.edu',
        passwordHash: adminPasswordHash,
        role: 'admin'
      },
      {
        name: 'Alex Rivera',
        email: 'alex@findora.campus.edu',
        passwordHash,
        role: 'user'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@findora.campus.edu',
        passwordHash,
        role: 'user'
      },
      {
        name: 'Marcus Chen',
        email: 'marcus@findora.campus.edu',
        passwordHash,
        role: 'user'
      }
    ]);

    console.log('[Seed] Demo users created:');
    console.log('   - Admin: admin@findora.campus.edu / AdminPass123!');
    console.log('   - User 1: alex@findora.campus.edu / FindoraDemo123!');
    console.log('   - User 2: priya@findora.campus.edu / FindoraDemo123!');
    console.log('   - User 3: marcus@findora.campus.edu / FindoraDemo123!');

    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    console.log('[Seed] Creating demonstration item reports...');
    const items = await ItemReport.create([
      {
        title: 'Blue Lanyard with Student ID Card',
        category: 'ID Cards & Documents',
        description: 'Lost a navy blue lanyard with student ID card for Alex Rivera, along with a dormitory magnetic key card.',
        reportType: 'lost',
        location: 'Science & Engineering Complex, 2nd Floor Study Lounge',
        eventDate: daysAgo(2),
        imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
        status: 'open',
        reporter: userAlex._id
      },
      {
        title: 'Found Navy Blue Campus ID Lanyard',
        category: 'ID Cards & Documents',
        description: 'Found a blue fabric lanyard with an engineering department student badge on the bench near Room 204.',
        reportType: 'found',
        location: 'Science Complex, near Room 204 benches',
        eventDate: daysAgo(2),
        imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
        status: 'open',
        reporter: userPriya._id
      },
      {
        title: 'Hydro Flask 32oz Cobalt Water Bottle',
        category: 'Bottles & Containers',
        description: 'Cobalt blue insulated Hydro Flask water bottle with several outdoor national park stickers and minor scratch on lid.',
        reportType: 'found',
        location: 'Main University Library, 3rd Floor Quiet Reading Hall',
        eventDate: daysAgo(1),
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
        status: 'open',
        reporter: userMarcus._id
      },
      {
        title: 'Brass Dorm & Bike Keyring',
        category: 'Keys',
        description: 'Set of 3 brass keys on a miniature red Swiss Army carabiner. One key has a green rubber identifier ring.',
        reportType: 'lost',
        location: 'Campus Dining Commons, Outdoor Courtyard',
        eventDate: daysAgo(3),
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
        status: 'open',
        reporter: userPriya._id
      },
      {
        title: 'Calculus IV Spiral Notebook with Handwritten Notes',
        category: 'Books & Stationery',
        description: 'A black five-star college-ruled spiral notebook. Contains lecture notes, midterm review sheets, and graph papers.',
        reportType: 'found',
        location: 'Mathematics Hall, Lecture Hall B Room 102',
        eventDate: daysAgo(4),
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        status: 'open',
        reporter: userAlex._id
      },
      {
        title: 'Black Wireless Noise-Cancelling Earbuds in Case',
        category: 'Electronics',
        description: 'Matte black wireless earbuds inside an oval charging case. Lost while studying between classes.',
        reportType: 'lost',
        location: 'Student Union, Ground Floor Coffee Bar',
        eventDate: daysAgo(5),
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
        status: 'claim_pending',
        reporter: userMarcus._id
      },
      {
        title: 'Matte Black Earbud Charging Case',
        category: 'Electronics',
        description: 'Found an oval charging case with wireless earphones inside left on the sofa counter.',
        reportType: 'found',
        location: 'Student Union, Ground Floor Coffee Bar',
        eventDate: daysAgo(5),
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
        status: 'claim_pending',
        reporter: userPriya._id
      },
      {
        title: 'Dark Green Automatic Windproof Umbrella',
        category: 'Clothing & Accessories',
        description: 'Left a dark forest-green compact travel umbrella with wooden hooked handle inside the entryway umbrella stand.',
        reportType: 'found',
        location: 'Humanities Building, North Vestibule Entrance',
        eventDate: daysAgo(6),
        imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
        status: 'open',
        reporter: userAlex._id
      },
      {
        title: 'Brown Leather Bi-fold Wallet',
        category: 'Bags & Wallets',
        description: 'Brown leather vintage wallet with silver zipper compartment. Contains transit pass and library card.',
        reportType: 'found',
        location: 'Campus Recreation Center, Gymnasium Bleachers',
        eventDate: daysAgo(7),
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
        status: 'resolved',
        reporter: userPriya._id,
        resolvedAt: daysAgo(1)
      }
    ]);

    console.log(`[Seed] Created ${items.length} item reports.`);

    // Create a demo claim request for the earbud case
    const foundEarbuds = items.find((i) => i.title.includes('Matte Black Earbud Charging Case'));
    if (foundEarbuds) {
      console.log('[Seed] Creating demo claim request...');
      await ClaimRequest.create({
        item: foundEarbuds._id,
        requester: userMarcus._id,
        message: 'These are my Sony wireless earbuds! The left earbud has a tiny sticker dot on it, and the case was left near the espresso machine around 3:30 PM.',
        status: 'pending'
      });
      console.log('[Seed] Demo claim request created.');
    }

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
