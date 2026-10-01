import { connectDB } from '../config/db';
import { UserModel } from '../models/User';
import { DonationModel } from '../models/Donation';
import { PickupModel } from '../models/Pickup';
import { NotificationModel } from '../models/Notification';
import { NeedReportModel } from '../models/NeedReport';
import { ActivityLogModel } from '../models/ActivityLog';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const seed = async () => {
  console.log('[Seeder] Initializing database connection...');
  await connectDB();

  console.log('[Seeder] Clearing all database collections...');
  await UserModel.clear();
  await DonationModel.clear();
  await PickupModel.clear();
  await NotificationModel.clear();
  await NeedReportModel.clear();
  await ActivityLogModel.clear();

  console.log('[Seeder] Hashing passwords...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Admins (1)
  const admin = await UserModel.create({
    name: 'FoodBridge Admin',
    email: 'admin@foodbridge.demo',
    passwordHash,
    role: 'ADMIN',
    isVerified: true,
    phone: '+919876543210',
    address: 'FoodBridge Headquarters, Nungambakkam, Chennai'
  });

  // 2. Seed Donors (10)
  const donorNames = [
    { name: 'Gopal Krishnan', email: 'donor@foodbridge.demo', org: 'Ananda Catering', type: 'CATERER' },
    { name: 'Manager Taj', email: 'taj_coromandel@foodbridge.demo', org: 'Taj Coromandel Hotel', type: 'HOTEL' },
    { name: 'Saravana Bhavan', email: 'saravana_bhavan@foodbridge.demo', org: 'Saravana Bhavan Restaurant', type: 'RESTAURANT' },
    { name: 'Karthik Raja', email: 'karthik_halls@foodbridge.demo', org: 'Sri Raja Wedding Hall', type: 'MARRIAGE_HALL' },
    { name: 'Green Park Resort', email: 'green_park@foodbridge.demo', org: 'Green Park Chennai', type: 'RESORT' },
    { name: 'Royal Caterers', email: 'royal_caterers@foodbridge.demo', org: 'Royal South Indian Catering', type: 'CATERER' },
    { name: 'Infosys Food Court', email: 'infosys_court@foodbridge.demo', org: 'Infosys Campus Cafeteria', type: 'CORPORATE_OFFICE' },
    { name: 'Sathyabama Mess', email: 'sathyabama@foodbridge.demo', org: 'Sathyabama College Mess', type: 'COMMUNITY_EVENT' },
    { name: 'A2B Adyar', email: 'a2b_adyar@foodbridge.demo', org: 'Adyar Ananda Bhavan', type: 'RESTAURANT' },
    { name: 'Community Feast', email: 'community@foodbridge.demo', org: 'Mylapore Community Hall', type: 'COMMUNITY_EVENT' }
  ];

  const donors: any[] = [];
  for (const d of donorNames) {
    const user = await UserModel.create({
      name: d.name,
      email: d.email,
      passwordHash,
      role: 'DONOR',
      isVerified: true,
      phone: '+919876543211',
      address: `${d.org}, Chennai, Tamil Nadu`,
      donorProfile: {
        orgName: d.org,
        donorType: d.type,
        points: d.email === 'donor@foodbridge.demo' ? 240 : 40,
        badge: d.email === 'donor@foodbridge.demo' ? 'Silver' : 'Bronze'
      }
    });
    donors.push(user);
  }

  // 3. Seed NGOs (5)
  const ngoNames = [
    { name: 'Karunai Foundation', email: 'ngo@foodbridge.demo', cap: 350, reg: 'NGO-TN-2024-8899', verified: true },
    { name: 'Chennai Hunger Relief', email: 'chennai_hunger@foodbridge.demo', cap: 500, reg: 'NGO-TN-2023-4532', verified: true },
    { name: 'Tamil Nadu Feed NGO', email: 'tn_feed@foodbridge.demo', cap: 200, reg: 'NGO-TN-2022-7711', verified: true },
    { name: 'Mylapore Shelter', email: 'mylapore_shelter@foodbridge.demo', cap: 150, reg: 'NGO-TN-2025-1032', verified: true },
    { name: 'Coimbatore Care', email: 'coimbatore_care@foodbridge.demo', cap: 300, reg: 'NGO-TN-2024-5544', verified: false } // Non verified to test approval flow
  ];

  const ngos: any[] = [];
  for (const n of ngoNames) {
    const user = await UserModel.create({
      name: n.name,
      email: n.email,
      passwordHash,
      role: 'NGO',
      isVerified: n.verified,
      phone: '+919876543212',
      address: `${n.name} Distribution Center, Chennai`,
      ngoProfile: {
        capacity: n.cap,
        regNumber: n.reg,
        documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      }
    });
    ngos.push(user);
  }

  // 4. Seed Volunteers (10)
  const volunteerNames = [
    { name: 'Ramesh Kumar', email: 'volunteer@foodbridge.demo', vehicle: 'TWO_WHEELER' },
    { name: 'Suresh Raina', email: 'volunteer_suresh@foodbridge.demo', vehicle: 'CAR' },
    { name: 'Divya Bharathi', email: 'volunteer_divya@foodbridge.demo', vehicle: 'TWO_WHEELER' },
    { name: 'Anand Kumar', email: 'volunteer_anand@foodbridge.demo', vehicle: 'CAR' },
    { name: 'Vijay Sethu', email: 'volunteer_vijay@foodbridge.demo', vehicle: 'THREE_WHEELER' },
    { name: 'Sneha Nair', email: 'volunteer_sneha@foodbridge.demo', vehicle: 'TWO_WHEELER' },
    { name: 'Priya Raj', email: 'volunteer_priya@foodbridge.demo', vehicle: 'TWO_WHEELER' },
    { name: 'Dinesh Karthik', email: 'volunteer_dinesh@foodbridge.demo', vehicle: 'CAR' },
    { name: 'Vikram Prabhu', email: 'volunteer_vikram@foodbridge.demo', vehicle: 'THREE_WHEELER' },
    { name: 'Aarthi Sundar', email: 'volunteer_aarthi@foodbridge.demo', vehicle: 'TWO_WHEELER' }
  ];

  const volunteers: any[] = [];
  for (const v of volunteerNames) {
    const user = await UserModel.create({
      name: v.name,
      email: v.email,
      passwordHash,
      role: 'VOLUNTEER',
      isVerified: true,
      phone: '+919876543213',
      address: `Volunteer Base, Chennai, TN`,
      volunteerProfile: {
        availability: true,
        vehicleType: v.vehicle,
        distanceTravelled: v.email === 'volunteer@foodbridge.demo' ? 45.8 : 0.0,
        mealsTransported: v.email === 'volunteer@foodbridge.demo' ? 320 : 0
      }
    });
    volunteers.push(user);
  }

  // 5. Seed 20 Donations with different locations and statuses
  // Locations clustered around Chennai
  const donationSeeds = [
    // PENDING
    { donorIdx: 0, cat: 'Biryani', items: 'Chicken Biryani, Onion Raitha', servings: 120, status: 'PENDING', lat: 13.0401, lng: 80.2435, addr: 'T-Nagar Bazaar Road, Chennai' },
    { donorIdx: 1, cat: 'Rice', items: 'White Rice, Sambar, Cabbage Poriyal', servings: 80, status: 'PENDING', lat: 13.0610, lng: 80.2520, addr: 'Taj Coromandel, Nungambakkam, Chennai' },
    { donorIdx: 2, cat: 'Meals', items: 'Full Meals (Rice, Rasam, Curd, Kootu)', servings: 200, status: 'PENDING', lat: 13.0380, lng: 80.2600, addr: 'Saravana Bhavan, Mylapore, Chennai' },
    { donorIdx: 3, cat: 'Chapati', items: 'Chapati, Paneer Butter Masala', servings: 150, status: 'PENDING', lat: 13.0720, lng: 80.2100, addr: 'Raja Hall, Anna Nagar, Chennai' },
    { donorIdx: 4, cat: 'Bakery', items: 'Fresh Breads, Buns, Tea Cakes', servings: 60, status: 'PENDING', lat: 12.9800, lng: 80.2200, addr: 'Green Park Resort, Velachery, Chennai' },
    { donorIdx: 5, cat: 'Biryani', items: 'Veg Biryani, Brinjal Curry', servings: 100, status: 'PENDING', lat: 13.0063, lng: 80.2212, addr: 'Royal Caterers, Guindy, Chennai' },
    
    // ACCEPTED (NGO assigned, waiting for volunteer)
    { donorIdx: 6, cat: 'Meals', items: 'South Indian Meals with Curry', servings: 250, status: 'ACCEPTED', ngoIdx: 0, lat: 12.9780, lng: 80.2450, addr: 'Infosys Food Court, Sholinganallur, Chennai' },
    { donorIdx: 7, cat: 'Idli', items: 'Idli, Coconut Chutney, Sambar', servings: 70, status: 'ACCEPTED', ngoIdx: 1, lat: 13.0300, lng: 80.1900, addr: 'Sathyabama Mess, OMR, Chennai' },
    
    // PICKED_UP (Volunteer collected, transport in progress)
    { donorIdx: 8, cat: 'Curry', items: 'Paneer Masala & Vegetable Kurma', servings: 110, status: 'PICKED_UP', ngoIdx: 2, volIdx: 0, lat: 13.0250, lng: 80.2450, addr: 'A2B Adyar, Chennai' },
    { donorIdx: 9, cat: 'Biryani', items: 'Mutton Biryani, Raita', servings: 300, status: 'PICKED_UP', ngoIdx: 0, volIdx: 1, lat: 13.0350, lng: 80.2620, addr: 'Mylapore Community Hall, Mylapore, Chennai' },
    
    // DELIVERED (Food arrived at NGO, NGO needs to confirm distribution)
    { donorIdx: 1, cat: 'Chapati', items: 'Chapati, Aloo Kurma', servings: 90, status: 'DELIVERED', ngoIdx: 1, volIdx: 2, lat: 13.0610, lng: 80.2520, addr: 'Taj Coromandel, Nungambakkam, Chennai' },
    { donorIdx: 2, cat: 'Rice', items: 'Curd Rice & Pickle', servings: 140, status: 'DELIVERED', ngoIdx: 3, volIdx: 0, lat: 13.0380, lng: 80.2600, addr: 'Saravana Bhavan, Mylapore, Chennai' },

    // COMPLETED
    { donorIdx: 0, cat: 'Meals', items: 'Meals, Dal, Appalam', servings: 180, status: 'COMPLETED', ngoIdx: 0, volIdx: 0, lat: 13.0401, lng: 80.2435, addr: 'T-Nagar, Chennai' },
    { donorIdx: 1, cat: 'Biryani', items: 'Chicken Biryani', servings: 250, status: 'COMPLETED', ngoIdx: 1, volIdx: 1, lat: 13.0610, lng: 80.2520, addr: 'Nungambakkam, Chennai' },
    { donorIdx: 2, cat: 'Idli', items: 'Sambar Idli', servings: 60, status: 'COMPLETED', ngoIdx: 2, volIdx: 2, lat: 13.0380, lng: 80.2600, addr: 'Mylapore, Chennai' },
    { donorIdx: 3, cat: 'Dosa', items: 'Masala Dosa, Chutney', servings: 100, status: 'COMPLETED', ngoIdx: 3, volIdx: 3, lat: 13.0720, lng: 80.2100, addr: 'Anna Nagar, Chennai' },
    { donorIdx: 4, cat: 'Bakery', items: 'Pastries & Sandwiches', servings: 80, status: 'COMPLETED', ngoIdx: 0, volIdx: 4, lat: 12.9800, lng: 80.2200, addr: 'Velachery, Chennai' },
    { donorIdx: 5, cat: 'Veg Curry', items: 'Mixed Vegetable Curry', servings: 120, status: 'COMPLETED', ngoIdx: 1, volIdx: 0, lat: 13.0063, lng: 80.2212, addr: 'Guindy, Chennai' },
    { donorIdx: 6, cat: 'Meals', items: 'Variety Rice (Lemon, Tamarind)', servings: 150, status: 'COMPLETED', ngoIdx: 2, volIdx: 1, lat: 12.9780, lng: 80.2450, addr: 'Sholinganallur, Chennai' },
    { donorIdx: 7, cat: 'Biryani', items: 'Egg Biryani', servings: 130, status: 'COMPLETED', ngoIdx: 3, volIdx: 2, lat: 13.0300, lng: 80.1900, addr: 'OMR, Chennai' }
  ];

  const now = new Date();
  
  for (let i = 0; i < donationSeeds.length; i++) {
    const d = donationSeeds[i];
    const donorUser = donors[d.donorIdx];
    const ngoUser = d.ngoIdx !== undefined ? ngos[d.ngoIdx] : null;
    const volUser = d.volIdx !== undefined ? volunteers[d.volIdx] : null;

    // Cooking date set to today/yesterday for realistic safety assessments
    const cookingDate = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString().split('T')[0];
    const cookingTime = new Date(now.getTime() - 2 * 60 * 60 * 1000).toTimeString().split(' ')[0].substring(0, 5);
    const pickupDeadline = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

    const donation = await DonationModel.create({
      donorId: donorUser._id || donorUser.id,
      donorName: donorUser.name,
      orgName: donorUser.donorProfile.orgName,
      category: d.cat,
      foodItems: d.items,
      foodType: d.cat.toLowerCase().includes('chicken') || d.cat.toLowerCase().includes('mutton') || d.cat.toLowerCase().includes('egg') ? 'NON_VEG' : 'VEG',
      quantity: `${d.servings} Servings`,
      servings: d.servings,
      cookingDate,
      cookingTime,
      storageCondition: 'REFRIGERATED',
      isExposed: false,
      isReheated: false,
      temperature: 4,
      pickupDeadline,
      address: d.addr,
      latitude: d.lat,
      longitude: d.lng,
      contactNumber: '+919988776655',
      specialInstructions: 'Please carry containers. Located at main gate.',
      foodImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      priorityScore: d.status === 'PENDING' ? 75 : 0,
      safetyStatus: 'SAFE',
      status: d.status as any,
      assignedNgoId: ngoUser ? (ngoUser._id || ngoUser.id) : undefined,
      assignedVolunteerId: volUser ? (volUser._id || volUser.id) : undefined
    });

    // Create Pickup Log for non-pending items
    if (d.status !== 'PENDING' && ngoUser) {
      let pickupStatus: 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' = 'ASSIGNED';
      if (d.status === 'PICKED_UP') pickupStatus = 'PICKED_UP';
      else if (d.status === 'DELIVERED') pickupStatus = 'DELIVERED';
      else if (d.status === 'COMPLETED') pickupStatus = 'COMPLETED';

      await PickupModel.create({
        donationId: donation._id || donation.id!,
        ngoId: ngoUser._id || ngoUser.id!,
        volunteerId: volUser ? (volUser._id || volUser.id!) : undefined,
        distance: 4.2,
        status: pickupStatus,
        acceptedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        assignedAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
        pickedUpAt: d.status !== 'ACCEPTED' ? new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString() : undefined,
        deliveredAt: (d.status === 'DELIVERED' || d.status === 'COMPLETED') ? new Date(now.getTime() - 45 * 60 * 1000).toISOString() : undefined,
        completedAt: d.status === 'COMPLETED' ? new Date(now.getTime() - 10 * 60 * 1000).toISOString() : undefined,
      });
    }
  }

  // 6. Seed In-app Notifications
  await NotificationModel.create({
    userId: donors[0]._id || donors[0].id,
    message: 'Welcome to FoodBridge AI! Your registration is complete and verified.',
    messageTa: 'உணவுப் பாலம் AI-க்கு உங்களை வரவேற்கிறோம்! உங்கள் பதிவு வெற்றிகரமாக சரிபார்க்கப்பட்டது.',
    type: 'SUCCESS',
    isRead: true
  });
  await NotificationModel.create({
    userId: ngos[0]._id || ngos[0].id,
    message: 'Karunai Foundation has been verified as a hunger relief partner.',
    messageTa: 'கருணை அறக்கட்டளை உணவு விநியோக தொண்டு நிறுவனமாக அங்கீகரிக்கப்பட்டுள்ளது.',
    type: 'SUCCESS',
    isRead: false
  });

  // 7. Seed Community Need Areas
  const needSeeds = [
    { area: 'Chennai Central Railway Station (Outer Area)', servings: 400, level: 'HIGH', lat: 13.0827, lng: 80.2707, details: 'Large population of daily laborers and pavement dwellers without dinner.' },
    { area: 'Vyasarpadi Slum Pockets', servings: 600, level: 'HIGH', lat: 13.1180, lng: 80.2520, details: 'Heavy demand for infant milk and basic dinner meals.' },
    { area: 'Tambaram Slum Clearance Board Blocks', servings: 300, level: 'MEDIUM', lat: 12.9220, lng: 80.1200, details: 'Support required for senior citizens.' },
    { area: 'Koyambedu Wholesale Market Outer Area', servings: 500, level: 'HIGH', lat: 13.0680, lng: 80.1900, details: 'Migrant loaders needing fresh breakfast support.' },
    { area: 'Guindy Industrial Labour Lines', servings: 200, level: 'LOW', lat: 13.0063, lng: 80.2212, details: 'General evening nutrition pack request.' }
  ];

  for (const n of needSeeds) {
    await NeedReportModel.create({
      userId: ngos[0]._id || ngos[0].id,
      reporterName: ngos[0].name,
      areaName: n.area,
      needLevel: n.level as any,
      servingsNeeded: n.servings,
      latitude: n.lat,
      longitude: n.lng,
      details: n.details
    });
  }

  // 8. Seed Audit Activity Logs
  await ActivityLogModel.create({
    userId: admin._id || admin.id,
    action: 'SYSTEM_SEED',
    details: 'System database successfully seeded with mock demo datasets.'
  });

  console.log('\n======================================================');
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('------------------------------------------------------');
  console.log('👤 DEMO USER CREDENTIALS (Password: password123):');
  console.log('1. Admin:     admin@foodbridge.demo');
  console.log('2. Donor:     donor@foodbridge.demo');
  console.log('3. NGO:       ngo@foodbridge.demo');
  console.log('4. Volunteer: volunteer@foodbridge.demo');
  console.log('======================================================\n');

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
};

seed().catch(err => {
  console.error('[Seeder Error] Failed to seed database:', err);
  process.exit(1);
});
export default seed;
