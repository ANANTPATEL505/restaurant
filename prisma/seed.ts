import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";



async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@savour.in" },
    update: {},
    create: {
      email: "admin@savour.in",
      password: hashedPassword,
      name: "Admin User",
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user: admin@savour.in / admin123");

  // Clear existing data
  await prisma.menuItem.deleteMany({});

  // Tables
  await prisma.table.deleteMany({});
  const tablesData = [
    { number: 1,  capacity: 2, location: "Indoor",  status: "AVAILABLE" as const },
    { number: 2,  capacity: 2, location: "Indoor",  status: "AVAILABLE" as const },
    { number: 3,  capacity: 4, location: "Indoor",  status: "AVAILABLE" as const },
    { number: 4,  capacity: 4, location: "Indoor",  status: "AVAILABLE" as const },
    { number: 5,  capacity: 4, location: "Indoor",  status: "AVAILABLE" as const },
    { number: 6,  capacity: 6, location: "Indoor",  status: "AVAILABLE" as const },
    { number: 7,  capacity: 6, location: "Indoor",  status: "AVAILABLE" as const },
    { number: 8,  capacity: 8, location: "Private", status: "AVAILABLE" as const },
    { number: 9,  capacity: 8, location: "Private", status: "AVAILABLE" as const },
    { number: 10, capacity: 4, location: "Outdoor", status: "AVAILABLE" as const },
    { number: 11, capacity: 4, location: "Outdoor", status: "AVAILABLE" as const },
    { number: 12, capacity: 2, location: "Bar",     status: "AVAILABLE" as const },
    { number: 13, capacity: 2, location: "Bar",     status: "AVAILABLE" as const },
    { number: 14, capacity: 10, location: "Private", status: "MAINTENANCE" as const },
  ];
  await prisma.table.createMany({ data: tablesData });
  console.log("✅ Tables seeded (14 tables)");

  // Menu items
  const menuItems = [
    { name: "Bruschetta", description: "Grilled bread with fresh tomatoes, basil, and olive oil drizzle.", price: 299, category: "Starters", veg: true, spicy: false, featured: false, available: true },
    { name: "Paneer Tikka", description: "Smoky marinated paneer cubes grilled in a tandoor with spicy masala.", price: 349, category: "Starters", veg: true, spicy: true, featured: true, available: true },
    { name: "Chicken Wings", description: "Crispy golden wings tossed in our house buffalo sauce, served with blue cheese dip.", price: 399, category: "Starters", veg: false, spicy: true, featured: false, available: true },
    { name: "Cream of Mushroom", description: "Velvety mushroom soup with truffle oil and fresh herbs.", price: 249, category: "Soups", veg: true, spicy: false, featured: false, available: true },
    { name: "Tomato Basil Soup", description: "Rich, slow-simmered tomato soup with fresh basil and cream.", price: 229, category: "Soups", veg: true, spicy: false, featured: false, available: true },
    { name: "Butter Chicken", description: "Tender chicken in a rich tomato-butter sauce with aromatic spices.", price: 449, category: "Main Course", veg: false, spicy: false, featured: true, available: true },
    { name: "Dal Makhani", description: "Slow-cooked black lentils simmered overnight in a creamy tomato base.", price: 329, category: "Main Course", veg: true, spicy: false, featured: false, available: true },
    { name: "Alfredo Pasta", description: "Creamy pasta with parmesan, fresh herbs, and your choice of protein.", price: 499, category: "Main Course", veg: true, spicy: false, featured: false, available: true },
    { name: "Chicken Biryani", description: "Fragrant basmati rice layered with spiced chicken and saffron.", price: 549, category: "Main Course", veg: false, spicy: true, featured: true, available: true },
    { name: "Naan", description: "Soft, pillowy Indian bread baked fresh in a clay tandoor.", price: 49, category: "Breads", veg: true, spicy: false, featured: false, available: true },
    { name: "Garlic Naan", description: "Buttered naan topped with fresh garlic and coriander.", price: 69, category: "Breads", veg: true, spicy: false, featured: false, available: true },
    { name: "Chocolate Lava Cake", description: "Warm molten chocolate cake served with vanilla ice cream.", price: 249, category: "Desserts", veg: true, spicy: false, featured: true, available: true },
    { name: "Gulab Jamun", description: "Soft milk solid dumplings soaked in rose-flavoured sugar syrup.", price: 149, category: "Desserts", veg: true, spicy: false, featured: false, available: true },
    { name: "Classic Mojito", description: "Fresh mint, lime juice, and soda water — the perfect refresher.", price: 199, category: "Drinks", veg: true, spicy: false, featured: false, available: true },
    { name: "Mango Lassi", description: "Thick creamy yogurt blended with sweet Alphonso mangoes.", price: 179, category: "Drinks", veg: true, spicy: false, featured: false, available: true },
  ];

  await prisma.menuItem.createMany({ data: menuItems });
  console.log("✅ Menu items seeded");

  // Gallery
  await prisma.galleryImage.deleteMany({});
  await prisma.galleryImage.createMany({
    data: [
      { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", caption: "Main Dining Hall", category: "Ambience", featured: true },
      { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", caption: "Signature Dishes", category: "Food", featured: true },
      { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", caption: "Private Dining Room", category: "Ambience", featured: false },
      { src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800", caption: "Chef at Work", category: "Kitchen", featured: false },
      { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", caption: "Chef's Special", category: "Food", featured: false },
      { src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800", caption: "Fresh Ingredients", category: "Kitchen", featured: false },
    ],
  });
  console.log("✅ Gallery seeded");

  // Reviews
  await prisma.review.deleteMany({});
  await prisma.review.createMany({
    data: [
      { name: "Priya M.", rating: 5, comment: "Absolutely divine food! The butter chicken was the best I've ever had. Will definitely be back!", approved: true },
      { name: "Rohan S.", rating: 5, comment: "Celebrated my anniversary here and it was magical. The chef's special menu was extraordinary.", approved: true },
      { name: "Anita K.", rating: 4, comment: "Great ambience and delicious food. The paneer tikka starter was incredible!", approved: true },
      { name: "Vikram P.", rating: 5, comment: "The chocolate lava cake alone is worth the trip. Everything here screams excellence.", approved: true },
    ],
  });
  console.log("✅ Reviews seeded");

  // Event
  await prisma.event.deleteMany({});
  await prisma.event.create({
    data: {
      title: "Wine & Dine Evening",
      description: "An exclusive evening pairing our finest dishes with curated wines from around the world.",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
      venue: "Main Dining Hall",
      price: 2499,
      maxSeats: 30,
      bookedSeats: 8,
      active: true,
    },
  });
  console.log("✅ Events seeded");

  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      restaurantName: "Savour Fine Dining",
      tagline: "Where every meal is a masterpiece",
      phone: "+91 1234567890",
      email: "hello@savour.in",
      address: "123 Main Street, Surat, Gujarat 394107",
    },
  });
  console.log("✅ Site settings seeded");

  console.log("\n🎉 Database seeded successfully!");
  console.log("📧 Admin login: admin@savour.in");
  console.log("🔑 Password:    admin123");
  console.log("🌐 Visit: http://localhost:3000");
  console.log("⚙️  Admin: http://localhost:3000/admin");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
